// 마스 상자 (정사각형 색종이, 마름모 방향) — 뚜껑 없는 정사각 상자
// 네 모서리를 가운데로 접은 뒤 선을 내고, 옆벽·앞뒤벽을 세우고 모서리를 안으로 넣어 입체로 조립한다.
import { GAP } from '../engine.js';
const R = Math.SQRT1_2;
const h = R / 2;   // 모서리를 접은 정사각형의 반너비
const q = h / 2;   // 상자 바닥의 반너비 = 벽 높이

const corners = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
const inCorner = (c, sx, sy) => sx * c.x > q + 1e-6 && sy * c.y > q + 1e-6 && sx * c.x < h + 1e-6 && sy * c.y < h + 1e-6;
// 모서리 정사각형의 앞뒤벽 쪽 삼각형 (대각선으로 나눈 뒤 t1 표시가 없는 쪽)
const isT2 = (c) => corners.some(([sx, sy]) => inCorner(c, sx, sy) && !c.tags.has(`t1${sx}${sy}`));
// 1) 모서리 정사각형을 대각선으로 나누고(옆벽 쪽 삼각형 t1) 옆벽을 세운다
const sideWalls = () => [
  ...corners.map(([sx, sy]) => ({ line: [[sx * q, sy * q], [sx * h, sy * h]], side: [sx * (q + 0.12), sy * (q + 0.03)], filter: (c) => inCorner(c, sx, sy), angle: 0, tag: `t1${sx}${sy}` })),
  ...[1, -1].map((sx) => ({ line: [[sx * q, -1], [sx * q, 1]], side: [sx, 0], filter: (c) => sx * c.x > q - 1e-6 && Math.abs(c.y) < h + 1e-6 && !isT2(c), angle: 90 })),
];
// 2) 앞뒤벽을 세우면서 모서리 삼각형을 안으로 넣는다
const endWalls = () => {
  const mv = [];
  for (const sy of [1, -1]) {
    const tag = sy > 0 ? 'cT' : 'cB';
    mv.push({ line: [[-1, sy * q], [1, sy * q]], side: [0, sy], filter: (c) => (Math.abs(c.x) < q && sy * c.y > q - 1e-6 && c.z < 0.02) || c.tags.has(tag) || (isT2(c) && sy * c.y > 0), angle: 90, at: [0, 0.6] });
  }
  for (const [sx, sy] of corners) {
    const t1 = `t1${sx}${sy}`;
    // 옆벽 쪽 삼각형: 세로 모서리를 축으로 90° 돌려 앞뒤벽 안쪽에 붙인다
    mv.push({ axis3: { a: [sx * q, sy * q, 0], b: [sx * q, sy * q, 1], angle: 90 * sx * sy }, offset: [0, -sy * 2 * GAP, 0], filter: (c) => c.tags.has(t1), at: [0.2, 1] });
    // 앞뒤벽 쪽 삼각형(과 그 위에 이어진 끝 날개 바깥 조각): 세로 모서리를 축으로 안쪽으로 반 바퀴 접는다
    mv.push({ axis3: { a: [sx * q, sy * q, 0], b: [sx * q, sy * q, 1], angle: -180 * sx * sy }, offset: [0, -sy * GAP, 0],
      filter: (c) => !c.tags.has(t1) && sx * c.x > q - 1e-6 && Math.abs(c.y - sy * q) < 0.01 && c.z > 1e-4, at: [0.2, 1] });
  }
  return mv;
};
// 3) 끝 날개를 벽 위로 넘겨 안쪽으로 내리고, 바닥에 눕힌다
const flaps = () => {
  const mv = [];
  for (const sy of [1, -1]) {
    const tag = sy > 0 ? 'cT' : 'cB';
    mv.push({ axis3: { a: [-1, sy * q, q], b: [1, sy * q, q], angle: 180 * sy }, offset: [0, -sy * 3 * GAP, 0], filter: (c) => c.tags.has(tag), at: [0, 0.7] });
    mv.push({ axis3: { a: [-1, sy * (q - 3 * GAP), 0], b: [1, sy * (q - 3 * GAP), 0], angle: -90 * sy }, offset: [0, 0, GAP], filter: (c) => c.tags.has(tag) && c.z < -1e-4, at: [0.5, 1] });
  }
  return mv;
};

export const masu = {
  id: 'masu',
  name: '네모 상자',
  level: 4,
  maxJump: 0.07, // 벽 네 개를 한꺼번에 세우는 큰 입체 조립
  desc: '평면에서 선을 미리 내 두고, 벽을 세우고 모서리를 접어 넣어 입체 상자를 조립해요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#7a5bb5' },
  accent: '#5e43a0',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0.35, -0.9, 0.9],
  done: '네모 상자 완성! 같은 방법으로 조금 큰 종이로 접으면 뚜껑이 돼요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 세로로 반 접었다 펴요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '가로로도 반 접었다 펴요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }] },
    {
      text: '네 모서리를 모두 가운데 점에 맞춰 접어요.',
      moves: [
        { line: [[-1, h], [1, h]], side: [0, 1], tag: 'cT' },
        { line: [[-1, -h], [1, -h]], side: [0, -1], tag: 'cB' },
        { line: [[h, -1], [h, 1]], side: [1, 0], tag: 'cR' },
        { line: [[-h, -1], [-h, 1]], side: [-1, 0], tag: 'cL' },
      ],
    },
    { text: '위아래 변을 가운데 선에 맞춰 접었다 펴요.', moves: [{ line: [[-1, q], [1, q]], side: [0, 1], unfold: true }, { line: [[-1, -q], [1, -q]], side: [0, -1], unfold: true }] },
    { text: '좌우 변도 가운데 선에 맞춰 접었다 펴요.', moves: [{ line: [[q, -1], [q, 1]], side: [1, 0], unfold: true }, { line: [[-q, -1], [-q, 1]], side: [-1, 0], unfold: true }] },
    {
      text: '위아래 모서리를 다시 펼쳐요.',
      moves: [
        { line: [[-1, h], [1, h]], side: [0, 0.1], filter: (c) => c.tags.has('cT') },
        { line: [[-1, -h], [1, -h]], side: [0, -0.1], filter: (c) => c.tags.has('cB') },
      ],
    },
    {
      text: '좌우를 선을 따라 직각으로 세워 옆벽을 만들고, 이어서 위아래 벽을 세우면서 모서리를 안쪽으로 밀어 넣어요.',
      sim: true,
      moves: [...sideWalls().map((m) => (m.angle ? { ...m, at: [0, 0.5] } : m)), ...endWalls().map((m) => ({ ...m, at: m.axis3 ? [0.35, 1] : [0.25, 0.85] }))],
      view: [0.35, -0.9, 0.9],
    },
    { text: '끝을 벽 너머 안쪽으로 넘겨 바닥에 눕혀요.', sim: true, moves: flaps(), view: [0.35, -0.9, 0.9] },
  ],
};
