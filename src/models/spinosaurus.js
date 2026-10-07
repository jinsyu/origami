// 스피노사우루스 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Spinosaurus" (Fumiaki Shingu) https://en.origami-club.com/easy/dinosaur/spinosaurus/
// 아래 변을 가운데 선에 맞춰 접고 아래·위를 접어 띠를 만든 뒤, 오른쪽 끝을 접고 위아래로 뒤집어 왼쪽 끝을 접으면 머리가 된다.
import { eye, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const C = Math.cos(Math.PI / 8), S = Math.sin(Math.PI / 8);
const SPOT = '#8a3fa0';

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  low: 아래를 접어 올리는 가로선의 높이(음수), top: 위를 접어 내리는 가로선의 높이
//  right: 오른쪽 끝을 접는 세로선의 x, head: 뒤집은 뒤 왼쪽 끝(머리)을 접는 세로선의 x
export const spinosaurusParams = { low: -0.143, top: 0.14, right: 0.555, head: -0.315 };
export function makeSpinosaurus(P = spinosaurusParams) {
  const { low, top, right, head } = P;
  const tip = 2 * top - R; // 접어 내린 위 꼭짓점의 높이
  const V = [0, 0.05, 1];
  return {
    id: 'spinosaurus',
    name: '스피노사우루스',
    level: 2,
    desc: '가로로 길게 접어 띠를 만들고 뒤집으면 등에 큰 돛이 솟은 스피노사우루스가 돼요. 얼굴과 등 가시를 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#e9a3d0' },
    accent: '#a8509a',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: V,
    done: '스피노사우루스 완성! 등 돛이 멋져요.',
    params: P,
    make: makeSpinosaurus,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '왼쪽 아래 변을 가운데 선에 맞춰 접어요.', moves: [{ line: [[-R, 0], [-R + C, -S]], side: [0, -R] }] },
      { text: '아래쪽을 가로 점선에서 접어 올려요.', moves: [{ line: [[-1, low], [1, low]], side: [0, -R] }] },
      { text: '위 꼭짓점을 가로 점선에서 접어 내려요.', moves: [{ line: [[-1, top], [1, top]], side: [0, R], tag: 'top' }] },
      { text: '오른쪽 끝을 세로 점선에서 접어요.', moves: [{ line: [[right, -1], [right, 1]], side: [R, 0] }] },
      { text: '오른쪽 아래를 세모의 변에 맞춰 비스듬히 접어 올려요.', moves: [{ line: [[0, tip], [1, tip + 1]], side: [right - 0.03, low + 0.03] }] },
      { text: '위아래로 뒤집어요. 흰 세모가 위로 솟아요.', moves: [{ spin: { a: [0, 0, 0], b: [1, 0, 0], angle: 180 } }], view: V },
      { text: '왼쪽 끝을 세로 점선에서 오른쪽으로 접어요. 머리가 돼요.', moves: [{ line: [[head, -1], [head, 1]], side: [-R, 0], tag: 'head' }] },
      {
        text: '연필로 눈과 이빨, 등 돛의 가시를 그려요.',
        view: V,
        draw: [
          ...eye(-0.19, 0.055, 0.022),
          { line: [[-0.14, -0.03], [-0.11, -0.075], [-0.08, -0.03], [-0.05, -0.075], [-0.02, -0.03], [0.01, -0.065]], w: 0.008, color: PENCIL },
          ...[-0.12, -0.06, 0, 0.06, 0.12].map((x) => ({ line: [[x * 0.9, 0.18], [x, 0.27]], w: 0.012, color: PENCIL })),
        ],
      },
      {
        text: '색연필로 몸에 점무늬를 그리면 완성!',
        view: V,
        draw: [[0.13, 0.06], [0.28, 0.08], [0.21, -0.04], [0.36, -0.02], [0.1, -0.09], [0.42, -0.1]].map(([x, y]) => ({ dot: [x, y], r: 0.012, color: SPOT })),
      },
    ],
  };
}
export const spinosaurus = makeSpinosaurus();
