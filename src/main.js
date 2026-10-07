import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { buildModel, moveGuides } from './engine.js';
import { simGuides, simArrows } from './sim.js';
import { PaperMesh, addLights, fitCamera, loopsOf, simOf, toVecs } from './paper.js';
import { finalThumb, stepThumb, diagram, snapshot } from './thumbs.js';
import { MODELS } from './models/index.js';
import { createHero } from './hero.js';
import { enModels, enUI } from './i18n/en.js';

// ---------- 언어 (한국어 / English) ----------
const langKey = 'origami.lang';
const LANG = (() => {
  let saved = null;
  try { saved = localStorage.getItem(langKey); } catch { /* 저장소 사용 불가 */ }
  if (saved === 'ko' || saved === 'en') return saved;
  return (navigator.language || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en';
})();
const EN = LANG === 'en';
const KO = {
  title: '종이접기 교실', pencils: '연필, 색연필', pencil: '연필', fold: '이 단계 접기', draw: '이 단계 그리기', full: '크게 보기', unfull: '작게 보기', stop: '멈추기', replay: '처음부터 다시 보기', auto: '끝까지 이어서 보기',
  startBtn: (n) => `${n}부터 시작하기`, continueBtn: (n, i) => `${n} ${i}단계부터 이어서 접기`,
  done: '완성', folded: '접어 봤어요', resume: (i) => `${i}단계부터 이어서`, next: (n) => `다음 작품: ${n}`, stepsCount: (n) => `${n}단계`, sheetsCount: (n) => `색종이 ${n}장`, level: (l) => ['입문', '초급', '중급', '고급'][l - 1],
  printTitle: (n) => `${n} 접는 방법`,
  bands: [['all', '전체'], ['1', '입문'], ['2', '초급'], ['3', '중급'], ['4', '고급']], bandLabel: '난이도로 보기',
};
const T = EN ? enUI : KO;
if (EN) {
  document.documentElement.lang = 'en';
  // 작품 문구를 영어로 바꾼다
  for (const m of MODELS) {
    const e = enModels[m.id];
    if (!e) continue;
    Object.assign(m, { name: e.name, desc: e.desc, paper: e.paper, done: e.done });
    m.steps.forEach((st, i) => { if (e.steps[i]) st.text = e.steps[i]; });
  }
  // 화면 고정 문구 (data-en)
  document.querySelectorAll('[data-en]').forEach((el) => { el.textContent = el.dataset.en; });
  document.querySelectorAll('[data-en-aria]').forEach((el) => el.setAttribute('aria-label', el.dataset.enAria));
}
document.querySelectorAll('.lang-btn').forEach((b) => {
  b.textContent = EN ? '한국어' : 'English';
  b.onclick = () => { try { localStorage.setItem(langKey, EN ? 'ko' : 'en'); } catch { /* 저장 불가 */ } location.reload(); };
});

// 개발 중인 작품: 주소에 ?dev 를 붙이면 보인다
if (new URLSearchParams(location.search).has('dev')) {
  MODELS.push((await import('./models/_test.js')).test);
  MODELS.sort((a, b) => a.level - b.level);
}

const FOLD_SEC = 2.2;   // 한 단계 접는 시간 (보통 속도)
const WAIT_SEC = 0.9;   // 접기 전 접는 선·화살표를 보여 주는 시간
const MOUNTAIN = '#9a5b13';
const $ = (id) => document.getElementById(id);

// 접어 본 작품 기록 (이 기기에만 저장, 실패해도 동작에는 영향 없음)
const doneKey = 'origami.done';
const readDone = () => { try { return new Set(JSON.parse(localStorage.getItem(doneKey) || '[]')); } catch { return new Set(); } };
const markDone = (id) => { try { const d = readDone(); d.add(id); localStorage.setItem(doneKey, JSON.stringify([...d])); } catch { /* 저장 불가 */ } };

// 작품별 계획은 처음 필요할 때 계산
const planCache = new Map();
const plansOf = (m) => { if (!planCache.has(m.id)) planCache.set(m.id, buildModel(m)); return planCache.get(m.id); };

// ---------- 작품 목록 ----------
function meter(level) {
  const el = document.createElement('span');
  el.className = 'meter';
  el.setAttribute('aria-label', EN ? `Level: ${T.level(level)}` : `난이도: ${T.level(level)}`);
  el.innerHTML = Array.from({ length: 4 }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('');
  return el;
}

function resumeOf(id) { try { return JSON.parse(localStorage.getItem('origami.resume') || '{}')[id] || 0; } catch { return 0; } }
function refreshDone() {
  const done = readDone();
  document.querySelectorAll('.card').forEach((li) => {
    const id = li.dataset.id, has = done.has(id);
    const pic = li.querySelector('.pic'), facts = li.querySelector('.facts');
    let mark = pic.querySelector('.check'), badge = facts.querySelector('.done-badge');
    if (has && !mark) { mark = document.createElement('span'); mark.className = 'check'; mark.setAttribute('aria-hidden', 'true'); pic.appendChild(mark); }
    if (has && !badge) { badge = document.createElement('span'); badge.className = 'done-badge'; badge.textContent = T.folded; facts.appendChild(badge); }
    if (!has) { mark?.remove(); badge?.remove(); }
    // 접다 만 작품: 어디까지 접었는지 표시
    const at = resumeOf(id), m = MODELS.find((x) => x.id === id);
    let res = facts.querySelector('.resume-badge');
    if (at && !res) { res = document.createElement('span'); res.className = 'done-badge resume-badge'; facts.appendChild(res); }
    if (at) res.textContent = T.resume(at + 1, m.steps.length); else res?.remove();
  });
}

// 첫 화면 시연 (갤러리가 보일 때만 돌린다)
const hero = createHero($('heroCanvas'), MODELS, plansOf, (m) => {
  $('heroCaption').textContent = `${m.name} · ${T.level(m.level)}`;
  $('heroLink').href = `#/m/${m.id}`;
});

// 난이도 구간 필터 (고른 구간은 이 브라우저에 기억)
const bandKey = 'origami.band';
let band = 'all';
try { band = localStorage.getItem(bandKey) || 'all'; } catch { /* 저장소 사용 불가 */ }
if (!['all', '1', '2', '3', '4'].includes(band)) band = 'all';
function applyBand() {
  [...$('cards').children].forEach((li) => { li.hidden = band !== 'all' && li.dataset.band !== band; });
  $('bands').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.band === band)));
}
function renderBands() {
  const box = $('bands');
  if (box.childElementCount) return;
  box.setAttribute('aria-label', T.bandLabel);
  for (const [key, label] of T.bands) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.band = key;
    const n = key === 'all' ? MODELS.length : MODELS.filter((m) => String(m.level) === key).length;
    b.innerHTML = `<span></span><small>${n}</small>`;
    b.querySelector('span').textContent = label;
    b.onclick = () => { band = key; try { localStorage.setItem(bandKey, band); } catch { /* 무시 */ } applyBand(); };
    box.appendChild(b);
  }
}

// 첫 화면 시작 버튼: 접다 만 작품이 있으면 이어서, 없으면 가장 쉬운 작품부터
function renderStart() {
  let r = {};
  try { r = JSON.parse(localStorage.getItem('origami.resume') || '{}'); } catch { /* 무시 */ }
  let last = null;
  try { last = localStorage.getItem('origami.last'); } catch { /* 무시 */ }
  const m = MODELS.find((x) => x.id === last && r[x.id]) || MODELS.find((x) => r[x.id]);
  const btn = $('startBtn');
  if (m) { btn.href = `#/m/${m.id}`; btn.textContent = T.continueBtn(m.name, r[m.id] + 1, m.steps.length); }
  else { btn.href = `#/m/${MODELS[0].id}`; btn.textContent = T.startBtn(MODELS[0].name); }
}

function renderGallery() {
  renderStart();
  const ol = $('cards');
  renderBands();
  if (ol.childElementCount) { refreshDone(); applyBand(); return; }
  const queue = [];
  for (const m of MODELS) {
    const li = document.createElement('li');
    li.className = 'card';
    li.dataset.id = m.id;
    li.dataset.band = String(m.level);
    li.innerHTML = `<a href="#/m/${m.id}"><div class="pic matgrid"><span class="lv" aria-hidden="true">${T.level(m.level)}</span><img alt="" /></div>
      <div class="meta"><h3></h3><p></p><div class="facts"><span class="steps"></span></div></div></a>`;
    li.querySelector('h3').textContent = m.name;
    li.querySelector('p').textContent = m.desc;
    li.querySelector('.steps').textContent = T.stepsCount(m.steps.length) + (m.sheets ? ` · ${T.sheetsCount(m.sheets.length)}` : '');
    li.querySelector('.facts').prepend(meter(m.level));
    li.querySelector('img').alt = EN ? `Finished ${m.name}` : `${m.name} 완성 모습`;
    ol.appendChild(li);
    queue.push([m, li.querySelector('img')]);
  }
  applyBand();
  // 완성 그림: 미리 만들어 둔 이미지(thumbs/작품.webp)를 쓰고, 없으면 3D로 그린다.
  // 주소에 ?live 를 붙이면 항상 새로 그린다 (작품을 고친 뒤 썸네일을 다시 만들 때)
  const live = new URLSearchParams(location.search).has('live');
  // ?live&save : 새로 그린 그림을 scripts/thumb-server.mjs 로 보내 thumbs/ 에 저장 (개발용)
  const save = live && new URLSearchParams(location.search).has('save');
  const saveThumb = (m, img) => img.decode().then(() => {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return fetch(`http://localhost:5199/${m.id}.webp`, { method: 'POST', body: c.toDataURL('image/webp', 0.9) });
  }).catch(() => console.warn('썸네일 저장 실패: scripts/thumb-server.mjs 가 켜져 있는지 확인하세요'));
  const render = [];
  for (const [m, img] of queue) {
    if (live) { render.push([m, img]); continue; }
    img.onerror = () => { img.onerror = null; render.push([m, img]); if (render.length === 1) setTimeout(next, 16); };
    img.src = `thumbs/${m.id}.webp`;
  }
  const next = () => {
    const job = render.shift();
    if (!job) return;
    const [m, img] = job;
    img.src = finalThumb(m, plansOf(m));
    if (save) saveThumb(m, img);
    setTimeout(next, 16);
  };
  if (live) setTimeout(next, 50);
  refreshDone();
}

// ---------- 3D 장면 ----------
const stage = $('stage');
const canvas = $('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 50);
camera.position.set(0, -1, 2.5);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 0.4;
controls.maxDistance = 6;
addLights(scene);
const paper = new PaperMesh();
scene.add(paper.group);
const guideGroup = new THREE.Group();
scene.add(guideGroup);
let guideMats = [];

// ---------- 상태 ----------
let model = null, plans, N, plan = null;
let step = 0, t = 0, phase = 'idle', waitT = 0, autoAll = false, speed = 1;
let running = false;

// ---------- 접는 선(점선)과 화살표 ----------
function clearGuides() {
  guideGroup.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  guideMats.forEach((m) => m.dispose());
  guideGroup.clear();
  guideMats = [];
}

function dashed(a, b, color, mountain) {
  // 밝은 테두리(헤일로)를 먼저 깔아 어떤 색 종이 위에서도 점선이 보이게
  const hg = new LineGeometry();
  hg.setPositions([...a, ...b]);
  const hm = new LineMaterial({ color: new THREE.Color('#fbfaf6'), linewidth: 6, transparent: true, opacity: 0.85, depthTest: false });
  hm.resolution.set(canvas.clientWidth, canvas.clientHeight);
  const halo = new Line2(hg, hm);
  halo.renderOrder = 9;
  guideGroup.add(halo);
  guideMats.push(hm);
  const g = new LineGeometry();
  g.setPositions([...a, ...b]);
  const m = new LineMaterial({ color, linewidth: 3, dashed: true, dashSize: mountain ? 0.06 : 0.03, gapSize: mountain ? 0.03 : 0.022, transparent: true, depthTest: false });
  m.resolution.set(canvas.clientWidth, canvas.clientHeight);
  const l = new Line2(g, m);
  l.computeLineDistances();
  l.renderOrder = 10;
  guideGroup.add(l);
  guideMats.push(m);
}

function arrow(path, color) {
  const vs = path.map((v) => new THREE.Vector3(...v));
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
  return vs;
}

function buildGuides(p) {
  clearGuides();
  const color = new THREE.Color(model.accent);
  const pts = [];
  let mountain = false;
  if (p.sim) {
    for (const g of simGuides(simOf(p))) {
      dashed([g.a[0], g.a[1], g.a[2] + 0.006], [g.b[0], g.b[1], g.b[2] + 0.006], g.valley ? color : new THREE.Color(MOUNTAIN), !g.valley);
      if (!g.valley) mountain = true;
    }
    for (const path of simArrows(simOf(p))) pts.push(...arrow(path, color));
  } else {
    const gs = p.moves.map((mv, mi) => ({ mv, ...moveGuides(p, mi) }));
    // 화살표는 많이 움직이는 것 2개까지만 (여러 동작이 겹치면 읽기 어려움)
    const lenOf = (path) => path.reduce((a, q, i) => (i ? a + Math.hypot(q[0] - path[i - 1][0], q[1] - path[i - 1][1], q[2] - path[i - 1][2]) : 0), 0);
    const keep = new Set(gs.map((g, i) => [i, lenOf(g.path)]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([i]) => i));
    gs.forEach(({ mv, line, path }, i) => {
      // 보는 쪽(+z)으로 접으면 골짜기, 뒤로 접으면 산
      const isMountain = !mv.spin && mv.u[2] < 0;
      if (isMountain) mountain = true;
      if (line) dashed(line[0], line[1], isMountain ? new THREE.Color(MOUNTAIN) : color, isMountain);
      if (keep.has(i) && path.length > 2) pts.push(...arrow(path, isMountain ? new THREE.Color(MOUNTAIN) : color));
    });
  }
  $('legend').hidden = !mountain && !p.sim;
  return pts;
}

function setGuideOpacity(a) {
  guideGroup.visible = a > 0.01;
  guideMats.forEach((m) => { m.opacity = a; });
}

// ---------- 카메라 자동 맞춤 ----------
let camTween = null;
controls.addEventListener('start', () => { camTween = null; });
function frameTo(points, dir, instant, extra = []) {
  const fit = fitCamera(camera, points, dir, canvas.clientWidth / Math.max(1, canvas.clientHeight), 1.12, extra);
  camTween = { k: instant ? 1 : 0, fromPos: camera.position.clone(), fromTarget: controls.target.clone(), toPos: fit.pos, toTarget: fit.target };
}

// 좌우 대칭으로 함께 접는 단계는 정면 쪽에서 본다 (비스듬히 보면 한쪽 화살표가 납작해진다)
const mirrored = (a, b) => a.line && b.line && a.line.every((p, i) => Math.abs(p[0] + b.line[i][0]) < 1e-6 && Math.abs(p[1] - b.line[i][1]) < 1e-6);
function viewFor(st) {
  const ms = st.moves || [];
  if (!st.sim && ms.length === 2 && mirrored(ms[0], ms[1])) return [0, model.view[1], model.view[2]];
  return model.view;
}

// ---------- 단계 이동 ----------
function enterStep(i, play, instant) {
  step = i;
  if (step >= N) {
    plan = plans[N - 1];
    t = 1; phase = 'idle'; autoAll = false;
    clearGuides();
    $('legend').hidden = true;
    frameTo(toVecs(loopsOf(plan, 1)), model.finalView, instant);
  } else {
    plan = plans[step];
    t = 0; phase = play ? 'wait' : 'idle'; waitT = WAIT_SEC / speed;
    const arrowPts = buildGuides(plan);
    const pts = [...toVecs(loopsOf(plan, 0)), ...toVecs(loopsOf(plan, 1)), ...(plan.sim ? toVecs(loopsOf(plan, 0.5)) : [])];
    frameTo(pts, model.steps[step].view || viewFor(model.steps[step]), instant, arrowPts);
  }
  const want = `#/m/${model.id}${step ? `/${step + 1}` : ''}`;
  if (location.hash !== want) history.replaceState(null, '', want);
  saveResume(model.id, step < N ? step : 0);
  updateUI();
}

// 작품마다 마지막으로 보던 단계를 기억해, 다시 열면 그 단계부터 이어서 접는다 (다 접으면 처음부터)
const resumeKey = 'origami.resume';
function loadResume() { try { return JSON.parse(localStorage.getItem(resumeKey) || '{}'); } catch { return {}; } }
function saveResume(id, i) {
  const r = loadResume();
  if (i) r[id] = i; else delete r[id];
  try { localStorage.setItem(resumeKey, JSON.stringify(r)); if (i) localStorage.setItem('origami.last', id); } catch { /* 무시 */ }
}

// 준비물: 꾸미기 단계가 있으면 연필·색연필도 챙기게 한다
function supplies(m) {
  const strokes = m.steps.flatMap((s) => s.draw || []);
  if (!strokes.length) return m.paper;
  // 연필 색(기본)과 흰색만 쓰면 연필만, 다른 색이 있으면 색연필도
  const colored = strokes.some((s) => s.color && !['#34363a', '#ffffff'].includes(s.color.toLowerCase()));
  return `${m.paper}, ${colored ? T.pencils : T.pencil}`;
}

function openModel(m, startStep = 0) {
  if (m !== model) {
    model = m;
    plans = plansOf(m);
    N = plans.length;
    paper.setModel(m);
    document.documentElement.style.setProperty('--accent', m.accent);
    $('modelName').textContent = m.name;
    $('modelLevel').replaceWith(Object.assign(meter(m.level), { id: 'modelLevel' }));
    $('paperInfo').textContent = `${supplies(m)}, ${T.stepsCount(N)}`;
    $('printLink').href = `#/print/${m.id}`;
    document.title = `${m.name} - ${T.title}`;
    const list = $('stepList');
    list.innerHTML = '';
    m.steps.forEach((s, i) => {
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.innerHTML = `<span class="num">${i + 1}</span><img alt="" /><span class="txt"></span>`;
      li.querySelector('.txt').textContent = s.text;
      li.onclick = () => {
        autoAll = false;
        enterStep(i, false);
        // 한 줄 배치(모바일)에서는 목록이 화면 아래에 있으므로 안내문과 접기 화면으로 올려 준다
        if (matchMedia('(max-width: 900px)').matches) $('viewer').querySelector('.instruction').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      };
      li.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.onclick(); } };
      list.appendChild(li);
    });
    // 단계 그림은 화면이 뜬 뒤 차례로
    let k = 0;
    const next = () => {
      if (model !== m || k >= N) return;
      list.children[k].querySelector('img').src = stepThumb(m, plans, k);
      k++;
      setTimeout(next, 10);
    };
    setTimeout(next, 120);
  }
  enterStep(Math.max(0, Math.min(N, startStep)), false, true);
}

// ---------- UI ----------
const slider = $('progress');
function updateUI() {
  const done = step >= N;
  if (done) markDone(model.id);
  const nextM = MODELS[MODELS.indexOf(model) + 1];
  $('nextModel').hidden = !done || !nextM;
  $('saveImg').hidden = !done;
  $('fold').hidden = done && !!nextM;
  if (nextM) { $('nextModel').href = `#/m/${nextM.id}`; $('nextModel').textContent = T.next(nextM.name); }
  $('badge').textContent = done ? T.done : `${step + 1}/${N}`;
  // 이 단계를 마치면 되는 모양 (다음 단계 시작 그림, 마지막 단계는 완성 그림)
  const peek = $('resultPeek');
  peek.hidden = done;
  if (!done) {
    const img = peek.querySelector('img');
    const want = `${model.id}:${step}`;
    if (img.dataset.k !== want) {
      img.dataset.k = want;
      img.alt = EN ? `After step ${step + 1}` : `${step + 1}단계를 마친 모습`;
      img.src = step < N - 1 ? stepThumb(model, plans, step + 1) : finalThumb(model, plans);
    }
  }
  $('stepText').textContent = done ? model.done : model.steps[step].text;
  $('prev').disabled = step === 0 && t === 0;
  $('fold').disabled = done || phase !== 'idle';
  $('fold').textContent = !done && model.steps[step].draw ? T.draw : T.fold;
  $('auto').textContent = autoAll && phase !== 'idle' ? T.stop : done ? T.replay : T.auto;
  [...$('stepList').children].forEach((li, i) => {
    li.classList.toggle('done', i < step);
    li.classList.toggle('now', i === step);
    if (i === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
  });
  // 목록 상자 안에서만 스크롤한다 (페이지 전체가 움직이지 않게)
  const list = $('stepList'), now = list.children[step];
  if (now && list.scrollHeight > list.clientHeight + 4) {
    const top = now.offsetTop - list.offsetTop, bottom = top + now.offsetHeight;
    if (top < list.scrollTop) list.scrollTo({ top: top - 8, behavior: 'smooth' });
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTo({ top: bottom - list.clientHeight + 8, behavior: 'smooth' });
  }
}

function prevStep() {
  autoAll = false;
  if (step >= N) enterStep(N - 1, false);
  else if (t > 0.001) enterStep(step, false);
  else enterStep(Math.max(0, step - 1), false);
}
function foldStep() {
  autoAll = false;
  if (step >= N || phase !== 'idle') return;
  if (t >= 1) { step < N - 1 ? enterStep(step + 1, true) : enterStep(N, false); return; }
  phase = 'play';
  updateUI();
}
function toggleAuto() {
  if (autoAll && phase !== 'idle') { autoAll = false; phase = 'idle'; updateUI(); return; }
  if (step >= N) { enterStep(0, true); autoAll = true; updateUI(); return; }
  autoAll = true;
  phase = t > 0 ? 'play' : 'wait';
  waitT = WAIT_SEC / speed;
  updateUI();
}
$('prev').onclick = prevStep;
$('fold').onclick = foldStep;
$('auto').onclick = toggleAuto;
// 접는 속도는 이 브라우저에 기억해 두고 다음에도 쓴다
const speedKey = 'origami.speed';
try { const v = +localStorage.getItem(speedKey); if ([...$('speed').options].some((o) => +o.value === v)) { speed = v; $('speed').value = String(v); } } catch { /* 저장소 사용 불가 */ }
$('speed').onchange = (e) => { speed = +e.target.value; try { localStorage.setItem(speedKey, String(speed)); } catch { /* 무시 */ } };
slider.oninput = () => {
  if (!model) return;
  autoAll = false;
  if (step >= N) enterStep(N - 1, false);
  t = +slider.value;
  phase = 'idle';
  updateUI();
};
// 완성 그림을 이미지로 저장 (방금 그린 화면을 바로 읽어 종이 바탕·이름과 함께 한 장으로)
$('saveImg').onclick = () => {
  // 화면 렌더러는 그린 내용을 보존하지 않으므로, 지금 보는 방향으로 따로 그린다
  const dir = camera.position.clone().sub(controls.target).normalize();
  const src = new Image();
  src.onload = () => saveComposite(src);
  src.src = snapshot(model, plan, t, [dir.x, dir.y, dir.z], 900);
};
function saveComposite(src) {
  const W = 1080, H = 1080;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--mat').trim() || '#e3eadf';
  g.fillRect(0, 0, W, H);
  const k = Math.min(W / src.width, (H - 140) / src.height);
  g.drawImage(src, (W - src.width * k) / 2, 30 + (H - 140 - src.height * k) / 2, src.width * k, src.height * k);
  g.fillStyle = '#1e2b3a';
  g.font = '600 44px Pretendard, system-ui, sans-serif';
  g.fillText(model.name, 56, H - 60);
  g.font = '24px Pretendard, system-ui, sans-serif';
  g.fillStyle = '#5c6875';
  g.textAlign = 'right';
  g.fillText('origami.gyosil.app', W - 56, H - 64);
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png');
  a.download = `${model.name}.png`;
  a.click();
}

window.addEventListener('keydown', (e) => {
  if ($('viewer').hidden || e.target.closest('input, select, textarea')) return;
  // 버튼·링크·단계 항목에 초점이 있으면 스페이스는 그 항목을 누르는 키로 둔다
  if (e.key === ' ' && e.target.closest('button, a, [tabindex]')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); foldStep(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); }
  else if (e.key === ' ') { e.preventDefault(); toggleAuto(); }
});

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  guideMats.forEach((m) => m.resolution && m.resolution.set(w, h));
}
new ResizeObserver(resize).observe(stage);

// ---------- 화면 전환 (#/  ·  #/m/작품/단계) ----------
// 인쇄용 도면: 단계마다 접는 선·화살표가 그려진 그림과 설명
function renderPrint(m) {
  const plans = plansOf(m);
  $('pName').textContent = T.printTitle(m.name);
  $('pInfo').textContent = `${supplies(m)} · ${T.level(m.level)} · ${T.stepsCount(m.steps.length)}`;
  $('printBack').href = `#/m/${m.id}`;
  document.title = `${m.name} - ${T.title}`;
  const ol = $('pSteps');
  ol.innerHTML = '';
  const items = m.steps.map((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<div class="pic"><span class="n">${i + 1}</span><img alt="" /></div><p></p>`;
    li.querySelector('p').textContent = s.text;
    li.querySelector('img').alt = EN ? `Step ${i + 1}` : `${i + 1}단계 그림`;
    ol.appendChild(li);
    return li;
  });
  const fin = document.createElement('li');
  fin.className = 'final';
  fin.innerHTML = `<div class="pic"><img alt="${EN ? 'Finished' : '완성 모습'}" /></div><p></p>`;
  fin.querySelector('p').textContent = m.done;
  ol.appendChild(fin);
  document.documentElement.style.setProperty('--accent', m.accent);
  // 그림은 하나씩 차례로 (화면이 멈추지 않게)
  let k = 0;
  const next = () => {
    if (location.hash !== `#/print/${m.id}`) return;
    if (k < items.length) { items[k].querySelector('img').src = diagram(m, plans, k); k++; setTimeout(next, 10); }
    else fin.querySelector('img').src = finalThumb(m, plans);
  };
  setTimeout(next, 30);
}
$('printBtn').onclick = () => window.print();
// 크게 보기: 접기 화면을 전체 화면으로 (교실 화면용)
const fullBtn = $('fullBtn');
if (!document.documentElement.requestFullscreen) fullBtn.hidden = true;
fullBtn.onclick = () => (document.fullscreenElement ? document.exitFullscreen() : $('viewer').requestFullscreen());
document.addEventListener('fullscreenchange', () => {
  fullBtn.textContent = document.fullscreenElement ? T.unfull : T.full;
  setTimeout(resize, 50);
});

// 화면이 바뀌면 맨 위에서 시작하고, 갤러리로 돌아오면 보던 위치로 되돌린다
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
let lastView = null, galleryY = 0;
function scrollFor(view) {
  if (view === lastView) return;
  lastView = view;
  scrollTo(0, view === 'gallery' ? galleryY : 0);
}

function route() {
  if (lastView === 'gallery') galleryY = scrollY; // 갤러리를 숨기기 전에 위치를 기억
  const pm = location.hash.match(/^#\/print\/([\w-]+)/);
  const printTarget = pm && MODELS.find((x) => x.id === pm[1]);
  $('print').hidden = !printTarget;
  if (printTarget) {
    hero.stop();
    $('gallery').hidden = true;
    $('viewer').hidden = true;
    running = false;
    renderPrint(printTarget);
    scrollFor(`print:${printTarget.id}`);
    return;
  }
  const m = location.hash.match(/^#\/m\/([\w-]+)(?:\/(\d+))?/);
  const target = m && MODELS.find((x) => x.id === m[1]);
  $('gallery').hidden = !!target;
  $('viewer').hidden = !target;
  if (target) {
    resize();
    openModel(target, m[2] ? +m[2] - 1 : loadResume()[target.id] || 0);
    running = true;
  } else {
    running = false;
    document.title = T.title;
    renderGallery();
  }
  if (!target) hero.start(); else hero.stop();
  scrollFor(target ? `m:${target.id}` : 'gallery');
}
window.addEventListener('hashchange', route);
route();

// ---------- 루프 ----------
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!running || !plan) return;
  if (phase === 'wait') {
    waitT -= dt;
    if (waitT <= 0) { phase = 'play'; updateUI(); }
  } else if (phase === 'play') {
    t = Math.min(1, t + (dt * speed) / FOLD_SEC);
    if (t >= 1) {
      if (step < N - 1) { const a = autoAll; enterStep(step + 1, a); autoAll = a; }
      else enterStep(N, false);
    }
  }
  paper.update(plan, t);
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
