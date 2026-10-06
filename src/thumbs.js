// 작품 완성 모습·단계별 그림을 이미지로 만든다 (화면 밖 렌더러 하나를 공유)
import * as THREE from 'three';
import { PaperMesh, addLights, fitCamera, loopsOf, toVecs } from './paper.js';

let r = null;
function ctx() {
  if (r) return r;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  const scene = new THREE.Scene();
  addLights(scene);
  const paper = new PaperMesh();
  scene.add(paper.group);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
  r = { renderer, scene, paper, camera };
  return r;
}

const cache = new Map();

// plan의 진행률 t 상태를 dir 방향에서 본 그림
export function snapshot(model, plan, t, dir, size = 320, key) {
  if (key && cache.has(key)) return cache.get(key);
  const { renderer, scene, paper, camera } = ctx();
  renderer.setSize(size, size, false);
  if (paper.model !== model) { paper.setModel(model); paper.model = model; }
  const loops = paper.update(plan, t);
  const fit = fitCamera(camera, toVecs(loops), dir, 1, 1.12);
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

// 완성 모습
export function finalThumb(model, plans) {
  return snapshot(model, plans[plans.length - 1], 1, model.finalView, 360, `${model.id}:final`);
}

export { loopsOf };
