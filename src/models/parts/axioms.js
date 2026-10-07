// 접는 선 작도 (종이접기 공리, Huzita–Hatori)
// 도안의 문장("변을 가운데 선에 맞춰", "꼭짓점을 저 점에 맞춰")을 그대로 선으로 옮긴다. 좌표를 손으로 계산하지 않는다.
//
// 선은 [[x1, y1], [x2, y2]] (두 점), 점은 [x, y].
// 동작의 line·side·grab·spine 자리에 함수 (S) => 값 을 쓰면 엔진이 그 단계 직전 종이 상태 S 를 넘겨준다:
//   S.at(uv)       종이 위 점 uv(처음 펼친 종이에서의 좌표)가 지금 놓인 자리 [x, y]
//   S.edge(u1, u2) 종이 위 두 점을 잇는 선이 지금 놓인 자리 (선)
// 예) 오른쪽 아래 변을 가로 가운데 선에 맞춰 접기:
//   line: (S) => lineToLine(S.edge(B, R), [[-1, 0], [1, 0]], S.at(B))

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = (a) => Math.hypot(a[0], a[1]);
const unit = (a) => mul(a, 1 / (len(a) || 1));
const dirOf = (l) => unit(sub(l[1], l[0]));
const lineFrom = (p, d) => [p, add(p, d)];

export const mid = (p, q) => mul(add(p, q), 0.5);
// 선 위의 점 (t=0 첫 점, t=1 둘째 점)
export const along = (l, t) => add(l[0], mul(sub(l[1], l[0]), t));
// 두 선의 교점 (나란하면 null)
export function intersect(l1, l2) {
  const d1 = sub(l1[1], l1[0]), d2 = sub(l2[1], l2[0]), den = d1[0] * d2[1] - d1[1] * d2[0];
  if (Math.abs(den) < 1e-12) return null;
  const t = ((l2[0][0] - l1[0][0]) * d2[1] - (l2[0][1] - l1[0][1]) * d2[0]) / den;
  return along(l1, t);
}
// 점 p 를 선 l 에 대해 접어 넘긴 자리
export function reflect(p, l) {
  const d = dirOf(l), v = sub(p, l[0]);
  return sub(mul(add(l[0], mul(d, dot(v, d))), 2), p);
}
// 점에서 선까지의 부호 있는 거리 (선 방향의 왼쪽이 +)
export const sideDist = (p, l) => { const d = dirOf(l), v = sub(p, l[0]); return d[0] * v[1] - d[1] * v[0]; };

// 공리 1: 두 점을 지나는 선
export const through = (p, q) => [p, q];
// 공리 2: 점 p 를 점 q 에 맞추는 선 (수직 이등분선)
export const pointToPoint = (p, q) => { const m = mid(p, q), d = sub(q, p); return lineFrom(m, [-d[1], d[0]]); };
// 공리 3: 선 l1 을 선 l2 에 맞추는 선 (각의 이등분선). 두 선이 만나면 이등분선이 둘이므로
// near(그 점에 더 가까이 지나는 쪽) 로 고른다. 나란하면 두 선 한가운데
export function lineToLine(l1, l2, near) {
  const P = intersect(l1, l2), d1 = dirOf(l1);
  let d2 = dirOf(l2);
  if (!P) return lineFrom(mid(l1[0], add(l2[0], mul(d2, dot(sub(l1[0], l2[0]), d2)))), d1);
  const a = lineFrom(P, unit(add(d1, d2))), b = lineFrom(P, unit(sub(d1, d2)));
  if (!near) return a;
  return Math.abs(sideDist(near, a)) <= Math.abs(sideDist(near, b)) ? a : b;
}
// 공리 4: 점 p 를 지나고 선 l 에 수직인 선
export const perpThrough = (l, p) => { const d = dirOf(l); return lineFrom(p, [-d[1], d[0]]); };
// 나란한 선: 점 p 를 지나고 선 l 과 나란한 선 (계단 접기의 둘째 선 등)
export const parallelThrough = (l, p) => lineFrom(p, dirOf(l));
// 공리 5: 점 q 를 지나면서 점 p 를 선 l 위에 놓는 선. 답이 둘이면 near 에 더 가까운 자리로 p 가 가는 쪽
export function pointToLineThrough(p, l, q, near) {
  // p 가 놓일 자리 X: l 위에 있고 |X - q| = |p - q|
  const d = dirOf(l), r = len(sub(p, q)), f = add(l[0], mul(d, dot(sub(q, l[0]), d)));
  const h = len(sub(q, f));
  if (h > r + 1e-12) return null;
  const s = Math.sqrt(Math.max(0, r * r - h * h));
  const cands = [add(f, mul(d, s)), add(f, mul(d, -s))];
  const X = near ? (len(sub(cands[0], near)) <= len(sub(cands[1], near)) ? cands[0] : cands[1]) : cands[0];
  return pointToPoint(p, X);
}
// 공리 7: 선 m 에 수직이면서 점 p 를 선 l 위에 놓는 선
export function pointToLinePerp(p, l, m) {
  const dm = dirOf(m), n = [-dm[1], dm[0]];
  // p 는 m 방향으로 움직여 l 과 만난다
  const X = intersect(lineFrom(p, dm), l);
  if (!X) return null;
  const c = mid(p, X);
  return lineFrom(c, n);
}
// 선을 거꾸로 (접는 방향을 바꿀 때가 아니라 끝점 순서만 바꿈)
export const reversed = (l) => [l[1], l[0]];
