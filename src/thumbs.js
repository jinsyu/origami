// 작품 완성 모습·단계별 그림을 이미지로 만든다 (화면 밖 렌더러 하나를 공유)
import * as THREE from 'three';
import { PaperMesh, addLights, fitCamera, loopsOf, simOf, toVecs } from './paper.js';
import { moveGuides } from './engine.js';
import { simGuides, simArrows } from './sim.js';

let r = null;
function ctx() {
  if (r) return r;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  const scene = new THREE.Scene();
  addLights(scene);
  const paper = new PaperMesh();
  scene.add(paper.group);
  const guides = new THREE.Group();
  scene.add(guides);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
  r = { renderer, scene, paper, camera, guides };
  return r;
}

const cache = new Map();
const MOUNTAIN = '#9a5b13';

// 도면용 안내선: 접는 선(점선)과 움직임 화살표
function drawGuides(group, model, plan) {
  group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  group.clear();
  const accent = new THREE.Color(model.accent);
  // 점선을 짧은 원기둥 조각으로 그린다 (밝은 테두리를 아래에 깔아 어떤 종이 위에서도 보이게)
  const halo = new THREE.MeshBasicMaterial({ color: '#fbfaf6', depthTest: false, transparent: true, opacity: 0.9 });
  const seg = (p, q, r, m, order) => {
    const len = p.distanceTo(q);
    if (len < 1e-5) return;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), m);
    c.position.copy(p).add(q).multiplyScalar(0.5);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize());
    c.renderOrder = order;
    group.add(c);
  };
  const dashed = (a, b, color, mountain) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
    const dash = mountain ? 0.05 : 0.026, gap = 0.018;
    const m = new THREE.MeshBasicMaterial({ color, depthTest: false });
    for (let s = 0; s < L; s += dash + gap) {
      const p = A.clone().lerp(B, s / L), q = A.clone().lerp(B, Math.min(1, (s + dash) / L));
      seg(p, q, 0.009, halo, 9);
      seg(p, q, 0.0045, m, 10);
    }
  };
  const arrow = (path, color) => {
    const vs = path.map((v) => new THREE.Vector3(...v));
    if (vs.length < 2) return;
    const m = new THREE.MeshBasicMaterial({ color, depthTest: false });
    const curve = new THREE.CatmullRomCurve3(vs);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.006, 6), m);
    const end = curve.getPointAt(1), before = curve.getPointAt(0.93);
    const dir = end.clone().sub(before).normalize();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.06, 12), m);
    cone.position.copy(end);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    tube.renderOrder = cone.renderOrder = 11;
    group.add(tube, cone);
  };
  if (plan.sim) {
    for (const g of simGuides(simOf(plan))) dashed([g.a[0], g.a[1], g.a[2] + 0.006], [g.b[0], g.b[1], g.b[2] + 0.006], g.valley ? accent : new THREE.Color(MOUNTAIN), !g.valley);
    for (const p of simArrows(simOf(plan))) arrow(p, accent);
  } else {
    const gs = plan.moves.map((mv, mi) => ({ mv, ...moveGuides(plan, mi) }));
    const lenOf = (path) => path.reduce((a, q, i) => (i ? a + Math.hypot(q[0] - path[i - 1][0], q[1] - path[i - 1][1], q[2] - path[i - 1][2]) : 0), 0);
    const keep = new Set(gs.map((g, i) => [i, lenOf(g.path)]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([i]) => i));
    gs.forEach(({ mv, line, path }, i) => {
      const mountain = !mv.spin && mv.u[2] < 0;
      const color = mountain ? new THREE.Color(MOUNTAIN) : accent;
      if (line) dashed(line[0], line[1], color, mountain);
      if (keep.has(i) && path.length > 2) arrow(path, color);
    });
  }
}

// plan의 진행률 t 상태를 dir 방향에서 본 그림
export function snapshot(model, plan, t, dir, size = 320, key, withGuides = false) {
  if (key && cache.has(key)) return cache.get(key);
  const { renderer, scene, paper, camera, guides } = ctx();
  renderer.setSize(size, size, false);
  if (paper.model !== model) { paper.setModel(model); paper.model = model; }
  const loops = paper.update(plan, t);
  guides.visible = withGuides;
  if (withGuides) drawGuides(guides, model, plan);
  const pts = toVecs(loops);
  // 안내선·화살표가 잘리지 않도록 전체 범위의 꼭짓점을 함께 맞춘다
  if (withGuides && guides.children.length) {
    const b = new THREE.Box3().setFromObject(guides);
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) pts.push(new THREE.Vector3(x, y, z));
  }
  const fit = fitCamera(camera, pts, dir, 1, withGuides ? 1.04 : 1.18);
  camera.position.copy(fit.pos);
  camera.lookAt(fit.target);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  if (key) cache.set(key, url);
  return url;
}

// 단계 i를 시작하기 직전 모습 (작은 도해용, 정면에서)
export function stepThumb(model, plans, i) {
  return snapshot(model, plans[i], 0, [0, 0, 1], 160, `${model.id}:s${i}`);
}

// 인쇄 도면용: 접는 선·화살표까지 그린 큰 그림
export function diagram(model, plans, i) {
  const st = model.steps[i], ms = st.moves || [];
  // 좌우 대칭으로 함께 접는 단계는 정면 쪽에서 조금 내려다본다 (화살표가 납작해지지 않게)
  const sym = !st.sim && ms.length === 2 && ms[0].line && ms[1].line && ms[0].line.every((p, k) => Math.abs(p[0] + ms[1].line[k][0]) < 1e-6 && Math.abs(p[1] - ms[1].line[k][1]) < 1e-6);
  const dir = st.view && st.view[2] > 0.5 ? [st.view[0] * 0.5, st.view[1] * 0.5, 1] : sym ? [0, -0.45, 1] : [0.12, -0.25, 1];
  // 꾸미기 단계는 접는 선이 없으므로 다 그린 모습을 보여 준다
  if (model.steps[i].draw) return snapshot(model, plans[i], 1, [0, 0, 1], 420, `${model.id}:d${i}`);
  return snapshot(model, plans[i], 0, dir, 420, `${model.id}:d${i}`, true);
}

// 완성 모습
export function finalThumb(model, plans) {
  return snapshot(model, plans[plans.length - 1], 1, model.finalView, 360, `${model.id}:final`);
}

export { loopsOf };
