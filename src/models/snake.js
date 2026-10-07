// 뱀 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Snake" (Fumiaki Shingu) https://en.origami-club.com/easy/animal/snake/
// 가로 접는 선을 4등분으로 만든 뒤 아래와 위를 차례로 올렸다 내렸다 접어 세모 무늬 띠를 만들고, 반으로 접는다.
import { bigEye } from './parts/draw.js';
const R = Math.SQRT1_2, Q = R / 4;
const has = (t) => (c) => c.tags.has(t);
const H = (y) => [[-1, y], [1, y]];

// 한쪽(sy: 아래 -1, 위 1) 계단 접기 세 번: 끝을 4등분 선에서 넘기고, 가운데에서 되접고, 다시 4등분 선에서 넘긴다
const zig = (sy) => [
  { text: sy < 0 ? '아래 꼭짓점을 아래쪽 4등분 선에서 접어 올려요.' : '위 꼭짓점을 위쪽 4등분 선에서 접어 내려요.', moves: [{ line: H(sy * Q), side: [0, sy * R], tag: `z${sy}` }] },
  { text: '넘긴 끝을 가운데 선에서 되접어요.', moves: [{ line: H(0), side: [0, -sy * 0.3], filter: has(`z${sy}`), tag: `z${sy}b` }] },
  { text: '띠 밖으로 나온 끝을 다시 4등분 선에서 접어 넣어요.', moves: [{ line: H(sy * Q), side: [0, sy * R * 0.6], filter: has(`z${sy}b`) }] },
];

export function makeSnake() {
  return {
    id: 'snake',
    name: '뱀',
    level: 2,
    desc: '접었다 폈다를 되풀이해 세모 무늬가 줄줄이 생기는 뱀이에요. 눈을 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#7fbf3f', back: '#fbf8f1' },
    accent: '#4f8a1c',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: [0, -0.1, 1],
    done: '뱀 완성! 스르륵~',
    steps: [
      {
        text: '색깔 면이 위로 가게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.',
        moves: [{ line: H(0), side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }],
      },
      { text: '위와 아래 꼭짓점을 가운데에 맞춰 접어요.', moves: [1, -1].map((sy) => ({ line: H(sy * 2 * Q), side: [0, sy * R], tag: `a${sy}` })) },
      { text: '위와 아래 변을 가운데 선에 맞춰 접어요.', moves: [1, -1].map((sy) => ({ line: H(sy * Q), side: [0, sy * 0.3], tag: `b${sy}` })) },
      {
        text: '접은 것을 모두 펴요. 가로로 접는 선이 생겼어요.',
        sim: true,
        moves: [1, -1].flatMap((sy) => [
          { line: H(sy * Q), side: [0, sy * 0.1], filter: has(`b${sy}`), toward: 1, at: [0, 0.5] },
          { line: H(sy * 2 * Q), side: [0, sy * 0.2], filter: has(`a${sy}`), toward: 1, at: [0.5, 1] },
        ]),
      },
      ...zig(-1),
      ...zig(1),
      { text: '위쪽을 가운데 선에서 뒤로 반 접어요.', moves: [{ line: H(0), side: [0, 0.1], toward: -1 }], view: [0, -0.1, 1] },
      { text: '연필로 왼쪽 끝에 눈을 그리면 완성!', view: [0, -0.1, 1], draw: bigEye(-0.49, -0.055, 0.032) },
    ],
  };
}
export const snake = makeSnake();
