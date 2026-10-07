// 종이 접기 엔진
// 종이를 볼록 다각형들의 집합으로 표현한다. 접기마다 접힘선(평면)으로 다각형을 정확히 잘라낸 뒤,
// 접히는 쪽 다각형을 접힘선을 축으로 회전시킨다.
// - 단순 단계: 여러 회전을 동시에 진행하는 강체 애니메이션 (pose)
// - 복합 단계(sim): 하위 동작을 차례로 적용해 최종 평면 상태를 만들고,
//   접힌 선의 각도를 목표값으로 옮기는 제약 풀이기(sim.js)로 움직임을 만든다.
//   (안쪽 뒤집어 접기, 펼쳐 누르기, 꽃잎 접기, 가라앉히기 등)

export const GAP = 0.0022; // 겹친 종이 층 사이 간격
const E = 1e-7;
const CUT = 3; // 임시: 방금 자른 모서리
// 모서리 종류: 1 = 종이 가장자리, 2 = 접힌 선

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
const clonePoly = (q) => ({ p: q.p.map((v) => v.slice()), uv: q.uv, e: q.e, tags: new Set(q.tags), owner: -1, hist: q.hist });

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
  const ref = m.side ? Math.sign(sideOf(m.side)) : 0;
  const sel = (q) => {
    const c = centroid(q.p);
    if (ref && sideOf(c) * ref <= 1e-6) return false;
    return m.filter ? m.filter({ x: c[0], y: c[1], z: c[2], uv: centroid(q.uv), tags: q.tags }) : true;
  };

  const next = [];
  for (const q of cur) {
    if (q.owner !== -1) { next.push(q); continue; }
    const parts = splitPoly(q, o, n);
    if (parts) {
      const s = parts.map(sel);
      if (s[0] !== s[1]) {
        parts.forEach((pt, k) => { pt.e = pt.e.map((f) => (f === CUT ? 2 : f)); pt.owner = s[k] ? mi : -1; next.push(pt); });
        continue;
      }
    }
    q.owner = sel(q) ? mi : -1;
    next.push(q);
  }

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

// 단순 단계: 여러 동작을 동시에 진행
function planStep(polys, step) {
  let cur = polys.map(clonePoly);
  const moves = [];
  (step.moves || []).forEach((m, mi) => {
    const r = selectMove(cur, m, mi);
    cur = r.cur;
    moves.push(r.mv);
  });
  moves.forEach((mv, mi) => { mv.shift = computeShift(cur, mv, mi); });
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
  return { polys: cur, moves: [], subs, sim: true, tearOk: !!step.tearOk, edges: edgeList(cur) };
}

// 단순 단계에서 진행률 t(0~1)일 때 각 다각형의 꼭짓점 위치
export function pose(plan, t) {
  if (plan.sim) return t < 0.5 ? plan.polys.map((q) => q.hist[0]) : plan.polys.map((q) => q.p);
  const e = t * t * (3 - 2 * t);
  const out = plan.polys.map((q) => {
    if (q.owner < 0) return q.p;
    const mv = plan.moves[q.owner];
    const f = mv.unfold ? Math.sin(Math.PI * e) : e;
    const s = mv.unfold ? 0 : mv.shift * f;
    return q.p.map((p) => add(rotate(p, mv.o, mv.d, mv.theta * f), mul(mv.u, s)));
  });
  // deform(p, e): 위치에 따라 꼭짓점을 옮기는 연속 변형 (부풀리기). 같은 점은 같이 움직여 끊기지 않는다
  return plan.deform ? out.map((L) => L.map((p) => plan.deform(p, e))) : out;
}

// 단계의 시작·끝 상태
export const startPose = (plan) => (plan.sim ? plan.polys.map((q) => q.hist[0]) : plan.polys.map((q) => q.p));
export const endPose = (plan) => (plan.sim ? plan.polys.map((q) => q.p) : pose(plan, 1));

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
    res.push({ i: ed.i, k: ed.k, j, border: false });
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
  for (const step of model.steps) {
    const plan = step.sim ? planSeqStep(polys, step) : planStep(polys, step);
    if (inked.length || step.draw) { plan.inked = inked; plan.draw = step.draw || []; inked = [...inked, ...plan.draw]; }
    plans.push(plan);
    const fin = endPose(plan);
    polys = plan.polys.map((q, i) => ({ ...clonePoly(q), p: fin[i].map((v) => v.slice()), hist: undefined }));
  }
  return plans;
}

// 미리보기용: 접힘선 구간과 대표 꼭짓점의 이동 경로 (단순 단계)
export function moveGuides(plan, mi) {
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
