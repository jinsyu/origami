// 여러 작품이 함께 쓰는 접기 묶음
export const has = (t) => (c) => c.tags.has(t);
export const not = (t) => (c) => !c.tags.has(t);
export const and = (...fs) => (c) => fs.every((f) => f(c));
export const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

// 펼쳐 누르기(squash): 경첩(세로선 x=0)과 등선(윗변)이 꼭짓점 (0,0)에서 만나는 날개를 누른다.
// sx: 날개가 있는 쪽 (-1 왼쪽, 1 오른쪽), size: 이등분선 길이, outer/inner: 바깥·안쪽 겹
// 최종 상태 (실제 종이와 같은 층 순서):
//  - 등선(두 겹을 잇는 접힌 선)은 펼쳐져 가운데 선 위에 놓이고, 등선 쪽 삼각형들이 맨 위 한 장이 된다.
//  - 경첩 쪽 삼각형들은 그 아래로 접혀 들어간다(경첩으로 몸통과 이어진 채).
//  - 바깥 겹: 등선 쪽 삼각형을 이등분선을 따라 위로 접어 올린다.
//  - 안쪽 겹: 경첩 건너편으로 넘긴 뒤, 등선 쪽 삼각형을 넘긴 쪽 이등분선을 따라 위로 접어 올린다.
// 움직임: 두 겹이 경첩을 축으로 60°까지 함께 들린 뒤 벌어져(바깥 겹은 돌아오고 안쪽 겹은 넘어감)
//        틈이 생기면 등선 쪽 삼각형이 그 안으로 접힌다. 같은 축을 도는 두 겹은 서로 뚫고 지나가지 않는다.
export const squash = (sx, outer, inner, size = 0.5, faceTag) => {
  const hinge = [[0, -1], [0, 1]];
  const side = [sx * 0.2, -0.2];
  return [
    { line: hinge, side, filter: outer, toward: 1, transient: true, curve: 'peak', peak: 1 / 3, role: 'lift' },
    { line: hinge, side, filter: inner, toward: 1, role: 'hinge' },
    { line: [[0, 0], [sx * size, -size]], side: [sx * size * 0.8, -size * 0.1], filter: outer, toward: 1, at: [0.33, 0.95], role: 'obis', tag: faceTag },
    { line: [[0, 0], [-sx * size, -size]], side: [-sx * size * 0.8, -size * 0.1], filter: inner, toward: 1, at: [0.33, 0.95], role: 'ibis', tag: faceTag },
  ];
};

// 꽃잎 접기(petal fold): 사각 기본형의 앞 날개를 길쭉한 마름모로 들어 올린다.
// 꼭대기 (0,0), 아래 끝 (0,-R). face: 맨 위 한 장을 고르는 조건, front: 앞쪽 날개 전체(맨 위 두 장)를 고르는 조건
// 최종 상태(구속 조건 탐색으로 확인):
//  - 맨 위 두 장의 연 모양 선 바깥 부분을 안으로 접는다.
//  - 맨 위 한 장(옆을 접어 넣은 부분 포함)의 가로선 아래를 위로 넘긴다.
export const petal = (R, face, front, tag) => {
  const s1 = Math.sin(Math.PI / 8), c1 = Math.cos(Math.PI / 8);
  const K = R * (1 - Math.SQRT1_2); // 연 모양 선이 옆 변과 만나는 높이 |y| (R=√½ 이면 0.2071)
  const kiteR = [[0, -R], [s1, -R + c1]], kiteL = [[0, -R], [-s1, -R + c1]];
  const top = (c) => front(c) && face(c), second = (c) => front(c) && !face(c);
  // 맨 위 장의 옆은 가운데 조각 '아래'로, 둘째 장의 옆은 그 위로 접혀 들어간다.
  // 들어 올리면 순서가 뒤집혀 맨 위 장의 옆 조각이 꽃잎 겉면이 된다 (실제 학의 기본형과 같은 겉면).
  return [
    { line: kiteR, side: [R / 2, -R / 2], filter: top, toward: -1, insert: 1, at: [0, 0.6] },
    { line: kiteL, side: [-R / 2, -R / 2], filter: top, toward: -1, insert: 1, at: [0, 0.6] },
    { line: kiteR, side: [R / 2, -R / 2], filter: second, toward: 1, insert: 2, at: [0, 0.6] },
    { line: kiteL, side: [-R / 2, -R / 2], filter: second, toward: 1, insert: 2, at: [0, 0.6] },
    { line: [[-1, -K], [1, -K]], side: [0, -1], filter: face, toward: 1, at: [0.2, 1], tag },
  ];
};
