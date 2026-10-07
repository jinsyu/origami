// 작품 검증: node scripts/check.mjs
// - 모든 단계가 계산 오류(NaN) 없이 만들어지는지
// - 각 단계 끝 상태에서 같은 종이 위치가 한 곳에 모이는지(종이가 끊기지 않는지)
//   (tearOk 단계와 층 간격 수준의 차이는 허용)
// - 복합 단계의 움직임이 프레임 사이에 갑자기 튀지 않는지
import { buildModel, endPose } from '../src/engine.js';
import { prepareSim, simPose } from '../src/sim.js';
import { MODELS } from '../src/models/index.js';
import { enModels } from '../src/i18n/en.js';

const TEAR = 0.07;   // 끝 상태에서 허용하는 같은 점의 최대 차이
const JUMP = 0.05;   // 복합 단계에서 프레임 사이 최대 이동
let fail = 0;
const bad = (m, msg) => { fail++; console.log(`  ✗ ${m.name}: ${msg}`); };

for (const m of MODELS) {
  const t0 = performance.now();
  let plans;
  try { plans = buildModel(m); } catch (e) { bad(m, `계산 실패 ${e.message}`); continue; }
  const known = new Set(m.knownTears || []);
  let torn = new Set(); // 이전 단계에서 이미 허용된 끊김 (tearOk·knownTears 에서 이어짐)
  plans.forEach((p, si) => {
    const fin = endPose(p);
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
for (const m of MODELS) {
  const e = enModels[m.id];
  if (!e) bad(m, '영어 문구 없음');
  else if (e.steps.length !== m.steps.length) bad(m, `영어 단계 수 ${e.steps.length} ≠ ${m.steps.length}`);
}
console.log(fail ? `\n문제 ${fail}건` : '\n모든 작품 통과');
process.exit(fail ? 1 : 0);
