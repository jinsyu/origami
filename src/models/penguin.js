// 펭귄 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Penguin" (Fumiaki Shingu) https://en.origami-club.com/easy/sea/penguin/
// 아래를 올려 하얀 배를 만들고, 뒤집어 양옆을 가운데로 접었다가 다시 바깥으로 접어 날개를 낸다.
import { eye } from './parts/draw.js';
const R = Math.SQRT1_2, Y2 = -0.164, Y3 = 0.24, X5 = R / 2, X6 = 0.26;
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
const has = (t) => (c) => c.tags.has(t);

export const penguin = {
  id: 'penguin',
  name: '펭귄',
  level: 2,
  desc: '아래를 올려 접어 하얀 배를 만들고, 양옆을 접었다 다시 바깥으로 접으면 날개가 생겨요.',
  paper: '정사각형 색종이 (파란색)',
  colors: { front: '#4fb7d8', back: '#fbf8f1' },
  accent: '#2b8fb2',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '펭귄 완성!',
  steps: [
    { text: '색깔 면이 위로 오게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '아래 꼭짓점을 점선에서 접어 올려요. 하얀 배가 돼요.', moves: [{ line: [[-1, Y2], [1, Y2]], side: [0, -R], tag: 'belly' }] },
    { text: '올린 끝을 점선에서 조금 접어 내려요. 부리가 돼요.', moves: [{ line: [[-1, Y3], [1, Y3]], side: [0, 0.35], filter: has('belly') }] },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '왼쪽을 세로 점선에서 가운데로 접어요.', moves: [{ line: [[-X5, -1], [-X5, 1]], side: [-0.5, -0.1], tag: 'wL' }] },
    { text: '오른쪽도 접어 왼쪽 날개 위에 겹쳐요.', moves: [{ line: [[X5, -1], [X5, 1]], side: [0.5, -0.1], tag: 'wR' }] },
    { text: '왼쪽 날개를 점선에서 다시 바깥으로 접어 내요.', moves: [{ line: [[-X6, -1], [-X6, 1]], side: [0, -0.1], filter: has('wL') }] },
    { text: '오른쪽 날개도 다시 바깥으로 접어 내요.', moves: [{ line: [[X6, -1], [X6, 1]], side: [0, -0.1], filter: has('wR') }] },
    { text: '위 꼭짓점을 조금 접어 내려요.', moves: [{ line: [[-1, 0.62], [1, 0.62]], side: [0, R] }] },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '연필로 눈을 그리면 완성!', view: [0, 0, 1], draw: [...eye(-0.1, 0.4, 0.026), ...eye(0.1, 0.4, 0.026)] },
  ],
};
