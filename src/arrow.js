// 접기 화살표 (접기 화면·단계 그림·인쇄 도면 공용): 곧은 관 몸통 + 뾰족한 세모 촉
// 촉은 평평한 세모 한 장으로, 그리기 직전에 faceCamera 로 카메라를 향하게 돌린다
// (원뿔은 비스듬히 보면 둥근 덩어리, 열십자 세모 두 장은 별 모양처럼 보였다)
import * as THREE from 'three';

export function makeArrow(path, color, { r = 0.008, head = 0.085, w = 0.042 } = {}) {
  const vs = path.map((v) => new THREE.Vector3(...v));
  if (vs.length < 2) return [];
  const curve = new THREE.CatmullRomCurve3(vs);
  const len = curve.getLength(), h = Math.min(head, len * 0.35);
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false, side: THREE.DoubleSide });
  // 몸통은 끝까지 그린다 (촉 방향을 화면에서 정하므로, 촉 밑동에서 끊으면 몸통과 어긋날 수 있다)
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, r, 8), m);
  const tip = curve.getPointAt(1);
  const g = new THREE.BufferGeometry().setFromPoints([tip, tip, tip]);
  const cone = new THREE.Mesh(g, m);
  // 끝에서 거꾸로 짚어 갈 점들: 화면에서 촉 길이만큼 떨어진 점을 찾아 촉 방향으로 쓴다
  const back = Array.from({ length: 41 }, (_, i) => curve.getPointAt(Math.max(0, 1 - (i / 40) * 0.6)));
  cone.userData.arrowHead = { tip, back, h, w };
  cone.frustumCulled = false;
  tube.renderOrder = cone.renderOrder = 11;
  return [tube, cone];
}

// 촉 세모를 카메라 쪽으로 돌린다. 촉 방향은 끝점의 접선이 아니라, 화면에서 볼 때 몸통이 끝으로 들어오는 방향
// (끝에서 촉 길이만큼 거슬러 올라간 점 → 끝점)으로 정한다. 접는 호의 끝은 종이 쪽(화면 안쪽)으로 꺾여 있어
// 접선을 쓰면 몸통은 옆에서 들어오는데 촉은 엉뚱한 쪽을 향했다.
const _v = new THREE.Vector3(), _d = new THREE.Vector3(), _s = new THREE.Vector3(), _b = new THREE.Vector3();
export function faceCamera(root, camera) {
  root.traverse((o) => {
    const a = o.userData.arrowHead;
    if (!a) return;
    _v.copy(camera.position).sub(a.tip).normalize();
    // 시선에 수직인 평면에 투영한 거리로 촉 길이만큼 떨어진 점을 찾는다
    let q = a.back[a.back.length - 1];
    for (const p of a.back) {
      _d.copy(a.tip).sub(p);
      _d.addScaledVector(_v, -_d.dot(_v));
      if (_d.length() >= a.h) { q = p; break; }
    }
    _d.copy(a.tip).sub(q);
    _d.addScaledVector(_v, -_d.dot(_v));
    if (_d.lengthSq() < 1e-10) return;
    _d.normalize();
    _s.copy(_d).cross(_v).normalize().multiplyScalar(a.w);
    _b.copy(a.tip).addScaledVector(_d, -a.h);
    const P = o.geometry.attributes.position;
    P.setXYZ(0, _b.x + _s.x, _b.y + _s.y, _b.z + _s.z);
    P.setXYZ(1, _b.x - _s.x, _b.y - _s.y, _b.z - _s.z);
    P.setXYZ(2, a.tip.x, a.tip.y, a.tip.z);
    P.needsUpdate = true;
  });
}
