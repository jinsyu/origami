// 잉꼬 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Parakeet" (Fumiaki Shingu) https://en.origami-club.com/animal/bird/parakeet/
// 물고기 기본형(날개가 아래를 향함)을 만든 뒤, 계단 접기로 몸통·꼬리를 나누고 머리와 부리를 접는다.
// 도안은 아래 변을 접은 채 위 변을 접으며 '안쪽 종이를 끄집어내지만', 엔진 움직임이 어지러워 같은 끝 모양의 토끼 귀 접기로 만든다.
import { pleat } from './parts/folds.js';
import { arc, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const C = Math.cos(Math.PI / 8), S = Math.sin(Math.PI / 8);
const K = R * Math.tan(Math.PI / 8); // 두 연 선이 만나는 점의 x (0.293)
const has = (t) => (c) => c.tags.has(t);
// 아래 연 선: 아래 꼭짓점에서 22.5° (아래 변을 가운데 선에 맞춘다), 위 연 선: 위 꼭짓점에서 22.5°
const low = (sx) => [[0, -R], [sx * S, -R + C]];
const up = (sx) => [[0, R], [sx * S, R - C]];
// 토끼 귀 접기 (물고기 기본형 한쪽): 연 모양 선 넷이 만나는 점 (sx·K, 0) 에서
//  위 연 선 바깥(위쪽)은 위 연 선을 따라, 아래 연 선 바깥(아래쪽)은 아래 연 선을 따라 함께 접고,
//  가운데에 솟는 귀를 가로선에서 아래로 눕힌다 (parts/bases.js 의 fishBase 를 세로로 돌린 것과 같다).
// 끝 상태는 도안의 '위 변을 접으면서 안쪽 종이를 끄집어내기'와 같다 (날개 끝이 아래를 향함).
const rabbitEar = (sx) => [
  { line: [[-1, 0], [1, 0]], side: [0, -0.1], angle: 0, seam: true },
  // 아래쪽을 먼저 접고 위쪽을 그 위로 접는다: 눕힌 귀(위쪽 반)가 아래 연 날개 위에 오게
  { line: low(sx), side: [sx * 0.5, -0.1], filter: (c) => c.y < 0 && sx * c.x > 0, toward: 1, tag: `low${sx}` },
  { line: up(sx), side: [sx * 0.5, 0.1], filter: (c) => c.y > 0 && sx * c.x > 0, toward: 1, tag: 'wing' },
  { line: [[0, 0], [sx, 0]], side: [sx * K * 0.3, 0.1], filter: (c) => c.tags.has(`low${sx}`) && c.y > 0, toward: 1, insert: 1, tag: 'fl' },
];

// 도안 그림에서 잰 길이 (scripts/diagram.mjs --fit 으로 맞춤)
//  pleatY: 날개 계단 접기 위 선의 높이, sideY: 옆 접는 선이 위 변과 만나는 높이 (선은 아래 꼭짓점까지),
//  backY: 뒤로 계단 접기 위 선의 높이, topY: 위를 접어 내리는 선의 높이, headY: 머리를 올려 접는 선이 왼쪽 변과 만나는 높이,
//  beak: 부리 접는 선 [왼쪽 x, 왼쪽 y, 오른쪽 x, 오른쪽 y]
export const parakeetParams = { pleatY: -0.079, pleatW: 0.059, sideY: 0.096, backY: -0.219, backW: 0.05, topY: 0.249, headY: 0.14, beak: [-0.178, 0.38, 0.013, 0.353] };
export function makeParakeet(P = parakeetParams) {
  const { pleatY, pleatW, sideY, backY, backW, topY, headY, beak } = P;
  // 옆 접는 선: 위 변 위의 점 (높이 sideY) 에서 아래 꼭짓점까지
  const sideX = K * (R - sideY) / R;
  const sideLine = (sx) => [[sx * sideX, sideY], [0, -R]];
  // 위를 접어 내린 세모의 반폭 (옆 접는 선 위 변 기준)
  const topX = sideX * (R - topY) / (R - sideY);
  const headX = -topX * (1 - (topY - headY) / (topY - (2 * topY - R)));
  return {
    id: 'parakeet',
    name: '잉꼬',
    level: 3,
    desc: '물고기 기본형에서 계단 접기로 날개와 꼬리를 나누고, 머리와 부리를 접어 만드는 잉꼬예요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#a9d46b' },
    accent: '#5f8f2a',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: [0, 0, 1],
    done: '잉꼬 완성!',
    params: P,
    make: makeParakeet,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 반으로 접었다 펴서 가운데 세로선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      {
        text: '아래쪽 두 변을 가운데 선에 맞춰 접었다 펴요.',
        moves: [1, -1].map((sx) => ({ line: low(sx), side: [sx * R, -0.1], unfold: true })),
      },
      {
        text: '위쪽 두 변도 가운데 선에 맞춰 접었다 펴요.',
        moves: [1, -1].map((sx) => ({ line: up(sx), side: [sx * R, 0.1], unfold: true })),
      },
      {
        text: '오른쪽은 접은 선대로 위아래 변을 함께 가운데로 모으면서, 가운데에 솟는 귀를 아래로 눕혀 세모로 눌러요.',
        sim: true,
        moves: rabbitEar(1),
      },
      {
        text: '왼쪽도 똑같이 접어요. 아래를 향한 세모 날개 두 개가 생겨요.',
        sim: true,
        moves: rabbitEar(-1),
      },
      {
        text: '아래를 향한 두 세모 날개를 점선에서 계단 접기 해요.',
        sim: true,
        moves: pleat({ a: [[-1, pleatY], [1, pleatY]], far: [0, -1], width: pleatW, sel: (c) => c.tags.has('fl') || c.tags.has('wing'), toward: 1 }),
      },
      {
        text: '양옆을 점선에서 안쪽으로 접어요.',
        moves: [1, -1].map((sx) => ({ line: sideLine(sx), side: [sx * 0.3, 0], toward: 1 })),
      },
      {
        text: '점선에서 뒤쪽으로 계단 접기 해요. 꼬리가 생겨요.',
        sim: true,
        moves: pleat({ a: [[-1, backY], [1, backY]], far: [0, -1], width: backW, toward: -1, tag: 'back' }),
      },
      { text: '위 끝을 점선에서 접어 내려요.', moves: [{ line: [[-1, topY], [1, topY]], side: [0, R], toward: 1, tag: 'head' }] },
      {
        text: '접어 내린 끝을 비스듬한 점선에서 왼쪽 위로 접어 올려요. 머리가 돼요.',
        moves: [{ line: [[topX, topY], [headX, headY]], side: [0, 2 * topY - R + 0.05], filter: has('head'), toward: 1, tag: 'head2' }],
      },
      {
        text: '머리 끝을 점선에서 접어 내려 부리를 만들어요.',
        moves: [{ line: [[beak[0], beak[1]], [beak[2], beak[3]]], side: [-0.22, 0.48], filter: has('head2'), toward: 1, tag: 'beak' }],
      },
      {
        text: '연필로 눈을 그리면 완성!',
        view: [0, 0, 1],
        draw: [
          { dot: [-0.048, 0.283], r: 0.03, color: '#ffffff' },
          { line: arc([-0.048, 0.283], 0.03, 0.03, 0, 360, 28), w: 0.006, color: PENCIL },
          { dot: [-0.043, 0.285], r: 0.019, color: PENCIL },
        ],
      },
    ],
  };
}
export const parakeet = makeParakeet();
