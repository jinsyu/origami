// 복합 접기 움직임
// 안쪽 뒤집어 접기, 펼쳐 누르기, 꽃잎 접기처럼 여러 면이 서로 다른 축으로 함께 움직이는 단계용.
// 1) 운동학 연쇄: 각 면은 자기가 겪은 하위 회전들을 시간 구간에 맞춰 이어 붙여 움직인다.
// 2) 이완: 하위 회전끼리 서로 다른 면이 따로 움직이면 이음매가 벌어지므로,
//    같은 종이 위치(uv)의 꼭짓점을 합치고 변 길이(종이는 늘어나지 않음)를 반복 투영해 이어 붙인다.
// 시작·끝에서는 이완 강도가 0이 되어 엔진이 계산한 정확한 평면 상태와 일치한다.
import { foldAngle, rotate } from './engine.js';

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const wrap = (a) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
const RELAX_ITERS = 40;
const PULL = 0.02;

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
  const member = polys.map((q) => plan.subs.map((_, k) => k).filter((k) => q.tags.has(`__s${k}`)));

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

  // 펼쳐 누르기 묶음(역할: lift/hinge/obis/ibis)이 있으면 해석적 경로를 쓴다
  const roleIdx = {};
  plan.subs.forEach((sb, k) => { if (sb.role) roleIdx[sb.role] = k; });
  let squash = null;
  if (['lift', 'hinge', 'obis', 'ibis'].every((r) => r in roleIdx)) {
    const tag = (r) => `__s${roleIdx[r]}`;
    const group = polys.map((q) => (q.tags.has(tag('hinge')) ? 'in' : q.tags.has(tag('lift')) ? 'out' : null));
    const p2 = polys.map((q) => q.tags.has(tag('obis')) || q.tags.has(tag('ibis')));
    squash = { roleIdx, group, p2 };
  }
  const sim = { loops, nCorner, NV: nCorner, member, subs: plan.subs, start, end, dist, guides, squash, tearOk: plan.tearOk };
  if (squash) {
    // 해석적 경로의 시작·끝을 실제 상태와 맞추기 위한 보정값
    const A0 = squashPose(sim, 0), A1 = squashPose(sim, 1);
    squash.c0 = start.map((L, pi) => L.map((p, li) => (A0[pi] ? sub3(p, A0[pi][li]) : [0, 0, 0])));
    squash.c1 = end.map((L, pi) => L.map((p, li) => (A1[pi] ? sub3(p, A1[pi][li]) : [0, 0, 0])));
  }
  return sim;
}

// 하위 동작 k를 비율 f만큼 적용 (회전 후 층 간격 이동)
// 뒤집어 접기(rev)는 등선 축 회전 + 평면 안 회전으로 움직인다 (engine.js 참고)
const Z = [0, 0, 1];
const applyMove = (p, mv, f) => {
  let r;
  if (mv.rev) r = rotate(rotate(p, mv.rev.P, mv.rev.s, mv.rev.ths * f), mv.rev.P, Z, mv.rev.delta * f);
  else r = rotate(p, mv.o, mv.d, mv.theta * f);
  return [r[0] + mv.u[0] * mv.shift * f, r[1] + mv.u[1] * mv.shift * f, r[2] + mv.u[2] * mv.shift * f];
};
const undoMove = (p, mv) => {
  const q = [p[0] - mv.u[0] * mv.shift, p[1] - mv.u[1] * mv.shift, p[2] - mv.u[2] * mv.shift];
  if (mv.rev) return rotate(rotate(q, mv.rev.P, Z, -mv.rev.delta), mv.rev.P, mv.rev.s, -mv.rev.ths);
  return rotate(q, mv.o, mv.d, -mv.theta);
};

// 운동학 연쇄: x_t = M1(f1) ∘ M2'(f2) ∘ … (Mk'는 이전 동작 기준으로 되돌려 표현한 k번째 회전)
function chain(p, mem, subs, fs) {
  let y = p;
  for (let a = mem.length - 1; a >= 0; a--) {
    const k = mem[a];
    if (fs[k] === 0) continue;
    let z = y;
    // 일시 동작(transient)은 끝나면 제자리이므로 앞선 동작의 '완료 상태'에서는 빼고 계산한다
    for (let b = 0; b < a; b++) if (!subs[mem[b]].mv.transient) z = applyMove(z, subs[mem[b]].mv, 1);
    z = applyMove(z, subs[k].mv, fs[k]);
    for (let b = a - 1; b >= 0; b--) if (!subs[mem[b]].mv.transient) z = undoMove(z, subs[mem[b]].mv);
    y = z;
  }
  return y;
}

const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const rotDir = (v, axis, th) => rotate(v, [0, 0, 0], axis, th);

function curveOf(sb, t) {
  const e = ease((t - sb.at[0]) / Math.max(1e-6, sb.at[1] - sb.at[0]));
  if (sb.curve === 'peak') return e <= sb.peak ? e : (sb.peak * (1 - e)) / (1 - sb.peak);
  return sb.curve === 'updown' ? Math.min(e, 1 - e) : e;
}

// 펼쳐 누르기의 해석적 경로.
// 두 겹은 경첩을 축으로 각각 aK(바깥), aF(안쪽)만큼 들린다. 두 겹이 공유하는 등선은
// 두 겹 사이 가운데 평면에 있어야 하고, 각 겹의 이등분선과 γ(경첩-이등분선 각)를 이뤄야 하므로
// 경첩 방향과 이루는 각 ψ = 2·atan(cos(Δ/2)·tanγ) 로 정해진다 (Δ = aF - aK). γ=45°면 등선이 경첩에 수직인 경우.
// 각 겹의 등선 쪽 삼각형은 이 등선 방향에 맞도록 이등분선을 축으로 β만큼 돈다.
function squashPose(sim, t) {
  const { roleIdx, group, p2 } = sim.squash;
  const H = sim.subs[roleIdx.hinge], OB = sim.subs[roleIdx.obis], L = sim.subs[roleIdx.lift];
  const ho = H.mv.o, hd0 = H.mv.d, th = H.mv.theta;
  const V = OB.mv.o, b0 = OB.mv.d;
  const aF = th * curveOf(H, t), aK = th * curveOf(L, t);
  const hd = norm3(dot3(b0, hd0) > 0 ? hd0 : [-hd0[0], -hd0[1], -hd0[2]]); // 경첩을 따라 날개 쪽
  const cg = Math.min(1, dot3(b0, hd)), gamma = Math.acos(cg);               // 경첩-이등분선 각 γ
  const sp0 = norm3(sub3(b0, [hd[0] * cg, hd[1] * cg, hd[2] * cg]));           // 경첩에 수직, 등선 쪽
  const c2g = Math.cos(2 * gamma), s2g = Math.sin(2 * gamma);
  const spine0 = [hd[0] * c2g + sp0[0] * s2g, hd[1] * c2g + sp0[1] * s2g, hd[2] * c2g + sp0[2] * s2g]; // 원래 등선 방향
  const m = (aK + aF) / 2, D = aF - aK;
  const psi = 2 * Math.atan(Math.cos(D / 2) * Math.tan(gamma));
  const um = rotDir(sp0, hd0, m);
  const s = norm3([hd[0] * Math.cos(psi) + um[0] * Math.sin(psi), hd[1] * Math.cos(psi) + um[1] * Math.sin(psi), hd[2] * Math.cos(psi) + um[2] * Math.sin(psi)]);
  const betaFor = (a, sign) => {
    const sl = rotDir(s, hd0, -a);
    const pp = (v) => norm3(sub3(v, [b0[0] * dot3(v, b0), b0[1] * dot3(v, b0), b0[2] * dot3(v, b0)]));
    const u = pp(spine0), w = pp(sl);
    let beta = Math.atan2(dot3(b0, cross3(u, w)), dot3(u, w));
    if (Math.abs(Math.abs(beta) - Math.PI) < 1e-3 || (sign && Math.sign(beta) !== sign && Math.abs(beta) > Math.PI / 2)) beta = sign * Math.PI;
    return beta;
  };
  // 끝(β=±π)에서의 부호는 열려 있는 중간 상태의 방향을 따른다
  if (sim.squash.signK === undefined) {
    const save = sim.squash; save.signK = 0; save.signF = 0;
    const mid = squashPose(sim, 0.75);
    save.signK = mid.signK; save.signF = mid.signF;
  }
  const bK = betaFor(aK, sim.squash.signK), bF = betaFor(aF, sim.squash.signF);
  const out = sim.start.map((Lp, pi) => {
    const g = group[pi];
    if (!g) return null;
    const a = g === 'in' ? aF : aK, b = g === 'in' ? bF : bK;
    return Lp.map((x) => {
      let y = x;
      if (p2[pi]) y = rotate(y, V, b0, b);
      return rotate(y, ho, hd0, a);
    });
  });
  out.signK = Math.sign(bK) || 1;
  out.signF = Math.sign(bF) || 1;
  return out;
}

// 진행률 t에서 다각형별 고리 꼭짓점 위치
// 운동학 경로(이완 전)에서 다각형별 고리 꼭짓점 위치
function kinematic(sim, t) {
  const fs = sim.subs.map((s) => curveOf(s, t));
  let kin = sim.start.map((L, pi) => L.map((p) => chain(p, sim.member[pi], sim.subs, fs)));
  if (sim.squash) {
    const A = squashPose(sim, t), { c0, c1 } = sim.squash;
    kin = kin.map((L, pi) => (A[pi] ? A[pi].map((p, li) => [0, 1, 2].map((c) => p[c] + c0[pi][li][c] * (1 - t) + c1[pi][li][c] * t)) : L));
  }
  return kin;
}

// 이완은 시간 순서대로 미리 계산한다. 이전 프레임의 이완 결과에서 이어서 풀어야
// 찢김이 큰 순간에도 해가 갑자기 다른 모양으로 튀지 않는다.
const FRAMES = 96;
function bake(sim) {
  const NV = sim.NV, LIM = 0.012;
  const frames = [sim.start];
  let prevX = null, prevAvg = null;
  for (let f = 1; f < FRAMES; f++) {
    const t = f / FRAMES;
    const kin = kinematic(sim, t);
    const avg = new Float64Array(NV * 3), cnt = new Float64Array(NV);
    sim.loops.forEach((L, pi) => L.forEach((it, li) => {
      const p = kin[pi][li];
      avg[it.w * 3] += p[0]; avg[it.w * 3 + 1] += p[1]; avg[it.w * 3 + 2] += p[2]; cnt[it.w]++;
    }));
    for (let i = 0; i < NV; i++) { const c = cnt[i] || 1; avg[i * 3] /= c; avg[i * 3 + 1] /= c; avg[i * 3 + 2] /= c; }
    // 이전 이완 결과 + (이번 평균 - 이전 평균) 에서 시작
    const x = Float64Array.from(avg);
    if (prevX) for (let i = 0; i < x.length; i++) x[i] = prevX[i] + (avg[i] - prevAvg[i]);
    for (let it = 0; it < RELAX_ITERS; it++) {
      // 운동학 경로 쪽으로 약하게 끌어당겨 프레임이 지날수록 모양이 떠내려가지 않게
      for (let i = 0; i < x.length; i++) x[i] += (avg[i] - x[i]) * PULL;
      for (const [i, j, rest] of sim.dist) {
        const dx = x[j * 3] - x[i * 3], dy = x[j * 3 + 1] - x[i * 3 + 1], dz = x[j * 3 + 2] - x[i * 3 + 2];
        const L = Math.hypot(dx, dy, dz);
        if (L < 1e-6) continue;
        const c = ((L - rest) / L) * 0.5;
        x[i * 3] += dx * c; x[i * 3 + 1] += dy * c; x[i * 3 + 2] += dz * c;
        x[j * 3] -= dx * c; x[j * 3 + 1] -= dy * c; x[j * 3 + 2] -= dz * c;
      }
    }
    prevX = x; prevAvg = avg;
    // 층 간격처럼 작은 차이는 살리고, 이음매 벌어짐은 없앤다. 시작·끝 근처에서는 이완을 줄인다
    // tearOk: 가려지는 이음선이 일부러 벌어지는 단계는 이완하지 않는다
    const w = sim.tearOk ? 0 : Math.min(1, Math.min(t, 1 - t) * 25);
    frames.push(sim.loops.map((L, pi) => L.map((it, li) => {
      const p = kin[pi][li], o = [0, 0, 0];
      for (let c = 0; c < 3; c++) {
        const off = Math.max(-LIM, Math.min(LIM, p[c] - avg[it.w * 3 + c]));
        o[c] = p[c] + (x[it.w * 3 + c] + off - p[c]) * w;
      }
      return o;
    })));
  }
  frames.push(sim.end);
  sim.frames = frames;
}

// 진행률 t에서 다각형별 고리 꼭짓점 위치 (미리 계산한 프레임 사이를 보간)
export function simPose(sim, t) {
  if (t <= 0) return sim.start;
  if (t >= 1) return sim.end;
  if (!sim.frames) bake(sim);
  const f = t * FRAMES, i = Math.floor(f), r = f - i;
  const A = sim.frames[i], B = sim.frames[i + 1];
  return A.map((L, pi) => L.map((p, li) => {
    const q = B[pi][li];
    return [p[0] + (q[0] - p[0]) * r, p[1] + (q[1] - p[1]) * r, p[2] + (q[2] - p[2]) * r];
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

// 움직임 화살표: 가장 멀리 움직이는 꼭짓점들의 실제 경로 (서로 떨어진 것 최대 n개)
export function simArrows(sim, n = 2) {
  if (!sim.frames) bake(sim);
  const cand = [];
  sim.loops.forEach((L, pi) => L.forEach((_, li) => {
    const a = sim.start[pi][li], b = sim.end[pi][li];
    // 경로 길이 (프레임을 따라 잰 거리)
    let len = 0;
    for (let f = 1; f < sim.frames.length; f++) {
      const p = sim.frames[f - 1][pi][li], q = sim.frames[f][pi][li];
      len += Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
    }
    if (len > 0.08) cand.push({ pi, li, len, a, b });
  }));
  cand.sort((x, y) => y.len - x.len);
  const picked = [];
  for (const c of cand) {
    if (picked.length >= n) break;
    if (picked.some((p) => Math.hypot(p.a[0] - c.a[0], p.a[1] - c.a[1]) < 0.15 || Math.hypot(p.b[0] - c.b[0], p.b[1] - c.b[1]) < 0.12)) continue;
    picked.push(c);
  }
  // 출발점 - 가장 높이 뜬 지점 - 도착점을 잇는 단순한 호 (실제 경로가 휘돌아도 읽기 쉽게)
  return picked.map((c) => {
    let top = null, tz = -Infinity;
    for (let f = 1; f < sim.frames.length; f++) { const p = sim.frames[f][c.pi][c.li]; if (p[2] > tz) { tz = p[2]; top = p; } }
    const a = c.a, b = c.b;
    const mid = [(a[0] + b[0]) / 2 * 0.5 + top[0] * 0.5, (a[1] + b[1]) / 2 * 0.5 + top[1] * 0.5, Math.max(top[2], (a[2] + b[2]) / 2) + 0.03];
    const path = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24, u = 1 - t;
      path.push([0, 1, 2].map((i) => u * u * a[i] + 2 * u * t * mid[i] + t * t * b[i] + (i === 2 ? 0.006 : 0)));
    }
    return path;
  });
}
