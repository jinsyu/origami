// 문어 (정사각형 색종이)
// 출처: Origami Club "Octopus" (Fumiaki Shingu) https://en.origami-club.com/easy/sea/octopus/
// 양옆을 가운데로 접고 아래 안쪽 모서리를 바깥으로 접어 넓은 다리를 만든 뒤, 뒤집어 위를 내려 머리를 만든다.
import { arc, PENCIL } from './parts/draw.js';
const H = 0.5, F = 0.154; // 머리 윗변
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
const has = (t) => (c) => c.tags.has(t);
const leg = (x) => ({ line: [[x, -0.24], [x, -0.48]], w: 0.012, color: PENCIL });

export const octopus = {
  id: 'octopus',
  name: '문어',
  level: 1,
  desc: '양옆을 가운데로 접고 아래 모서리를 바깥으로 접으면 넓은 다리가, 위를 내려 접으면 동그란 머리가 돼요.',
  paper: '정사각형 색종이 (빨간색)',
  colors: { front: '#fbf8f1', back: '#e2504c' },
  accent: '#bb3530',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '문어 완성!',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '양쪽 변을 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[0.25, -1], [0.25, 1]], side: [H, 0], tag: 'sideR' },
        { line: [[-0.25, -1], [-0.25, 1]], side: [-H, 0], tag: 'sideL' },
      ],
    },
    {
      text: '아래 가운데 모서리를 점선을 따라 바깥으로 접어 내요.',
      moves: [
        { line: [[0, 0], [0.25, -H]], side: [0.02, -0.45], filter: has('sideR') },
        { line: [[0, 0], [-0.25, -H]], side: [-0.02, -0.45], filter: has('sideL') },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '위쪽을 점선에서 접어 내려요. 머리가 돼요.', moves: [{ line: [[-1, F], [1, F]], side: [0, H] }] },
    {
      text: '연필로 눈과 동그란 입, 다리 줄무늬를 그리면 완성!',
      view: [0, 0, 1],
      draw: [
        { dot: [-0.12, 0.03], r: 0.022, color: PENCIL }, { dot: [0.12, 0.03], r: 0.022, color: PENCIL },
        { line: arc([0, -0.06], 0.06, 0.04, 0, 360, 24), w: 0.012, color: PENCIL },
        { line: arc([0, -0.06], 0.025, 0.018, 0, 360, 16), w: 0.01, color: PENCIL },
        ...[-0.21, -0.15, -0.09, -0.03, 0.03, 0.09, 0.15, 0.21].map(leg),
      ],
    },
  ],
};
