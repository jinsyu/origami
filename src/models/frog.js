// 개구리 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Frog" (Fumiaki Shingu) https://en.origami-club.com/easy/sea/frog/
// 세모의 오른쪽을 펼쳐 눌러 네모난 머리와 하얀 입을 만들고, 왼쪽을 접어 몸을 만든다.
import { squashFlap } from './parts/folds.js';
import { eye } from './parts/draw.js';
const R = Math.SQRT1_2, P = 0.22 * R;
const top = (c) => c.tags.has('top');

export const frog = {
  id: 'frog',
  name: '개구리',
  level: 3,
  desc: '세모의 한쪽을 펼쳐 눌러 네모난 머리와 하얀 입을 만들어요. 펼쳐 누르기를 연습해요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#8cc84b' },
  accent: '#5e9a2a',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '개구리 완성! 개굴개굴!',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 반으로 접었다 펴서 가운데 세로 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, R], tag: 'top' }] },
    {
      text: '오른쪽 부분을 점선에서 들어 올려 틈을 벌리고, 꾹 눌러 네모 모양으로 펼쳐 눌러요.',
      sim: true,
      moves: squashFlap({ V: [P, 0], hd: [-P, -R], sd: [1, 0], outer: (c) => !top(c), inner: top, faceTag: 'head', size: R }),
    },
    { text: '왼쪽 끝을 세로 점선에서 오른쪽으로 접어 몸을 만들어요.', moves: [{ line: [[-0.35, -1], [-0.35, 1]], side: [-0.7, -0.02] }] },
    {
      text: '연필로 머리에 동그란 눈 두 개를 그리면 완성!',
      view: [0, 0, 1],
      draw: [{ dot: [0.1, -0.06], r: 0.04, color: '#ffffff' }, ...eye(0.1, -0.06, 0.022), { dot: [0.27, -0.2], r: 0.04, color: '#ffffff' }, ...eye(0.27, -0.2, 0.022)],
    },
  ],
};
