// 접기 화살표 (접기 화면·단계 그림·인쇄 도면 공용): 띠 몸통 + 뒤가 파인 촉
// 몸통과 촉은 한 장짜리 평평한 도형이고, 그리기 직전에 faceCamera 가 화면을 향하게 다시 만든다.
//  - 원뿔 촉은 비스듬히 보면 둥근 덩어리, 열십자 세모는 별 모양처럼 보였다
//  - 관 몸통은 화면 쪽으로 선 부분에서 단면 원이 덩어리처럼 보였고, Line2 는 토막마다 둥근 끝이 겹쳐 흐려질 때 점점이 보였다
import * as THREE from 'three';

const SEG = 60, CAP = 8, NOTCH = 0.28; // NOTCH: 촉 뒤가 파인 깊이 (촉 길이에 대한 비)

export function makeArrow(path, color, { r = 0.008, head = 0.08, w = 0.034 } = {}) {
  const vs = path.map((v) => new THREE.Vector3(...v));
  if (vs.length < 2) return [];
  const curve = new THREE.CatmullRomCurve3(vs);
  const len = curve.getLength(), h = Math.min(head, len * 0.35);
  const pts = curve.getSpacedPoints(SEG);
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: false, side: THREE.DoubleSide });
  // 몸통 띠: 시작 반원(가운데 1 + 둘레 CAP+1) + 점마다 양쪽 두 점
  const O = CAP + 2, nv = O + (SEG + 1) * 2;
  const bg = new THREE.BufferGeometry();
  bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
  const idx = [];
  for (let k = 0; k < CAP; k++) idx.push(0, 1 + k, 2 + k);
  for (let i = 0; i < SEG; i++) { const a = O + 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  bg.setIndex(idx);
  const body = new THREE.Mesh(bg, m);
  const tip = pts[SEG];
  // 촉: 끝 T, 날개 L·R, 파인 자리 양쪽 nL·nR (몸통 끝 변과 같은 점) — 세모 셋
  const hg = new THREE.BufferGeometry();
  hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(5 * 3), 3));
  hg.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4]);
  const cone = new THREE.Mesh(hg, m);
  cone.userData.arrowHead = { tip, pts, h, w, r, body };
  cone.frustumCulled = body.frustumCulled = false;
  body.renderOrder = cone.renderOrder = 11;
  return [body, cone];
}

// 화면을 향하게 다시 만든다. 촉 방향은 끝점의 접선이 아니라 화면에서 몸통이 끝으로 들어오는 방향
// (끝에서 촉 길이만큼 거슬러 올라간 점 → 끝점). 접는 호의 끝은 종이 쪽(화면 안쪽)으로 꺾여 있어 접선을 쓰면 촉이 엉뚱한 쪽을 향했다.
// 몸통은 그 점에서 끊고 마지막 점을 촉 밑동 가운데에 두어 둘이 틈 없이 이어지게 한다.
const _v = new THREE.Vector3(), _d = new THREE.Vector3(), _s = new THREE.Vector3(), _b = new THREE.Vector3();
const _t = new THREE.Vector3(), _w = new THREE.Vector3(), _k = new THREE.Vector3(), _e = new THREE.Vector3();
export function faceCamera(root, camera) {
  root.traverse((o) => {
    const a = o.userData.arrowHead;
    if (!a) return;
    const { pts, tip } = a;
    _v.copy(camera.position).sub(tip).normalize();
    let qi = Math.floor(SEG * 0.4);
    for (let i = SEG; i >= SEG * 0.4; i--) {
      _d.copy(tip).sub(pts[i]);
      _d.addScaledVector(_v, -_d.dot(_v));
      if (_d.length() >= a.h) { qi = i; break; }
    }
    _d.copy(tip).sub(pts[qi]);
    _d.addScaledVector(_v, -_d.dot(_v));
    const hl = _d.length();
    if (hl < 1e-5) return;
    _d.normalize();
    _s.copy(_d).cross(_v).normalize();
    // 날개 밑동 B, 뒤가 파인 자리 N (날개보다 촉 쪽으로 NOTCH 만큼 들어감)
    _b.copy(tip).addScaledVector(_d, -hl * (1 - NOTCH));
    _w.copy(tip).addScaledVector(_d, -hl);
    const P = o.geometry.attributes.position;
    P.setXYZ(0, tip.x, tip.y, tip.z);
    P.setXYZ(1, _w.x + _s.x * a.w, _w.y + _s.y * a.w, _w.z + _s.z * a.w);
    P.setXYZ(2, _b.x + _s.x * a.r, _b.y + _s.y * a.r, _b.z + _s.z * a.r);
    P.setXYZ(3, _b.x - _s.x * a.r, _b.y - _s.y * a.r, _b.z - _s.z * a.r);
    P.setXYZ(4, _w.x - _s.x * a.w, _w.y - _s.y * a.w, _w.z - _s.z * a.w);
    P.needsUpdate = true;
    _e.copy(_s).multiplyScalar(a.r);
    // 몸통 점: pts[0..qi-1] + 파인 자리 가운데. 마지막 점은 촉과 같은 두 꼭짓점을 써서 틈이 없다
    const n = qi + 1, at = (i) => (i < qi ? pts[i] : _b);
    const B = a.body.geometry.attributes.position, O = CAP + 2;
    let s0x = 0, s0y = 0, s0z = 0;
    for (let i = 0; i < n; i++) {
      const p = at(i);
      _t.copy(at(Math.min(n - 1, i + 1))).sub(at(Math.max(0, i - 1)));
      _w.copy(camera.position).sub(p);
      _k.copy(_t).cross(_w);
      if (i === n - 1) _k.copy(_e);
      else if (_k.lengthSq() < 1e-14) _k.set(s0x, s0y, s0z); else _k.normalize().multiplyScalar(a.r);
      if (i === 0) { s0x = _k.x; s0y = _k.y; s0z = _k.z; }
      B.setXYZ(O + 2 * i, p.x + _k.x, p.y + _k.y, p.z + _k.z);
      B.setXYZ(O + 2 * i + 1, p.x - _k.x, p.y - _k.y, p.z - _k.z);
    }
    // 시작 끝을 둥글게: 진행 반대쪽으로 반원
    const p0 = pts[0];
    _t.copy(at(1)).sub(p0);
    _w.copy(camera.position).sub(p0).normalize();
    _t.addScaledVector(_w, -_t.dot(_w)).normalize().multiplyScalar(-a.r);
    B.setXYZ(0, p0.x, p0.y, p0.z);
    for (let k = 0; k <= CAP; k++) {
      const t = (Math.PI * k) / CAP, c = Math.cos(t), sn = Math.sin(t);
      B.setXYZ(1 + k, p0.x + s0x * c + _t.x * sn, p0.y + s0y * c + _t.y * sn, p0.z + s0z * c + _t.z * sn);
    }
    B.needsUpdate = true;
    a.body.geometry.setDrawRange(0, CAP * 3 + (n - 1) * 6);
  });
}
