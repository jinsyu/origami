// 모서리 책갈피 (정사각형 색종이, 마름모 방향)
// 세모 → 앞장 꼭짓점을 아래로 내려 주머니 → 양쪽 모서리를 꼭대기로 올려 주머니 안에 끼운다. 책 모서리에 끼워 쓴다.
import { PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const pocket = (c) => c.tags.has('pocket');

export const bookmark = {
  id: 'bookmark',
  name: '모서리 책갈피',
  level: 2,
  desc: '책 모서리에 쏙 끼우는 책갈피예요. 앞장으로 주머니를 만들고 양쪽 끝을 그 안에 끼워 넣어요. 얼굴을 그려 꾸며 보세요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#2bb3a3' },
  accent: '#178a7d',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0.1, 1],
  done: '괴물 책갈피 완성! 읽던 책장 모서리에 끼워 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'front' }] },
    { text: '앞의 한 장만 위 꼭짓점을 아래 변 가운데까지 접어 내려요. 이 장이 주머니가 돼요.', moves: [{ line: [[-1, R / 2], [1, R / 2]], side: [0, R], filter: (c) => c.tags.has('front'), tag: 'pocket' }] },
    { text: '오른쪽 모서리를 위 꼭짓점까지 올리면서 주머니 안으로 끼워 넣어요.', moves: [{ line: [[0, 0], [1, 1]], side: [R, 0.05], filter: (c) => !pocket(c), insert: 1, tag: 'tuckR' }] },
    { text: '왼쪽 모서리도 위 꼭짓점까지 올려 주머니 안으로 끼워 넣어요.', moves: [{ line: [[0, 0], [-1, 1]], side: [-R, 0.05], filter: (c) => !pocket(c) && !c.tags.has('tuckR'), insert: 1, tag: 'tuckL' }] },
    {
      text: '연필로 위쪽 세모에 커다란 눈 두 개를, 주머니 윗변을 따라 뾰족한 이빨을 그려요.',
      view: [0, 0.1, 1],
      draw: [
        { dot: [-0.09, 0.47], r: 0.05, color: '#ffffff' }, { line: [...Array(25)].map((_, i) => [-0.09 + 0.05 * Math.cos((i / 24) * 2 * Math.PI), 0.47 + 0.05 * Math.sin((i / 24) * 2 * Math.PI)]), w: 0.008 },
        { dot: [0.09, 0.47], r: 0.05, color: '#ffffff' }, { line: [...Array(25)].map((_, i) => [0.09 + 0.05 * Math.cos((i / 24) * 2 * Math.PI), 0.47 + 0.05 * Math.sin((i / 24) * 2 * Math.PI)]), w: 0.008 },
        { dot: [-0.08, 0.46], r: 0.022, color: PENCIL }, { dot: [0.1, 0.46], r: 0.022, color: PENCIL },
        { line: [[-0.3, 0.354], [-0.24, 0.3], [-0.18, 0.354], [-0.12, 0.3], [-0.06, 0.354], [0.0, 0.3], [0.06, 0.354], [0.12, 0.3], [0.18, 0.354], [0.24000000000000005, 0.3], [0.3, 0.354]], w: 0.008 },
      ],
    },
    {
      text: '색연필로 주머니 안쪽에 빨간 혀를 칠하면 완성!',
      view: [0, 0.1, 1],
      draw: [{ dot: [0, 0.2], r: 0.07, ry: 0.05, color: '#e0566b', under: true }],
    },
  ],
};
