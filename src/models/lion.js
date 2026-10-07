// 사자 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Lion (face)" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/lion/
// 아래 끝을 조금 올리고 양옆을 비스듬히 안으로 접어 흰 갈기를 만든 뒤, 위를 뒤로 접는다.
import { eye, fillPoly, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const whisker = (a, b) => ({ line: [a, b], w: 0.006, color: PENCIL });

export const lionParams = { top: -0.03, bot: -0.515, a: 0.285, c: 0.44 };

export function makeLion({ top, bot, a, c } = lionParams) {
  return {
  params: { top, bot, a, c },
  make: makeLion,
  id: 'lion',
  name: '사자 얼굴',
  level: 1,
  desc: '양옆을 비스듬히 접으면 하얀 갈기가 얼굴을 감싸는 사자가 돼요.',
  paper: '정사각형 색종이 (노란색)',
  colors: { front: '#f2b632', back: '#fbf8f1' },
  accent: '#c48a0f',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '사자 얼굴 완성!',
  steps: [
    { text: '색깔 면이 위로 오게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '아래 꼭짓점을 조금 접어 올려요.', moves: [{ line: [[-1, bot], [1, bot]], side: [0, -R] }] },
    { text: '왼쪽을 비스듬한 점선에서 안으로 접어요. 하얀 갈기가 생겨요.', moves: [{ line: [[-a, bot], [-c, 0.2]], side: [-R, 0] }] },
    { text: '오른쪽도 똑같이 접어요.', moves: [{ line: [[a, bot], [c, 0.2]], side: [R, 0] }] },
    { text: '위쪽을 점선에서 뒤로 접어요.', moves: [{ line: [[-1, top], [1, top]], side: [0, R], toward: -1 }] },
    {
      text: '연필로 눈과 코, 수염을 그리면 완성!',
      view: [0, 0, 1],
      draw: [
        ...eye(-0.13, -0.19, 0.03), ...eye(0.13, -0.19, 0.03),
        fillPoly([[-0.05, -0.285], [0.05, -0.285], [0, -0.33]], PENCIL),
        { line: [[0, -0.33], [0, -0.4]], w: 0.008, color: PENCIL },
        whisker([-0.08, -0.29], [-0.21, -0.26]), whisker([-0.08, -0.32], [-0.21, -0.33]),
        whisker([0.08, -0.29], [0.21, -0.26]), whisker([0.08, -0.32], [0.21, -0.33]),
      ],
    },
  ],
};
}

export const lion = makeLion();
