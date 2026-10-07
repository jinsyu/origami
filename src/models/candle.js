// 촛불 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Candle 2" (Fumiaki Shingu) https://en.origami-club.com/easy/other/candle2/
// 세 모서리를 가운데로 접고 아래를 접어 올려 불꽃 끝만 남긴 뒤, 양옆을 뒤로 접어 가는 초를 만든다.
const R = Math.SQRT1_2, A = R / 2;

export const candle = {
  id: 'candle',
  name: '촛불',
  level: 1,
  desc: '세 모서리를 가운데로 접고 아래를 올려 접으면 꼭대기에 작은 불꽃이 남아요. 생일 카드에 붙여 보세요.',
  paper: '정사각형 색종이 (주황색)',
  colors: { front: '#f5a623', back: '#fbf8f1' },
  accent: '#c9800e',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '촛불 완성! 여러 개 접어 생일 케이크를 꾸며 보세요.',
  steps: [
    { text: '색깔 면이 위로 오게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '왼쪽, 오른쪽, 아래 꼭짓점을 가운데 점에 맞춰 접어요.',
      moves: [
        { line: [[-A, -1], [-A, 1]], side: [-R, 0] },
        { line: [[A, -1], [A, 1]], side: [R, 0] },
        { line: [[-1, -A], [1, -A]], side: [0, -R] },
      ],
    },
    { text: '아래 변을 점선에서 접어 올려요. 위쪽 끝에 작은 불꽃만 보이게 해요.', moves: [{ line: [[-1, 0.14], [1, 0.14]], side: [0, -A] }] },
    {
      text: '양쪽을 세로 점선에서 뒤로 접으면 완성!',
      moves: [
        { line: [[0.15, -1], [0.15, 1]], side: [A, 0], toward: -1 },
        { line: [[-0.15, -1], [-0.15, 1]], side: [-A, 0], toward: -1 },
      ],
    },
  ],
};
