// 돼지 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Pig (face)" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/pig/
// 양옆을 가운데로 접고 반으로 접은 뒤, 아래 끝을 올렸다 내려 흰 코를 만들고 위 모서리를 접어 귀를 만든다.
import { eye, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2, A = R / 2;
const has = (t) => (c) => c.tags.has(t);

export const pigParams = { y1: -0.507, y2: -0.386, ex: 0.211, ey: -0.25 };

export function makePig({ y1, y2, ex, ey } = pigParams) {
  return {
  params: { y1, y2, ex, ey },
  make: makePig,
  id: 'pig',
  name: '돼지 얼굴',
  level: 1,
  desc: '아래 끝을 올렸다 내려 접으면 하얀 코가, 위 모서리를 접으면 귀가 생겨요. 콧구멍을 그려 주세요.',
  paper: '정사각형 색종이 (분홍색)',
  colors: { front: '#fbf8f1', back: '#f2a2b4' },
  accent: '#c7607a',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.15, 1],
  done: '돼지 얼굴 완성! 꿀꿀 소리도 내 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '양쪽 모서리를 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[A, -1], [A, 1]], side: [R, 0] },
        { line: [[-A, -1], [-A, 1]], side: [-R, 0] },
      ],
    },
    { text: '위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, R], tag: 'top' }] },
    { text: '아래 끝을 점선에서 접어 올려요.', moves: [{ line: [[-1, y1], [1, y1]], side: [0, -R], tag: 'snout' }] },
    { text: '올린 끝을 조금만 다시 내려 접어요. 하얀 코가 생겨요.', moves: [{ line: [[-1, y2], [1, y2]], side: [0, y2 + 0.05], filter: (c) => c.tags.has('snout') && !c.tags.has('top') }] },
    {
      text: '위 양쪽 모서리를 조금씩 접어 내려 귀를 만들어요.',
      moves: [
        { line: [[ex, 0], [A, ey]], side: [A, 0] },
        { line: [[-ex, 0], [-A, ey]], side: [-A, 0] },
      ],
    },
    { text: '연필로 눈과 콧구멍을 그리면 완성!', view: [0, -0.15, 1], draw: [...eye(-0.13, -0.19, 0.022), ...eye(0.13, -0.19, 0.022), { dot: [-0.025, -0.39], r: 0.01, ry: 0.016, color: PENCIL }, { dot: [0.025, -0.39], r: 0.01, ry: 0.016, color: PENCIL }] },
  ],
};
}

export const pig = makePig();
