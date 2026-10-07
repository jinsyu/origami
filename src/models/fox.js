// 여우 얼굴 (정사각형 색종이, 마름모 방향)
// 세모(꼭짓점 아래 = 주둥이)를 만들고, 양쪽 모서리를 비스듬히 올려 흰 귀를 세운다.
import { eye, cheek, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);
// 내린 날개만 접는 선 (날개와 몸통이 이어진 변은 건드리지 않는다). 귀 끝은 약 (0.38, 0.14)
const UP = [[0, -0.2], [0.35, -R + 0.35]];
const mirror = (L) => L.map(([x, y]) => [-x, y]);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

export const fox = {
  id: 'fox',
  name: '여우 얼굴',
  level: 1,
  desc: '세모의 뾰족한 끝이 주둥이가 되고, 양쪽 모서리를 올리면 안쪽이 하얀 귀가 생겨요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e2702a' },
  accent: '#b9531a',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.1, 1],
  done: '여우 얼굴 완성! 이름을 지어 주고 친구에게 보여 주세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'front' }],
    },
    {
      text: '양쪽 모서리를 아래 꼭짓점에 맞춰 내려 접어요. 마름모가 돼요.',
      moves: [
        { line: [[0, 0], [1, -1]], side: [R, 0], tag: 'flapR' },
        { line: [[0, 0], [-1, -1]], side: [-R, 0], tag: 'flapL' },
      ],
    },
    {
      text: '내린 두 날개의 끝을 바깥 위로 비스듬히 접어 올려요. 위로 삐죽 나온 끝이 귀가 돼요.',
      moves: [
        { line: UP, side: [0.02, -0.65], filter: has('flapR'), tag: 'earR' },
        { line: mirror(UP), side: [-0.02, -0.65], filter: has('flapL'), tag: 'earL' },
      ],
    },
    { text: '종이를 뒤집어요. 뾰족한 귀가 달린 여우 얼굴이 보여요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '연필로 눈을 그리고, 주둥이 끝에 까만 코를 칠해요.',
      view: [0, -0.1, 1],
      draw: [
        ...eye(-0.1, -0.22, 0.022), ...eye(0.1, -0.22, 0.022),
        { dot: [0, -0.655], r: 0.03, ry: 0.024, color: PENCIL },
      ],
    },
    {
      text: '색연필로 볼을 분홍색으로 칠하면 완성!',
      view: [0, -0.1, 1],
      draw: [cheek(-0.17, -0.34, 0.028), cheek(0.17, -0.34, 0.028)],
    },
  ],
};
