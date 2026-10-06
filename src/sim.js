// 복합 접기 움직임
// 안쪽 뒤집어 접기, 펼쳐 누르기, 꽃잎 접기처럼 여러 면이 서로 다른 축으로 함께 움직이는 단계용.
// 1) 운동학 연쇄: 각 면은 자기가 겪은 하위 회전들을 시간 구간에 맞춰 이어 붙여 움직인다.
// 2) 이완: 하위 회전끼리 서로 다른 면이 따로 움직이면 이음매가 벌어지므로,
//    같은 종이 위치(uv)의 꼭짓점을 합치고 변 길이(종이는 늘어나지 않음)를 반복 투영해 이어 붙인다.
// 시작·끝에서는 이완 강도가 0이 되어 엔진이 계산한 정확한 평면 상태와 일치한다.
import { foldAngle, rotate } from './engine.js';

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const wrap = (a) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
const RELAX_ITERS = 14;

export function prepareSim(plan) {
  const polys = plan.polys;
  const H = polys[0].hist.length;

  // 같은 uv 위치의 꼭짓점을 하나로
  const vmap = new Map(), vuv = [];
  const vid = (uv) => {
    const k = `${Math.round(uv[0] * 1e6)},${Math.round(uv[1] * 1e6)}`;
    let i = vmap.get(k);
    if (i === undefined) { i = vuv.length; vmap.set(k, i); vuv.push(uv); }
    return i;
  };
  polys.forEach((q) => q.uv.forEach(vid));
  const nCorner = vuv.length;

  // T자 접점을 넣어 이웃 다각형과 꼭짓점을 공유하는 고리(loop)
  const loops = polys.map((q) => {
    const L = [], n = q.uv.length;
    for (let k = 0; k < n; k++) {
      const a = q.uv[k], b = q.uv[(k + 1) % n];
      L.push({ w: vid(a), k, t: 0 });
      const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy, l = Math.sqrt(l2);
      const ins = [];
      for (let w = 0; w < nCorner; w++) {
        const px = vuv[w][0] - a[0], py = vuv[w][1] - a[1];
        const t = (px * dx + py * dy) / l2;
        if (t <= 1e-6 || t >= 1 - 1e-6) continue;
        if (Math.abs(dx * py - dy * px) / l > 1e-7) continue;
        ins.push({ w, k, t });
      }
      ins.sort((p, r) => p.t - r.t);
      L.push(...ins);
    }
    return L;
  });
  const posAt = (q, it, h) => {
    const P = q.hist[h], a = P[it.k];
    if (it.t === 0) return a;
    const b = P[(it.k + 1) % P.length];
    return [a[0] + (b[0] - a[0]) * it.t, a[1] + (b[1] - a[1]) * it.t, a[2] + (b[2] - a[2]) * it.t];
  };
  const start = polys.map((q, pi) => loops[pi].map((it) => posAt(q, it, 0)));
  const end = polys.map((q, pi) => loops[pi].map((it) => posAt(q, it, H - 1)));

  // 각 면이 참여한 하위 동작 목록
  const movedAt = (q, h) => q.hist[h].some((p, i) => Math.abs(p[0] - q.hist[h - 1][i][0]) + Math.abs(p[1] - q.hist[h - 1][i][1]) + Math.abs(p[2] - q.hist[h - 1][i][2]) > 1e-9);
  const member = polys.map((q) => { const m = []; for (let h = 1; h < H; h++) if (movedAt(q, h)) m.push(h - 1); return m; });

  // 변 길이 제약 (고리의 변 + 고리 안 대각선 일부로 면 모양 유지)
  const dist = [], seen = new Set();
  const addDist = (i, j) => {
    if (i === j) return;
    const key = i < j ? `${i},${j}` : `${j},${i}`;
    if (seen.has(key)) return;
    seen.add(key);
    dist.push([i, j, Math.hypot(vuv[i][0] - vuv[j][0], vuv[i][1] - vuv[j][1])]);
  };
  loops.forEach((L) => {
    const n = L.length;
    for (let i = 0; i < n; i++) {
      addDist(L[i].w, L[(i + 1) % n].w);
      addDist(L[i].w, L[(i + 2) % n].w);
      addDist(L[i].w, L[(i + Math.floor(n / 2)) % n].w);
    }
  });

  // 안내선용: 이번 단계에서 바뀌는 접힌 선 (골짜기/산)
  const guides = [];
  const edgeOwner = new Map();
  polys.forEach((q, pi) => q.uv.forEach((_, k) => {
    const a = vid(q.uv[k]), b = vid(q.uv[(k + 1) % q.uv.length]);
    edgeOwner.set(`${a},${b}`, { pi, k });
  }));
  for (const [key, A] of edgeOwner) {
    const [a, b] = key.split(',');
    const B = edgeOwner.get(`${b},${a}`);
    if (!B || A.pi > B.pi) continue;
    const PA = polys[A.pi], PB = polys[B.pi];
    const r0 = foldAngle(PA.hist[0], PB.hist[0], A.k), r1 = foldAngle(PA.hist[H - 1], PB.hist[H - 1], A.k);
    const flat = (v) => Math.abs(Math.abs(v) - Math.PI) < 1e-9;
    const d = flat(r0) && flat(r1) ? r1 - r0 : wrap(r1 - r0);
    if (Math.abs(d) < 0.3) continue;
    const P = PA.hist[0];
    guides.push({ a: P[A.k], b: P[(A.k + 1) % P.length], valley: d < 0 });
  }

  return { loops, nCorner, NV: nCorner, member, subs: plan.subs, start, end, dist, guides };
}

// 하위 동작 k를 비율 f만큼 적용 (회전 후 층 간격 이동)
const applyMove = (p, mv, f) => {
  const r = rotate(p, mv.o, mv.d, mv.theta * f);
  return [r[0] + mv.u[0] * mv.shift * f, r[1] + mv.u[1] * mv.shift * f, r[2] + mv.u[2] * mv.shift * f];
};
const undoMove = (p, mv) => rotate([p[0] - mv.u[0] * mv.shift, p[1] - mv.u[1] * mv.shift, p[2] - mv.u[2] * mv.shift], mv.o, mv.d, -mv.theta);

// 운동학 연쇄: x_t = M1(f1) ∘ M2'(f2) ∘ … (Mk'는 이전 동작 기준으로 되돌려 표현한 k번째 회전)
function chain(p, mem, subs, fs) {
  let y = p;
  for (let a = mem.length - 1; a >= 0; a--) {
    const k = mem[a];
    if (fs[k] === 0) continue;
    let z = y;
    for (let b = 0; b < a; b++) z = applyMove(z, subs[mem[b]].mv, 1);
    z = applyMove(z, subs[k].mv, fs[k]);
    for (let b = a - 1; b >= 0; b--) z = undoMove(z, subs[mem[b]].mv);
    y = z;
  }
  return y;
}

// 진행률 t에서 다각형별 고리 꼭짓점 위치
export function simPose(sim, t) {
  if (t <= 0) return sim.start;
  if (t >= 1) return sim.end;
  const fs = sim.subs.map((s) => ease((t - s.at[0]) / Math.max(1e-6, s.at[1] - s.at[0])));
  const kin = sim.start.map((L, pi) => L.map((p) => chain(p, sim.member[pi], sim.subs, fs)));

  // 이완: 같은 종이 위치를 합치고 변 길이를 유지
  const NV = sim.NV, x = new Float64Array(NV * 3), cnt = new Float64Array(NV);
  sim.loops.forEach((L, pi) => L.forEach((it, li) => {
    const p = kin[pi][li];
    x[it.w * 3] += p[0]; x[it.w * 3 + 1] += p[1]; x[it.w * 3 + 2] += p[2]; cnt[it.w]++;
  }));
  for (let i = 0; i < NV; i++) { const c = cnt[i] || 1; x[i * 3] /= c; x[i * 3 + 1] /= c; x[i * 3 + 2] /= c; }
  const avg = Float64Array.from(x);
  for (let it = 0; it < RELAX_ITERS; it++) {
    for (const [i, j, rest] of sim.dist) {
      const dx = x[j * 3] - x[i * 3], dy = x[j * 3 + 1] - x[i * 3 + 1], dz = x[j * 3 + 2] - x[i * 3 + 2];
      const L = Math.hypot(dx, dy, dz) || 1e-9, c = ((L - rest) / L) * 0.5;
      x[i * 3] += dx * c; x[i * 3 + 1] += dy * c; x[i * 3 + 2] += dz * c;
      x[j * 3] -= dx * c; x[j * 3 + 1] -= dy * c; x[j * 3 + 2] -= dz * c;
    }
  }
  // 층 간격처럼 작은 차이는 살리고, 이음매 벌어짐은 없앤다. 시작·끝에서는 이완 0
  const w = Math.min(1, Math.min(t, 1 - t) * 25);
  const LIM = 0.012;
  return sim.loops.map((L, pi) => L.map((it, li) => {
    const p = kin[pi][li], o = [];
    for (let c = 0; c < 3; c++) {
      const off = Math.max(-LIM, Math.min(LIM, p[c] - avg[it.w * 3 + c]));
      o.push(p[c] + (x[it.w * 3 + c] + off - p[c]) * w);
    }
    return o;
  }));
}

// 이음매 벌어짐 최대값 (검증용): 같은 uv 꼭짓점들의 위치 차이
export function seamError(sim, posed) {
  const first = new Map();
  let err = 0;
  sim.loops.forEach((L, pi) => L.forEach((it, li) => {
    const p = posed[pi][li], f = first.get(it.w);
    if (!f) first.set(it.w, p);
    else err = Math.max(err, Math.hypot(p[0] - f[0], p[1] - f[1], p[2] - f[2]));
  }));
  return err;
}

export const simGuides = (sim) => sim.guides;
