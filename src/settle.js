// 겹 다지기 (화면 표시용): 평평하게 접힌 상태에서 겹을 실제 종이처럼 아래 겹 바로 위에 내려앉힌다.
//
// 엔진은 접을 때마다 접히는 조각을 겹치는 조각들 위로 올려 쌓는다. 그래서 몸통 속에서 다른 겹을 사이에 둔
// 두 겹은, 그 사이에 아무것도 없는 곳(학의 목 끝)에서도 몸통 두께만큼 떨어져 '여러 장'처럼 보인다.
// 실제 종이는 휘어서 빈 곳에서는 붙는다.
//
// 점별 겹 쌓기: 종이 위 한 점의 높이는 그 자리(x, y)에 실제로 겹쳐 있는 겹들만 보고 정한다.
// 가운데(z=0, 바닥 겹)에서 바깥쪽으로, 그 자리에서 자기보다 안쪽에 있는 겹의 수 × 간격(STEP)으로 다시 쌓는다.
// 겹이 '있다'는 0~1 의 부드러운 값(덮임 정도)이다: 겹 안과 가장자리 바깥 HOLD 까지는 1, 그 뒤 FADE 거리 동안 0으로.
//  - 겹 순서는 어느 점에서나 그대로고, 위 겹은 아래 겹보다 늘 STEP 이상 높다 (아래 겹이 있는 곳에서 덮임 정도가 1)
//  - 한 면(같은 높이로 이어진 조각들)은 같은 자리에서 같은 값을 받아 끊기지 않는다
//  - 아래 겹이 끝나는 곳에서는 위 겹이 부드럽게 내려앉는다. 높이가 매끄럽게 바뀌므로 화면 메시를 어떻게 나눠도
//    (겹마다 나누는 격자가 달라도) 겹끼리 뚫고 지나가지 않는다. 비탈은 아래 겹 가장자리에서 HOLD 이상 떨어진 곳에서 시작한다
// 엔진 계산은 평평한 원래 높이로 하고, 이 값은 그릴 때만 더한다.

const TOL = 1e-7;
// 화면 메시의 한 칸 크기(최대). 비탈이 시작되는 거리(HOLD)를 이보다 크게 두어, 아래 겹 가장자리에 걸친 칸은 평평하다
export const SETTLE_CELL = 0.04;
const HOLD = SETTLE_CELL, FADE = 0.06;
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// 평평한 상태(모든 면이 수평)일 때만 쓸 수 있는 높이 질의 구조. 아니면 null
export function flatLevels(P, gap) {
  const STEP = gap * 0.6; // 다진 겹 사이 간격 (화면 깊이 정밀도보다 충분히 크게)
  const n = P.length, Z = new Float64Array(n), box = [];
  for (let i = 0; i < n; i++) {
    const L = P[i];
    let zmin = Infinity, zmax = -Infinity, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const v of L) {
      zmin = Math.min(zmin, v[2]); zmax = Math.max(zmax, v[2]);
      x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]);
    }
    if (zmax - zmin > 1e-6) return null;
    Z[i] = (zmin + zmax) / 2;
    const d = HOLD + FADE;
    box.push([x0 - d, x1 + d, y0 - d, y1 + d]);
  }
  // 같은 높이(1e-6 이내)는 한 겹(level)으로 본다
  const order = [...Array(n).keys()].sort((a, b) => Z[a] - Z[b]);
  const lev = new Int32Array(n), lz = [];
  for (const i of order) { if (!lz.length || Z[i] - lz[lz.length - 1] > 1e-6) lz.push(Z[i]); lev[i] = lz.length - 1; }
  // 볼록 다각형까지의 거리 (안이면 0, 모서리 근처는 근사)
  const orient = P.map((L) => { let a = 0; for (let k = 0; k < L.length; k++) { const p = L[k], q = L[(k + 1) % L.length]; a += p[0] * q[1] - p[1] * q[0]; } return a >= 0 ? 1 : -1; });
  const distTo = (j, x, y) => {
    const L = P[j], sg = orient[j];
    let d = 0;
    for (let k = 0; k < L.length; k++) {
      const a = L[k], b = L[(k + 1) % L.length], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
      if (l < 1e-12) continue;
      d = Math.max(d, -(sg * (dx * (y - a[1]) - dy * (x - a[0]))) / l);
    }
    return d;
  };
  const cov = new Float64Array(lz.length);
  // 면 i 위의 점 (x, y)의 높이 변화량
  const query = (i, x, y) => {
    const zi = Z[i];
    if (Math.abs(zi) < 1e-6) return 0;
    const up = zi > 0;
    cov.fill(0);
    for (let j = 0; j < n; j++) {
      const zj = Z[j];
      // 0 과 자기 사이에 있는 겹만 센다
      if (up ? !(zj > 1e-6 && zj < zi - 1e-6) : !(zj < -1e-6 && zj > zi + 1e-6)) continue;
      const b = box[j];
      if (x < b[0] || x > b[1] || y < b[2] || y > b[3]) continue;
      const c = 1 - smooth((distTo(j, x, y) - HOLD) / FADE);
      if (c > cov[lev[j]]) cov[lev[j]] = c;
    }
    let cnt = 1;
    for (let l = 0; l < lz.length; l++) cnt += cov[l];
    return (up ? 1 : -1) * STEP * cnt - zi;
  };
  return { query };
}
