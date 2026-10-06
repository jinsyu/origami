import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { buildModel, pose, polyNormal, moveGuides } from './engine.js';
import { prepareSim, simPose, simGuides } from './sim.js';
import { cicada } from './models/cicada.js';
import { airplane } from './models/airplane.js';

const MODELS = [cicada, airplane];
if (location.hash === '#dev') MODELS.push((await import('./models/_test.js')).test);
const FOLD_SEC = 2.2;   // 한 단계 접는 시간
const WAIT_SEC = 0.9;   // 접기 전 접는 선·화살표를 보여 주는 시간
const $ = (id) => document.getElementById(id);

// ---------- 장면 ----------
const stage = $('stage');
const canvas = $('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 50);
camera.position.set(0, -1, 2.5);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 0.5;
controls.maxDistance = 6;

scene.add(new THREE.HemisphereLight('#ffffff', '#d9cfbf', 1.5));
const key = new THREE.DirectionalLight('#fff6ea', 1.7);
key.position.set(-1.2, 1.4, 2.6);
scene.add(key);
const fill = new THREE.DirectionalLight('#eef3ff', 0.6);
fill.position.set(1.6, -1, 1.2);
scene.add(fill);
const rim = new THREE.DirectionalLight('#ffffff', 0.7);
rim.position.set(0, 0.5, -2.5);
scene.add(rim);

// 종이 질감 (미세한 섬유 무늬)
function paperTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const v = 232 + Math.random() * 23;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  g.strokeStyle = 'rgba(0,0,0,0.035)';
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, a = Math.random() * Math.PI;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const tex = paperTexture();
const matOpts = { map: tex, roughness: 0.92, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
const frontMat = new THREE.MeshStandardMaterial({ ...matOpts, side: THREE.FrontSide });
const backMat = new THREE.MeshStandardMaterial({ ...matOpts, side: THREE.BackSide });
const frontMesh = new THREE.Mesh(new THREE.BufferGeometry(), frontMat);
const backMesh = new THREE.Mesh(frontMesh.geometry, backMat);
scene.add(frontMesh, backMesh);

// 모서리 선: 가장자리·접힌 선(진하게), 펼쳐진 접힌 자국(연하게)
const darkLines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#2b2622', transparent: true, opacity: 0.5 }));
const lightLines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#2b2622', transparent: true, opacity: 0.2 }));
scene.add(darkLines, lightLines);

const guideGroup = new THREE.Group();
scene.add(guideGroup);
let guideMats = [];

// ---------- 상태 ----------
let model, plans, N;
let step = 0, t = 0, phase = 'idle', waitT = 0, autoAll = false;
let plan = null, geoPlan = null, uvScale = 1, uvMin = [0, 0];

// 단계 p의 진행률 t에서 다각형별 꼭짓점 고리
const simOf = (p) => p._sim || (p._sim = prepareSim(p));
const loopsOf = (p, tt) => (p.sim ? simPose(simOf(p), tt) : pose(p, tt));
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

// 다각형마다 중심점 부채꼴로 삼각형을 만든다 (T자 접점이 있어도 갈라지지 않게)
function setupGeometry(p) {
  geoPlan = p;
  const meta = metaOf(p);
  const tris = meta.uv.reduce((s, L) => s + L.length, 0);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tris * 9), 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(tris * 9), 3));
  const uv = new Float32Array(tris * 6);
  let k = 0;
  const put = (v) => { uv[k++] = (v[0] - uvMin[0]) * uvScale; uv[k++] = (v[1] - uvMin[1]) * uvScale; };
  for (const L of meta.uv) {
    const c = [L.reduce((a, v) => a + v[0], 0) / L.length, L.reduce((a, v) => a + v[1], 0) / L.length];
    for (let i = 0; i < L.length; i++) { put(c); put(L[i]); put(L[(i + 1) % L.length]); }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  frontMesh.geometry.dispose();
  frontMesh.geometry = backMesh.geometry = geo;
  const n = p.edges.length * 6;
  for (const l of [darkLines, lightLines]) {
    l.geometry.dispose();
    l.geometry = new THREE.BufferGeometry();
    l.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n), 3));
  }
}

function drawPaper(p, tt) {
  if (p !== geoPlan) setupGeometry(p);
  const loops = loopsOf(p, tt);
  const meta = metaOf(p);
  const normals = loops.map(polyNormal);
  const geo = frontMesh.geometry;
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

  const D = darkLines.geometry.attributes.position.array, L = lightLines.geometry.attributes.position.array;
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
  darkLines.geometry.setDrawRange(0, di / 3);
  lightLines.geometry.setDrawRange(0, li / 3);
  darkLines.geometry.attributes.position.needsUpdate = true;
  lightLines.geometry.attributes.position.needsUpdate = true;
  return loops;
}

// ---------- 접는 선(점선)과 화살표 ----------
function clearGuides() {
  guideGroup.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  guideMats.forEach((m) => m.dispose());
  guideGroup.clear();
  guideMats = [];
}

function buildGuides(p) {
  clearGuides();
  const color = new THREE.Color(model.accent);
  const pts = [];
  if (p.sim) {
    // 골짜기 접기: 강조색 짧은 점선, 산 접기: 갈색 긴 점선
    for (const g of simGuides(simOf(p))) {
      const lg = new LineGeometry();
      lg.setPositions([g.a[0], g.a[1], g.a[2] + 0.006, g.b[0], g.b[1], g.b[2] + 0.006]);
      const m = new LineMaterial({ color: g.valley ? color : new THREE.Color('#9a5b13'), linewidth: 3, dashed: true, dashSize: g.valley ? 0.03 : 0.06, gapSize: g.valley ? 0.022 : 0.03, transparent: true, depthTest: false });
      m.resolution.set(canvas.clientWidth, canvas.clientHeight);
      const l = new Line2(lg, m);
      l.computeLineDistances();
      l.renderOrder = 10;
      guideGroup.add(l);
      guideMats.push(m);
    }
    return pts;
  }
  p.moves.forEach((_, mi) => {
    const { line, path } = moveGuides(p, mi);
    if (line) {
      const g = new LineGeometry();
      g.setPositions([...line[0], ...line[1]]);
      const m = new LineMaterial({ color, linewidth: 3, dashed: true, dashSize: 0.035, gapSize: 0.025, transparent: true, depthTest: false });
      m.resolution.set(canvas.clientWidth, canvas.clientHeight);
      const l = new Line2(g, m);
      l.computeLineDistances();
      l.renderOrder = 10;
      guideGroup.add(l);
      guideMats.push(m);
    }
    if (path.length > 2) {
      const vs = path.map((v) => new THREE.Vector3(...v));
      pts.push(...vs);
      const curve = new THREE.CatmullRomCurve3(vs);
      const len = curve.getLength(), head = Math.min(0.07, len * 0.3);
      const endU = 1 - head / len;
      const sub = new THREE.CatmullRomCurve3(curve.getSpacedPoints(60).filter((_, i) => i / 60 <= endU));
      const m = new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false });
      const tube = new THREE.Mesh(new THREE.TubeGeometry(sub, 60, 0.008, 8), m);
      const tipPos = curve.getPointAt(1), basePos = curve.getPointAt(endU);
      const dir = tipPos.clone().sub(basePos).normalize();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.026, head, 16), m);
      cone.position.copy(basePos).addScaledVector(dir, head / 2);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      tube.renderOrder = cone.renderOrder = 11;
      guideGroup.add(tube, cone);
      guideMats.push(m);
    }
  });
  return pts;
}

function setGuideOpacity(a) {
  guideGroup.visible = a > 0.01;
  guideMats.forEach((m) => { m.opacity = a; });
}

// ---------- 카메라 자동 맞춤 ----------
let camTween = null;
controls.addEventListener('start', () => { camTween = null; });

function frameTo(points, dir) {
  const box = new THREE.Box3().setFromPoints(points);
  const center = box.getCenter(new THREE.Vector3());
  const r = Math.max(0.2, ...points.map((p) => p.distanceTo(center)));
  const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
  const vf = THREE.MathUtils.degToRad(camera.fov) / 2;
  const hf = Math.atan(Math.tan(vf) * aspect);
  const dist = (r / Math.sin(Math.min(vf, hf))) * 1.08;
  const v = new THREE.Vector3(...dir).normalize();
  camTween = {
    k: 0,
    fromPos: camera.position.clone(), fromTarget: controls.target.clone(),
    toPos: center.clone().addScaledVector(v, dist), toTarget: center,
  };
}

const toVecs = (posed) => posed.flat().map((v) => new THREE.Vector3(...v));

// ---------- 단계 이동 ----------
function enterStep(i, play) {
  step = i;
  if (step >= N) {
    plan = plans[N - 1];
    t = 1; phase = 'idle'; autoAll = false;
    clearGuides();
    frameTo(toVecs(loopsOf(plan, 1)), model.finalView);
  } else {
    plan = plans[step];
    t = 0; phase = play ? 'wait' : 'idle'; waitT = WAIT_SEC;
    const arrowPts = buildGuides(plan);
    const pts = [...toVecs(loopsOf(plan, 0)), ...toVecs(loopsOf(plan, 1)), ...(plan.sim ? toVecs(loopsOf(plan, 0.5)) : []), ...arrowPts];
    frameTo(pts, model.steps[step].view || model.view);
  }
  updateUI();
}

function loadModel(m) {
  model = m;
  plans = buildModel(m);
  N = plans.length;
  const us = m.outline.map((v) => v[0]), vs = m.outline.map((v) => v[1]);
  uvMin = [Math.min(...us), Math.min(...vs)];
  uvScale = 1.6 / Math.max(Math.max(...us) - uvMin[0], Math.max(...vs) - uvMin[1]);
  frontMat.color.set(m.colors.front);
  backMat.color.set(m.colors.back);
  document.documentElement.style.setProperty('--accent', m.accent);
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b.dataset.id === m.id));
  $('paperInfo').textContent = `${m.paper} · ${N}단계 · ${m.level}`;
  const list = $('stepList');
  list.innerHTML = '';
  m.steps.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="num">${i + 1}</span><span class="txt"></span>`;
    li.querySelector('.txt').textContent = s.text;
    li.onclick = () => { autoAll = false; enterStep(i, false); };
    list.appendChild(li);
  });
  geoPlan = null;
  enterStep(0, false);
  camTween && (camTween.k = 1);
}

// ---------- UI ----------
const slider = $('progress');
function updateUI() {
  const done = step >= N;
  $('badge').textContent = done ? '완성' : `${step + 1} / ${N}`;
  $('stepText').textContent = done ? model.done : model.steps[step].text;
  $('prev').disabled = step === 0 && t === 0;
  $('fold').disabled = done || phase !== 'idle';
  $('auto').textContent = autoAll && phase !== 'idle' ? '❚❚ 멈춤' : '▶ 자동 재생';
  [...$('stepList').children].forEach((li, i) => {
    li.classList.toggle('done', i < step);
    li.classList.toggle('now', i === step);
  });
  const now = $('stepList').children[step];
  if (now) now.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

$('prev').onclick = () => {
  autoAll = false;
  if (step >= N) enterStep(N - 1, false);
  else if (t > 0.001) enterStep(step, false);
  else enterStep(Math.max(0, step - 1), false);
};
$('fold').onclick = () => {
  autoAll = false;
  if (step >= N) return;
  if (t >= 1) { step < N - 1 ? enterStep(step + 1, true) : enterStep(N, false); return; }
  phase = 'play';
  updateUI();
};
$('auto').onclick = () => {
  if (autoAll && phase !== 'idle') { autoAll = false; phase = 'idle'; updateUI(); return; }
  autoAll = true;
  if (step >= N) { enterStep(0, true); return; }
  phase = t > 0 ? 'play' : 'wait';
  waitT = WAIT_SEC;
  updateUI();
};
$('restart').onclick = () => { autoAll = false; enterStep(0, false); };
slider.oninput = () => {
  autoAll = false;
  if (step >= N) enterStep(N - 1, false);
  t = +slider.value;
  phase = 'idle';
  updateUI();
};

const tabs = $('tabs');
MODELS.forEach((m) => {
  const b = document.createElement('button');
  b.className = 'tab';
  b.dataset.id = m.id;
  b.textContent = m.name;
  b.onclick = () => { if (m !== model) loadModel(m); };
  tabs.appendChild(b);
});

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  guideMats.forEach((m) => m.resolution && m.resolution.set(w, h));
}
new ResizeObserver(resize).observe(stage);
resize();

loadModel(MODELS[0]);

// ---------- 루프 ----------
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (phase === 'wait') {
    waitT -= dt;
    if (waitT <= 0) { phase = 'play'; updateUI(); }
  } else if (phase === 'play') {
    t = Math.min(1, t + dt / FOLD_SEC);
    if (t >= 1) {
      if (step < N - 1) enterStep(step + 1, autoAll);
      else enterStep(N, false);
    }
  }
  drawPaper(plan, t);
  setGuideOpacity(step >= N ? 0 : Math.max(0, 1 - t * 2.5));
  slider.value = step >= N ? 1 : t;

  if (camTween) {
    camTween.k = Math.min(1, camTween.k + dt / 0.9);
    const e = 1 - Math.pow(1 - camTween.k, 3);
    camera.position.lerpVectors(camTween.fromPos, camTween.toPos, e);
    controls.target.lerpVectors(camTween.fromTarget, camTween.toTarget, e);
    if (camTween.k >= 1) camTween = null;
  }
  controls.update();
  renderer.render(scene, camera);
});
