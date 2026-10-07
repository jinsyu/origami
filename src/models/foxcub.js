// 아기 여우 (정사각형 색종이)
// 출처: Origami Club "Fox cub" (Fumiaki Shingu) https://en.origami-club.com/animal/animal(small)/fox-cub/
// 띠 접기 양 끝을 펼쳐 누르고 접어 몸통을 만든 뒤, 반으로 접어 머리와 꼬리를 뒤집어 접어 세운다.
import { squashFlap } from './parts/folds.js';
const H = 0.5, Q = 0.25;
const has = (t) => (c) => c.tags.has(t);
const NECK = [[0, -Q], [0.27, 0]]; // 목을 세우는 바깥 뒤집어 접기 선
const base = (c) => !c.tags.has('ft') && !c.tags.has('fb');

export const foxcub = {
  id: 'foxcub',
  name: '아기 여우',
  level: 4,
  maxJump: 0.12, // 목을 세우는 뒤집어 접기에서 목 끝이 한 프레임에 크게 움직인다
  desc: '펼쳐 누르기와 뒤집어 접기로 머리와 꼬리를 세우는, 몸 전체가 있는 여우예요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#f2b234' },
  accent: '#c98a12',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '아기 여우 완성!',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '위아래 변을 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[-1, Q], [1, Q]], side: [0, H], tag: 'ft' },
        { line: [[-1, -Q], [1, -Q]], side: [0, -H], tag: 'fb' },
      ],
    },
    {
      text: '양쪽 끝을 가운데 선에 맞춰 접었다 펴서 세로 선을 만들어요.',
      moves: [
        { line: [[Q, -1], [Q, 1]], side: [H, 0], unfold: true },
        { line: [[-Q, -1], [-Q, 1]], side: [-H, 0], unfold: true },
      ],
    },
    {
      text: '오른쪽 끝의 위아래 틈을 벌려, 두 모서리를 세모로 펼쳐 눌러요.',
      sim: true,
      moves: [
        ...squashFlap({ V: [Q, Q], hd: [0, -1], sd: [1, 0], outer: (c) => base(c) && c.y > 0, inner: has('ft'), faceTag: 'sqT', size: Q }),
        ...squashFlap({ V: [Q, -Q], hd: [0, 1], sd: [1, 0], outer: (c) => base(c) && c.y < 0, inner: has('fb'), faceTag: 'sqB', size: Q }),
      ],
    },
    {
      text: '왼쪽 위아래 모서리를 점선을 따라 안쪽으로 접어요.',
      moves: [
        { line: [[-H, 0], [-Q, Q]], side: [-H, Q], tag: 'cl' },
        { line: [[-H, 0], [-Q, -Q]], side: [-H, -Q], tag: 'cl' },
      ],
    },
    {
      text: '오른쪽 마름모의 위아래 날개를 점선에서 오른쪽으로 접어요.',
      moves: [
        { line: [[0.217, 0.217], [0.262, 0]], side: [0.1, 0.05], filter: (c) => c.y > 0 && (c.tags.has('sqT_in') || c.x > Q), tag: 'earT' },
        { line: [[0.217, -0.217], [0.262, 0]], side: [0.1, -0.05], filter: (c) => c.y < 0 && (c.tags.has('sqB_in') || c.x > Q), tag: 'earB' },
      ],
    },
    { text: '가운데 가로 선에서 위쪽을 뒤로 반 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 0.2], toward: -1, tag: 'back' }] },
    {
      text: '오른쪽 부분을 점선에서 바깥으로 뒤집어 접어 위로 세워요. 목과 머리가 돼요.',
      sim: true,
      moves: [
        { line: NECK, side: [0.45, -0.1], filter: (c) => !c.tags.has('back'), toward: 1, spine: [[0, 0], [1, 0]], tag: 'neck' },
        { line: NECK, side: [0.45, -0.1], filter: (c) => c.tags.has('back'), toward: -1, spine: [[0, 0], [1, 0]], tag: 'neck' },
      ],
    },
  ],
};
