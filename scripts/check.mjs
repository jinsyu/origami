// 작품 검증: node scripts/check.mjs
// - 모든 단계가 계산 오류(NaN) 없이 만들어지는지
// - 각 단계 끝 상태에서 같은 종이 위치가 한 곳에 모이는지(종이가 끊기지 않는지)
//   (tearOk 단계와 층 간격 수준의 차이는 허용)
// - 단계가 넘어갈 때 화면이 튀지 않는지: 앞 단계 끝 모습과 다음 단계 시작 모습이 같은 종이 점에서 같은 자리
// - 겹 다지기(화면용 높이)가 겹 순서를 뒤집지 않는지: 수평으로 놓인 겹들의 격자 점마다 엔진 높이 순서와 화면 높이 순서 비교
// - 복합 단계의 움직임이 프레임 사이에 갑자기 튀지 않는지
import { buildModel, endPose, startPose, rawPose, polyNormal } from '../src/engine.js';
import { prepareSim, simPose } from '../src/sim.js';
import { MODELS as LIVE, DEV } from '../src/models/index.js';
const MODELS = [...LIVE, ...DEV];
import { enModels } from '../src/i18n/en.js';

const TEAR = 0.07;   // 끝 상태에서 허용하는 같은 점의 최대 차이
const JUMP = 0.05;   // 복합 단계에서 프레임 사이 최대 이동
let fail = 0;
const bad = (m, msg) => { fail++; console.log(`  ✗ ${m.name}: ${msg}`); };

// 겹 다지기 순서 검사: 수평 조각들을 격자 점(경계에서 조금 안쪽)마다 엔진 높이로 세운 순서와 화면 높이 순서가 같은지
function settleOrder(p) {
  if (!p.endOff) return 0;
  const sv = p.deform; p.deform = null; const P = rawPose(p, 1); p.deform = sv;
  const flat = P.map((L) => { const n = polyNormal(L); return Math.abs(n[2]) > 0.9999; });
  const strict = (L, x, y) => {
    let sg = 0;
    for (let k = 0; k < L.length; k++) {
      const a = L[k], b = L[(k + 1) % L.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (l < 1e-12) continue;
      const c = ((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])) / l;
      if (Math.abs(c) < 1e-4) return false;
      if (sg && Math.sign(c) !== sg) return false;
      sg = Math.sign(c);
    }
    return true;
  };
  const uvAt = (i, x, y) => {
    const L = P[i], U = p.polys[i].uv, a = L[0], b = L[1], c = L[2];
    const d = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const s = ((x - a[0]) * (c[1] - a[1]) - (y - a[1]) * (c[0] - a[0])) / d, t = ((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])) / d;
    return [U[0][0] + (U[1][0] - U[0][0]) * s + (U[2][0] - U[0][0]) * t, U[0][1] + (U[1][1] - U[0][1]) * s + (U[2][1] - U[0][1]) * t];
  };
  const xs = P.flat().map((v) => v[0]), ys = P.flat().map((v) => v[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), N = 30;
  let badPts = 0;
  for (let a = 0; a <= N; a++) for (let b = 0; b <= N; b++) {
    const x = x0 + ((x1 - x0) * a) / N, y = y0 + ((y1 - y0) * b) / N, rows = [];
    P.forEach((L, i) => { if (flat[i] && strict(L, x, y)) rows.push([L[0][2], L[0][2] + p.endOff(i, uvAt(i, x, y))[2]]); });
    rows.sort((u, v) => u[0] - v[0]);
    for (let k = 1; k < rows.length; k++) if (rows[k][0] - rows[k - 1][0] > 1e-6 && rows[k][1] - rows[k - 1][1] < 1e-5) { badPts++; break; }
  }
  return badPts;
}

for (const m of MODELS) {
  const t0 = performance.now();
  let plans;
  try { plans = buildModel(m); } catch (e) { bad(m, `계산 실패 ${e.message}`); continue; }
  const known = new Set(m.knownTears || []);
  let torn = new Set(); // 이전 단계에서 이미 허용된 끊김 (tearOk·knownTears 에서 이어짐)
  plans.forEach((p, si) => {
    const fin = endPose(p);
    // 다음 단계 시작과 이어지는지: 다음 단계 조각의 각 꼭짓점이, 그 조각을 낳은 앞 단계 조각(par)의 같은 종이 점 화면 위치와 같은 자리
    const nx = plans[si + 1];
    if (nx && !p.deform && p.endOff) {
      const st = startPose(nx), sv = p.deform, rawE = rawPose(p, 1);
      const affine = (U, L) => { const a = L[0], d1 = [L[1][0] - a[0], L[1][1] - a[1], L[1][2] - a[2]], d2 = [L[2][0] - a[0], L[2][1] - a[1], L[2][2] - a[2]];
        const u1 = [U[1][0] - U[0][0], U[1][1] - U[0][1]], u2 = [U[2][0] - U[0][0], U[2][1] - U[0][1]], det = u1[0] * u2[1] - u1[1] * u2[0];
        return (u) => { const x = u[0] - U[0][0], y = u[1] - U[0][1], s1 = (x * u2[1] - y * u2[0]) / det, t1 = (u1[0] * y - u1[1] * x) / det; return [0, 1, 2].map((c) => a[c] + d1[c] * s1 + d2[c] * t1); }; };
      let jumpB = 0;
      nx.polys.forEach((q, i) => {
        if (q.par === undefined) return;
        const f = affine(p.polys[q.par].uv, rawE[q.par]);
        q.uv.forEach((u, k) => {
          const r = f(u), o = p.endOff(q.par, u), e = [r[0] + o[0], r[1] + o[1], r[2] + o[2]], v = st[i][k];
          jumpB = Math.max(jumpB, Math.hypot(v[0] - e[0], v[1] - e[1], v[2] - e[2]));
        });
      });
      if (jumpB > 1e-4) bad(m, `${si + 1}→${si + 2}단계 넘어갈 때 튐 ${jumpB.toFixed(4)}`);
    }
    if (fin.some((L) => L.some((v) => v.some((x) => !Number.isFinite(x))))) bad(m, `${si + 1}단계 NaN`);
    const allowed = p.tearOk || known.has(si + 1);
    const seen = new Map(), nowTorn = new Set();
    let worst = 0;
    p.polys.forEach((q, i) => q.uv.forEach((uv, k) => {
      const key = `${Math.round(uv[0] * 1e5)},${Math.round(uv[1] * 1e5)}`, pos = fin[i][k], o = seen.get(key);
      if (!o) { seen.set(key, pos); return; }
      const d = Math.hypot(pos[0] - o[0], pos[1] - o[1], pos[2] - o[2]);
      if (d <= TEAR) return;
      nowTorn.add(key);
      if (!torn.has(key)) worst = Math.max(worst, d);
    }));
    if (!allowed && worst > TEAR) bad(m, `${si + 1}단계 끝 상태 끊김 ${worst.toFixed(3)}`);
    torn = allowed ? nowTorn : new Set([...nowTorn].filter((k) => torn.has(k)));
    const ov = settleOrder(p);
    if (ov) bad(m, `${si + 1}단계 겹 다지기가 겹 순서를 뒤집음 (${ov}곳)`);
    if (p.tearOk) return;
    if (p.sim) {
      const s = prepareSim(p);
      let prev = simPose(s, 0), jump = 0;
      for (let f = 1; f <= 120; f++) {
        const P = simPose(s, f / 120);
        P.forEach((L, pi) => L.forEach((v, li) => { const q = prev[pi][li]; jump = Math.max(jump, Math.hypot(v[0] - q[0], v[1] - q[1], v[2] - q[2])); }));
        prev = P;
      }
      if (jump > (m.maxJump || JUMP)) bad(m, `${si + 1}단계 움직임 튐 ${jump.toFixed(3)}`);
    }
  });
  console.log(`✓ ${m.level}. ${m.name} — ${plans.length}단계, ${Math.round(performance.now() - t0)}ms`);
}
// 영어 문구: 작품마다 있고 단계 수가 같아야 한다
for (const m of LIVE) {
  const e = enModels[m.id];
  if (!e) bad(m, '영어 문구 없음');
  else if (e.steps.length !== m.steps.length) bad(m, `영어 단계 수 ${e.steps.length} ≠ ${m.steps.length}`);
}
console.log(fail ? `\n문제 ${fail}건` : '\n모든 작품 통과');
process.exit(fail ? 1 : 0);
