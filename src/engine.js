// 종이 접기 엔진
// 종이를 볼록 다각형들의 집합으로 표현한다. 접기마다 접힘선(평면)으로 다각형을 정확히 잘라낸 뒤,
// 접히는 쪽 다각형을 접힘선을 축으로 회전시킨다.
// - 단순 단계: 여러 회전을 동시에 진행하는 강체 애니메이션 (pose)
// - 복합 단계(sim): 하위 동작을 차례로 적용해 최종 평면 상태를 만들고,
//   접힌 선의 각도를 목표값으로 옮기는 제약 풀이기(sim.js)로 움직임을 만든다.
//   (안쪽 뒤집어 접기, 펼쳐 누르기, 꽃잎 접기, 가라앉히기 등)

export const GAP = 0.0008; // 겹친 종이 층 사이 간격
const E = 1e-7;
import { flatLevels } from './settle.js';
const CUT = 3; // 임시: 방금 자른 모서리
// 모서리 종류: 1 = 종이 가장자리, 2 = 접힌 선, 0 = seam(계산용으로만 나눈 자리, 그리지 않음)

export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
const lerp = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
export const centroid = (pts) => pts.reduce((s, p) => s.map((x, i) => x + p[i] / pts.length), pts[0].map(() => 0));

// 점 p를 축(원점 o, 단위방향 d) 기준으로 th 라디안 회전 (로드리게스 공식)
export function rotate(p, o, d, th) {
  const v = sub(p, o), c = Math.cos(th), s = Math.sin(th);
  const k = cross(d, v), kd = dot(d, v) * (1 - c);
  return [o[0] + v[0] * c + k[0] * s + d[0] * kd, o[1] + v[1] * c + k[1] * s + d[1] * kd, o[2] + v[2] * c + k[2] * s + d[2] * kd];
}

// 다각형 법선 (Newell 방식)
export function polyNormal(pts) {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    x += (a[1] - b[1]) * (a[2] + b[2]);
    y += (a[2] - b[2]) * (a[0] + b[0]);
    z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

// 이웃한 두 면 A, B 사이의 접힌 각도 (A의 k번째 모서리 방향 기준, 부호 있음)
// 0 = 평평, -π = 골짜기 접기로 완전히 접힘(B가 A 위), +π = 산 접기로 완전히 접힘
export function foldAngle(PA, PB, k) {
  const nA = polyNormal(PA), nB = polyNormal(PB);
  const e = norm(sub(PA[(k + 1) % PA.length], PA[k]));
  const c = dot(nA, nB);
  if (c < -0.9995) return dot(sub(centroid(PB), centroid(PA)), nA) > 0 ? -Math.PI : Math.PI;
  return Math.atan2(dot(cross(nA, nB), e), c);
}

const cxyz = (q) => { const c = centroid(q.p); return { x: c[0], y: c[1], z: c[2] }; };
const clonePoly = (q) => ({ p: q.p.map((v) => v.slice()), uv: q.uv, e: q.e, tags: new Set(q.tags), owner: -1, hist: q.hist, par: q.par });

// 볼록 다각형을 평면(o, n)으로 둘로 자른다. 걸치지 않으면 null
// 위치 기록(hist)도 같은 비율로 함께 자른다.
function splitPoly(q, o, n) {
  const ds = q.p.map((p) => dot(sub(p, o), n));
  if (!ds.some((x) => x > E) || !ds.some((x) => x < -E)) return null;
  const A = [], B = [], N = q.p.length;
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N, di = ds[i], dj = ds[j];
    const si = di > E ? 1 : di < -E ? -1 : 0, sj = dj > E ? 1 : dj < -E ? -1 : 0;
    const v = { i, j: i, t: 0, on: si === 0, src: i };
    if (si >= 0) A.push(v);
    if (si <= 0) B.push(v);
    if (si * sj < 0) {
      const x = { i, j, t: di / (di - dj), on: true, src: i };
      A.push(x); B.push(x);
    }
  }
  const at = (arr, v) => (v.t === 0 ? arr[v.i].slice() : lerp(arr[v.i], arr[v.j], v.t));
  const build = (L) => ({
    p: L.map((v) => at(q.p, v)),
    uv: L.map((v) => at(q.uv, v)),
    e: L.map((v, k) => (v.on && L[(k + 1) % L.length].on ? CUT : q.e[v.src])),
    tags: new Set(q.tags),
    owner: -1,
    hist: q.hist ? q.hist.map((h) => L.map((v) => at(h, v))) : undefined,
    par: q.par,
  });
  return [build(A), build(B)];
}

// 2D 볼록 다각형 겹침 판정 (분리축 정리)
function overlap(A, B) {
  for (const P of [A, B]) {
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      const nx = a[1] - b[1], ny = b[0] - a[0], L = Math.hypot(nx, ny);
      if (L < 1e-12) continue;
      let amin = Infinity, amax = -Infinity, bmin = Infinity, bmax = -Infinity;
      for (const p of A) { const v = (p[0] * nx + p[1] * ny) / L; amin = Math.min(amin, v); amax = Math.max(amax, v); }
      for (const p of B) { const v = (p[0] * nx + p[1] * ny) / L; bmin = Math.min(bmin, v); bmax = Math.max(bmax, v); }
      if (amax <= bmin + 1e-5 || bmax <= amin + 1e-5) return false;
    }
  }
  return true;
}

// 동작 하나: 접힘선으로 자르고, 접힐 다각형을 고르고, 회전축·방향을 정한다
function selectMove(cur, m, mi) {
  // 3차원 축 회전: 이미 나뉜 조각을 조건으로만 골라 임의의 축(a→b)으로 돌린다 (입체 조립용)
  if (m.axis3) {
    for (const q of cur) if (q.owner === -1 && (!m.filter || m.filter({ ...cxyz(q), uv: centroid(q.uv), tags: q.tags }))) q.owner = mi;
    const mem = cur.filter((q) => q.owner === mi);
    if (m.tag) mem.forEach((q) => q.tags.add(m.tag));
    const d = norm(sub(m.axis3.b, m.axis3.a));
    const off = m.offset || [0, 0, 0], ol = Math.hypot(...off);
    return { cur, mv: { o: m.axis3.a, d, u: ol ? mul(off, 1 / ol) : [0, 0, 1], n: [0, 0, 0], theta: (m.axis3.angle * Math.PI) / 180, shift: ol, spin: true } };
  }
  if (m.spin) {
    for (const q of cur) if (q.owner === -1) q.owner = mi;
    const d = norm(sub(m.spin.b, m.spin.a));
    return { cur, mv: { o: m.spin.a, d, u: [0, 0, 1], n: [0, 0, 0], theta: (m.spin.angle * Math.PI) / 180, shift: 0, spin: true } };
  }
  const u = [0, 0, m.toward ?? 1];
  let o = [m.line[0][0], m.line[0][1], 0];
  const d = norm(sub([m.line[1][0], m.line[1][1], 0], o));
  const n = norm(cross(d, u));
  const sideOf = (c) => dot(sub([c[0], c[1], 0], o), n);
  const ref = m.side ? Math.sign(sideOf(m.side)) : m.grab ? Math.sign(sideOf(m.grab)) : 0;
  const sel = (q) => {
    const c = centroid(q.p);
    if (ref && sideOf(c) * ref <= 1e-6) return false;
    return m.filter ? m.filter({ x: c[0], y: c[1], z: c[2], uv: centroid(q.uv), tags: q.tags }) : true;
  };

  // grab: 잡은 점에서 시작해, 접는 선 너머로 넘어가지 않고 종이로 이어진 조각만 함께 접는다 (실제 종이처럼)
  if (m.grab) return grabMove(cur, m, mi, o, d, n, u, sideOf, ref);

  const next = [];
  for (const q of cur) {
    if (q.owner !== -1) { next.push(q); continue; }
    const parts = splitPoly(q, o, n);
    if (parts) {
      const s = parts.map(sel);
      if (s[0] !== s[1]) {
        parts.forEach((pt, k) => { pt.e = pt.e.map((f) => (f === CUT ? (m.seam ? 0 : 2) : f)); pt.owner = s[k] ? mi : -1; next.push(pt); });
        continue;
      }
    }
    q.owner = sel(q) ? mi : -1;
    next.push(q);
  }

  return finishMove(next, m, mi, o, d, n, u);
}

// 2D 점이 볼록 다각형 안에 있는지 (변 위 포함)
function inPoly2(pt, P) {
  let sgn = 0;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    const c = (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]);
    if (Math.abs(c) < 1e-9) continue;
    if (sgn && Math.sign(c) !== sgn) return false;
    sgn = Math.sign(c);
  }
  return true;
}
// 맞댄 변이 있지만 그 변이 skip(위치) 조건을 만족하면 건너뛴다 (등선처럼 넘지 않을 변)
function shareEdgeOff(A, B, skip) {
  for (let i = 0; i < A.uv.length; i++) {
    const i2 = (i + 1) % A.uv.length;
    if (skip(A.p[i]) && skip(A.p[i2])) continue;
    if (shareEdge({ uv: [A.uv[i], A.uv[i2]] }, B, true)) return true;
  }
  return false;
}
// 두 다각형이 종이 위에서 변을 (일부라도) 맞대고 있는지 (open: A를 닫히지 않은 선분 목록으로 본다)
function shareEdge(A, B, open = false) {
  for (let i = 0; i < (open ? A.uv.length - 1 : A.uv.length); i++) {
    const a1 = A.uv[i], a2 = A.uv[(i + 1) % A.uv.length];
    const dx = a2[0] - a1[0], dy = a2[1] - a1[1], L = Math.hypot(dx, dy);
    if (L < 1e-9) continue;
    for (let j = 0; j < B.uv.length; j++) {
      const b1 = B.uv[j], b2 = B.uv[(j + 1) % B.uv.length];
      const c1 = (dx * (b1[1] - a1[1]) - dy * (b1[0] - a1[0])) / L, c2 = (dx * (b2[1] - a1[1]) - dy * (b2[0] - a1[0])) / L;
      if (Math.abs(c1) > 1e-6 || Math.abs(c2) > 1e-6) continue;
      const t1 = (dx * (b1[0] - a1[0]) + dy * (b1[1] - a1[1])) / L, t2 = (dx * (b2[0] - a1[0]) + dy * (b2[1] - a1[1])) / L;
      if (Math.min(L, Math.max(t1, t2)) - Math.max(0, Math.min(t1, t2)) > 1e-6) return true;
    }
  }
  return false;
}

// grab 선택: 접는 선으로 모든 조각을 잘라 본 뒤, 움직이는 쪽 조각들 가운데 잡은 점을 덮는 조각
// (layers: 'top' 맨 위 한 장, 'all' 그 점의 모든 겹, 숫자 n 위에서 n장)에서 출발해 변으로 이어진 조각을 모은다.
// 접는 선 반대쪽으로는 넘어가지 않으므로, 같은 쪽에서 접힌 선으로 이어진 겹은 함께 움직이고 그렇지 않은 겹은 남는다.
function grabMove(cur, m, mi, o, d, n, u, sideOf, ref) {
  const pieces = [];
  for (const q of cur) {
    if (q.owner !== -1) { pieces.push({ q, src: q, cand: false }); continue; }
    const parts = splitPoly(q, o, n);
    const list = parts || [q];
    for (const pt of list) {
      const c = centroid(pt.p);
      const on = sideOf(c) * ref > 1e-6 && (!m.filter || m.filter({ x: c[0], y: c[1], z: c[2], uv: centroid(pt.uv), tags: pt.tags }));
      pieces.push({ q: pt, src: q, split: !!parts, cand: on });
    }
  }
  const cands = pieces.filter((p) => p.cand);
  const g = m.grab, under = cands.filter((p) => inPoly2(g, p.q.p.map((v) => [v[0], v[1]])));
  under.sort((a, b) => dot(centroid(b.q.p), u) - dot(centroid(a.q.p), u)); // 접는 쪽(toward)에서 가까운 겹부터
  const k = m.layers === 'all' ? under.length : typeof m.layers === 'number' ? m.layers : 1;
  const seen = new Set(under.slice(0, k)), queue = [...seen];
  while (queue.length) {
    const a = queue.pop();
    for (const b of cands) if (!seen.has(b) && shareEdge(a.q, b.q)) { seen.add(b); queue.push(b); }
  }
  // half: 잡은 날개의 겹을 높이로 앞 절반('front')·뒤 절반('back')으로 나눈다 (뒤집어 접기에서 두 쪽이 반대로 접힌다)
  // half: 잡은 날개의 겹을 보는 쪽(z) 높이 순으로 세워 위 절반('front')·아래 절반('back')으로 나눈다.
  // 뒤집어 접기에서 날개의 앞 겹과 뒤 겹은 장수가 같으므로 장수로 반을 가른다
  if (m.half) {
    const all = [...seen].sort((p1, p2) => centroid(p2.q.p)[2] - centroid(p1.q.p)[2]);
    const keep = m.half === 'front' ? all.slice(0, Math.ceil(all.length / 2)) : all.slice(Math.floor(all.length / 2));
    for (const p of all) if (!keep.includes(p)) seen.delete(p);
  }
  // 나뉜 조각 가운데 한쪽만 움직이면 나눈 채로, 아니면 원래 다각형으로 되돌린다
  const next = [];
  const bySrc = new Map();
  for (const p of pieces) { if (!bySrc.has(p.src)) bySrc.set(p.src, []); bySrc.get(p.src).push(p); }
  for (const [src, ps] of bySrc) {
    if (src.owner !== -1) { next.push(src); continue; }
    const moved = ps.map((p) => seen.has(p));
    if (ps.length > 1 && moved.some((x) => x) && !moved.every((x) => x)) {
      ps.forEach((p, i) => { p.q.e = p.q.e.map((f) => (f === CUT ? (m.seam ? 0 : 2) : f)); p.q.owner = moved[i] ? mi : -1; next.push(p.q); });
    } else { src.owner = moved.some((x) => x) ? mi : -1; next.push(src); }
  }
  return finishMove(next, m, mi, o, d, n, u);
}

// 고른 조각들로 회전축·방향을 정한다
function finishMove(next, m, mi, o, d, n, u) {
  const mem = next.filter((q) => q.owner === mi);
  if (m.tag) mem.forEach((q) => q.tags.add(m.tag));
  if (m.untag) mem.forEach((q) => q.tags.delete(m.untag));
  // 회전축 높이를 실제 접힘선 위치(층 높이)에 맞춘다
  let hs = 0, hc = 0;
  for (const q of mem) for (const p of q.p) if (Math.abs(dot(sub(p, o), n)) < 1e-6) { hs += dot(p, u); hc++; }
  if (hc) o = add(o, mul(u, hs / hc - dot(o, u)));
  // 회전 방향: 접히는 부분이 toward 쪽으로 들리도록
  let sg = 1;
  outer: for (const q of mem) for (const p of q.p) {
    const t = dot(cross(d, sub(p, o)), u);
    if (Math.abs(t) > 1e-6) { sg = Math.sign(t); break outer; }
  }
  const angle = m.angle ?? 180;
  const mv = { o, d, n, u, theta: (sg * angle * Math.PI) / 180, shift: 0, flat: angle >= 179, unfold: !!m.unfold, fixedShift: m.shift, insert: m.insert, noRejoin: !!m.noRejoin };

  // 뒤집어 접기 경로: 날개(flap)가 등선을 축으로 책처럼 펼쳐졌다 반대로 닫히면서(180°),
  // 동시에 접는 선과 등선이 만나는 점을 중심으로 평면 안에서 2(α-β)만큼 돈다.
  // 두 회전을 합치면 접는 선을 축으로 한 180° 회전과 같으므로 끝 상태는 동일하다.
  if (m.spine) {
    const a = [m.spine[0][0], m.spine[0][1]];
    let sd = [m.spine[1][0] - a[0], m.spine[1][1] - a[1]];
    const sl = Math.hypot(sd[0], sd[1]); sd = [sd[0] / sl, sd[1] / sl];
    const den = d[0] * sd[1] - d[1] * sd[0];
    const s = ((a[0] - o[0]) * sd[1] - (a[1] - o[1]) * sd[0]) / den;
    const P = [o[0] + d[0] * s, o[1] + d[1] * s, o[2]];
    const ref = m.side || [P[0] + sd[0], P[1] + sd[1]];
    if ((ref[0] - P[0]) * sd[0] + (ref[1] - P[1]) * sd[1] < 0) sd = [-sd[0], -sd[1]];
    const s3 = [sd[0], sd[1], 0];
    let sg2 = 1;
    outer2: for (const q of mem) for (const p of q.p) {
      const t = dot(cross(s3, sub(p, P)), u);
      if (Math.abs(t) > 1e-6) { sg2 = Math.sign(t); break outer2; }
    }
    const alpha = Math.atan2(d[1], d[0]), beta = Math.atan2(sd[1], sd[0]);
    let delta = 2 * (alpha - beta);
    delta -= 2 * Math.PI * Math.round(delta / (2 * Math.PI));
    mv.rev = { P, s: s3, ths: sg2 * Math.PI, delta };
  }
  return { cur: next, mv };
}

const uvKey = (v) => `${Math.round(v[0] * 1e6)},${Math.round(v[1] * 1e6)}`;

// 완전히 접히는 경우, 접힌 층을 어느 높이에 둘지 정한다
//  - 기본: 겹치는 층들보다 toward 쪽 바깥에 놓는다
//  - insert: k  → 겹치는 층 가운데 위에서 k번째 층 바로 아래에 끼워 넣는다 (안으로 접어 넣기)
//  - 다시 펴기(접었던 조각이 이웃과 다시 평평하게 이어짐)는 자동으로 이웃과 같은 높이에 맞춘다
function computeShift(cur, mv, mi) {
  if (mv.spin) return mv.shift || 0; // 전체 돌리기는 0, 3차원 축 회전은 지정한 이동량
  if (!mv.flat || mv.unfold) return 0;
  if (mv.fixedShift !== undefined) return mv.fixedShift * GAP;
  const moved = cur.filter((q) => q.owner === mi), stat = cur.filter((q) => q.owner === -1);
  const rot = moved.map((q) => q.p.map((p) => rotate(p, mv.o, mv.d, mv.theta)));

  // 다시 펴기 감지: 접힘선 위의 변을 공유하는 고정 조각과 면 방향이 같아지면 같은 높이로
  // (꼭짓점 하나만 같은 경우는 제외: 종이 중심처럼 여러 층이 한 점을 공유할 수 있다)
  const onAxis = (p) => Math.abs(dot(sub(p, mv.o), mv.n)) < 1e-6;
  const segOverlap = (a1, a2, b1, b2) => {
    const dx = a2[0] - a1[0], dy = a2[1] - a1[1], L = Math.hypot(dx, dy);
    if (L < 1e-9) return false;
    const cr = (p) => (dx * (p[1] - a1[1]) - dy * (p[0] - a1[0])) / L;
    if (Math.abs(cr(b1)) > 1e-6 || Math.abs(cr(b2)) > 1e-6) return false;
    const t = (p) => (dx * (p[0] - a1[0]) + dy * (p[1] - a1[1])) / L;
    return Math.min(L, Math.max(t(b1), t(b2))) - Math.max(0, Math.min(t(b1), t(b2))) > 1e-6;
  };
  let rs = 0, rc = 0;
  moved.forEach((q, qi) => {
    const nq = polyNormal(rot[qi]);
    for (let k = 0; k < q.p.length; k++) {
      const k2 = (k + 1) % q.p.length;
      if (!onAxis(q.p[k]) || !onAxis(q.p[k2])) continue;
      for (const s2 of stat) {
        if (dot(polyNormal(s2.p), nq) < 0.99) continue;
        for (let j = 0; j < s2.uv.length; j++) {
          const j2 = (j + 1) % s2.uv.length;
          if (!segOverlap(q.uv[k], q.uv[k2], s2.uv[j], s2.uv[j2])) continue;
          rs += (centroid(s2.p)[2] - centroid(rot[qi])[2]) * mv.u[2]; // 높이 차이만큼 toward 방향으로
          rc++;
        }
      }
    }
  });
  if (rc && !mv.insert && !mv.noRejoin) return rs / rc;

  const proj = (pts) => pts.map((p) => [dot(p, mv.d), dot(p, mv.n)]);
  const sp = stat.map((q) => ({ h: Math.max(...q.p.map((p) => dot(p, mv.u))), z: centroid(q.p)[2], pp: proj(q.p) }));
  const hit = new Set();
  let need = GAP * 0.5, zmax = -Infinity;
  moved.forEach((q, qi) => {
    const r = rot[qi];
    const lo = Math.min(...r.map((p) => dot(p, mv.u)));
    zmax = Math.max(zmax, ...r.map((p) => p[2]));
    const rp = proj(r);
    sp.forEach((s2, si) => { if (overlap(rp, s2.pp)) { hit.add(si); need = Math.max(need, s2.h - lo + GAP); } });
  });
  if (mv.insert) {
    const zs = [...new Set([...hit].map((si) => Math.round(sp[si].z * 1e7) / 1e7))].sort((x, y) => y - x);
    const k = mv.insert;
    if (!zs.length) return need;
    const zt = k < zs.length ? (zs[k - 1] + zs[k]) / 2 : zs[zs.length - 1] - GAP / 2;
    return (zt - zmax) * mv.u[2];
  }
  return need;
}

const moveTo = (p, mv, f) => add(rotate(p, mv.o, mv.d, mv.theta * f), mul(mv.u, mv.shift * f));

// 접는 선 작도용 종이 상태: 동작의 line·side·grab·spine 이 함수면 (S) => 값 으로 지금 종이 상태에서 정한다
// (parts/axioms.js). S.at(uv): 처음 종이 위 점 uv 가 지금 놓인 자리, S.edge(u1, u2): 두 점을 잇는 선
function paperState(polys) {
  const inUv = (U, u) => {
    let sg = 0;
    for (let k = 0; k < U.length; k++) {
      const a = U[k], b = U[(k + 1) % U.length], c = (b[0] - a[0]) * (u[1] - a[1]) - (b[1] - a[1]) * (u[0] - a[0]);
      if (Math.abs(c) < 1e-9) continue;
      if (sg && Math.sign(c) !== sg) return false;
      sg = Math.sign(c);
    }
    return true;
  };
  const at = (u) => {
    // 그 점을 가진 조각 가운데 맨 위 조각에서 (접힌 선 위의 점은 여러 겹에 있지만 xy 는 같다)
    let best = null;
    for (const q of polys) {
      if (!inUv(q.uv, u)) continue;
      const p = affineOf(q.uv, q.p)(u);
      if (!best || p[2] > best[2]) best = p;
    }
    if (!best) throw new Error(`종이 위에 없는 점 ${u}`);
    return [best[0], best[1]];
  };
  return { at, edge: (u1, u2) => [at(u1), at(u2)] };
}
function resolveMove(m, polys) {
  const keys = ['line', 'side', 'grab', 'spine'].filter((k) => typeof m[k] === 'function');
  if (!keys.length) return m;
  const S = paperState(polys), r = { ...m };
  for (const k of keys) r[k] = m[k](S);
  return r;
}
const resolveStep = (step, polys) => (step.moves && step.moves.some((m) => ['line', 'side', 'grab', 'spine'].some((k) => typeof m[k] === 'function'))
  ? { ...step, moves: step.moves.map((m) => resolveMove(m, polys)) } : step);

// 단순 단계: 여러 동작을 동시에 진행
function planStep(polys, step) {
  let cur = polys.map(clonePoly);
  const moves = [];
  (step.moves || []).forEach((m, mi) => {
    const r = selectMove(cur, m, mi);
    cur = r.cur;
    moves.push(r.mv);
  });
  moves.forEach((mv, mi) => {
    mv.shift = computeShift(cur, mv, mi);
    // 접었다 펴기: 완전히 접힌 순간에도 아래 겹과 같은 높이에 겹치지 않게 접을 때의 높이만큼 띄운다
    if (mv.unfold && mv.flat) { mv.unfold = false; mv.lift = computeShift(cur, mv, mi); mv.unfold = true; }
  });
  return { polys: cur, moves, edges: edgeList(cur), deform: step.deform };
}

// 복합 단계: 하위 동작을 차례로 적용해 최종 상태를 만든다 (각 상태의 위치를 hist에 기록)
function planSeqStep(polys, step) {
  let cur = polys.map((q) => {
    const c = { ...clonePoly(q), hist: [q.p.map((v) => v.slice())] };
    for (const t of [...c.tags]) if (t.startsWith('__s')) c.tags.delete(t); // 이전 단계의 하위 동작 표시는 지운다
    return c;
  });
  const subs = [];
  step.moves.forEach((m, k) => {
    cur.forEach((q) => { q.owner = -1; });
    m = resolveMove(m, cur); // 앞 하위 동작까지 반영한 상태에서 선을 정한다
    const r = selectMove(cur, m, 0);
    cur = r.cur;
    const mv = r.mv;
    // transient: 움직이는 도중에만 들렸다가 제자리로 돌아오는 동작 (최종 상태에는 영향 없음)
    mv.transient = !!m.transient;
    mv.shift = mv.transient ? 0 : computeShift(cur, mv, 0);
    for (const q of cur) {
      if (q.owner === 0) {
        q.tags.add(`__s${k}`);
        if (!mv.transient) q.p = q.p.map((p) => moveTo(p, mv, 1));
      }
      q.hist = [...q.hist, q.p.map((v) => v.slice())];
    }
    subs.push({ mv, at: m.at || [0, 1], curve: m.curve || (mv.transient ? 'updown' : 'ease'), peak: m.peak ?? 0.5, role: m.role });
  });
  cur.forEach((q) => { q.owner = -1; });
  // 펼쳐 누르기·꽃잎 접기처럼 포개진 겹을 들어 올려 다시 배치하는 단계 (role 이 붙은 하위 동작)
  const unstack = step.moves.some((m) => m.role);
  return { polys: cur, moves: [], subs, sim: true, unstack, tearOk: !!step.tearOk, swing: step.swing !== false, edges: edgeList(cur) };
}

// 서로 엇갈리는 두 '접었다 펴기'를 한 단계에서 하면, 동시에 움직일 때 한 조각이 한 동작에만 속해
// 두 번째 선이 종이 절반에만 생긴다(종이가 잘린 것처럼 보임). 그래서 앞 절반·뒤 절반에 차례로 한다.
function crossUnfold(step) {
  const ms = step.moves || [];
  if (ms.length !== 2 || !ms.every((m) => m.unfold && m.line)) return false;
  const d = ms.map((m) => [m.line[1][0] - m.line[0][0], m.line[1][1] - m.line[0][1]]);
  return Math.abs(d[0][0] * d[1][1] - d[0][1] * d[1][0]) > 1e-6 * Math.hypot(...d[0]) * Math.hypot(...d[1]);
}
function planCrossUnfold(polys, step) {
  const [a, b] = step.moves;
  const pA = planStep(polys, { moves: [a] });
  const rest = pA.polys.map((q) => ({ ...clonePoly(q), p: q.p.map((v) => v.slice()) }));
  const pB = planStep(rest, { moves: [b] });
  // 첫 동작도 두 선으로 이미 나뉜 조각으로 다시 계산해 두 구간의 다각형 목록을 같게 맞춘다
  const pA2 = planStep(pB.polys.map((q) => ({ ...clonePoly(q), p: q.p.map((v) => v.slice()) })), { moves: [a] });
  return { ...pB, moves: [pA2.moves[0], pB.moves[0]], parts: [pA2, pB] };
}

// 단순 단계에서 진행률 t(0~1)일 때 각 다각형의 꼭짓점 위치 (엔진 계산용: 평평한 겹, 표시 보정 없음)
function rigidPose(plan, e) {
  return plan.polys.map((q) => {
    if (q.owner < 0) return q.p;
    const mv = plan.moves[q.owner];
    const f = mv.unfold ? Math.sin(Math.PI * e) : e;
    const s = mv.unfold ? (mv.lift || 0) * f : mv.shift * f;
    return q.p.map((p) => add(rotate(p, mv.o, mv.d, mv.theta * f), mul(mv.u, s)));
  });
}

// 표시 보정: 겹 다지기(settle.js)로 겹을 내려앉힌 높이.
// 엔진은 늘 평평한 원래 높이로 계산하고(접는 높이·겹 순서가 흔들리지 않게), 화면에 그릴 때만 종이 점을 옮긴다.
// 종이 점(면 i, uv)마다 단계 시작의 보정(이전 단계 끝에서 이어 옴)과 끝의 보정(이번 단계 끝의 겹 다지기)을
// 각 면의 좌표틀로 저장해 두면, 면이 돌아도 보정이 함께 돈다. 단계가 진행되며 시작 보정에서 끝 보정으로 바뀐다.
export function frameOf(L) {
  const n = polyNormal(L);
  for (let k = 1; k < L.length; k++) {
    const v = sub(L[k], L[0]), l = Math.hypot(v[0], v[1], v[2]);
    if (l < 1e-6) continue;
    const e1 = norm(sub(v, mul(n, dot(v, n))));
    return [e1, cross(n, e1), n];
  }
  return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
}
const toLocal = (F, v) => [dot(v, F[0]), dot(v, F[1]), dot(v, F[2])];
export const toWorld = (F, a) => [F[0][0] * a[0] + F[1][0] * a[1] + F[2][0] * a[2], F[0][1] * a[0] + F[1][1] * a[1] + F[2][1] * a[2], F[0][2] * a[0] + F[1][2] * a[1] + F[2][2] * a[2]];
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
// 시작 보정 → 끝 보정으로 바뀌는 비율
// 복합 단계는 겹이 포개진 채 움직이다 끝에서 다시 배치되는 일이 많아(펼쳐 누르기: 포개진 두 겹이 나란히 펼쳐짐)
// 앞 절반은 시작 보정을 유지하고 뒤 절반에 끝 보정으로 바꾼다 (포개진 동안 끝 보정이 섞여 겹이 뒤집히지 않게)
// 포개진 겹을 다시 배치하는 단계는 움직이는 동안 접히는 선 근처의 겹 사이가 엔진 간격만큼 가까워, mm 단위 보정이
// 겹 순서를 뒤집을 수 있다. 움직이는 동안은 보정을 빼고(엔진 위치) 시작·끝에서만 다진 모습을 쓴다
export const settleFade = (plan, t) => (plan.unstack ? 1 - Math.sin(Math.PI * Math.min(1, Math.max(0, t))) : 1);
export const settleW = (plan, t) => (plan.parts ? (t < 0.5 ? 0 : ease(t * 2 - 1)) : plan.sim ? ease(t * 2 - 1) : ease(t));
// 보정값(면 좌표 A: 시작, B: 끝)을 지금 위치 L에 더한다
export function dressLoop(L, A, B, w, f = 1) {
  const F = frameOf(L);
  return L.map((p, k) => {
    const a = A[k], b = B[k], o = toWorld(F, [(a[0] + (b[0] - a[0]) * w) * f, (a[1] + (b[1] - a[1]) * w) * f, (a[2] + (b[2] - a[2]) * w) * f]);
    return [p[0] + o[0], p[1] + o[1], p[2] + o[2]];
  });
}
// 면 i의 종이 점 uv에 대한 [시작 보정, 끝 보정] (각 면 좌표틀 기준)
export const offAt = (plan, i, uv) => plan.offLocal(i, uv);
// 면마다 꼭짓점 보정값 (화면용 pose 에서 씀)
function cornerOff(plan) {
  if (plan._corner !== undefined) return plan._corner;
  if (!plan.offLocal) return (plan._corner = null);
  const A = [], B = [];
  let any = false;
  plan.polys.forEach((q, i) => {
    const r = q.uv.map((u) => plan.offLocal(i, u));
    A.push(r.map((x) => x[0])); B.push(r.map((x) => x[1]));
    if (r.some(([a, b]) => Math.abs(a[2]) + Math.abs(b[2]) + Math.abs(a[0]) + Math.abs(b[0]) + Math.abs(a[1]) + Math.abs(b[1]) > 1e-9)) any = true;
  });
  return (plan._corner = any ? { A, B } : null);
}

// 엔진 계산용 위치 (표시 보정 없음)
export function rawPose(plan, t) {
  if (plan.parts) return t < 0.5 ? rawPose(plan.parts[0], t * 2) : rawPose(plan.parts[1], t * 2 - 1);
  if (plan.sim) return t < 0.5 ? plan.polys.map((q) => q.hist[0]) : plan.polys.map((q) => q.p);
  return rigidPose(plan, t * t * (3 - 2 * t));
}

// 단순 단계에서 진행률 t(0~1)일 때 각 다각형의 꼭짓점 위치 (화면용: 부풀리기 변형 + 표시 보정)
export function pose(plan, t) {
  const co = cornerOff(plan), w = settleW(plan, t), e = t * t * (3 - 2 * t);
  let out = rawPose(plan, t);
  // deform(p, e, q): 위치에 따라 꼭짓점을 옮기는 연속 변형 (부풀리기). 같은 점은 같이 움직여 끊기지 않는다.
  // q 는 그 점이 속한 종이 조각 ({ tags, uv }): 앞 벽·뒤 벽처럼 조각에 따라 다르게 옮길 때 쓴다.
  // 변형은 엔진 높이(겹 다지기 전)를 보고 하고, 겹 다지기 보정은 그 뒤에 더한다
  if (plan.deform) out = out.map((L, i) => L.map((p) => plan.deform(p, e, plan.polys[i])));
  if (co) out = out.map((L, i) => dressLoop(L, co.A[i], co.B[i], w, settleFade(plan, t)));
  return out;
}

// 단계의 시작·끝 상태 (화면용)
export const startPose = (plan) => pose(plan, 0);
export const endPose = (plan) => pose(plan, 1);
// 엔진 계산용 끝 상태 (평평한 원래 높이, 부풀리기 변형은 다음 단계로 이어진다)
const rawEnd = (plan) => {
  if (plan.parts) return rawEnd(plan.parts[1]);
  if (plan.sim) return plan.polys.map((q) => q.p);
  const out = rigidPose(plan, 1);
  return plan.deform ? out.map((L, i) => L.map((p) => plan.deform(p, 1, plan.polys[i]))) : out;
};
const rawStart = (plan) => (plan.parts ? rawStart(plan.parts[0]) : plan.polys.map((q) => (plan.sim ? q.hist[0] : q.p)));

// 면 i 위 종이 점 uv의 위치를 정하는 일차 변환 (면은 강체이므로 세 꼭짓점으로 정해진다)
function affineOf(U, P) {
  let best = 0, ib = [0, 1, 2];
  const n = U.length;
  for (let a = 1; a < n; a++) for (let b = a + 1; b < n; b++) {
    const ar = Math.abs((U[a][0] - U[0][0]) * (U[b][1] - U[0][1]) - (U[a][1] - U[0][1]) * (U[b][0] - U[0][0]));
    if (ar > best) { best = ar; ib = [0, a, b]; }
  }
  const [i0, i1, i2] = ib, u0 = U[i0], du1 = [U[i1][0] - u0[0], U[i1][1] - u0[1]], du2 = [U[i2][0] - u0[0], U[i2][1] - u0[1]];
  const det = du1[0] * du2[1] - du1[1] * du2[0] || 1e-30;
  const p0 = P[i0], dp1 = sub(P[i1], p0), dp2 = sub(P[i2], p0);
  return (u) => {
    const x = u[0] - u0[0], y = u[1] - u0[1], s = (x * du2[1] - y * du2[0]) / det, t = (du1[0] * y - du1[1] * x) / det;
    return [p0[0] + dp1[0] * s + dp2[0] * t, p0[1] + dp1[1] * s + dp2[1] * t, p0[2] + dp1[2] * s + dp2[2] * t];
  };
}

// 단계마다 표시 보정 함수를 붙인다 (prev: 이전 단계 계획)
// 같은 평면(나란하고 거의 같은 높이)에 놓인 조각끼리 묶는다: 평평한 단계는 전체가 한 묶음,
// 입체 단계(날개를 세운 학, 상자 벽)는 평면마다 따로 겹을 다진다
function planeClusters(P) {
  const info = P.map((L) => {
    let n = polyNormal(L);
    const m = Math.abs(n[0]) >= Math.abs(n[1]) && Math.abs(n[0]) >= Math.abs(n[2]) ? 0 : Math.abs(n[1]) >= Math.abs(n[2]) ? 1 : 2;
    if (n[m] < 0) n = mul(n, -1);
    const w = L.map((p) => dot(p, n));
    return { n, w: (Math.min(...w) + Math.max(...w)) / 2, flat: Math.max(...w) - Math.min(...w) < 1e-6 };
  });
  const cl = [];
  info.forEach((it, i) => {
    if (!it.flat) return;
    const c = cl.find((c2) => dot(c2.n, it.n) > 1 - 1e-9 && Math.abs(c2.w - it.w) < GAP * 40);
    if (c) c.ids.push(i); else cl.push({ n: it.n, w: it.w, ids: [i] });
  });
  return cl;
}

// 단계마다 표시 보정 함수를 붙인다 (prev: 이전 단계 계획)
function attachSettle(plan, prev) {
  const start = rawStart(plan);
  // 끝 상태는 부풀리기 변형 전 위치로 (화면에서는 변형한 위치에 보정을 더한다)
  const geom = plan.parts ? rigidPose(plan.parts[1], 1) : plan.sim ? plan.polys.map((q) => q.p) : rigidPose(plan, 1);
  const F0 = start.map(frameOf), F1 = geom.map(frameOf);
  const aff = geom.map((L, i) => affineOf(plan.polys[i].uv, L));
  // 평면 묶음마다 그 평면의 2차원 좌표(u, v)와 높이(w, 가운데 겹 기준)로 겹을 다진다
  const where = new Map(); // 면 → { levels, li, e1, e2, n }
  for (const c of planeClusters(geom)) {
    if (c.ids.length < 2) continue;
    const n = c.n, t = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const e1 = norm(cross(t, n)), e2 = cross(n, e1);
    const ws = c.ids.map((i) => dot(geom[i][0], n)).sort((x, y) => x - y);
    const mid = (ws[0] + ws[ws.length - 1]) / 2;
    const ref = ws.reduce((b2, w) => (Math.abs(w - mid) < Math.abs(b2 - mid) ? w : b2), ws[0]);
    const PL = c.ids.map((i) => geom[i].map((p) => [dot(p, e1), dot(p, e2), dot(p, n) - ref]));
    const levels = flatLevels(PL, GAP, c.ids.map((i) => plan.polys[i]));
    if (!levels) continue;
    c.ids.forEach((i, li) => where.set(i, { levels, li, e1, e2, n }));
  }
  const memo = new Map();
  // 끝 보정 (세계 좌표 벡터): 다음 단계가 이어 받는다. 평면 묶음에 들지 않은 면은 시작 보정을 그대로 가지고 돈다
  plan.endOff = (i, uv) => {
    const key = `${i}|${uvKey(uv)}`;
    let v = memo.get(key);
    if (v) return v;
    const c = where.get(i);
    if (c) { const p = aff[i](uv); v = mul(c.n, c.levels.query(c.li, dot(p, c.e1), dot(p, c.e2))); }
    else v = toWorld(F1[i], toLocal(F0[i], startOff(i, uv)));
    memo.set(key, v);
    return v;
  };
  const startOff = (i, uv) => (prev && prev.endOff && plan.polys[i].par !== undefined ? prev.endOff(plan.polys[i].par, uv) : [0, 0, 0]);
  plan.offLocal = (i, uv) => [toLocal(F0[i], startOff(i, uv)), toLocal(F1[i], plan.endOff(i, uv))];
  plan.frames = { F0, F1 };
  if (plan.parts) plan.parts.forEach((pt) => { pt.offLocal = plan.offLocal; });
}

// 그릴 모서리 목록: 가장자리(1)와 접힌 선(2, 맞닿은 이웃 다각형 포함)
function edgeList(polys) {
  const all = [];
  polys.forEach((q, i) => q.e.forEach((f, k) => all.push({ i, k, f, a: q.uv[k], b: q.uv[(k + 1) % q.uv.length] })));
  const res = [];
  for (const ed of all) {
    if (ed.f === 1) { res.push({ i: ed.i, k: ed.k, j: -1, border: true }); continue; }
    const dx = ed.b[0] - ed.a[0], dy = ed.b[1] - ed.a[1], L = Math.hypot(dx, dy);
    let j = -1;
    for (const o of all) {
      if (o.i === ed.i) continue;
      const c1 = (dx * (o.a[1] - ed.a[1]) - dy * (o.a[0] - ed.a[0])) / L;
      const c2 = (dx * (o.b[1] - ed.a[1]) - dy * (o.b[0] - ed.a[0])) / L;
      if (Math.abs(c1) > 1e-6 || Math.abs(c2) > 1e-6) continue;
      const t1 = (dx * (o.a[0] - ed.a[0]) + dy * (o.a[1] - ed.a[1])) / L;
      const t2 = (dx * (o.b[0] - ed.a[0]) + dy * (o.b[1] - ed.a[1])) / L;
      if (Math.min(Math.max(t1, t2), L) - Math.max(Math.min(t1, t2), 0) > 1e-6) { j = o.i; break; }
    }
    // seam(0): 계산용으로 나눈 자리라 평평할 때는 그리지 않고, 실제로 꺾였을 때만 접힌 선으로 그린다
    res.push({ i: ed.i, k: ed.k, j, border: false, seam: ed.f === 0 });
  }
  return res;
}

// 종이 여러 장: model.sheets = [{ outline, colors, place }], 한 장이면 model.outline·colors
export const SHEET_U = 10;
export const sheetsOf = (model) => model.sheets || [{ outline: model.outline, colors: model.colors }];
export const sheetOfU = (u) => Math.max(0, Math.round(u / SHEET_U));

// 작품 전체를 미리 계산: 단계별 계획 목록
export function buildModel(model) {
  let polys = sheetsOf(model).map((sh, k) => {
    // 여러 장일 때: 종이 좌표(uv)는 장마다 SHEET_U 만큼 떼어 두어 서로 이어진 종이로 보지 않게 하고,
    // 처음 놓는 자리는 place {x, y, z, rot(도)} 로 정한다
    const pl = sh.place || {}, a = ((pl.rot || 0) * Math.PI) / 180, c = Math.cos(a), si = Math.sin(a);
    return {
      p: sh.outline.map(([x, y]) => [x * c - y * si + (pl.x || 0), x * si + y * c + (pl.y || 0), pl.z || 0]),
      uv: sh.outline.map(([x, y]) => [x + k * SHEET_U, y]),
      e: sh.outline.map(() => 1),
      tags: new Set(model.sheets ? [`sheet${k}`] : []),
      owner: -1,
    };
  });
  const plans = [];
  let inked = []; // 꾸미기 단계에서 이미 그린 획 (다음 꾸미기 단계에도 그대로 보인다)
  for (const step0 of model.steps) {
    const step = step0.sim ? step0 : resolveStep(step0, polys);
    const plan = step.sim ? planSeqStep(polys, step) : crossUnfold(step) ? planCrossUnfold(polys, step) : planStep(polys, step);
    if (inked.length || step.draw) { plan.inked = inked; plan.draw = step.draw || []; inked = [...inked, ...plan.draw]; }
    // 화면용 겹 다지기 (엔진 상태는 그대로)
    const raw = rawEnd(plan);
    attachSettle(plan, plans[plans.length - 1]);
    plans.push(plan);
    polys = plan.polys.map((q, i) => ({ ...clonePoly(q), p: raw[i].map((v) => v.slice()), hist: undefined, par: i }));
  }
  return plans;
}

// 미리보기용: 접힘선 구간과 대표 꼭짓점의 이동 경로 (단순 단계)
export function moveGuides(plan, mi) {
  if (plan.parts) return moveGuides(plan.parts[mi], 0);
  const mv = plan.moves[mi];
  const mem = plan.polys.filter((q) => q.owner === mi);
  let line = null;
  if (!mv.spin) {
    let smin = Infinity, smax = -Infinity, h = -Infinity;
    for (const q of plan.polys) {
      if (q.owner !== mi && q.owner !== -1) continue;
      for (const p of q.p) {
        if (Math.abs(dot(sub(p, mv.o), mv.n)) > 1e-6) continue;
        h = Math.max(h, dot(p, mv.u));
        if (q.owner === mi) { const s = dot(sub(p, mv.o), mv.d); smin = Math.min(smin, s); smax = Math.max(smax, s); }
      }
    }
    if (smax > smin) {
      const base = add(mv.o, mul(mv.u, h + 0.004 - dot(mv.o, mv.u)));
      line = [add(base, mul(mv.d, smin)), add(base, mul(mv.d, smax))];
    }
  }
  // 축에서 가장 먼 꼭짓점(위층·가운데 우선)을 화살표 출발점으로
  let smid = 0, cnt = 0;
  for (const q of mem) for (const p of q.p) { smid += dot(sub(p, mv.o), mv.d); cnt++; }
  smid /= cnt || 1;
  let tip = null, best = -Infinity;
  for (const q of mem) for (const p of q.p) {
    const r = sub(p, mv.o), s = dot(r, mv.d), perp = sub(r, mul(mv.d, s));
    const score = Math.round(Math.hypot(...perp) * 1000) + dot(p, mv.u) * 10 - Math.abs(s - smid) * 0.1;
    if (score > best) { best = score; tip = p; }
  }
  // 가장자리 전체가 같은 거리라면(예: 반 접기) 그 가장자리의 가운데에서 출발
  if (tip && !mv.spin) {
    const far = [];
    for (const q of mem) for (const p of q.p) {
      const r = sub(p, mv.o), perp = sub(r, mul(mv.d, dot(r, mv.d)));
      const tr = sub(tip, mv.o), tperp = sub(tr, mul(mv.d, dot(tr, mv.d)));
      if (Math.abs(Math.hypot(...perp) - Math.hypot(...tperp)) < 1e-4) far.push(dot(r, mv.d));
    }
    const lo = Math.min(...far), hi = Math.max(...far);
    if (hi - lo > 0.05) tip = add(tip, mul(mv.d, (lo + hi) / 2 - dot(sub(tip, mv.o), mv.d)));
  }
  const path = [];
  if (tip) {
    const c = add(mv.o, mul(mv.d, dot(sub(tip, mv.o), mv.d)));
    for (let k = 0; k <= 40; k++) {
      const s = k / 40;
      let q = moveTo(tip, mv, s);
      q = add(c, mul(sub(q, c), 1.05));
      path.push(add(q, mul(mv.u, 0.012 * Math.sin(Math.PI * s))));
    }
  }
  return { line, path };
}
