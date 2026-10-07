// 접기 화살표 (접기 화면·단계 그림·인쇄 도면 공용): 곧은 관 몸통 + 뾰족한 세모 촉
// 촉은 평평한 세모 한 장으로, 그리기 직전에 faceCamera 로 카메라를 향하게 돌린다
// (원뿔은 비스듬히 보면 둥근 덩어리, 열십자 세모 두 장은 별 모양처럼 보였다)
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

export function makeArrow(path, color, { r = 0.008, head = 0.085, w = 0.032 } = {}) {
  const vs = path.map((v) => new THREE.Vector3(...v));
  if (vs.length < 2) return [];
  const curve = new THREE.CatmullRomCurve3(vs);
  const len = curve.getLength(), h = Math.min(head, len * 0.35);
  // 몸통: 늘 화면을 향하는 굵은 선 (관은 화면 쪽으로 선 부분에서 단면 원이 덩어리처럼 보였다). 끝은 둥글다
  const pts = curve.getSpacedPoints(SEG);
  const lg = new LineGeometry();
  lg.setPositions(pts.flatMap((p) => [p.x, p.y, p.z]));
  const lm = new LineMaterial({ color, linewidth: 2 * r, worldUnits: true, transparent: true, depthTest: false });
  const line = new Line2(lg, lm);
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false, side: THREE.DoubleSide });
  const tip = curve.getPointAt(1);
  const cone = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([tip, tip, tip]), m);
  // 끝에서 거꾸로 짚어 갈 점들 (몸통 점의 번호와 함께): 화면에서 촉 길이만큼 떨어진 점을 찾아 촉 방향으로 쓰고, 몸통은 거기서 끊는다
  const back = [];
  for (let i = SEG; i >= SEG * 0.4; i--) back.push(i);
  cone.userData.arrowHead = { tip, pts, back, h, w, line };
  cone.frustumCulled = line.frustumCulled = false;
  line.renderOrder = cone.renderOrder = 11;
  return [line, cone];
}
const SEG = 60;

// 촉 세모를 카메라 쪽으로 돌린다. 촉 방향은 끝점의 접선이 아니라, 화면에서 볼 때 몸통이 끝으로 들어오는 방향
// (끝에서 촉 길이만큼 거슬러 올라간 점 → 끝점)으로 정한다. 접는 호의 끝은 종이 쪽(화면 안쪽)으로 꺾여 있어
// 접선을 쓰면 몸통은 옆에서 들어오는데 촉은 엉뚱한 쪽을 향했다.
const _v = new THREE.Vector3(), _d = new THREE.Vector3(), _s = new THREE.Vector3(), _b = new THREE.Vector3();
export function faceCamera(root, camera, size) {
  root.traverse((o) => {
    const a = o.userData.arrowHead;
    if (!a) return;
    _v.copy(camera.position).sub(a.tip).normalize();
    // 시선에 수직인 평면에 투영한 거리로 촉 길이만큼 떨어진 점을 찾는다
    let qi = a.back[a.back.length - 1];
    for (const i of a.back) {
      _d.copy(a.tip).sub(a.pts[i]);
      _d.addScaledVector(_v, -_d.dot(_v));
      if (_d.length() >= a.h) { qi = i; break; }
    }
    const q = a.pts[qi];
    // 몸통은 촉 밑동까지만 그린다 (둥근 끝이 촉 밑에 숨는다)
    a.line.geometry.instanceCount = qi;
    if (size) a.line.material.resolution.set(size.x, size.y);
    _d.copy(a.tip).sub(q);
    _d.addScaledVector(_v, -_d.dot(_v));
    const hl = _d.length(); // 촉 길이 = 끊은 몸통 끝까지의 화면 거리 (몸통과 촉 사이에 틈이 없게)
    if (hl < 1e-5) return;
    _d.normalize();
    _s.copy(_d).cross(_v).normalize().multiplyScalar(a.w);
    _b.copy(a.tip).addScaledVector(_d, -hl);
    const P = o.geometry.attributes.position;
    P.setXYZ(0, _b.x + _s.x, _b.y + _s.y, _b.z + _s.z);
    P.setXYZ(1, _b.x - _s.x, _b.y - _s.y, _b.z - _s.z);
    P.setXYZ(2, a.tip.x, a.tip.y, a.tip.z);
    P.needsUpdate = true;
  });
}
