// 꾸미기 검사: 마지막 단계의 획·점이 정면에서 본 종이 위에 있는지 (npm run inkcheck [id])
import { buildModel, endPose } from '../src/engine.js';
import { MODELS } from '../src/models/index.js';
const only = process.argv[2];
const inPoly = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
let bad = 0;
for (const m of MODELS) {
  if (only && m.id !== only) continue;
  const plans = buildModel(m), last = plans.at(-1);
  const ink = last.inked || [];
  if (!ink.length) continue;
  const polys = endPose(last).map((P) => P.map((q) => [q[0], q[1]]));
  const pts = [];
  for (const d of ink) {
    if (d.dot) { const r = d.r || 0.02, ry = d.ry || r; pts.push(d.dot, [d.dot[0] + r, d.dot[1]], [d.dot[0] - r, d.dot[1]], [d.dot[0], d.dot[1] + ry], [d.dot[0], d.dot[1] - ry]); }
    if (d.line) pts.push(...d.line);
    if (d.poly) pts.push(...d.poly);
  }
  const out = pts.filter((p) => !polys.some((P) => inPoly(p, P)));
  if (out.length) { bad++; console.log(`✗ ${m.name}(${m.id}): 종이 밖 꾸미기 점 ${out.length}/${pts.length} 예) ${out.slice(0, 3).map((p) => p.map((v) => v.toFixed(3)).join(',')).join(' / ')}`); }
}
console.log(bad ? `꾸미기가 종이 밖에 있는 작품 ${bad}개` : '모든 꾸미기가 종이 위');
