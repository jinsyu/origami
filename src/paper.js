// 종이 메시: 단계 계획(plan)과 진행률 t를 받아 앞·뒷면, 가장자리·접힌 선을 그린다.
import * as THREE from 'three';
import { pose, rawPose, settleW, settleFade, frameOf, polyNormal, cross, sub, sheetsOf, sheetOfU } from './engine.js';
import { prepareSim, simPose, simRaw } from './sim.js';
import { SETTLE_CELL } from './settle.js';

export const simOf = (p) => p._sim || (p._sim = prepareSim(p));
export const loopsOf = (p, t) => (p.sim ? simPose(simOf(p), t) : pose(p, t));

// 고리의 uv와, 원래 꼭짓점(모서리 그리기용)이 고리의 몇 번째인지
function metaOf(p) {
  if (p._meta) return p._meta;
  if (!p.sim) {
    p._meta = { uv: p.polys.map((q) => q.uv), corners: p.polys.map((q) => q.uv.map((_, k) => k)) };
  } else {
    const s = simOf(p);
    const uv = s.loops.map((L, pi) => L.map((it) => {
      const U = p.polys[pi].uv, a = U[it.k], b = U[(it.k + 1) % U.length];
      return [a[0] + (b[0] - a[0]) * it.t, a[1] + (b[1] - a[1]) * it.t];
    }));
    const corners = s.loops.map((L) => { const c = []; L.forEach((it, li) => { if (it.t === 0) c[it.k] = li; }); return c; });
    p._meta = { uv, corners };
  }
  return p._meta;
}

// 부채꼴 삼각형 하나를 나누는 최대 수 (부풀리기 단계, 겹 다지기로 겹이 휘는 면) · 둥근 접힘 띠를 나누는 수 · 띠로 잇는 최대 틈
const MAX_SUB = 24, FOLD_ARC = 4, FOLD_MAX = 0.012;
// 종이 질감 (미세한 섬유 무늬)
let sharedTex = null;
function paperTexture() {
  if (sharedTex) return sharedTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const v = 236 + Math.random() * 19;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  g.strokeStyle = 'rgba(0,0,0,0.03)';
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, a = Math.random() * Math.PI;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.stroke();
  }
  sharedTex = new THREE.CanvasTexture(c);
  sharedTex.wrapS = sharedTex.wrapT = THREE.RepeatWrapping;
  sharedTex.colorSpace = THREE.SRGBColorSpace;
  return sharedTex;
}

export function addLights(scene) {
  // 그늘진 면도 종이 색이 그대로 읽히도록 바닥광을 밝게, 주광 대비는 낮게 둔다
  scene.add(new THREE.HemisphereLight('#ffffff', '#ece9e2', 1.9));
  const key = new THREE.DirectionalLight('#fffaf0', 1.15);
  key.position.set(-1.2, 1.4, 2.6);
  scene.add(key);
  const fill = new THREE.DirectionalLight('#eef3ff', 0.75);
  fill.position.set(1.6, -1, 1.2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight('#ffffff', 0.7);
  rim.position.set(0, 0.5, -2.5);
  scene.add(rim);
}

export class PaperMesh {
  constructor() {
    const opts = { map: paperTexture(), roughness: 0.9, metalness: 0, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: 1 };
    // (기울기 비례 오프셋은 비스듬히 볼 때 얇은 겹 간격보다 커져 겹 순서가 뒤바뀐다: 고정 오프셋만 쓴다)
    this.frontMat = new THREE.MeshStandardMaterial({ ...opts, side: THREE.FrontSide });
    this.backMat = new THREE.MeshStandardMaterial({ ...opts, side: THREE.BackSide });
    this.front = new THREE.Mesh(new THREE.BufferGeometry(), this.frontMat);
    this.back = new THREE.Mesh(this.front.geometry, this.backMat);
    this.dark = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#1e2b3a', transparent: true, opacity: 0.45 }));
    this.light = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#1e2b3a', transparent: true, opacity: 0.16 }));
    this.group = new THREE.Group();
    this.ink = new THREE.Group(); // 꾸미기 단계에서 연필·색연필로 그린 획
    // 둥근 접힘: 겹쳐 접힌 선마다 두 겹을 잇는 반원 띠 (겹 간격 틈으로 안쪽 면이 비치지 않게)
    this.foldF = new THREE.Mesh(new THREE.BufferGeometry(), this.frontMat);
    this.foldB = new THREE.Mesh(new THREE.BufferGeometry(), this.backMat);
    this.group.add(this.front, this.back, this.foldF, this.foldB, this.dark, this.light, this.ink);
    this.plan = null;
    this.inkItems = [];
  }

  // 꾸미기 획을 만든다: 이미 그린 획(inked)은 그대로, 이번 단계 획(draw)은 진행률에 따라 차례로 나타난다
  setupInk(p) {
    this.ink.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.ink.clear();
    this.inkItems = [];
    if (!p.draw) return;
    const weight = (s) => (s.line ? s.line.reduce((a, q, i) => (i ? a + Math.hypot(q[0] - s.line[i - 1][0], q[1] - s.line[i - 1][1]) : 0), 0) : s.poly ? 0.25 : 0.06);
    const total = p.draw.reduce((a, s) => a + weight(s), 0) || 1;
    let acc = 0;
    const add = (s, animated) => {
      const mat = new THREE.MeshBasicMaterial({ color: s.color || '#34363a', transparent: true, opacity: s.line ? 0.92 : s.poly ? 0.96 : 0.85, side: THREE.DoubleSide, depthWrite: false });
      let mesh;
      if (s.line) {
        // 획을 촘촘히 나눠 얇은 띠로 만든다 (앞에서부터 그려지게)
        const pts = [];
        s.line.forEach((q, i) => {
          if (!i) { pts.push(q); return; }
          const a = s.line[i - 1], n = Math.max(1, Math.ceil(Math.hypot(q[0] - a[0], q[1] - a[1]) / 0.004));
          for (let k = 1; k <= n; k++) pts.push([a[0] + ((q[0] - a[0]) * k) / n, a[1] + ((q[1] - a[1]) * k) / n]);
        });
        const h = (s.w || 0.011) / 2, v = [];
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          const nx = (-(b[1] - a[1]) / L) * h, ny = ((b[0] - a[0]) / L) * h;
          const A = [a[0] - nx, a[1] - ny], B = [a[0] + nx, a[1] + ny], C = [b[0] + nx, b[1] + ny], D = [b[0] - nx, b[1] - ny];
          for (const q of [A, B, C, A, C, D]) v.push(q[0], q[1], 0);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
        mesh = new THREE.Mesh(geo, mat);
      } else if (s.poly) {
        // 색칠 면: 다각형을 채우고, 차례가 오면 서서히 진해진다
        mesh = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(s.poly.map(([x, y]) => new THREE.Vector2(x, y)))), mat);
        mesh.userData.fade = mat.opacity;
      } else {
        const r = s.r || 0.02;
        mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 28), mat);
        mesh.position.set(s.dot[0], s.dot[1], 0);
        mesh.scale.set(r, s.ry || r, 1);
        mesh.userData.r = [r, s.ry || r];
      }
      // 색칠(under)은 연필 윤곽 아래에, 같은 종류끼리는 그린 순서대로 위에 쌓인다
      mesh.renderOrder = (s.under ? 2 : 3) + this.ink.children.length * 1e-3;
      this.ink.add(mesh);
      if (!animated) return;
      const w = weight(s) / total;
      this.inkItems.push({ mesh, from: acc, to: acc + w, segs: s.line ? mesh.geometry.attributes.position.count / 6 : 0 });
      acc += w;
    };
    p.inked.forEach((s) => add(s, false));
    p.draw.forEach((s) => add(s, true));
  }

  updateInk(loops, t) {
    if (!this.ink.children.length) return;
    // 맨 위 종이 바로 위에 얹는다
    this.ink.position.z = Math.max(...loops.flat().map((v) => v[2])) + 0.003;
    const e = Math.min(1, t / 0.9);
    for (const it of this.inkItems) {
      const f = Math.max(0, Math.min(1, (e - it.from) / (it.to - it.from || 1)));
      if (it.segs) it.mesh.geometry.setDrawRange(0, Math.round(it.segs * f) * 6);
      else if (it.mesh.userData.fade) it.mesh.material.opacity = it.mesh.userData.fade * f;
      else { const [rx, ry] = it.mesh.userData.r, k = f > 0 ? 1 - Math.pow(1 - f, 3) : 0.0001; it.mesh.scale.set(rx * k, ry * k, 1); }
    }
  }

  setModel(model) {
    const sheets = sheetsOf(model), outline = sheets[0].outline;
    const us = outline.map((v) => v[0]), vs = outline.map((v) => v[1]);
    this.uvMin = [Math.min(...us), Math.min(...vs)];
    this.uvScale = 1.6 / Math.max(Math.max(...us) - this.uvMin[0], Math.max(...vs) - this.uvMin[1]);
    // 장마다 앞·뒷면 색이 다를 수 있으므로 꼭짓점 색으로 칠한다
    this.sheetColors = sheets.map((sh) => {
      const c = sh.colors || model.colors;
      return { front: new THREE.Color(c.front), back: new THREE.Color(c.back) };
    });
    // 어두운 종이(한글 자모의 검은 색종이)에는 남색 선이 묻힌다: 선을 바탕 색의 반대로 칠해(흰 면엔 어둡게, 검은 면엔 밝게) 어느 면에서나 보이게
    const darkPaper = this.sheetColors.some((c) => [c.front, c.back].some((k) => 0.2126 * k.r + 0.7152 * k.g + 0.0722 * k.b < 0.1));
    for (const [l, g, op] of [[this.dark, 0.5, 0.45], [this.light, 0.22, 0.16]]) {
      const m = l.material;
      if (darkPaper) Object.assign(m, { blending: THREE.CustomBlending, blendSrc: THREE.OneMinusDstColorFactor, blendDst: THREE.OneMinusSrcColorFactor, blendEquation: THREE.AddEquation, opacity: 1 }), m.color.setRGB(g, g, g);
      else Object.assign(m, { blending: THREE.NormalBlending, opacity: op }), m.color.set('#1e2b3a');
      m.needsUpdate = true;
    }
    this.frontMat.color.set('#ffffff');
    this.backMat.color.set('#ffffff');
    this.frontMat.vertexColors = this.backMat.vertexColors = true;
    this.frontMat.needsUpdate = this.backMat.needsUpdate = true;
    this.plan = null;
  }

  // 다각형마다 중심점 부채꼴로 삼각형을 만든다 (T자 접점이 있어도 갈라지지 않게)
  setup(p) {
    this.plan = p;
    this.setupInk(p);
    const meta = metaOf(p);
    // 겹 다지기 보정값이 있으면 면을 잘게 나눠 종이 점마다 높이를 따라가게 한다 (부풀리기 단계도)
    const offAt = p.offLocal ? (qi, u) => p.offLocal(qi, u) : null;
    let hasOff = false;
    if (offAt) {
      outer: for (let qi = 0; qi < meta.uv.length; qi++) for (const u of meta.uv[qi]) {
        const [A, B] = offAt(qi, u);
        if (Math.abs(A[2]) + Math.abs(B[2]) + Math.abs(A[0]) + Math.abs(B[0]) + Math.abs(A[1]) + Math.abs(B[1]) > 1e-9) { hasOff = true; break outer; }
      }
      // 꼭짓점에서는 0이어도 면 안쪽(아래 겹이 끝나는 곳)에서 생길 수 있으므로 가운데 점도 본다
      if (!hasOff) hasOff = meta.uv.some((L, qi) => {
        const c = [L.reduce((s2, v) => s2 + v[0], 0) / L.length, L.reduce((s2, v) => s2 + v[1], 0) / L.length];
        const [A, B] = offAt(qi, c);
        return Math.abs(A[2]) + Math.abs(B[2]) > 1e-9;
      });
    }
    // 다각형마다 나누는 수. 보정값이 면 위에서 일차식(부채꼴 삼각형마다)이면 나누지 않는다.
    // 휘는 면만 한 칸이 SETTLE_CELL 보다 작게 나눈다 (겹 다지기의 비탈이 아래 겹 바깥에 생기도록)
    const fine = hasOff || !!p.deform;
    const isZero = (v) => Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]) < 1e-12;
    const Sq = meta.uv.map((L, qi) => {
      if (!fine) return 1;
      let d = 0;
      for (const a of L) for (const b of L) d = Math.max(d, Math.hypot(a[0] - b[0], a[1] - b[1]));
      const Sfine = Math.max(p.deform ? 4 : 1, Math.min(MAX_SUB, Math.ceil(d / SETTLE_CELL)));
      if (p.deform || Sfine === 1) return Sfine;
      // 나눌 격자(비탈 폭보다 촘촘함) 그대로에서 보정값이 꼭짓점·가운데의 일차 보간과 같은지
      const St = Sfine;
      const c = [L.reduce((s2, v) => s2 + v[0], 0) / L.length, L.reduce((s2, v) => s2 + v[1], 0) / L.length];
      const oc = offAt(qi, c), oL = L.map((u) => offAt(qi, u));
      for (let i = 0; i < L.length; i++) {
        const a = L[i], b = L[(i + 1) % L.length], oa = oL[i], ob = oL[(i + 1) % L.length];
        for (let x = 0; x <= St; x++) for (let y = 0; x + y <= St; y++) {
          const wa = x / St, wb = y / St, wc = 1 - wa - wb;
          const [A, B] = offAt(qi, [c[0] * wc + a[0] * wa + b[0] * wb, c[1] * wc + a[1] * wa + b[1] * wb]);
          for (let m = 0; m < 3; m++) {
            if (Math.abs(A[m] - (oc[0][m] * wc + oa[0][m] * wa + ob[0][m] * wb)) > 2e-5) return Sfine;
            if (Math.abs(B[m] - (oc[1][m] * wc + oa[1][m] * wa + ob[1][m] * wb)) > 2e-5) return Sfine;
          }
        }
      }
      return 1;
    });
    this.Sq = Sq;
    this.fine = fine;
    this.hasOff = hasOff;
    // 부채꼴 삼각형마다 (S+1)(S+2)/2 개 꼭짓점을 두고 인덱스로 잇는다 (꼭짓점 공유: 계산량이 줄고 휜 면이 매끄럽다)
    let nv = 0, nt = 0;
    meta.uv.forEach((L, qi) => { const S = Sq[qi]; nv += L.length * ((S + 1) * (S + 2)) / 2; nt += L.length * S * S; });
    const VQ = new Int32Array(nv), VA = new Int32Array(nv), VB = new Int32Array(nv), VW = new Float32Array(nv * 3);
    const OA = hasOff ? new Float32Array(nv * 3) : null, OB = hasOff ? new Float32Array(nv * 3) : null;
    const uv = new Float32Array(nv * 2), colF = new Float32Array(nv * 3), colB = new Float32Array(nv * 3);
    const index = new Uint32Array(nt * 3);
    let v = 0, ti = 0;
    meta.uv.forEach((L, qi) => {
      const S = Sq[qi], n = L.length;
      const c = [L.reduce((s2, x) => s2 + x[0], 0) / n, L.reduce((s2, x) => s2 + x[1], 0) / n];
      const cs = this.sheetColors[Math.min(this.sheetColors.length - 1, sheetOfU(c[0]))];
      for (let i = 0; i < n; i++) {
        const a = L[i], b = L[(i + 1) % n], v0 = v, id = (x, y) => v0 + (x * (2 * S + 3 - x)) / 2 + y; // x: a 쪽, y: b 쪽
        for (let x = 0; x <= S; x++) for (let y = 0; x + y <= S; y++) {
          const wa = x / S, wb = y / S, wc = 1 - wa - wb, u = [c[0] * wc + a[0] * wa + b[0] * wb, c[1] * wc + a[1] * wa + b[1] * wb];
          VQ[v] = qi; VA[v] = i; VB[v] = (i + 1) % n; VW[v * 3] = wc; VW[v * 3 + 1] = wa; VW[v * 3 + 2] = wb;
          uv[v * 2] = (u[0] - this.uvMin[0]) * this.uvScale; uv[v * 2 + 1] = (u[1] - this.uvMin[1]) * this.uvScale;
          colF[v * 3] = cs.front.r; colF[v * 3 + 1] = cs.front.g; colF[v * 3 + 2] = cs.front.b;
          colB[v * 3] = cs.back.r; colB[v * 3 + 1] = cs.back.g; colB[v * 3 + 2] = cs.back.b;
          if (hasOff) { const [A, B] = offAt(qi, u); OA.set(A, v * 3); OB.set(B, v * 3); }
          v++;
        }
        for (let x = 0; x < S; x++) for (let y = 0; x + y < S; y++) {
          index[ti++] = id(x, y); index[ti++] = id(x + 1, y); index[ti++] = id(x, y + 1);
          if (x + y + 1 < S) { index[ti++] = id(x + 1, y); index[ti++] = id(x + 1, y + 1); index[ti++] = id(x, y + 1); }
        }
      }
    });
    this.V = { VQ, VA, VB, VW, OA, OB, nv };
    const geo = new THREE.BufferGeometry();
    geo.setIndex(new THREE.BufferAttribute(index, 1));
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.BufferAttribute(colF, 3));
    // 앞면·뒷면 메시는 위치·법선·uv·인덱스를 함께 쓰고 색만 따로 가진다
    const geoB = new THREE.BufferGeometry();
    geoB.setIndex(geo.index);
    for (const a of ['position', 'normal', 'uv']) geoB.setAttribute(a, geo.attributes[a]);
    geoB.setAttribute('color', new THREE.BufferAttribute(colB, 3));
    this.front.geometry.dispose();
    if (this.back.geometry !== this.front.geometry) this.back.geometry.dispose();
    this.front.geometry = geo;
    this.back.geometry = geoB;
    // 선(가장자리·접힌 선)도 S개로 나눠 휜 면을 따라가게 한다
    this.edgeOff = hasOff ? p.edges.map((ed) => {
      const U = meta.uv[ed.i], cs = meta.corners[ed.i], a = U[cs[ed.k]], b = U[cs[(ed.k + 1) % cs.length]], S = Sq[ed.i];
      const r = [];
      for (let s2 = 0; s2 <= S; s2++) r.push(offAt(ed.i, [a[0] + (b[0] - a[0]) * (s2 / S), a[1] + (b[1] - a[1]) * (s2 / S)]));
      return r;
    }) : null;
    this.setupFolds(p, meta, Sq, offAt && hasOff ? offAt : null);
    const n = p.edges.reduce((s2, ed) => s2 + 6 * Sq[ed.i], 0) + this.folds.reduce((s2, f) => s2 + 6 * (f.pts.length - 1), 0);
    for (const l of [this.dark, this.light]) {
      l.geometry.dispose();
      l.geometry = new THREE.BufferGeometry();
      l.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n), 3));
    }
  }

  // 접힌 선(이웃 면과 맞댄 변)마다 양쪽 면 위의 같은 종이 점들을 미리 골라 둔다
  setupFolds(p, meta, Sq, offAt) {
    const area3 = (U, a, b, c) => (U[b][0] - U[a][0]) * (U[c][1] - U[a][1]) - (U[b][1] - U[a][1]) * (U[c][0] - U[a][0]);
    const tri = meta.uv.map((U) => {
      let best = [0, 1, 2], ba = 0;
      for (let b = 1; b < U.length; b++) for (let c = b + 1; c < U.length; c++) { const ar = Math.abs(area3(U, 0, b, c)); if (ar > ba) { ba = ar; best = [0, b, c]; } }
      return best;
    });
    // 종이 점 u를 면 qi 고리 꼭짓점 세 개의 일차 결합으로 (면은 강체라 위치도 같은 결합)
    const affW = (qi, u) => {
      const U = meta.uv[qi], [a, b, c] = tri[qi], d = area3(U, a, b, c) || 1e-30;
      const wb = ((u[0] - U[a][0]) * (U[c][1] - U[a][1]) - (u[1] - U[a][1]) * (U[c][0] - U[a][0])) / d;
      const wc = ((U[b][0] - U[a][0]) * (u[1] - U[a][1]) - (U[b][1] - U[a][1]) * (u[0] - U[a][0])) / d;
      return [a, 1 - wb - wc, b, wb, c, wc];
    };
    const folds = [], seen = new Set();
    p.edges.forEach((ed) => {
      if (ed.border || ed.j < 0) return;
      const U = meta.uv[ed.i], cs = meta.corners[ed.i], a = U[cs[ed.k]], b = U[cs[(ed.k + 1) % cs.length]];
      const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
      // 이웃 면의 변과 겹치는 구간만
      let t0 = 1, t1 = 0;
      const V = meta.uv[ed.j];
      for (let m = 0; m < V.length; m++) {
        const c = V[m], d = V[(m + 1) % V.length];
        const cr = (q) => Math.abs(dx * (q[1] - a[1]) - dy * (q[0] - a[0])) / Math.sqrt(l2);
        if (cr(c) > 1e-6 || cr(d) > 1e-6) continue;
        const tc = ((c[0] - a[0]) * dx + (c[1] - a[1]) * dy) / l2, td = ((d[0] - a[0]) * dx + (d[1] - a[1]) * dy) / l2;
        t0 = Math.min(t0, Math.max(0, Math.min(tc, td))); t1 = Math.max(t1, Math.min(1, Math.max(tc, td)));
      }
      if (t1 - t0 < 1e-6) return;
      const tm = (t0 + t1) / 2, key = `${Math.min(ed.i, ed.j)}|${Math.max(ed.i, ed.j)}|${Math.round((a[0] + dx * tm) * 1e5)},${Math.round((a[1] + dy * tm) * 1e5)}`;
      if (seen.has(key)) return;
      seen.add(key);
      // 띠는 위아래 겹의 휜 모양을 따라가도록 길이에 맞춰 잘게 나눈다 (면 분할 수와 따로)
      const pts = [], S = Math.max(Sq[ed.i], Math.min(MAX_SUB, Math.ceil((Math.sqrt(l2) * (t1 - t0)) / (SETTLE_CELL / 2))));
      for (let s2 = 0; s2 <= S; s2++) {
        const t = t0 + ((t1 - t0) * s2) / S, u = [a[0] + dx * t, a[1] + dy * t];
        pts.push({ u, wi: affW(ed.i, u), wj: affW(ed.j, u), oi: offAt ? offAt(ed.i, u) : null, oj: offAt ? offAt(ed.j, u) : null });
      }
      const ci = [U.reduce((s3, v) => s3 + v[0], 0) / U.length, U.reduce((s3, v) => s3 + v[1], 0) / U.length];
      folds.push({ i: ed.i, j: ed.j, pts, ci: affW(ed.i, ci) });
    });
    this.folds = folds;
    const tris = folds.reduce((s3, f) => s3 + (f.pts.length - 1) * FOLD_ARC * 2, 0);
    const geo = new THREE.BufferGeometry();
    for (const [name, size] of [['position', 3], ['normal', 3], ['uv', 2]]) geo.setAttribute(name, new THREE.BufferAttribute(new Float32Array(tris * 3 * size), size));
    const colF = new Float32Array(tris * 9), colB = new Float32Array(tris * 9);
    const uvA = geo.attributes.uv.array;
    let k = 0, ci = 0;
    for (const f of folds) {
      const L = meta.uv[f.i], cs = this.sheetColors[Math.min(this.sheetColors.length - 1, sheetOfU(L[0][0]))];
      for (let s2 = 0; s2 < f.pts.length - 1; s2++) for (let m = 0; m < FOLD_ARC; m++) for (const sv of [0, 1, 0, 1, 1, 0]) {
        const u = f.pts[s2 + sv].u;
        uvA[k++] = (u[0] - this.uvMin[0]) * this.uvScale; uvA[k++] = (u[1] - this.uvMin[1]) * this.uvScale;
        colF.set([cs.front.r, cs.front.g, cs.front.b], ci); colB.set([cs.back.r, cs.back.g, cs.back.b], ci); ci += 3;
      }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colF, 3));
    const geoB = new THREE.BufferGeometry();
    for (const a of ['position', 'normal', 'uv']) geoB.setAttribute(a, geo.attributes[a]);
    geoB.setAttribute('color', new THREE.BufferAttribute(colB, 3));
    this.foldF.geometry.dispose(); this.foldB.geometry.dispose();
    this.foldF.geometry = geo; this.foldB.geometry = geoB;
  }

  // 이웃 면과 맞댄 변 사이의 틈(겹 간격·계단·경첩)을 띠로 잇는다: 겹쳐 접힌(거의 180°) 선은 반원, 그 밖은 곧은 띠.
  // 틈이 큰 곳(일부러 벌어지는 이음)은 잇지 않는다
  updateFolds(base, normals, F, w, fx, fade = 1) {
    const geo = this.foldF.geometry, P = geo.attributes.position.array, N = geo.attributes.normal.array;
    const ridge = []; // 반원 띠의 꼭대기 선 (접힌 모서리로 보이는 곳)
    let k = 0;
    const at = (W, o, qi) => {
      const L = base[qi], v = fx([0, 1, 2].map((c) => L[W[0]][c] * W[1] + L[W[2]][c] * W[3] + L[W[4]][c] * W[5]), qi);
      if (o && F) {
        const f = F[qi], [A, B] = o, q = [0, 1, 2].map((c) => (A[c] + (B[c] - A[c]) * w) * fade);
        for (let c = 0; c < 3; c++) v[c] += f[0][c] * q[0] + f[1][c] * q[1] + f[2][c] * q[2];
      }
      return v;
    };
    for (const f of this.folds) {
      const S = f.pts.length - 1, slot = S * FOLD_ARC * 2 * 9;
      const skip = () => { P.fill(0, k, k + slot); k += slot; };
      const ni = normals[f.i], nj = normals[f.j];
      const A = f.pts.map((pt) => at(pt.wi, pt.oi, f.i)), B = f.pts.map((pt) => at(pt.wj, pt.oj, f.j));
      const gaps = A.map((a, s2) => Math.hypot(B[s2][0] - a[0], B[s2][1] - a[1], B[s2][2] - a[2]));
      const gmax = Math.max(...gaps);
      if (gmax > FOLD_MAX || gmax < 1e-5) { skip(); continue; }
      const round = ni[0] * nj[0] + ni[1] * nj[1] + ni[2] * nj[2] < -0.9;
      // 바깥쪽: 면 i 안에서 변에 수직, 면 가운데에서 멀어지는 쪽
      const c = at(f.ci, null, f.i), e = sub(A[S], A[0]);
      let o = cross(e, ni);
      const ol = Math.hypot(...o) || 1;
      o = o.map((x) => x / ol);
      if (o[0] * (A[0][0] - c[0]) + o[1] * (A[0][1] - c[1]) + o[2] * (A[0][2] - c[2]) < 0) o = o.map((x) => -x);
      const arc = A.map((a, s2) => {
        const g = sub(B[s2], a), r = gaps[s2] / 2, out = [];
        for (let m = 0; m <= FOLD_ARC; m++) {
          if (!round) { out.push([a[0] + (g[0] * m) / FOLD_ARC, a[1] + (g[1] * m) / FOLD_ARC, a[2] + (g[2] * m) / FOLD_ARC]); continue; }
          const th = (Math.PI * m) / FOLD_ARC, h = (1 - Math.cos(th)) / 2, sn = Math.sin(th) * r;
          out.push([a[0] + g[0] * h + o[0] * sn, a[1] + g[1] * h + o[1] * sn, a[2] + g[2] * h + o[2] * sn]);
        }
        return out;
      });
      if (round) for (let s2 = 0; s2 < S; s2++) ridge.push([arc[s2][FOLD_ARC / 2], arc[s2 + 1][FOLD_ARC / 2]]);
      // 앞면 방향: 종이가 면 i 에서 띠로 넘어가며 꺾이는 만큼 면 i 의 앞면 방향도 돈다 (접선 o → τ 이면 법선 n → (τ·o)n − (τ·n)o)
      const mid = Math.floor(S / 2), tv = sub(arc[mid][1], arc[mid][0]), tl = Math.hypot(...tv) || 1, tau = tv.map((x) => x / tl);
      const to = tau[0] * o[0] + tau[1] * o[1] + tau[2] * o[2], tn = tau[0] * ni[0] + tau[1] * ni[1] + tau[2] * ni[2];
      const nexp = [0, 1, 2].map((q) => to * ni[q] - tn * o[q]);
      const t0 = cross(sub(arc[mid + 1][0], arc[mid][0]), sub(arc[mid][1], arc[mid][0]));
      let flipW = t0[0] * nexp[0] + t0[1] * nexp[1] + t0[2] * nexp[2] < 0;
      // 거의 같은 방향의 두 면 사이(계단·어긋남)는 띠가 면과 비슷하게 누워 있을 때가 많다: 두 면의 앞면 방향을 따른다
      if (!round) {
        const sn = [ni[0] + nj[0], ni[1] + nj[1], ni[2] + nj[2]], t0l = Math.hypot(...t0) || 1, snl = Math.hypot(...sn) || 1;
        const d1 = (t0[0] * sn[0] + t0[1] * sn[1] + t0[2] * sn[2]) / t0l / snl;
        if (Math.abs(d1) > 0.3) flipW = d1 < 0;
      }
    for (let s2 = 0; s2 < S; s2++) for (let m = 0; m < FOLD_ARC; m++) {
        const q00 = arc[s2][m], q10 = arc[s2 + 1][m], q01 = arc[s2][m + 1], q11 = arc[s2 + 1][m + 1];
        const T = flipW ? [[q00, q01, q10], [q10, q01, q11]] : [[q00, q10, q01], [q10, q11, q01]];
        for (const tr of T) {
          const tn = cross(sub(tr[1], tr[0]), sub(tr[2], tr[0])), tl = Math.hypot(...tn) || 1;
          for (const v of tr) { P[k] = v[0]; P[k + 1] = v[1]; P[k + 2] = v[2]; N[k] = tn[0] / tl; N[k + 1] = tn[1] / tl; N[k + 2] = tn[2] / tl; k += 3; }
        }
      }
    }
    // 띠 하나는 (S×FOLD_ARC×2) 삼각형: 색·uv 는 접힌 선 순서대로 미리 채워 두었으므로 그리지 않는 띠는 크기 0으로 둔다
    geo.attributes.position.needsUpdate = true;
    geo.attributes.normal.needsUpdate = true;
    geo.computeBoundingSphere();
    this.foldB.geometry.boundingSphere = geo.boundingSphere;
    return ridge;
  }

  update(p, t) {
    if (p !== this.plan) this.setup(p);
    const loops = loopsOf(p, t);
    const meta = metaOf(p);
    const normals = loops.map(polyNormal);
    const geo = this.front.geometry;
    const P = geo.attributes.position.array;
    // 잘게 나눌 때는 엔진 위치(보정·변형 전)에서 나눈 뒤 점마다 변형·보정한다
    const base = this.fine ? (p.sim ? simRaw(simOf(p), t) : rawPose(p, t)) : loops, e = t * t * (3 - 2 * t);
    const w = settleW(p, t), fade = settleFade(p, t);
    const F = this.hasOff ? base.map(frameOf) : null;
    const fx = this.fine && p.deform ? (v, qi) => p.deform(v, e, p.polys[qi]) : (v) => v;
    // 면마다 가운데점 (부채꼴 중심)
    const C = base.map((pts) => { const c = [0, 0, 0]; for (const q of pts) { c[0] += q[0]; c[1] += q[1]; c[2] += q[2]; } return [c[0] / pts.length, c[1] / pts.length, c[2] / pts.length]; });
    const { VQ, VA, VB, VW, OA, OB, nv } = this.V, deform = this.fine && p.deform;
    for (let v = 0; v < nv; v++) {
      const qi = VQ[v], pts = base[qi], a = pts[VA[v]], b = pts[VB[v]], c = C[qi], wc = VW[v * 3], wa = VW[v * 3 + 1], wb = VW[v * 3 + 2];
      let x = c[0] * wc + a[0] * wa + b[0] * wb, y = c[1] * wc + a[1] * wa + b[1] * wb, z = c[2] * wc + a[2] * wa + b[2] * wb;
      if (deform) { const d = p.deform([x, y, z], e, p.polys[qi]); x = d[0]; y = d[1]; z = d[2]; }
      if (F) {
        const f = F[qi], o = v * 3;
        const a0 = (OA[o] + (OB[o] - OA[o]) * w) * fade, a1 = (OA[o + 1] + (OB[o + 1] - OA[o + 1]) * w) * fade, a2 = (OA[o + 2] + (OB[o + 2] - OA[o + 2]) * w) * fade;
        x += f[0][0] * a0 + f[1][0] * a1 + f[2][0] * a2; y += f[0][1] * a0 + f[1][1] * a1 + f[2][1] * a2; z += f[0][2] * a0 + f[1][2] * a1 + f[2][2] * a2;
      }
      P[v * 3] = x; P[v * 3 + 1] = y; P[v * 3 + 2] = z;
    }
    // 법선: 면 안에서는 매끄럽게 (꼭짓점 공유), 면 사이(접힌 선)는 꼭짓점이 따로라 각지게
    geo.computeVertexNormals();
    geo.attributes.position.needsUpdate = true;
    geo.computeBoundingSphere();
    this.back.geometry.boundingSphere = geo.boundingSphere;
    const ridge = this.updateFolds(base, normals, F, w, fx, fade);

    const D = this.dark.geometry.attributes.position.array, L = this.light.geometry.attributes.position.array;
    let di = 0, li = 0;
    p.edges.forEach((ed, ei) => {
      const pts = loops[ed.i], cs = meta.corners[ed.i];
      const a = pts[cs[ed.k]], b = pts[cs[(ed.k + 1) % cs.length]];
      let dark = ed.border;
      if (!dark && ed.j >= 0) {
        const n1 = normals[ed.i], n2 = normals[ed.j];
        dark = n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2] < 0.995;
      }
      if (ed.seam && !dark) return;
      const arr = dark ? D : L;
      let o = dark ? di : li;
      if (this.fine) {
        // 휜 면을 따라가도록 선도 잘게 나눈다
        const S = this.Sq[ed.i];
        const bp = base[ed.i], a0 = bp[cs[ed.k]], b0 = bp[cs[(ed.k + 1) % cs.length]], eo = this.edgeOff && this.edgeOff[ei];
        const at = (s2) => {
          let v = fx(a0.map((x, j) => x + (b0[j] - x) * (s2 / S)), ed.i);
          if (eo && F) {
            const f = F[ed.i], [A, B] = eo[s2], q = [0, 1, 2].map((j) => (A[j] + (B[j] - A[j]) * w) * fade);
            v = [0, 1, 2].map((j) => v[j] + f[0][j] * q[0] + f[1][j] * q[1] + f[2][j] * q[2]);
          }
          return v;
        };
        for (let s2 = 0; s2 < S; s2++) {
          const u = at(s2), v = at(s2 + 1);
          arr[o++] = u[0]; arr[o++] = u[1]; arr[o++] = u[2]; arr[o++] = v[0]; arr[o++] = v[1]; arr[o++] = v[2];
        }
      } else {
        arr[o++] = a[0]; arr[o++] = a[1]; arr[o++] = a[2]; arr[o++] = b[0]; arr[o++] = b[1]; arr[o++] = b[2];
      }
      if (dark) di = o; else li = o;
    });
    for (const [u, v] of ridge) { D[di++] = u[0]; D[di++] = u[1]; D[di++] = u[2]; D[di++] = v[0]; D[di++] = v[1]; D[di++] = v[2]; }
    this.dark.geometry.setDrawRange(0, di / 3);
    this.light.geometry.setDrawRange(0, li / 3);
    this.dark.geometry.attributes.position.needsUpdate = true;
    this.light.geometry.attributes.position.needsUpdate = true;
    this.updateInk(loops, t);
    return loops;
  }
}

// 점들이 화면에 꽉 차도록 카메라 위치 계산
// 점들이 화면에 꽉 차도록 카메라 위치 계산 (보는 방향에 투영한 가로·세로 범위로 맞춤)
// extra: 화살표처럼 '거의' 보이면 되는 점들 — 중심 쪽으로 당겨서 반영한다
export function fitCamera(camera, points, dir, aspect, margin = 1.1, extra = []) {
  const box = new THREE.Box3().setFromPoints(points);
  const center = box.getCenter(new THREE.Vector3());
  const all = [...points, ...extra.map((p) => center.clone().lerp(p, 0.75))];
  const v = new THREE.Vector3(...dir).normalize();
  const right = new THREE.Vector3(0, 1, 0).cross(v);
  if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
  right.normalize();
  const up = v.clone().cross(right).normalize();
  let hw = 0.08, hh = 0.08, front = 0;
  for (const p of all) {
    const d = p.clone().sub(center);
    hw = Math.max(hw, Math.abs(d.dot(right)));
    hh = Math.max(hh, Math.abs(d.dot(up)));
    front = Math.max(front, d.dot(v));
  }
  const vf = THREE.MathUtils.degToRad(camera.fov) / 2;
  const hf = Math.atan(Math.tan(vf) * aspect);
  let dist = Math.max(hw / Math.tan(hf), hh / Math.tan(vf)) * margin + front;
  // 원근 때문에 카메라 쪽으로 나온 점(펼친 날개 끝 등)은 더 크게 보인다: 실제 투영으로 확인해 넘치면 물러선다
  const tx = Math.tan(hf) / margin, ty = Math.tan(vf) / margin;
  for (let k = 0; k < 20; k++) {
    const cam = center.clone().addScaledVector(v, dist);
    let over = 1;
    for (const p of all) {
      const d = p.clone().sub(cam), z = -d.dot(v);
      if (z <= 1e-3) { over = 1.2; break; }
      over = Math.max(over, Math.abs(d.dot(right)) / z / tx, Math.abs(d.dot(up)) / z / ty);
    }
    if (over <= 1.001) break;
    dist *= Math.min(1.25, over);
  }
  return { pos: center.clone().addScaledVector(v, dist), target: center };
}

export const toVecs = (loops) => loops.flat().map((v) => new THREE.Vector3(...v));

