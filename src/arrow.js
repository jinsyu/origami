// 접기 화살표 (접기 화면·단계 그림·인쇄 도면 공용): 곧은 관 몸통 + 뾰족한 세모 촉
// 촉은 평평한 세모 두 장을 열십자로 겹쳐, 어느 쪽에서 봐도 세모로 보이게 한다 (원뿔은 비스듬히 보면 둥근 덩어리처럼 보였다)
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
  // 호가 놓인 평면의 법선 (곧은 화살표면 아무 수직 방향)
  let n = vs[0].clone().sub(base).cross(tip.clone().sub(vs[0]));
  if (n.lengthSq() < 1e-12) n = new THREE.Vector3(0, 0, 1).cross(dir);
  if (n.lengthSq() < 1e-12) n = new THREE.Vector3(1, 0, 0);
  n.normalize();
  const side = n.clone().cross(dir).normalize();
  const tri = (s) => [base.clone().addScaledVector(s, w), base.clone().addScaledVector(s, -w), tip.clone()];
  const g = new THREE.BufferGeometry().setFromPoints([...tri(side), ...tri(n)]);
  const cone = new THREE.Mesh(g, m);
  tube.renderOrder = cone.renderOrder = 11;
  return [tube, cone];
}
