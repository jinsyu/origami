// 종이 메시: 단계 계획(plan)과 진행률 t를 받아 앞·뒷면, 가장자리·접힌 선을 그린다.
import * as THREE from 'three';
import { pose, polyNormal, cross, sub, sheetsOf, sheetOfU } from './engine.js';
import { prepareSim, simPose } from './sim.js';

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

// 부풀리기 단계에서 부채꼴 삼각형 하나를 나누는 수
const SUB = 12;
// 삼각형 (가운데, a, b)를 S×S 개로 나눈 작은 삼각형들의 무게 (가운데·a·b 비율)
const subCache = new Map();
function subTris(S) {
  if (subCache.has(S)) return subCache.get(S);
  const W = (i, j) => [1 - (i + j) / S, i / S, j / S], out = [];
  for (let i = 0; i < S; i++) for (let j = 0; j < S - i; j++) {
    out.push([W(i, j), W(i + 1, j), W(i, j + 1)]);
    if (i + j + 1 < S) out.push([W(i + 1, j), W(i + 1, j + 1), W(i, j + 1)]);
  }
  subCache.set(S, out);
  return out;
}

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
    const opts = { map: paperTexture(), roughness: 0.9, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
    this.frontMat = new THREE.MeshStandardMaterial({ ...opts, side: THREE.FrontSide });
    this.backMat = new THREE.MeshStandardMaterial({ ...opts, side: THREE.BackSide });
    this.front = new THREE.Mesh(new THREE.BufferGeometry(), this.frontMat);
    this.back = new THREE.Mesh(this.front.geometry, this.backMat);
    this.dark = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#1e2b3a', transparent: true, opacity: 0.45 }));
    this.light = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#1e2b3a', transparent: true, opacity: 0.16 }));
    this.group = new THREE.Group();
    this.ink = new THREE.Group(); // 꾸미기 단계에서 연필·색연필로 그린 획
    this.group.add(this.front, this.back, this.dark, this.light, this.ink);
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
    // 부풀리기(deform) 단계는 면을 잘게 나눠 곡면으로 휘게 한다
    const S = p.deform ? SUB : 1, bt = subTris(S);
    this.S = S;
    const tris = meta.uv.reduce((s, L) => s + L.length, 0) * bt.length;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris * 9), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(tris * 9), 3));
    const uv = new Float32Array(tris * 6);
    let k = 0;
    const put = (v) => { uv[k++] = (v[0] - this.uvMin[0]) * this.uvScale; uv[k++] = (v[1] - this.uvMin[1]) * this.uvScale; };
    for (const L of meta.uv) {
      const c = [L.reduce((a, v) => a + v[0], 0) / L.length, L.reduce((a, v) => a + v[1], 0) / L.length];
      for (let i = 0; i < L.length; i++) {
        const a = L[i], b = L[(i + 1) % L.length];
        for (const T of bt) for (const w of T) put([0, 1].map((j) => c[j] * w[0] + a[j] * w[1] + b[j] * w[2]));
      }
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    // 앞면·뒷면 메시는 위치·법선·uv를 함께 쓰고 색만 따로 가진다
    const colF = new Float32Array(tris * 9), colB = new Float32Array(tris * 9);
    let ci = 0;
    for (const L of meta.uv) {
      const cs = this.sheetColors[Math.min(this.sheetColors.length - 1, sheetOfU(L.reduce((a, v) => a + v[0], 0) / L.length))];
      for (let i = 0; i < L.length * 3 * bt.length; i++, ci += 3) {
        colF[ci] = cs.front.r; colF[ci + 1] = cs.front.g; colF[ci + 2] = cs.front.b;
        colB[ci] = cs.back.r; colB[ci + 1] = cs.back.g; colB[ci + 2] = cs.back.b;
      }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colF, 3));
    const geoB = new THREE.BufferGeometry();
    for (const a of ['position', 'normal', 'uv']) geoB.setAttribute(a, geo.attributes[a]);
    geoB.setAttribute('color', new THREE.BufferAttribute(colB, 3));
    this.front.geometry.dispose();
    if (this.back.geometry !== this.front.geometry) this.back.geometry.dispose();
    this.front.geometry = geo;
    this.back.geometry = geoB;
    const n = p.edges.length * 6 * S;
    for (const l of [this.dark, this.light]) {
      l.geometry.dispose();
      l.geometry = new THREE.BufferGeometry();
      l.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n), 3));
    }
  }

  update(p, t) {
    if (p !== this.plan) this.setup(p);
    const loops = loopsOf(p, t);
    const meta = metaOf(p);
    const normals = loops.map(polyNormal);
    const geo = this.front.geometry;
    const P = geo.attributes.position.array, Nn = geo.attributes.normal.array;
    const S = this.S, bt = subTris(S);
    // 잘게 나눌 때는 변형 전 위치에서 나눈 뒤 점마다 변형한다
    const base = S > 1 ? pose(p, t, true) : loops, e = t * t * (3 - 2 * t);
    const fx = S > 1 ? (v) => p.deform(v, e) : (v) => v;
    let k = 0;
    base.forEach((pts, qi) => {
      const nn = normals[qi];
      const c = [0, 1, 2].map((i) => pts.reduce((a, v) => a + v[i], 0) / pts.length);
      for (let i = 0; i < pts.length; i++) {
        const a0 = pts[i], b0 = pts[(i + 1) % pts.length];
        for (const T of bt) {
          const V = T.map((w) => fx([0, 1, 2].map((j) => c[j] * w[0] + a0[j] * w[1] + b0[j] * w[2])));
          // 부풀린 면은 평평하지 않으므로 삼각형마다 법선을 구한다 (평평하면 다각형 법선과 같다)
          const tn = cross(sub(V[1], V[0]), sub(V[2], V[0])), tl = Math.hypot(...tn);
          const n3 = tl > 1e-12 ? [tn[0] / tl, tn[1] / tl, tn[2] / tl] : nn;
          for (const v of V) {
            P[k] = v[0]; P[k + 1] = v[1]; P[k + 2] = v[2];
            Nn[k] = n3[0]; Nn[k + 1] = n3[1]; Nn[k + 2] = n3[2];
            k += 3;
          }
        }
      }
    });
    geo.attributes.position.needsUpdate = true;
    geo.attributes.normal.needsUpdate = true;
    geo.computeBoundingSphere();
    this.back.geometry.boundingSphere = geo.boundingSphere;

    const D = this.dark.geometry.attributes.position.array, L = this.light.geometry.attributes.position.array;
    let di = 0, li = 0;
    for (const ed of p.edges) {
      const pts = loops[ed.i], cs = meta.corners[ed.i];
      const a = pts[cs[ed.k]], b = pts[cs[(ed.k + 1) % cs.length]];
      let dark = ed.border;
      if (!dark && ed.j >= 0) {
        const n1 = normals[ed.i], n2 = normals[ed.j];
        dark = n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2] < 0.995;
      }
      const arr = dark ? D : L;
      let o = dark ? di : li;
      if (S > 1) {
        // 휜 면을 따라가도록 선도 잘게 나눈다
        const bp = base[ed.i], a0 = bp[cs[ed.k]], b0 = bp[cs[(ed.k + 1) % cs.length]];
        for (let s2 = 0; s2 < S; s2++) {
          const u = fx(a0.map((x, j) => x + (b0[j] - x) * (s2 / S))), w = fx(a0.map((x, j) => x + (b0[j] - x) * ((s2 + 1) / S)));
          arr[o++] = u[0]; arr[o++] = u[1]; arr[o++] = u[2]; arr[o++] = w[0]; arr[o++] = w[1]; arr[o++] = w[2];
        }
      } else {
        arr[o++] = a[0]; arr[o++] = a[1]; arr[o++] = a[2]; arr[o++] = b[0]; arr[o++] = b[1]; arr[o++] = b[2];
      }
      if (dark) di = o; else li = o;
    }
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

