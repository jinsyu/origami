// 원숭이 (정사각형 색종이)
// 출처: Origami Club "Monkey" (Fumiaki Shingu) https://en.origami-club.com/easy/animal/monkey2/
import { squashFlap } from './parts/folds.js';
import { eye, PENCIL } from './parts/draw.js';
// 반으로 접은 뒤 오른쪽을 펼쳐 눌러 흰 얼굴을 만들고, 왼쪽을 뒤로 접어 머리 모양을 다듬는다.
const H = 0.5;
const top = (c) => c.tags.has('top');

export const monkey = {
  id: 'monkey',
  name: '원숭이',
  level: 3,
  desc: '반으로 접은 뒤 한쪽을 펼쳐 누르면 하얀 얼굴이 나와요. 눈과 머리카락을 그려 주세요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e8a067' },
  accent: '#c27a3f',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '원숭이 완성!',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 반으로 접었다 펴서 가운데 세로 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '위쪽을 아래로 반 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, H], tag: 'top' }] },
    { text: '오른쪽 틈을 벌리고 비스듬한 점선을 따라 꾹 눌러 펼쳐요. 하얀 얼굴이 나와요.', sim: true, moves: squashFlap({ V: [0.29, 0], hd: [-0.12, -0.5], sd: [1, 0], outer: (c) => !top(c), inner: top, faceTag: 'face', size: 0.5 }) },
    { text: '왼쪽을 세로 점선에서 뒤로 접어요.', moves: [{ line: [[-0.25, -1], [-0.25, 1]], side: [-H, -0.25], toward: -1 }] },
    {
      text: '연필로 눈과 머리카락을 그리고, 색연필로 입을 칠하면 완성!',
      view: [0, 0, 1],
      draw: [
        ...eye(0.04, -0.27, 0.02), ...eye(0.16, -0.31, 0.02),
        { line: [[-0.02, -0.19], [0.04, -0.17], [0.08, -0.21], [0.13, -0.18], [0.18, -0.22]], w: 0.009, color: PENCIL },
        { dot: [0.13, -0.4], r: 0.022, ry: 0.016, color: '#c0392b' },
      ],
    },
  ],
};
