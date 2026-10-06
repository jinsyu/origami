// 첫 화면 시연: 완성작을 3D로 천천히 돌리며 몇 초마다 다음 작품으로 바꾼다
import * as THREE from 'three';
import { PaperMesh, addLights, fitCamera, loopsOf, toVecs } from './paper.js';

export function createHero(canvas, models, plansOf, onChange) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  addLights(scene);
  const paper = new PaperMesh();
  const pivot = new THREE.Group();
  pivot.add(paper.group);
  scene.add(pivot);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let idx = -1, timer = 0, running = false, last = 0;
  const show = (i) => {
    idx = (i + models.length) % models.length;
    const m = models[idx], plans = plansOf(m), plan = plans[plans.length - 1];
    paper.setModel(m);
    const loops = paper.update(plan, 1);
    // 작품 중심을 회전축에 맞추고 화면에 꽉 차게
    const box = new THREE.Box3().setFromPoints(toVecs(loops));
    const c = box.getCenter(new THREE.Vector3());
    paper.group.position.set(-c.x, -c.y, -c.z);
    const fit = fitCamera(camera, toVecs(loops).map((v) => v.sub(c)), m.finalView, canvas.clientWidth / Math.max(1, canvas.clientHeight), 1.2);
    camera.position.copy(fit.pos.sub(fit.target));
    camera.lookAt(0, 0, 0);
    pivot.rotation.set(0, 0, 0);
    onChange && onChange(m);
  };
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  const loop = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    timer += dt;
    if (!reduce) pivot.rotation.y = Math.sin(timer * 0.6) * 0.5;
    if (timer > 5.5) { timer = 0; show(idx + 1); }
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  return {
    start() { if (running) return; running = true; resize(); if (idx < 0) show(models.length - 2); last = performance.now(); requestAnimationFrame(loop); },
    stop() { running = false; },
    next() { timer = 0; show(idx + 1); },
  };
}
