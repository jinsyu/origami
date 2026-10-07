// 자동차 (정사각형 색종이)
// 출처: Origami Club "Car" (Fumiaki Shingu) https://en.origami-club.com/easy/vehicle/car/
// 아래를 띠로 접어 바퀴를 내려 접고, 위를 접었다 올려 차체를 만든 뒤 모서리를 비스듬히 접어 앞유리를 만든다.
import { fillPoly, PENCIL } from './parts/draw.js';
const H = 0.5;
const WIN = [[-0.29, 0.05], [-0.03, 0.05], [-0.03, 0.19], [-0.12, 0.19]]; // 앞유리와 나란한 창문
const has = (t) => (c) => c.tags.has(t);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

export const car = {
  id: 'car',
  name: '자동차',
  level: 2,
  desc: '띠의 양 끝을 내려 접으면 바퀴가, 모서리를 비스듬히 접으면 앞유리가 생겨요. 창문을 그려 주세요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#4bb3d8' },
  accent: '#2b8cb0',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '자동차 완성! 부릉부릉 달려 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '아래 변을 가운데 선에 맞춰 접어 올려요.', moves: [{ line: [[-1, -0.25], [1, -0.25]], side: [0, -1], tag: 'band' }] },
    {
      text: '띠의 양쪽 끝을 점선을 따라 비스듬히 내려 접어요. 바퀴가 돼요.',
      moves: [
        { line: [[0, 0], [-H, -0.25]], side: [-0.45, -0.02], filter: has('band'), tag: 'wheel' },
        { line: [[0, 0], [H, -0.25]], side: [0.45, -0.02], filter: has('band'), tag: 'wheel' },
      ],
    },
    { text: '위쪽을 가운데 선에서 접어 내려요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 0.4], filter: (c) => !c.tags.has('band'), tag: 'roof' }] },
    { text: '내린 부분을 점선에서 다시 접어 올려요.', moves: [{ line: [[-1, -0.13], [1, -0.13]], side: [0, -0.4], filter: has('roof') }] },
    { text: '오른쪽 위 모서리를 점선을 따라 비스듬히 접어요. 앞유리가 돼요.', moves: [{ line: [[0.02, 0.4], [0.62, -0.1]], side: [0.48, 0.22], filter: (c) => !c.tags.has('wheel') }] },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '연필로 앞유리 옆에 창문을 그리면 완성!', view: [0, 0, 1], draw: [fillPoly(WIN, '#ffffff'), { line: [...WIN, WIN[0]], w: 0.012, color: PENCIL }] },
  ],
};
