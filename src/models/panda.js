// 판다 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Panda (face)" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/panda/
// 양옆을 가운데로 접어 검은 귀를 만들고, 뒤로 반 접은 뒤 위 모서리를 뒤로 접고, 아래 끝을 올려 코를 만든다.
import { eye, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2, A = R / 2;
const INK = '#26282c';

export const pandaParams = { s: 0.455, v: 0.331, b: -0.52, n: -0.405 };

export function makePanda({ s, v, b, n } = pandaParams) {
  return {
  params: { s, v, b, n },
  make: makePanda,
  id: 'panda',
  name: '판다 얼굴',
  level: 1,
  desc: '양옆을 가운데로 접으면 검은 귀가, 아래를 올려 접어 넣으면 검은 코가 생겨요. 눈을 그리면 판다가 돼요.',
  paper: '정사각형 색종이 (검은색)',
  colors: { front: '#fbf8f1', back: '#2f3134' },
  accent: '#2f3134',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.2, 1],
  done: '판다 얼굴 완성! 대나무 잎도 그려 주면 좋아해요.',
  steps: [
    { text: '흰 면이 위로 오게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '양쪽 모서리를 점선에서 조금 접어요. 검은 세모가 생겨요.',
      moves: [
        { line: [[-s, -1], [-s, 1]], side: [-R, 0] },
        { line: [[s, -1], [s, 1]], side: [R, 0] },
      ],
    },
    { text: '위쪽을 가운데 선에서 뒤로 반 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, R], toward: -1, tag: 'rear' }] },
    {
      text: '양옆을 세로 점선에서 뒤로 접어요. 위 모서리에 검은 귀가 남아요.',
      moves: [
        { line: [[-v, -1], [-v, 1]], side: [-s, -0.1], toward: -1 },
        { line: [[v, -1], [v, 1]], side: [s, -0.1], toward: -1 },
      ],
    },
    { text: '아래 꼭짓점을 점선에서 접어 올려요.', moves: [{ line: [[-1, b], [1, b]], side: [0, -R], tag: 'chin' }] },
    { text: '올린 끝을 흰 부분 안쪽으로 접어 넣어요. 검은 코가 생겨요.', moves: [{ line: [[-1, n], [1, n]], side: [0, n + 0.05], filter: (c2) => c2.tags.has('chin') && c2.tags.has('rear'), toward: -1 }] },
    {
      text: '검은 색연필로 눈 둘레를 칠하고, 흰 눈을 그리면 완성!',
      view: [0, -0.2, 1],
      draw: [
        { dot: [-0.15, -0.17], r: 0.06, ry: 0.05, color: INK },
        { dot: [0.15, -0.17], r: 0.06, ry: 0.05, color: INK },
        { dot: [-0.14, -0.165], r: 0.02, color: '#ffffff' }, { dot: [0.14, -0.165], r: 0.02, color: '#ffffff' },
        ...eye(-0.138, -0.167, 0.011), ...eye(0.138, -0.167, 0.011),
      ],
    },
  ],
};
}

export const panda = makePanda();
