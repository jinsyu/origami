// 겹 다지기 (화면 표시용): 평평하게 접힌 상태에서 겹을 실제 종이처럼 아래 겹 바로 위에 내려앉힌다.
//
// 엔진은 접을 때마다 접히는 조각을 겹치는 조각들 위로 올려 쌓는다. 그래서 몸통 속에서 다른 겹을 사이에 둔
// 두 겹은, 그 사이에 아무것도 없는 곳(학의 목 끝)에서도 몸통 두께만큼 떨어져 '여러 장'처럼 보인다.
// 실제 종이는 휘어서 빈 곳에서는 붙는다.
//
// 점별 겹 쌓기 (평면마다): 종이 위 한 점의 높이는 그 자리(x, y)에 실제로 겹쳐 있는 겹들만 보고 정한다.
// 바닥(가장 낮은 겹)에서부터, 그 자리 아래에 깔린 겹들의 (높이 + 간격 STEP × 덮임 정도) 가운데 최댓값 (책상 위 종이처럼).
// 겹이 '있다'는 0~1 의 부드러운 값(덮임 정도)이다: 겹 안과 가장자리 바깥 HOLD 까지는 1, 그 뒤 FADE 거리 동안 0으로.
//  - 겹 순서는 어느 점에서나 그대로고, 위 겹은 아래 겹보다 늘 STEP 이상 높다 (아래 겹이 있는 곳에서 덮임 정도가 1)
//  - 같은 면으로 평평하게 이어진 조각들(엔진이 조금 다른 높이에 둔 '계단')은 순서가 깨지지 않으면 한 높이로 합쳐,
//    이음새 양쪽에 깔린 겹 수가 같으면 높이도 같다 (학 날개·등 가운데 선)
//  - 아래 겹이 끝나는 곳에서는 위 겹이 부드럽게 내려앉는다. 높이가 매끄럽게 바뀌므로 화면 메시를 어떻게 나눠도
//    (겹마다 나누는 격자가 달라도) 겹끼리 뚫고 지나가지 않는다. 비탈은 아래 겹 가장자리에서 HOLD 이상 떨어진 곳에서 시작한다
// 엔진 계산은 평평한 원래 높이로 하고, 이 값은 그릴 때만 더한다.

const TOL = 1e-7;
// 화면 메시의 한 칸 크기(최대). 비탈이 시작되는 거리(HOLD)를 이보다 크게 두어, 아래 겹 가장자리에 걸친 칸은 평평하다
export const SETTLE_CELL = 0.04;
const HOLD = SETTLE_CELL, FADE = 0.15; // 비탈 폭: 여러 겹이 한 선에서 함께 끝나도 경사가 완만해 메시 보간 오차가 겹 간격보다 훨씬 작다
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// 평평한 상태(모든 면이 수평)일 때만 쓸 수 있는 높이 질의 구조. 아니면 null
export function flatLevels(P, gap, polys) {
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
  // 같은 면: 종이 위에서 변을 맞대고, 같은 쪽을 향하고, 높이 차이가 작은 조각들 (엔진이 접는 과정에서 평평하게 이어진
  // 두 조각을 조금 다른 높이에 둔 '계단'). 서로의 겹 수에 세지 않아야 이음새에서 높이가 같아진다
  const par = [...Array(n).keys()];
  const find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
  if (polys) for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (orient[i] !== orient[j] || Math.abs(Z[i] - Z[j]) > gap * 8 || find(i) === find(j)) continue;
    if (shareUvEdge(polys[i].uv, polys[j].uv)) par[find(i)] = find(j);
  }
  const unit = par.map((_, i) => find(i));
  // 실제로 겹치는(속이 겹치는) 조각 쌍. 경계 바깥까지 넓혀 세는 것은 겹치는 겹끼리만 한다
  // (나란히 맞붙은 다른 쪽 겹까지 세면 이음새 양쪽 높이가 어긋난다)
  const ov = [...Array(n)].map(() => new Uint8Array(n));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (overlap2(P[i], P[j])) ov[i][j] = ov[j][i] = 1;
  // 같은 면으로 이어진 조각들은 한 높이(평균)로 본다: 엔진이 남긴 '평평한 계단'이 화면에서 사라진다.
  // 합친 뒤에도 실제로 겹치는 모든 쌍의 위아래 순서가 그대로일 때만 합친다 (깨지는 묶음은 원래 높이로)
  const Zf = Float64Array.from(Z), merged = new Uint8Array(n).fill(1);
  const members = new Map();
  unit.forEach((u, i) => { if (!members.has(u)) members.set(u, []); members.get(u).push(i); });
  const setMeans = () => {
    for (const [, ids] of members) {
      const on = ids.length > 1 && ids.every((i) => merged[i]);
      const m = ids.reduce((s2, i) => s2 + Z[i], 0) / ids.length;
      for (const i of ids) Zf[i] = on ? m : Z[i];
    }
  };
  setMeans();
  // 순서를 따질 쌍: 넓게 겹치는 쌍만 (경첩 근처 몇 mm 스치는 겹침은 엔진 계산의 흔적이라 따지지 않는다)
  const area = (Q) => { let a = 0; for (let k = 0; k < Q.length; k++) { const p = Q[k], q = Q[(k + 1) % Q.length]; a += p[0] * q[1] - p[1] * q[0]; } return Math.abs(a) / 2; };
  const big = (i, j) => area(clip2(P[i], P[j])) > 0.05 * Math.min(area(P[i]), area(P[j]));
  for (let it = 0; it < n; it++) {
    let bad = false;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (!ov[i][j] || unit[i] === unit[j]) continue;
      const d0 = Z[i] - Z[j], d1 = Zf[i] - Zf[j];
      if (Math.abs(d0) < 1e-6 || (Math.sign(d0) === Math.sign(d1) && Math.abs(d1) > 1e-6) || !big(i, j)) continue;
      for (const k of [i, j]) for (const m of members.get(unit[k])) if (merged[m]) { merged[m] = 0; bad = true; }
    }
    if (!bad) break;
    setMeans();
  }
  // 면 i 위의 점 (x, y)의 높이: 바닥(가장 낮은 겹)에서 시작해, 그 자리 아래에 깔린 겹들의 (높이 + STEP × 덮임 정도) 가운데 최댓값.
  // 아래 겹이 실제로 있는 곳(덮임 1)에서는 늘 그 겹보다 STEP 이상 높다 (어떤 겹을 세지 않더라도 이 보장은 깨지지 않는다)
  let base = Infinity;
  for (let i = 0; i < n; i++) base = Math.min(base, Zf[i]);
  const order2 = [...Array(n).keys()].sort((a2, b2) => Zf[a2] - Zf[b2]);
  // 한 점에서 그 자리의 모든 겹 높이를 아래에서부터 한 번에 구해 기억한다 (같은 자리를 여러 면·꼭짓점이 묻는다)
  const cache = new Map();
  const C = new Float64Array(n), D = new Float64Array(n), H = new Float64Array(n);
  const heightsAt = (x, y) => {
    const key = Math.round(x * 1e8) + ',' + Math.round(y * 1e8);
    let r = cache.get(key);
    if (r) return r;
    const ids = [];
    for (const j of order2) {
      const b = box[j];
      if (x < b[0] || x > b[1] || y < b[2] || y > b[3]) continue;
      D[j] = distTo(j, x, y);
      C[j] = 1 - smooth((D[j] - HOLD) / FADE);
      ids.push(j);
    }
    // 낮은 겹부터: 자기 아래에 깔린(관계있는) 겹들의 (높이 + STEP × 덮임) 가운데 최댓값
    for (let a2 = 0; a2 < ids.length; a2++) {
      const i = ids[a2];
      let h = base;
      for (let b2 = 0; b2 < a2; b2++) {
        const j = ids[b2];
        if (!(Zf[j] < Zf[i] - 1e-6) || C[j] <= 0 || !ov[i][j]) continue;
        if (unit[j] === unit[i] && D[j] > 0) continue; // 같은 면의 이웃 조각
        const v = H[j] + STEP * C[j];
        if (v > h) h = v;
      }
      H[i] = h;
    }
    r = new Map(ids.map((i) => [i, H[i]]));
    if (cache.size > 50000) cache.clear();
    cache.set(key, r);
    return r;
  };
  const below = (i, x, y) => { const v = heightsAt(x, y).get(i); return v === undefined ? base : v; };
  const query0 = (i, x, y) => below(i, x, y) - Z[i];
  // 묶음 전체의 평균 이동이 0이 되게 상수만큼 옮긴다 (다른 평면 묶음과 이어진 경첩이 벌어지지 않게. 상수라 순서·이음새는 그대로)
  let shift = 0, cntS = 0;
  for (let i = 0; i < n; i++) for (const v of P[i]) { shift += query0(i, v[0], v[1]); cntS++; }
  shift /= cntS || 1;
  const query = (i, x, y) => query0(i, x, y) - shift;
  return { query };
}

// 두 다각형이 종이 위(uv)에서 변을 (일부라도) 맞대는지
function shareUvEdge(A, B) {
  for (let a = 0; a < A.length; a++) {
    const a1 = A[a], a2 = A[(a + 1) % A.length], dx = a2[0] - a1[0], dy = a2[1] - a1[1], L = Math.hypot(dx, dy);
    if (L < 1e-9) continue;
    for (let b = 0; b < B.length; b++) {
      const b1 = B[b], b2 = B[(b + 1) % B.length];
      const c1 = (dx * (b1[1] - a1[1]) - dy * (b1[0] - a1[0])) / L, c2 = (dx * (b2[1] - a1[1]) - dy * (b2[0] - a1[0])) / L;
      if (Math.abs(c1) > 1e-6 || Math.abs(c2) > 1e-6) continue;
      const t1 = (dx * (b1[0] - a1[0]) + dy * (b1[1] - a1[1])) / L, t2 = (dx * (b2[0] - a1[0]) + dy * (b2[1] - a1[1])) / L;
      if (Math.min(L, Math.max(t1, t2)) - Math.max(0, Math.min(t1, t2)) > 1e-6) return true;
    }
  }
  return false;
}

// 두 볼록 다각형(xy)의 속이 겹치는지 (분리축)
function overlap2(A, B) {
  for (const Q of [A, B]) {
    for (let k = 0; k < Q.length; k++) {
      const a = Q[k], b = Q[(k + 1) % Q.length], nx = a[1] - b[1], ny = b[0] - a[0], L = Math.hypot(nx, ny);
      if (L < 1e-12) continue;
      let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
      for (const p of A) { const v = (p[0] * nx + p[1] * ny) / L; a0 = Math.min(a0, v); a1 = Math.max(a1, v); }
      for (const p of B) { const v = (p[0] * nx + p[1] * ny) / L; b0 = Math.min(b0, v); b1 = Math.max(b1, v); }
      if (a1 <= b0 + 1e-6 || b1 <= a0 + 1e-6) return false;
    }
  }
  return true;
}

// 볼록 다각형 a 를 볼록 다각형 b 로 자른 교집합 (xy)
function clip2(a, b) {
  const cr = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const ccw = (Q) => { let s = 0; for (let k = 0; k < Q.length; k++) s += Q[k][0] * Q[(k + 1) % Q.length][1] - Q[k][1] * Q[(k + 1) % Q.length][0]; return s >= 0 ? Q : [...Q].reverse(); };
  let out = ccw(a.map((p) => [p[0], p[1]]));
  const B = ccw(b.map((p) => [p[0], p[1]]));
  for (let i = 0; i < B.length && out.length; i++) {
    const p = B[i], q = B[(i + 1) % B.length], inp = out;
    out = [];
    for (let j = 0; j < inp.length; j++) {
      const s0 = inp[j], e0 = inp[(j + 1) % inp.length], ds = cr(p, q, s0), de = cr(p, q, e0);
      if (ds >= 0) out.push(s0);
      if ((ds >= 0) !== (de >= 0)) { const t = ds / (ds - de); out.push([s0[0] + (e0[0] - s0[0]) * t, s0[1] + (e0[1] - s0[1]) * t]); }
    }
  }
  return out;
}
