// 쥐 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Mouse (face)" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/mouse/
// 세모의 오른쪽 모서리를 접었다 비스듬히 되접어 귀를 세우고, 왼쪽 끝은 뾰족한 코가 된다.
import { eye, fillPoly, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2, X = 0.135; // 첫 세로 접는 선
const has = (t) => (c) => c.tags.has(t);
// 되접는 선: 위 변 (-0.0185, 0)에서 날개가 몸통과 이어진 변의 아래 끝 (X, -(R - X))까지. 귀 끝은 약 (0.34, 0.21)
const EAR = [[-0.0185, 0], [X, -(R - X)]];
const whisker = (a, b) => ({ line: [a, b], w: 0.006, color: PENCIL });

export const mouse = {
  id: 'mouse',
  name: '쥐 얼굴',
  level: 1,
  desc: '세모의 한쪽 모서리를 접었다 비스듬히 되접으면 귀가 쫑긋, 반대쪽 끝은 뾰족한 코가 돼요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#7ec4e0' },
  accent: '#3f93b8',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '쥐 얼굴 완성! 찍찍!',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 반으로 접었다 펴서 가운데 세로 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, R] }] },
    { text: '오른쪽 모서리를 세로 점선에서 왼쪽으로 접어요.', moves: [{ line: [[X, -1], [X, 1]], side: [R, 0], tag: 'flap' }] },
    { text: '접은 부분을 비스듬한 점선에서 다시 오른쪽 위로 접어 올려요. 귀가 돼요.', moves: [{ line: EAR, side: [-0.4, -0.02], filter: has('flap'), tag: 'ear' }] },
    { text: '아래 끝을 점선에서 뒤로 접어요.', moves: [{ line: [[-1, -0.53], [1, -0.53]], side: [0, -R], toward: -1 }] },
    {
      text: '연필로 뾰족한 코끝을 까맣게 칠하고, 눈과 수염을 그리면 완성!',
      view: [0, 0, 1],
      draw: [
        fillPoly([[-R, 0], [-0.6, 0], [-0.6, -0.107]], PENCIL),
        ...eye(-0.2, -0.14, 0.024),
        whisker([-0.52, -0.05], [-0.38, -0.02]), whisker([-0.52, -0.08], [-0.38, -0.09]), whisker([-0.5, -0.11], [-0.38, -0.16]),
      ],
    },
  ],
};
