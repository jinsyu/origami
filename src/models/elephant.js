// 코끼리 얼굴 (정사각형 색종이)
// 출처: Origami Club "Elephant" (Fumiaki Shingu) https://en.origami-club.com/easy/animal/elephant2/
import { squashFlap } from './parts/folds.js';
import { eye, PENCIL } from './parts/draw.js';
// 왼쪽을 비스듬히 접어 코를 만들고, 반으로 접은 뒤 펼쳐 눌러 얼굴과 큰 귀를 만든다.
const H = 0.5;
const top = (c) => c.tags.has('top');

export const elephantParams = { tx: -0.245, size: 0.7 };

export function makeElephant({ tx, size } = elephantParams) {
  return {
  params: { tx, size },
  make: makeElephant,
  id: 'elephant',
  name: '코끼리',
  level: 2,
  desc: '왼쪽을 비스듬히 접고 반으로 접은 뒤 펼쳐 누르면, 긴 코와 큰 귀가 있는 코끼리 얼굴이 돼요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#5bb8d8' },
  accent: '#2f8fb2',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '코끼리 완성!',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '왼쪽 아래 모서리에서 시작하는 점선을 따라 왼쪽을 비스듬히 접어요. 코가 돼요.', moves: [{ line: [[-H, -H], [tx, H]], side: [-H, H], tag: 'trunk' }] },
    { text: '위쪽을 아래로 반 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, H], tag: 'top' }] },
    { text: '왼쪽 위의 틈을 벌리고 대각선 점선을 따라 꾹 눌러 펼쳐요. 얼굴과 귀가 생겨요.', sim: true, moves: squashFlap({ V: [0, 0], hd: [0, -1], sd: [-1, 0], outer: (c) => !top(c), inner: top, faceTag: 'face', size }) },
    {
      text: '연필로 눈과 코 주름을 그리면 완성!',
      view: [0, 0, 1],
      draw: [
        ...eye(-0.04, -0.17, 0.026),
        // 코 주름 (도안처럼 코 윗변에 비스듬히 세 줄)
        ...[-0.37, -0.305, -0.24].map((x) => ({ line: [[x - 0.006, x - 0.03], [x + 0.016, x - 0.052]], w: 0.012, color: PENCIL })),
      ],
    },
  ],
};
}

export const elephant = makeElephant();
