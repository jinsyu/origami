// 접기 화살표 (접기 화면·단계 그림·인쇄 도면 공용): 곧은 관 몸통 + 뾰족한 세모 촉
// 촉은 평평한 세모 한 장으로, 그리기 직전에 faceCamera 로 카메라를 향하게 돌린다
// (원뿔은 비스듬히 보면 둥근 덩어리, 열십자 세모 두 장은 별 모양처럼 보였다)
import * as THREE from 'three';

export function makeArrow(path, color, { r = 0.008, head = 0.085, w = 0.042 } = {}) {
  const vs = path.map((v) => new THREE.Vector3(...v));
  if (vs.length < 2) return [];
  const curve = new THREE.CatmullRomCurve3(vs);
  const len = curve.getLength(), h = Math.min(head, len * 0.35);
  const endU = 1 - h / len;
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false, side: THREE.DoubleSide });
  // 몸통은 촉 밑동까지만 (촉 안으로 관이 비치지 않게)
  const sub = new THREE.CatmullRomCurve3(curve.getSpacedPoints(60).filter((_, i) => i / 60 <= endU + 1e-9));
  const tube = new THREE.Mesh(new THREE.TubeGeometry(sub, 60, r, 8), m);
  const tip = curve.getPointAt(1), base = curve.getPointAt(endU);
  const dir = tip.clone().sub(base).normalize();
  const g = new THREE.BufferGeometry().setFromPoints([base, base, tip]);
  const cone = new THREE.Mesh(g, m);
  cone.userData.arrowHead = { tip, dir, h, w };
  cone.frustumCulled = false;
  tube.renderOrder = cone.renderOrder = 11;
  return [tube, cone];
}

// 촉 세모를 카메라 쪽으로 돌린다: 촉 방향은 화살표 끝의 방향을 화면에 보이는 성분으로 바꿔(시선 방향 성분을 뺌)
// 끝이 화면 안쪽을 향해도 촉이 짧아지거나 찌그러지지 않게 하고, 날개는 그 방향과 시선에 모두 수직으로 편다
const _v = new THREE.Vector3(), _d = new THREE.Vector3(), _s = new THREE.Vector3(), _b = new THREE.Vector3();
export function faceCamera(root, camera) {
  root.traverse((o) => {
    const a = o.userData.arrowHead;
    if (!a) return;
    _v.copy(camera.position).sub(a.tip).normalize();
    _d.copy(a.dir).addScaledVector(_v, -a.dir.dot(_v));
    if (_d.lengthSq() < 1e-8) _d.copy(a.dir);
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
