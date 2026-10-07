// 지붕 집 (정사각형 색종이)
// 반으로 접기 → 양옆을 가운데로 → 두 날개 위쪽을 펼쳐 눌러 삼각 지붕을 만든다. 펼쳐 누르기 입문 작품.
import { box, fill, PENCIL } from './parts/draw.js';
import { squashFlap } from './parts/folds.js';
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);
const roof = (sx, tag) => squashFlap({
  V: [sx * 0.25, 0], hd: [0, -1], sd: [-sx, 0], size: 0.25, faceTag: tag,
  outer: (c) => has(sx > 0 ? 'flapR' : 'flapL')(c) && has('front')(c),
  inner: (c) => has(sx > 0 ? 'flapR' : 'flapL')(c) && !has('front')(c),
});

export const roofhouse = {
  id: 'roofhouse',
  name: '지붕 집',
  level: 2,
  desc: '양옆 날개의 위쪽을 펼쳐 눌러 삼각 지붕을 만드는 집이에요. 펼쳐 누르기를 가장 쉽게 연습할 수 있어요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#4f7cac' },
  accent: '#355f8c',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.2, 1],
  done: '지붕 집 완성! 창문에 불이 켜진 따뜻한 집이에요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 위쪽 절반을 아래로 접어 내려요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, H], tag: 'front' }] },
    { text: '세로로 반 접었다 펴서 가운데 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '양쪽 끝을 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[0.25, -1], [0.25, 1]], side: [H, -0.2], tag: 'flapR' },
        { line: [[-0.25, -1], [-0.25, 1]], side: [-H, -0.2], tag: 'flapL' },
      ],
    },
    { text: '오른쪽 날개를 세우고 위쪽 틈을 벌려, 꾹 눌러 세모 지붕으로 펼쳐 눌러요.', sim: true, moves: roof(1, 'roofR') },
    { text: '왼쪽 날개도 똑같이 펼쳐 눌러 지붕을 완성해요.', sim: true, moves: roof(-1, 'roofL') },
    {
      text: '연필로 벽 가운데에 문을, 양옆에 창문을 그려요.',
      view: [0, -0.2, 1],
      draw: [
        box(-0.06, -0.5, 0.06, -0.32), { dot: [0.035, -0.41], r: 0.008, color: PENCIL },
        box(-0.4, -0.43, -0.26, -0.31), { line: [[-0.33, -0.43], [-0.33, -0.31]], w: 0.007 },
        box(0.26, -0.43, 0.4, -0.31), { line: [[0.33, -0.43], [0.33, -0.31]], w: 0.007 },
      ],
    },
    {
      text: '색연필로 창문은 노란색, 문은 빨간색으로 칠하면 완성!',
      view: [0, -0.2, 1],
      draw: [fill(-0.4, -0.43, -0.26, -0.31, '#f5cd4f'), fill(0.26, -0.43, 0.4, -0.31, '#f5cd4f'), fill(-0.06, -0.5, 0.06, -0.32, '#d9583f')],
    },
  ],
};
