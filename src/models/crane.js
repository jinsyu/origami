// 학 (정사각형 색종이, 마름모 방향)
import { has, not, and, flip, squash, petal } from './parts/folds.js';
const R = Math.SQRT1_2;
const s1 = Math.sin(Math.PI / 8), c1 = Math.cos(Math.PI / 8);
const K = R * (1 - Math.SQRT1_2); // 연 모양 선 윗끝 높이 |y|
// 사각 기본형의 한쪽 면 (front: 그 면의 날개 두 장, face: 맨 위 한 장)
const kite = (front) => [
  { line: [[0, -R], [s1, -R + c1]], side: [R / 2, -R / 2], filter: front },
  { line: [[0, -R], [-s1, -R + c1]], side: [-R / 2, -R / 2], filter: front },
];
const unkite = (front) => [
  { line: [[0, -R], [s1, -R + c1]], side: [0.02, -R + 0.2], filter: (c) => front(c) && c.x > 0 && c.tags.has('kite') },
  { line: [[0, -R], [-s1, -R + c1]], side: [-0.02, -R + 0.2], filter: (c) => front(c) && c.x < 0 && c.tags.has('kite') },
];
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
const tagged = (moves, tag) => moves.map((m) => ({ ...m, tag }));
const preAndPetal = (front, face, petalTag, side) => [
  { text: `${side} 날개 두 장의 아래쪽 변을 가운데 선에 맞춰 접어요.`, moves: tagged(kite(front), 'kite') },
  { text: '위쪽 삼각형을 접어 내렸다가 다시 펴서 가로 선을 만들어요.', moves: [{ line: [[-1, -K], [1, -K]], side: [0, 0.2], filter: front, unfold: true }] },
  { text: '방금 접은 양쪽 날개를 다시 펴요.', moves: unkite(front) },
  { text: '맨 위 한 장의 아래 끝을 가로 선을 따라 위로 들어 올리면서, 양옆을 접은 선대로 안쪽에 접어 넣어요. 꽃잎 접기예요.', sim: true, moves: petal(R, face, front, petalTag) },
];

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
  done: '학 완성! 날개를 살짝 벌리고 몸통을 부풀려 보세요.',
  steps: [
    { text: '흰 면이 위로 오게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'f1' }] },
    { text: '오른쪽 끝을 왼쪽 끝에 맞춰 한 번 더 반으로 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], tag: 'f2' }] },
    { text: '위 날개를 세워 틈을 벌리고 꾹 눌러 마름모로 펼쳐 눌러요.', sim: true, moves: squash(-1, and(has('f2'), has('f1')), and(has('f2'), not('f1')), R, 'faceA') },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 날개도 똑같이 펼쳐 눌러요. 사각 기본형이 완성돼요.', sim: true, moves: squash(1, and(not('f2'), has('f1')), and(not('f2'), not('f1')), R, 'faceB') },
    ...preAndPetal(not('f2'), has('faceB'), 'petalA', '앞쪽'),
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    ...preAndPetal(has('f2'), has('faceA'), 'petalB', '이쪽'),
    { text: '아래쪽 두 다리의 바깥 변을 가운데 선에 맞춰 접어 가늘게 만들어요.', moves: narrow((c) => c.tags.has('f2')) },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 다리도 바깥 변을 가운데 선에 맞춰 접어요.', moves: narrow((c) => !c.tags.has('f2')) },
    { text: '오른쪽 다리를 날개 사이로 안쪽 뒤집어 접어 세워요. 목이 돼요.', sim: true, moves: lift(1, 35, 'neck') },
    { text: '왼쪽 다리도 안쪽 뒤집어 접어 세워요. 꼬리가 돼요.', sim: true, moves: lift(-1, 145, 'tail') },
    { text: '목 끝을 안쪽 뒤집어 접어 머리를 만들어요.', sim: true, moves: head() },
    {
      text: '양쪽 날개를 옆으로 수평이 되게 펼치면 학 완성!',
      moves: [
        { line: [[-1, -K], [1, -K]], side: [0, 0.2], filter: (c) => c.tags.has('petalB'), angle: 90, toward: 1 },
        { line: [[-1, -K], [1, -K]], side: [0, 0.2], filter: (c) => c.tags.has('petalA'), angle: 90, toward: -1 },
      ],
      view: [0.35, 0.55, 1],
    },
  ],
};

