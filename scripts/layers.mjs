// 진단: 겹친 층이 서로 뚫고 지나가거나(앞뒤 색 섞임) 너무 붙어 깜빡이는 곳 찾기
import { buildModel, pose, polyNormal, GAP } from '../src/engine.js';
import { prepareSim, simPose } from '../src/sim.js';
import { MODELS } from '../src/models/index.js';
const only = process.argv[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
const cen = (L) => [0, 1, 2].map((i) => L.reduce((s, v) => s + v[i], 0) / L.length);
function area(L, n) { let s = [0, 0, 0]; for (let i = 0; i < L.length; i++) s = s.map((x, j) => x + cross(L[i], L[(i + 1) % L.length])[j]); return Math.abs(dot(s, n)) / 2; }
// A의 중심을 B 평면에 투영했을 때 B 안쪽(가장자리에서 m 이상)인지
function inside(p, L, n, m) {
  for (let i = 0; i < L.length; i++) {
    const a = L[i], b = L[(i + 1) % L.length], e = norm(sub(b, a)), side = cross(n, e);
    if (dot(sub(p, a), side) < m) return false;
  }
  return true;
}
function insideAny(p, L, n, m) { return inside(p, L, n, m) || inside(p, L, n.map((x) => -x), m); }
for (const m of MODELS) {
  if (only && m.id !== only) continue;
  const plans = buildModel(m);
  plans.forEach((p, si) => {
    const s = p.sim ? prepareSim(p) : null;
    const F = 48, frames = [];
    for (let f = 0; f <= F; f++) frames.push(s ? simPose(s, f / F) : pose(p, f / F));
    const prevSign = new Map(); const hits = new Map();
    frames.forEach((P, f) => {
      const N = P.map(polyNormal), C = P.map(cen);
      for (let i = 0; i < P.length; i++) for (let j = 0; j < P.length; j++) {
        if (i === j) continue;
        if (Math.abs(dot(N[i], N[j])) < 0.985) { prevSign.delete(i + ',' + j); continue; }
        if (area(P[i], N[i]) < 1e-3) continue;
        const d = dot(sub(C[i], P[j][0]), N[j]);
        if (Math.abs(d) > 0.03) { prevSign.delete(i + ',' + j); continue; }
        if (!insideAny(C[i], P[j], N[j], 0.01)) { prevSign.delete(i + ',' + j); continue; }
        const key = i + ',' + j, sg = Math.abs(d) > GAP * 0.4 ? Math.sign(d) : 0, ps = prevSign.get(key);
        if (ps !== undefined && sg !== 0 && ps !== sg) hits.set(`관통 ${i}/${j}`, f);
        if (f === F && Math.abs(d) < GAP * 0.25) hits.set(`끝상태 밀착 ${i}/${j} d=${d.toExponential(1)}`, f);
        if (sg) prevSign.set(key, sg);
      }
    });
    if (hits.size) console.log(`${m.id} ${si + 1}단계${p.sim ? '(복합)' : ''}: ${[...hits].slice(0, 6).map(([k, f]) => `${k}@${f}`).join(', ')}${hits.size > 6 ? ` 외 ${hits.size - 6}` : ''}`);
  });
}
