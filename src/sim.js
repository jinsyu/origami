// 복합 접기 움직임
// 안쪽 뒤집어 접기, 펼쳐 누르기, 꽃잎 접기처럼 여러 면이 서로 다른 축으로 함께 움직이는 단계용.
// 1) 운동학 연쇄: 각 면은 자기가 겪은 하위 회전들을 시간 구간에 맞춰 이어 붙여 움직인다.
// 2) 이완: 하위 회전끼리 서로 다른 면이 따로 움직이면 이음매가 벌어지므로,
//    같은 종이 위치(uv)의 꼭짓점을 합치고 변 길이(종이는 늘어나지 않음)를 반복 투영해 이어 붙인다.
// 시작·끝에서는 이완 강도가 0이 되어 엔진이 계산한 정확한 평면 상태와 일치한다.
import { foldAngle, rotate, dressLoop, settleW, settleFade } from './engine.js';

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
  // 표시 보정(겹 다지기): 고리 꼭짓점(T자 접점 포함)마다 종이 점의 [시작, 끝] 보정값
  let off = null;
  if (plan.offLocal) {
    off = polys.map((q, pi) => loops[pi].map((it) => {
      const U = q.uv, a = U[it.k], b = U[(it.k + 1) % U.length];
      return plan.offLocal(pi, [a[0] + (b[0] - a[0]) * it.t, a[1] + (b[1] - a[1]) * it.t]);
    }));
    if (!off.some((L) => L.some(([a, b]) => Math.abs(a[0]) + Math.abs(a[1]) + Math.abs(a[2]) + Math.abs(b[0]) + Math.abs(b[1]) + Math.abs(b[2]) > 1e-9))) off = null;
    else off = off.map((L) => ({ A: L.map((x) => x[0]), B: L.map((x) => x[1]) }));
  }
  const sim = { off, unstack: plan.unstack, loops, nCorner, NV: nCorner, member, subs: plan.subs, start, end, dist, guides, squash, tearOk: plan.tearOk };
  // swing: 뒤집어 접기를 '겹을 책처럼 벌리기' 대신 '날개를 평면 안에서 돌리며 앞뒤 겹이 등선 쪽으로 좁아졌다 자리를 바꾸기'로 보여 준다.
  // 벌어진 틈으로 안쪽 면이 보이지 않아 겉면 색이 유지된다. 끝 상태는 같다.
  const rv = plan.swing && plan.subs.find((s) => s.mv.rev);
  if (rv) {
    sim.swing = { P: rv.mv.rev.P, delta: rv.mv.rev.delta };
    // 뒤집어 넘기기: 날개 끝의 앞뒤 겹이 함께 접는 선을 축으로 보는 사람 반대쪽(뒤)으로 180° 넘어간다.
    // 180° 회전은 어느 쪽으로 돌아도 끝 자리가 같으므로, 두 겹 모두 뒤로 돌린다 (앞 겹은 뒤로 넘어가 겹 사이로 들어가고,
    // 뒤 겹은 그 뒤를 돌아 앞으로 나온다). 같은 축을 같이 돌아 등선·접는 선 이음이 끊기지 않는다
    const subOf = member.map((ms) => ms.find((k) => plan.subs[k].mv.rev));
    if (member.every((ms, pi) => !ms.length || subOf[pi] !== undefined)) {
      sim.tuck = start.map((L, pi) => {
        const k = subOf[pi];
        if (k === undefined) return null;
        const { o, d } = plan.subs[k].mv;
        const c = L.reduce((a, p) => [a[0] + p[0] / L.length, a[1] + p[1] / L.length, a[2] + p[2] / L.length], [0, 0, 0]);
        const v = [c[0] - o[0], c[1] - o[1], c[2] - o[2]], dz = d[0] * v[1] - d[1] * v[0]; // 작은 각도로 돌릴 때 z 변화 (d × v)_z
        const sg = dz > 0 ? -1 : 1;
        const R1 = L.map((p) => rotate(p, o, d, sg * Math.PI));
        return { o, d, sg, corr: L.map((p, li) => [0, 1, 2].map((c2) => end[pi][li][c2] - R1[li][c2])) };
      });
    }
  }
  // 꽃잎 접기 묶음(역할: plift, ptop/psec R·L)이 있으면 옆 조각 각도를 들어 올리는 각도에 맞춰 푼다
  if (['plift', 'ptopR', 'ptopL', 'psecR', 'psecL'].every((r) => r in roleIdx)) solvePetal(sim, roleIdx);
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

// 꽃잎 접기의 기하 경로.
// 가운데(아래 삼각형)는 가로선을 축으로 φ만큼 들린다. 맨 위 장의 옆 조각은 연 모양 선을 축으로 a만큼 접힌 채 가운데와 함께 들리고,
// 둘째 장의 옆 조각은 제자리의 연 모양 선을 축으로 b만큼 접힌다. 두 옆 조각은 바깥 변(접힌 변)으로 이어져 있으므로
// φ마다 그 변의 꼭짓점이 서로 붙도록 (a, b)를 가우스-뉴턴으로 푼다. 앞 프레임의 해에서 이어 풀어 한 갈래를 따라간다.
const PETAL_N = 240;
const rotBy = (p, mv, f) => rotate(p, mv.o, mv.d, mv.theta * f);
function petalRaw(sim, fl, fr) {
  const { subs, start, member } = sim, P = sim.petal;
  return start.map((L, pi) => {
    const m = member[pi];
    const sd = P.sides.find((d) => m.includes(d.kt) || m.includes(d.ks));
    if (!m.includes(P.kl) && !sd) return null;
    return L.map((p) => {
      if (sd && m.includes(sd.ks)) return rotBy(p, subs[sd.ks].mv, fr[sd.ks]);
      let y = p;
      if (sd && m.includes(sd.kt)) y = rotBy(y, subs[sd.kt].mv, fr[sd.kt]);
      return m.includes(P.kl) ? rotBy(y, subs[P.kl].mv, fl) : y;
    });
  });
}
function solvePetal(sim, roleIdx) {
  const { loops, member } = sim;
  const sides = ['R', 'L'].map((S) => {
    const kt = roleIdx[`ptop${S}`], ks = roleIdx[`psec${S}`];
    const byW = new Map();
    loops.forEach((L, pi) => L.forEach((it, li) => {
      const m = member[pi], g = m.includes(kt) ? 't' : m.includes(ks) ? 's' : null;
      if (!g) return;
      const e = byW.get(it.w) || { t: null, s: null };
      if (!e[g]) e[g] = [pi, li];
      byW.set(it.w, e);
    }));
    return { kt, ks, welds: [...byW.values()].filter((e) => e.t && e.s) };
  });
  const kl = roleIdx.plift;
  sim.petal = { sides, kl };
  const table = [];
  const cur = sides.map(() => [0.01, 0.01]);
  for (let n = 0; n <= PETAL_N; n++) {
    const fl = curveOf(sim.subs[kl], n / PETAL_N);
    const fr = {};
    sides.forEach((sd, si) => {
      const res = (v) => {
        const f = { ...fr, [sd.kt]: v[0], [sd.ks]: v[1] };
        const A = petalRaw(sim, fl, f);
        return sd.welds.flatMap((e) => sub3(A[e.t[0]][e.t[1]], A[e.s[0]][e.s[1]]));
      };
      let x = cur[si];
      for (let it = 0; it < 40; it++) {
        const r = res(x), h = 1e-6;
        const J = [0, 1].map((j) => { const y = [...x]; y[j] += h; return res(y).map((v, i) => (v - r[i]) / h); });
        const a11 = dot(J[0], J[0]) + 1e-12, a12 = dot(J[0], J[1]), a22 = dot(J[1], J[1]) + 1e-12;
        const b1 = -dot(J[0], r), b2 = -dot(J[1], r), det = a11 * a22 - a12 * a12;
        const dx = [(b1 * a22 - b2 * a12) / det, (a11 * b2 - a12 * b1) / det];
        x = [Math.min(1, Math.max(0, x[0] + dx[0])), Math.min(1, Math.max(0, x[1] + dx[1]))];
        if (Math.abs(dx[0]) + Math.abs(dx[1]) < 1e-10) break;
      }
      cur[si] = x;
      fr[sd.kt] = x[0]; fr[sd.ks] = x[1];
    });
    table.push({ fl, fr });
  }
  sim.petal.table = table;
  // 시작·끝 보정 (층 간격 이동 등)
  const A0 = petalPose(sim, 0), A1 = petalPose(sim, 1);
  sim.petal.c0 = sim.start.map((L, pi) => L.map((p, li) => (A0[pi] ? sub3(p, A0[pi][li]) : [0, 0, 0])));
  sim.petal.c1 = sim.end.map((L, pi) => L.map((p, li) => (A1[pi] ? sub3(p, A1[pi][li]) : [0, 0, 0])));
  return sim.petal;
}
function petalPose(sim, t) {
  const T = sim.petal.table, x = Math.min(1, Math.max(0, t)) * PETAL_N, i = Math.min(PETAL_N - 1, Math.floor(x)), u = x - i;
  const A = T[i], B = T[i + 1], fr = {};
  for (const k in A.fr) fr[k] = A.fr[k] + (B.fr[k] - A.fr[k]) * u;
  return petalRaw(sim, A.fl + (B.fl - A.fl) * u, fr);
}
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);

// 진행률 t에서 다각형별 고리 꼭짓점 위치
// 운동학 경로(이완 전)에서 다각형별 고리 꼭짓점 위치
function kinematic(sim, t) {
  const fs = sim.subs.map((s) => curveOf(s, t));
  let kin = sim.start.map((L, pi) => L.map((p) => chain(p, sim.member[pi], sim.subs, fs)));
  if (sim.petal) {
    // 층 간격 보정은 꽃잎이 내려앉기 전에 끝나야 아래 겹을 지나치지 않는다
    const A = petalPose(sim, t), { c0, c1 } = sim.petal, w = ease(t / 0.7);
    kin = kin.map((L, pi) => (A[pi] ? A[pi].map((p, li) => [0, 1, 2].map((c) => p[c] + c0[pi][li][c] * (1 - w) + c1[pi][li][c] * w)) : L));
  }
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
      // 이번 단계에 움직이지 않는 면은 제자리에 둔다 (이완이 이미 접힌 겹을 끌어당겨 서로 파고들지 않게)
      if (!sim.member[pi].length && !sim.petal && !sim.squash) return p;
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

// 진행률 t에서 다각형별 고리 꼭짓점 위치 (화면용: 표시 보정 포함)
export function simPose(sim, t) {
  const P = simPose0(sim, t);
  if (!sim.off) return P;
  const w = settleW({ sim: true }, t), f = settleFade({ unstack: sim.unstack }, t);
  return P.map((L, pi) => dressLoop(L, sim.off[pi].A, sim.off[pi].B, w, f));
}
// 표시 보정 없는 위치 (엔진 계산용)
export const simRaw = (sim, t) => simPose0(sim, t);
// 미리 계산한 프레임 사이를 보간
function simPose0(sim, t) {
  if (t <= 0) return sim.start;
  if (t >= 1) return sim.end;
  if (sim.swing) {
    // 앞뒤 겹이 자리를 바꾸는(면이 뒤집히는) 보정은 가운데 짧은 구간에 몰아, 겹마다 뒤집히는 때가 달라
    // 일부만 먼저 뒤집혀 안쪽 면이 보이는 시간을 줄인다 (앞뒤 겹이 대칭이 아닌 날개)
    if (sim.tuck) {
      const e = ease(t);
      return sim.start.map((L, pi) => {
        const T = sim.tuck[pi];
        if (!T) return L;
        return L.map((p, li) => { const r = rotate(p, T.o, T.d, T.sg * Math.PI * e), c = T.corr[li]; return [r[0] + c[0] * e, r[1] + c[1] * e, r[2] + c[2] * e]; });
      });
    }
    const { P, delta } = sim.swing, e = ease(t), w = ease((e - 0.35) / 0.3);
    return sim.start.map((L, pi) => (sim.member[pi].length ? L.map((p, li) => {
      const r = rotate(p, P, Z, delta * e), r1 = rotate(p, P, Z, delta), q = sim.end[pi][li];
      return [r[0] + w * (q[0] - r1[0]), r[1] + w * (q[1] - r1[1]), p[2] + w * (q[2] - p[2])];
    }) : L));
  }
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
    // (제자리에서 흔들리다 돌아오는 점은 화살표가 점으로 보이므로 실제로 옮겨 간 점만 고른다)
    let len = 0, far = 0;
    for (let f = 1; f < sim.frames.length; f++) {
      const p = sim.frames[f - 1][pi][li], q = sim.frames[f][pi][li];
      len += Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
      far = Math.max(far, Math.hypot(q[0] - a[0], q[1] - a[1], q[2] - a[2]));
    }
    const net = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (len > 0.08 && far > 0.08 && net > 0.05) cand.push({ pi, li, len, a, b });
  }));
  cand.sort((x, y) => y.len - x.len);
  const picked = [];
  for (const c of cand) {
    if (picked.length >= n) break;
    if (picked.some((p) => Math.hypot(p.a[0] - c.a[0], p.a[1] - c.a[1]) < 0.15 || Math.hypot(p.b[0] - c.b[0], p.b[1] - c.b[1]) < 0.12)) continue;
    picked.push(c);
  }
  // swing(뒤집어 접기를 평면 안에서 돌리기): 실제 움직임대로 회전 중심 P 를 도는 호. 직선으로 그리면 도는 방향을 알 수 없다
  if (sim.tuck) {
    // 실제 경로: 접는 선을 축으로 뒤로 넘어가는 호
    return picked.map((c) => {
      const T = sim.tuck[c.pi], path = [];
      if (!T) return [c.a, c.b];
      for (let k = 0; k <= 24; k++) path.push(rotate(c.a, T.o, T.d, (T.sg * Math.PI * k) / 24));
      return path;
    });
  }
  if (sim.swing) {
    const { P, delta } = sim.swing;
    return picked.map((c) => {
      const a = c.a, b = c.b, m = rotate(a, P, Z, delta / 2);
      const ctl = [0, 1].map((i) => 2 * m[i] - (a[i] + b[i]) / 2);
      const path = [];
      for (let k = 0; k <= 24; k++) {
        const t = k / 24, u = 1 - t;
        path.push([u * u * a[0] + 2 * u * t * ctl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctl[1] + t * t * b[1], Math.max(a[2], b[2]) + 0.006]);
      }
      return path;
    });
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
