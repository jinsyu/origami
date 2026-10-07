// 편지 봉투 (정사각형 색종이, 마름모 방향)
// 아래 끝을 올리고, 양옆을 가운데로 겹쳐 접고, 위 끝을 내려 덮개를 만든다. 접는 순서가 겹침을 정한다.
const R = Math.SQRT1_2;

export const envelope = {
  id: 'envelope',
  name: '편지 봉투',
  level: 1,
  desc: '네 모서리를 차례로 접어 겹치면 덮개가 있는 봉투가 돼요. 먼저 접은 장 위에 다음 장을 정확히 얹는 연습이에요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#7b9acc' },
  accent: '#3f63a1',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.15, 1],
  done: '편지 봉투 완성! 덮개 안에 쪽지를 넣어 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 위아래로 반 접었다 펴서 가운데 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }] },
    { text: '아래 꼭짓점을 가운데 선보다 조금 위까지 접어 올려요.', moves: [{ line: [[-1, -0.2], [1, -0.2]], side: [0, -R], tag: 'bottom' }] },
    { text: '오른쪽 모서리를 가운데를 조금 넘게 접어요.', moves: [{ line: [[0.3, -1], [0.3, 1]], side: [R, 0], tag: 'right' }] },
    { text: '왼쪽 모서리도 오른쪽 날개 위로 겹쳐 접어요.', moves: [{ line: [[-0.3, -1], [-0.3, 1]], side: [-R, 0], tag: 'left' }] },
    { text: '위 꼭짓점을 아래로 접어 덮개를 닫아요. 편지 봉투 완성!', moves: [{ line: [[-1, 0.26], [1, 0.26]], side: [0, R], tag: 'lid' }] },
  ],
};
