// 튤립 꽃봉오리 (정사각형 색종이)
// 반으로 두 번 접은 뒤 양쪽을 펼쳐 눌러(squash) 물풍선 기본형(삼각형)을 만들고,
// 앞뒤 날개 끝을 꼭대기로 접어 올려 꽃봉오리를 만든다.
//
// 펼쳐 누르기(정사각 날개 → 삼각형): 날개는 경첩(세로 접힌 선)과 등선(윗변 접힌 선)이 만나는 꼭짓점을 가진다.
//  - 바깥 겹: 등선 쪽 삼각형을 꼭짓점의 이등분선을 따라 안으로 접는다.
//  - 안쪽 겹: 등선 쪽 삼각형을 이등분선으로 접어 올린 뒤, 겹 전체를 경첩 건너편으로 펼친다.
// 이렇게 하면 경첩과 등선이 모두 이어진 채로 날개가 삼각형으로 눌린다.
const H = 0.5;
import { flip } from './parts/folds.js';
import { waterbombBase } from './parts/bases.js';
// 접는 선은 아래 가운데 점(앞 날개 두 장이 이어진 곳)을 지나야 종이가 갈라지지 않는다.
// 40° 선으로 접으면 날개 끝이 꼭대기 높이에서 살짝 바깥쪽에 닿는다
const PC = Math.cos((40 * Math.PI) / 180), PS = Math.sin((40 * Math.PI) / 180);
const petals = (front) => [
  { line: [[0, -H], [PC, -H + PS]], side: [0.45, -0.48], filter: (c) => front(c) && c.x > 0, tag: 'petal' },
  { line: [[0, -H], [-PC, -H + PS]], side: [-0.45, -0.48], filter: (c) => front(c) && c.x < 0, tag: 'petal' },
];

export const tulip = {
  id: 'tulip',
  name: '튤립 꽃봉오리',
  level: 3,
  desc: '날개를 벌려 눌러 삼각형 기본형을 만들고, 날개 끝을 모아 꽃봉오리를 만들어요. 펼쳐 눌러 접기를 배워요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e2557b' },
  accent: '#c43a62',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0.15, -0.25, 1],
  done: '튤립 꽃봉오리 완성! 줄기를 그리거나 빨대에 끼워 보세요.',
  steps: [
    ...waterbombBase(),
    {
      text: '앞쪽 날개의 양쪽 아래 끝을 아래 가운데 점에서 비스듬히 접어 올려 꼭대기 옆에 맞춰요. 꽃잎이 돼요.',
      moves: petals((c) => !c.tags.has('f2')),
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '이쪽 날개도 똑같이 비스듬히 접어 올려요.',
      moves: petals((c) => c.tags.has('f2')),
    },
    { text: '다시 뒤집으면 튤립 꽃봉오리 완성!', moves: [flip], view: [0, 0.4, 1] },
  ],
};
