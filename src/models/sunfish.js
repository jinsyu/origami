// 개복치 (정사각형 색종이)
// 출처: Origami Club "A Headfish" (Fumiaki Shingu) https://en.origami-club.com/easy/sea/headfish/
// 양옆을 가운데로 접고 위아래를 접었다 편 뒤, 아래쪽을 벌려 눌러 위아래로 솟은 지느러미를 만들고 머리 모서리를 접는다.
import { arc, PENCIL } from './parts/draw.js';
const H = 0.5, Q = 0.25;
const has = (t) => (c) => c.tags.has(t);
const flap = (c) => c.tags.has('flapL') || c.tags.has('flapR');

// 아래쪽 벌려 누르기: 앞의 두 날개(가운데에서 만난 띠)를 비스듬한 선에서 바깥으로 젖히고, 젖힌 끝을 다시 접어 넘긴 뒤,
// 뒤판 아래 끝을 위로 접어 올린다. 끝 모양: 아래가 위아래(지금은 좌우)로 넓게 퍼진 사다리꼴 지느러미.
const squash = (sx) => {
  const t = sx > 0 ? 'flapR' : 'flapL';
  const pull = `pull${sx}`;
  return [
    // 날개의 아래쪽 반에서 가운데 꼭짓점 (0,0) 에서 내려가는 비스듬한 선 바깥을 젖힌다
    { line: [[0, 0], [sx, -1]], side: [sx * 0.05, -0.4], filter: (c) => has(t)(c) && c.y < 0 && sx * c.x + c.y < 0, toward: 1, tag: pull, at: [0, 0.6] },
    // 젖혀져 바깥으로 나간 끝을 지느러미 변(점 (sx·Q, -Q) 와 (0, -H) 를 잇는 선)에서 다시 접어 넘긴다
    { line: [[sx * Q, -Q], [0, -H]], side: [sx * 0.4, -0.2], filter: (c) => has(pull)(c) && sx * c.x - c.y > H, toward: 1, at: [0.3, 0.9] },
  ];
};

export const sunfishParams = {};
export function makeSunfish() {
  return {
    id: 'sunfish',
    name: '개복치',
    level: 2,
    desc: '아래쪽을 벌려 눌러 위아래로 큰 지느러미를 만드는 개복치예요. 눈을 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#b48ac8' },
    accent: '#7d4f99',
    outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
    view: [0.3, -0.45, 1],
    finalView: [0, 0, 1],
    done: '개복치 완성! 바다를 둥둥 떠다녀요.',
    steps: [
      { text: '색깔 면이 아래로 가게 놓고, 반으로 접었다 펴서 가운데 세로선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      {
        text: '양옆을 가운데 선에 맞춰 접어요.',
        moves: [1, -1].map((sx) => ({ line: [[sx * Q, -1], [sx * Q, 1]], side: [sx * H, 0], tag: sx > 0 ? 'flapR' : 'flapL' })),
      },
      {
        text: '위와 아래를 가운데에 맞춰 접어요.',
        moves: [1, -1].map((sy) => ({ line: [[-1, sy * Q], [1, sy * Q]], side: [0, sy * H], tag: sy > 0 ? 'endT' : 'endB' })),
      },
      {
        text: '접은 위와 아래를 다시 펴요.',
        moves: [1, -1].map((sy) => ({ line: [[-1, sy * Q], [1, sy * Q]], side: [0, sy * 0.1], filter: has(sy > 0 ? 'endT' : 'endB'), toward: 1 })),
      },
      {
        text: '아래쪽 가운데를 양옆으로 벌리고, 아래 끝을 위로 올리면서 꾹 눌러 펴요. 지느러미가 생겨요.',
        sim: true,
        moves: [
          ...squash(1), ...squash(-1),
          { line: [[-1, -Q], [1, -Q]], side: [0, -0.45], filter: (c) => !flap(c) && c.y < -Q, toward: 1, at: [0.4, 1] },
        ],
      },
      { text: '지느러미가 오른쪽으로 가게 돌려요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: 90 } }], view: [0, 0, 1] },
      {
        text: '왼쪽 끝의 두 모서리를 점선에서 접어 뾰족한 머리를 만들어요.',
        moves: [1, -1].map((sy) => ({ line: [[-H, 0], [-Q, sy * Q]], side: [-H, sy * Q], toward: 1 })),
      },
      { text: '위아래로 뒤집어요.', moves: [{ spin: { a: [0, 0, 0], b: [1, 0, 0], angle: 180 } }], view: [0, 0, 1] },
      {
        text: '연필로 동그란 눈을 그리면 완성!',
        view: [0, 0, 1],
        draw: [
          { line: arc([-0.19, 0.06], 0.06, 0.06, 0, 360, 32), w: 0.009, color: PENCIL },
          { dot: [-0.19, 0.06], r: 0.03, color: PENCIL },
        ],
      },
    ],
  };
}
export const sunfish = makeSunfish();
