// 종이 접기 엔진
// 종이를 볼록 다각형들의 집합으로 표현한다. 한 단계의 접기마다 접힘선(평면)으로
// 다각형을 정확히 잘라낸 뒤, 접히는 쪽 다각형만 접힘선을 축으로 회전시킨다.
// 그래서 접힌 모서리가 깨끗하고, 몇 번을 접어도 형태가 정확하다.

export const GAP = 0.0022; // 겹친 종이 층 사이 간격
const E = 1e-7;
const CUT = 3; // 임시: 방금 자른 모서리
// 모서리 종류: 1 = 종이 가장자리, 2 = 접힌 선

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
const lerp = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
const centroid = (pts) => pts.reduce((s, p) => s.map((x, i) => x + p[i] / pts.length), pts[0].map(() => 0));

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

const clone = (q) => ({ p: q.p.map((v) => v.slice()), uv: q.uv, e: q.e, tags: new Set(q.tags), owner: -1 });

// 볼록 다각형을 평면(o, n)으로 둘로 자른다. 걸치지 않으면 null
function splitPoly(q, o, n) {
  const ds = q.p.map((p) => dot(sub(p, o), n));
  if (!ds.some((x) => x > E) || !ds.some((x) => x < -E)) return null;
  const A = [], B = [], N = q.p.length;
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N, di = ds[i], dj = ds[j];
    const si = di > E ? 1 : di < -E ? -1 : 0, sj = dj > E ? 1 : dj < -E ? -1 : 0;
    const v = { p: q.p[i], uv: q.uv[i], on: si === 0, src: i };
    if (si >= 0) A.push(v);
    if (si <= 0) B.push(v);
    if (si * sj < 0) {
      const t = di / (di - dj);
      const x = { p: lerp(q.p[i], q.p[j], t), uv: lerp(q.uv[i], q.uv[j], t), on: true, src: i };
      A.push(x); B.push(x);
    }
  }
  const build = (L) => ({
    p: L.map((v) => v.p.slice()),
    uv: L.map((v) => v.uv.slice()),
    e: L.map((v, k) => (v.on && L[(k + 1) % L.length].on ? CUT : q.e[v.src])),
    tags: new Set(q.tags),
    owner: -1,
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

// 한 단계 계획: 다각형 자르기 → 접힐 부분 고르기 → 회전축·방향·층 간격 계산
function planStep(polys, step) {
  let cur = polys.map(clone);
  const moves = [];

  step.moves.forEach((m, mi) => {
    // 종이 전체를 돌리기(뒤집기, 방향 바꾸기)
    if (m.spin) {
      for (const q of cur) if (q.owner === -1) q.owner = mi;
      moves.push({ o: m.spin.a, d: norm(sub(m.spin.b, m.spin.a)), u: [0, 0, 1], n: [0, 0, 0], theta: (m.spin.angle * Math.PI) / 180, shift: 0, spin: true });
      return;
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
    cur = next;

    const mem = cur.filter((q) => q.owner === mi);
    if (m.tag) mem.forEach((q) => q.tags.add(m.tag));
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
    moves.push({ o, d, n, u, theta: (sg * angle * Math.PI) / 180, shift: 0, flat: angle >= 179, unfold: !!m.unfold });
  });

  // 완전히 접히는 경우, 접힌 층이 아래 층과 겹치지 않도록 위로 올린다
  const stat = cur.filter((q) => q.owner === -1);
  moves.forEach((mv, mi) => {
    if (!mv.flat || mv.unfold || mv.spin) return;
    const proj = (pts) => pts.map((p) => [dot(p, mv.d), dot(p, mv.n)]);
    const sp = stat.map((q) => ({ h: Math.max(...q.p.map((p) => dot(p, mv.u))), pp: proj(q.p) }));
    let need = 0;
    for (const q of cur) {
      if (q.owner !== mi) continue;
      const r = q.p.map((p) => rotate(p, mv.o, mv.d, mv.theta));
      const lo = Math.min(...r.map((p) => dot(p, mv.u)));
      const rp = proj(r);
      for (const s of sp) if (overlap(rp, s.pp)) need = Math.max(need, s.h - lo + GAP);
    }
    mv.shift = need;
  });

  return { polys: cur, moves, edges: edgeList(cur) };
}

// 진행률 t(0~1)에서 각 다각형의 꼭짓점 위치
export function pose(plan, t) {
  const e = t * t * (3 - 2 * t);
  return plan.polys.map((q) => {
    if (q.owner < 0) return q.p;
    const mv = plan.moves[q.owner];
    const f = mv.unfold ? Math.sin(Math.PI * e) : e;
    const s = mv.unfold ? 0 : mv.shift * f;
    return q.p.map((p) => add(rotate(p, mv.o, mv.d, mv.theta * f), mul(mv.u, s)));
  });
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
    res.push({ i: ed.i, k: ed.k, j, border: false });
  }
  return res;
}

// 작품 전체를 미리 계산: 단계별 계획 목록
export function buildModel(model) {
  let polys = [{ p: model.outline.map(([x, y]) => [x, y, 0]), uv: model.outline.map((v) => v.slice()), e: model.outline.map(() => 1), tags: new Set(), owner: -1 }];
  const plans = [];
  for (const step of model.steps) {
    const plan = planStep(polys, step);
    plans.push(plan);
    const fin = pose(plan, 1);
    polys = plan.polys.map((q, i) => ({ ...clone(q), p: fin[i].map((v) => v.slice()) }));
  }
  return plans;
}

// 미리보기용: 접힘선 구간과 대표 꼭짓점의 이동 경로
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
      let q = add(rotate(tip, mv.o, mv.d, mv.theta * s), mul(mv.u, mv.shift * s));
      q = add(c, mul(sub(q, c), 1.05));
      path.push(add(q, mul(mv.u, 0.012 * Math.sin(Math.PI * s))));
    }
  }
  return { line, path };
}
