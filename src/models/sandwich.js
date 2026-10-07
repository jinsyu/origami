// 샌드위치 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Sandwich 2" (Fumiaki Shingu) https://en.origami-club.com/easy/food/sandwich2/
// 아래 꼭짓점을 조금 덜 올려 접어 속 재료 띠를 남기고, 뒤집어 반으로 접으면 세모 샌드위치가 된다.
const R = Math.SQRT1_2;
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

export const sandwich = {
  id: 'sandwich',
  name: '샌드위치',
  level: 1,
  desc: '아래를 조금 덜 올려 접으면 햄 띠가 생기고, 반으로 접으면 세모 샌드위치가 돼요. 초록 종이로 접으면 채소 샌드위치!',
  paper: '정사각형 색종이 (분홍색)',
  colors: { front: '#f08fa8', back: '#fbf3e4' },
  accent: '#c4607c',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '샌드위치 완성! 여러 색으로 접어 도시락을 꾸며 보세요.',
  steps: [
    { text: '색깔 면이 위로 오게 마름모로 놓고, 아래 꼭짓점을 가운데보다 조금 아래 점선에서 접어 올려요. 위쪽에 색깔 띠가 남아요.', moves: [{ line: [[-1, -0.035], [1, -0.035]], side: [0, -R] }] },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '오른쪽 절반을 왼쪽으로 반 접으면 완성!', moves: [{ line: [[0, -1], [0, 1]], side: [0.4, -0.05] }] },
  ],
};
