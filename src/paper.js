// 종이 메시: 단계 계획(plan)과 진행률 t를 받아 앞·뒷면, 가장자리·접힌 선을 그린다.
import * as THREE from 'three';
import { pose, polyNormal } from './engine.js';
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
    this.group.add(this.front, this.back, this.dark, this.light);
    this.plan = null;
  }

  setModel(model) {
    const us = model.outline.map((v) => v[0]), vs = model.outline.map((v) => v[1]);
    this.uvMin = [Math.min(...us), Math.min(...vs)];
    this.uvScale = 1.6 / Math.max(Math.max(...us) - this.uvMin[0], Math.max(...vs) - this.uvMin[1]);
    this.frontMat.color.set(model.colors.front);
    this.backMat.color.set(model.colors.back);
    this.plan = null;
  }

  // 다각형마다 중심점 부채꼴로 삼각형을 만든다 (T자 접점이 있어도 갈라지지 않게)
  setup(p) {
    this.plan = p;
    const meta = metaOf(p);
    const tris = meta.uv.reduce((s, L) => s + L.length, 0);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris * 9), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(tris * 9), 3));
    const uv = new Float32Array(tris * 6);
    let k = 0;
    const put = (v) => { uv[k++] = (v[0] - this.uvMin[0]) * this.uvScale; uv[k++] = (v[1] - this.uvMin[1]) * this.uvScale; };
    for (const L of meta.uv) {
      const c = [L.reduce((a, v) => a + v[0], 0) / L.length, L.reduce((a, v) => a + v[1], 0) / L.length];
      for (let i = 0; i < L.length; i++) { put(c); put(L[i]); put(L[(i + 1) % L.length]); }
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    this.front.geometry.dispose();
    this.front.geometry = this.back.geometry = geo;
    const n = p.edges.length * 6;
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
    let k = 0;
    loops.forEach((pts, qi) => {
      const nn = normals[qi];
      const c = [0, 1, 2].map((i) => pts.reduce((a, v) => a + v[i], 0) / pts.length);
      for (let i = 0; i < pts.length; i++) {
        for (const v of [c, pts[i], pts[(i + 1) % pts.length]]) {
          P[k] = v[0]; P[k + 1] = v[1]; P[k + 2] = v[2];
          Nn[k] = nn[0]; Nn[k + 1] = nn[1]; Nn[k + 2] = nn[2];
          k += 3;
        }
      }
    });
    geo.attributes.position.needsUpdate = true;
    geo.attributes.normal.needsUpdate = true;
    geo.computeBoundingSphere();

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
      arr[o++] = a[0]; arr[o++] = a[1]; arr[o++] = a[2]; arr[o++] = b[0]; arr[o++] = b[1]; arr[o++] = b[2];
      if (dark) di = o; else li = o;
    }
    this.dark.geometry.setDrawRange(0, di / 3);
    this.light.geometry.setDrawRange(0, li / 3);
    this.dark.geometry.attributes.position.needsUpdate = true;
    this.light.geometry.attributes.position.needsUpdate = true;
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
  const dist = Math.max(hw / Math.tan(hf), hh / Math.tan(vf)) * margin + front;
  return { pos: center.clone().addScaledVector(v, dist), target: center };
}

export const toVecs = (loops) => loops.flat().map((v) => new THREE.Vector3(...v));

