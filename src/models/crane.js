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
// 날개를 펴면 등(날개 경첩 위 몸통)이 낮게 솟는다: 꼭대기 점(0,0)·양옆 꼭짓점(±0.117,-0.117)·
// 날개 경첩(y=-0.207)은 그대로, 가운데가 가장 많이.
// 한쪽 벽의 겹은 통째로 같은 양만큼 밀린다 (겹마다 다르게 밀면 겹 가장자리에 틈이 벌어져 속이 보인다).
// 앞 벽·뒤 벽은 높이가 아니라 종이 조각으로 가른다: 처음 반으로 접을 때 뒤로 간 쪽(f2)이 뒤 벽.
// 몸통 윗부분은 여덟 조각이 고리로 이어져 있다. 바깥 겹(faceA·faceB)은 가운데 선을 평평하게 건너고,
// 안쪽 겹은 가운데 선(x=0)에서 앞 벽↔뒤 벽으로 U자로 꺾여 이어진다. 그래서 안쪽 겹은 가운데 선에서 0,
// 바깥 변(바깥 겹과 접힌 선으로 이어진 곳)에서 바깥 겹과 같은 양이 되게 민다 (책장이 벌어지듯).
const BACK = 0.04; // 등이 솟는 높이 (몸통 폭 0.234 의 약 1/6)
const inner = (q) => !['faceA', 'faceB', 'leg'].some((t) => q.tags.has(t));
const puff = (p, e, q) => {
  const [x, y, z] = p;
  // 이 단계에 돌아가는 날개 조각은 밀지 않는다 (접기 전에는 몸통 자리에 겹쳐 있어, 밀면 몸통 겹을 지나친다. 끝에서는 경첩선 위라 0)
  if (q.owner >= 0) return p;
  if (y >= 0 || y <= -0.207 || Math.abs(x) >= 0.117) return p;
  // 매끄러운 낮은 언덕 (면 안쪽에 꺾인 선이 있으면 겹마다 다른 메시가 다르게 보간해 붙어 있는 겹끼리 엇갈린다)
  const tx = Math.cos((Math.PI * x) / 0.234);
  const ty = Math.sin((Math.PI * -y) / 0.207);
  const h = tx * ty;
  const half = y >= -0.117 ? -y : 0.117 + 0.2 * (y + 0.117); // 그 높이에서 몸통 윗부분의 반폭
  const r = inner(q) ? Math.min(1, Math.abs(x) / Math.max(half, 1e-6)) : 1;
  return [x, y, z + BACK * e * h * r * (q.tags.has('f2') ? -1 : 1)];
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
  done: '학 완성! 날개를 펴니 등이 볼록 솟았어요.',
  steps: [
    ...birdBase(),
    { text: '아래쪽 두 다리의 바깥 변을 가운데 선에 맞춰 접어 가늘게 만들어요.', moves: narrow((c) => c.tags.has('f2')) },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 다리도 바깥 변을 가운데 선에 맞춰 접어요.', moves: narrow((c) => !c.tags.has('f2')) },
    { text: '오른쪽 다리를 날개 사이로 안쪽 뒤집어 접어 세워요. 목이 돼요.', sim: true, moves: lift(1, 35, 'neck'), view: [0.3, 0.4, 1] },
    { text: '왼쪽 다리도 안쪽 뒤집어 접어 세워요. 꼬리가 돼요.', sim: true, moves: lift(-1, 145, 'tail'), view: [0.3, 0.4, 1] },
    { text: '목 끝을 안쪽 뒤집어 접어 머리를 만들어요.', sim: true, moves: head(), view: [0.3, 0.4, 1] },
    {
      text: '양쪽 날개를 옆으로 펼치면서 살살 당기면 등이 볼록 솟아요. 학 완성!',
      deform: puff,
      moves: [
        { line: [[-1, -K], [1, -K]], side: [0, 0.2], filter: (c) => c.tags.has('petalB'), angle: 90, toward: -1 }, // 뒤 날개(petalB)는 뒤로, 앞 날개는 앞으로 (서로·몸통을 지나치지 않게)
        { line: [[-1, -K], [1, -K]], side: [0, 0.2], filter: (c) => c.tags.has('petalA'), angle: 90, toward: 1 },
      ],
      view: [0.35, 0.55, 1],
      diagramView: [0.9, 0.25, 0.9],
    },
  ],
};

