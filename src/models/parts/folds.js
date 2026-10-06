// 여러 작품이 함께 쓰는 접기 묶음
export const has = (t) => (c) => c.tags.has(t);
export const not = (t) => (c) => !c.tags.has(t);
export const and = (...fs) => (c) => fs.every((f) => f(c));
export const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

// 펼쳐 누르기(squash): 경첩(세로선 x=0)과 등선(윗변)이 꼭짓점 (0,0)에서 만나는 날개를 누른다.
// sx: 날개가 있는 쪽 (-1 왼쪽, 1 오른쪽), size: 이등분선 길이, outer/inner: 바깥·안쪽 겹
// 최종 상태:
//  - 바깥 겹: 등선 쪽 삼각형을 이등분선을 따라 안으로 접는다.
//  - 안쪽 겹: 경첩 건너편으로 넘긴 뒤, 등선 쪽 삼각형을 이등분선(넘긴 쪽)으로 안으로 접는다.
// 움직임: 두 겹이 경첩을 축으로 60°까지 함께 들린 뒤 벌어져(바깥 겹은 돌아오고 안쪽 겹은 넘어감)
//        틈이 생기면 등선 쪽 삼각형이 그 안으로 접힌다. 같은 축을 도는 두 겹은 서로 뚫고 지나가지 않는다.
export const squash = (sx, outer, inner, size = 0.5) => {
  const hinge = [[0, -1], [0, 1]];
  const side = [sx * 0.2, -0.2];
  return [
    { line: hinge, side, filter: outer, toward: 1, transient: true, curve: 'peak', peak: 1 / 3, role: 'lift' },
    { line: hinge, side, filter: inner, toward: 1, role: 'hinge' },
    { line: [[0, 0], [sx * size, -size]], side: [sx * size * 0.8, -size * 0.1], filter: outer, toward: -1, shift: 0.5, at: [0.33, 0.95], role: 'obis' },
    { line: [[0, 0], [-sx * size, -size]], side: [-sx * size * 0.8, -size * 0.1], filter: inner, toward: -1, at: [0.33, 0.95], role: 'ibis' },
  ];
};
