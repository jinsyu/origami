// 기본형: 여러 작품이 출발점으로 쓰는 단계 묶음
// 각 함수는 단계 배열을 돌려준다. 작품의 steps 앞에 펼쳐 넣고 이어서 접는다.
//  - 정사각형 마름모(outline [[0,-R],[R,0],[0,R],[-R,0]], 흰 면 위) 기준
import { has, not, and, flip, squash, petal } from './folds.js';
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
const tagged = (moves, tag) => moves.map((m) => ({ ...m, tag }));
const preAndPetal = (front, face, petalTag, side) => [
  { text: `${side} 날개 두 장의 아래쪽 변을 가운데 선에 맞춰 접어요.`, moves: tagged(kite(front), 'kite') },
  { text: '위쪽 삼각형을 접어 내렸다가 다시 펴서 가로 선을 만들어요.', moves: [{ line: [[-1, -K], [1, -K]], side: [0, 0.2], filter: front, unfold: true }] },
  { text: '방금 접은 양쪽 날개를 다시 펴요.', moves: unkite(front) },
  { text: '맨 위 한 장의 아래 끝을 가로 선을 따라 위로 들어 올리면서, 양옆을 접은 선대로 안쪽에 접어 넣어요. 꽃잎 접기예요.', sim: true, moves: petal(R, face, front, petalTag) },
];


// 사각 기본형 (5단계): 반 접기 두 번 → 앞뒤 날개 펼쳐 누르기. 태그 f1·f2·faceA·faceB
export const squareBase = () => [
    { text: '흰 면이 위로 오게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'f1' }] },
    { text: '오른쪽 끝을 왼쪽 끝에 맞춰 한 번 더 반으로 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], tag: 'f2' }] },
    { text: '위 날개를 세워 틈을 벌리고 꾹 눌러 마름모로 펼쳐 눌러요.', sim: true, moves: squash(-1, and(has('f2'), has('f1')), and(has('f2'), not('f1')), R, 'faceA') },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 날개도 똑같이 펼쳐 눌러요. 사각 기본형이 완성돼요.', sim: true, moves: squash(1, and(not('f2'), has('f1')), and(not('f2'), not('f1')), R, 'faceB') },
];

// 학 기본형 (14단계): 사각 기본형 + 앞뒤 꽃잎 접기. 태그 petalA(앞)·petalB(뒤)
export const birdBase = () => [
  ...squareBase(),
    ...preAndPetal(not('f2'), has('faceB'), 'petalA', '앞쪽'),
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    ...preAndPetal(has('f2'), has('faceA'), 'petalB', '이쪽'),
];

// 물풍선(삼각) 기본형 (5단계): 정사각형(흰 면 위, 변이 수평) 기준. 반 접기 두 번 → 양쪽 펼쳐 누르기
const H = 0.5;
export const waterbombBase = () => [
    { text: '흰 면이 위로 오게 놓고, 위쪽 절반을 아래로 접어 내려요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'f1' }] },
    { text: '오른쪽 절반을 왼쪽으로 접어 작은 정사각형을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], tag: 'f2' }] },
    {
      text: '위에 있는 날개를 세우고 틈을 벌린 뒤, 꾹 눌러 삼각형으로 펼쳐 눌러요.',
      sim: true,
      moves: squash(-1, and(has('f2'), has('f1')), and(has('f2'), not('f1'))),
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '반대쪽 날개도 똑같이 펼쳐 눌러요. 삼각형 기본형이 완성돼요.',
      sim: true,
      moves: squash(1, and(not('f2'), has('f1')), and(not('f2'), not('f1'))),
    },
];

// 물고기 기본형 (3단계): 마름모(흰 면 위) 기준. 양쪽 꼭짓점에서 22.5° 선으로 연 모양 선을 낸 뒤,
// 위아래 각각 토끼 귀 접기로 접어 오른쪽을 향한 세모 날개 두 개를 만든다.
// 토끼 귀 접기의 끝 상태: 두 연 선이 만나는 점 I=(0, ±t) (t = R·tan22.5°)에서
//  - 왼쪽 선 위쪽(x<0) 조각은 왼쪽 선을 따라 내려 접고(꼭대기 끝이 (t,0)으로 와서 오른쪽을 향한 세모가 된다)
//  - 오른쪽 선 위쪽(x>0) 조각은 오른쪽 선을 따라 내려 접은 뒤, 꼭대기 쪽 세모만 세로선 x=0을 따라 오른쪽으로 넘긴다.
const T = R * Math.tan(Math.PI / 8);
const kiteLine = (sx, sy) => [[sx * R, 0], [sx * R - sx * Math.cos(Math.PI / 8), sy * Math.sin(Math.PI / 8)]];
const rabbitEar = (sy) => [
  // 세로선 x=0 으로 조각을 먼저 나눠 둔다 (움직이지 않음). 꼭대기 쪽 세모가 왼쪽·오른쪽으로 갈라져야 한다
  { line: [[0, -1], [0, 1]], side: [0.1, 0], angle: 0, seam: true },
  { line: kiteLine(-1, sy), side: [-0.1, sy * 0.5], filter: (c) => c.x < 0 && sy * c.y > 0, toward: 1, tag: `fishL${sy}` },
  { line: kiteLine(1, sy), side: [0.1, sy * 0.5], filter: (c) => c.x > 0 && sy * c.y > 0, toward: 1, tag: `fishR${sy}` },
  { line: [[0, 0], [0, sy]], side: [-0.1, sy * T * 0.3], filter: (c) => c.tags.has(`fishR${sy}`) && c.x < 0, toward: 1, tag: `fishF${sy}` },
];
export const fishBase = () => [
  {
    text: '색깔 면이 아래로 가게 마름모로 놓고, 왼쪽 꼭짓점에서 위아래 변을 가운데 가로선에 맞춰 접었다 펴요.',
    moves: [
      { line: kiteLine(-1, 1), side: [-0.2, 0.5], unfold: true },
      { line: kiteLine(-1, -1), side: [-0.2, -0.5], unfold: true },
    ],
  },
  {
    text: '오른쪽 꼭짓점에서도 위아래 변을 가운데 가로선에 맞춰 접었다 펴요.',
    moves: [
      { line: kiteLine(1, 1), side: [0.2, 0.5], unfold: true },
      { line: kiteLine(1, -1), side: [0.2, -0.5], unfold: true },
    ],
  },
  { text: '위쪽은 접은 선대로 양옆을 함께 접어 내리면서, 가운데에 솟는 부분을 오른쪽으로 눕혀 세모로 눌러요.', sim: true, moves: rabbitEar(1) },
  { text: '아래쪽도 똑같이 접어 올리면서 가운데 부분을 오른쪽으로 눕혀요. 물고기 기본형이 완성돼요.', sim: true, moves: rabbitEar(-1) },
];
