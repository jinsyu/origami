// 집 (정사각형 색종이)
// 가운데 선을 만든 뒤 위 두 모서리를 가운데로 접어 지붕을, 아래 변을 접어 올려 바닥 띠를 만든다.
const H = 0.5;
const roof = (c) => c.tags.has('roofL') || c.tags.has('roofR');

export const house = {
  id: 'house',
  name: '집',
  level: 2,
  desc: '모서리 두 개를 가운데 선에 맞추면 뾰족한 지붕이 생겨요. 선에 맞춰 접는 연습이에요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#c8553d' },
  accent: '#a33e29',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.1, 1],
  done: '집 완성! 창문과 문을 그려 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 세로로 반 접었다 펴서 가운데 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '위쪽 두 모서리를 가운데 선에 맞춰 접어 내려요. 뾰족한 지붕이 돼요.',
      moves: [
        { line: [[0, H], [H, 0]], side: [H, H], tag: 'roofR' },
        { line: [[0, H], [-H, 0]], side: [-H, H], tag: 'roofL' },
      ],
    },
    {
      text: '아래 변을 조금 접어 올려 바닥 띠를 만들어요. 집 완성!',
      moves: [{ line: [[-1, -0.42], [1, -0.42]], side: [0, -1], filter: (c) => !roof(c), tag: 'base' }],
    },
  ],
};
