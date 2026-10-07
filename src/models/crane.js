// 학 (정사각형 색종이, 마름모 방향)
import { flip } from './parts/folds.js';
import { birdBase } from './parts/bases.js';
const R = Math.SQRT1_2;
const K = R * (1 - Math.SQRT1_2); // 연 모양 선 윗끝 높이 |y|
// 사각 기본형의 한쪽 면 (front: 그 면의 날개 두 장, face: 맨 위 한 장)
const s2 = Math.sin(Math.PI / 16), c2 = Math.cos(Math.PI / 16);
// 다리를 가늘게: 아래 끝에서 11.25° 선을 따라 바깥 변을 가운데로
// 다리를 가늘게: 아래 끝에서 11.25° 선을 따라 그 면의 바깥쪽 겹을 모두 가운데로 접는다
// (구속 조건 탐색 결과: 날개 밑동의 옆 조각까지 함께 접혀야 종이가 끊기지 않는다)
const narrow = (layer) => [
  { line: [[0, -R], [s2, -R + c2]], side: [0.15, -0.45], filter: layer, tag: 'leg' },
  { line: [[0, -R], [-s2, -R + c2]], side: [-0.15, -0.45], filter: layer, tag: 'leg' },
];
// 다리를 안쪽으로 뒤집어 세우기 (sx=1 오른쪽 목, -1 왼쪽 꼬리). 등선 = 가늘게 접은 선
const lift = (sx, deg, tag) => {
  const P = [0, -0.27];                 // 뒤집는 선이 등선(가운데 선)과 만나는 점
  const beta = -Math.PI / 2;            // 다리 방향(뿌리→끝): 아래
  const target = (deg * Math.PI) / 180;
  const a = (target + beta) / 2;
  const line = [P, [P[0] + Math.cos(a), P[1] + Math.sin(a)]];
  const spine = [[0, -R], [0, 0]]; // 다리 앞뒤 겹은 가운데 선에서 이어져 있다
  const legSide = (c) => c.y < -K + 1e-3 && sx * c.x > 0;
  return [
    { line, side: [sx * 0.02, -0.62], spine, filter: (c) => legSide(c) && !c.tags.has('f2'), toward: -1, shift: 0.5, tag },
    { line, side: [sx * 0.02, -0.62], spine, filter: (c) => legSide(c) && c.tags.has('f2'), toward: 1, shift: 0.5, tag },
  ];
};
// 머리: 목 끝을 안쪽 뒤집어 접어 아래로 꺾는다 (목 방향 35°, 등선 = 목의 접힌 변)
const head = () => {
  const P = [0, -0.27], dir = [Math.cos(0.6109), Math.sin(0.6109)];
  const Q = [P[0] + dir[0] * 0.33, P[1] + dir[1] * 0.33];
  const a = ((-40 + 35) / 2) * (Math.PI / 180);
  const line = [Q, [Q[0] + Math.cos(a), Q[1] + Math.sin(a)]];
  const spine = [P, [P[0] + dir[0], P[1] + dir[1]]];
  const tip = [0.35, -0.025];
  return [
    { line, side: tip, spine, filter: (c) => c.tags.has('neck') && !c.tags.has('f2'), toward: -1, shift: 0.5 },
    { line, side: tip, spine, filter: (c) => c.tags.has('neck') && c.tags.has('f2'), toward: 1, shift: 0.5 },
  ];
};
// 날개를 벌리면 몸통 앞뒤 벽이 벌어져 빵빵해진다: 가운데(x=0)가 가장 많이, 목·꼬리 쪽과 위아래 끝은 그대로.
// 겹마다 지금 높이(z)에 비례해 밀어내므로 겹 순서가 유지된다
const puff = (p, e) => {
  const [x, y, z] = p;
  const fx = Math.abs(x) < 0.11 ? Math.cos((Math.PI / 2) * (x / 0.11)) ** 2 : 0; // 꺾이는 곳 없이 매끄럽게
  // 날개가 붙는 선(y≈-0.207) 위쪽 등만 부풀린다. 그 아래에는 목·꼬리 밑동이 있어 밀면 겹이 부채처럼 벌어진다
  const fy = y < 0 && y > -0.2 ? Math.sin((Math.PI * -y) / 0.2) : 0;
  const s = Math.max(-1, Math.min(1, z / 0.019)); // 0.019 = 몸통 바깥 겹 높이
  // 목·꼬리(몸통 바깥쪽, 날개가 붙는 선 아래)는 겹 사이를 눌러 한 장처럼 보이게 한다 (겹마다 따로 보이면 머리가 여러 개처럼 보인다)
  const sm = (a, b, v) => { const k = Math.min(1, Math.max(0, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
  const w = Math.max(sm(0.11, 0.16, Math.abs(x)), sm(-0.2, -0.24, y)) * (1 - sm(0.03, 0.06, Math.abs(z))) * e; // 펼친 날개(|z| 큼)는 제외
  return [x, y, z * (1 - 0.6 * w) + 0.09 * e * fx * fy * s];
};
export const crane = {
  id: 'crane',
  name: '학',
  level: 4,
  desc: '사각 기본형에서 꽃잎 접기를 앞뒤로 하고, 목과 꼬리를 뒤집어 접어 세워요. 종이접기의 대표 작품이에요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#2e86ab' },
  accent: '#1f6a8a',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0.45, 0.75, 1],
  // 21단계: 몸통 속 가운데 겹(날개 밑동과 다리 겹이 만나는 점)이 부풀리며 벌어진다. 겉에서는 보이지 않는다
  knownTears: [21],
  done: '학 완성! 몸통이 빵빵하게 부풀었어요.',
  steps: [
    ...birdBase(),
    { text: '아래쪽 두 다리의 바깥 변을 가운데 선에 맞춰 접어 가늘게 만들어요.', moves: narrow((c) => c.tags.has('f2')) },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 다리도 바깥 변을 가운데 선에 맞춰 접어요.', moves: narrow((c) => !c.tags.has('f2')) },
    { text: '오른쪽 다리를 날개 사이로 안쪽 뒤집어 접어 세워요. 목이 돼요.', sim: true, moves: lift(1, 35, 'neck'), view: [0.3, 0.4, 1] },
    { text: '왼쪽 다리도 안쪽 뒤집어 접어 세워요. 꼬리가 돼요.', sim: true, moves: lift(-1, 145, 'tail'), view: [0.3, 0.4, 1] },
    { text: '목 끝을 안쪽 뒤집어 접어 머리를 만들어요.', sim: true, moves: head(), view: [0.3, 0.4, 1] },
    {
      text: '양쪽 날개를 옆으로 펼치면서 살살 당기면 몸통이 빵빵하게 부풀어요. 학 완성!',
      deform: puff,
      moves: [
        { line: [[-1, -K], [1, -K]], side: [0, 0.2], filter: (c) => c.tags.has('petalB'), angle: 90, toward: 1 },
        { line: [[-1, -K], [1, -K]], side: [0, 0.2], filter: (c) => c.tags.has('petalA'), angle: 90, toward: -1 },
      ],
      view: [0.35, 0.55, 1],
      diagramView: [1, 0.5, 0.5],
    },
  ],
};

