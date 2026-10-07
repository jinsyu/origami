// 호랑이 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Tiger(face)" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/tiger-face/
// 세모의 양쪽을 아래로 내렸다가 끝을 위로 올려 뾰족한 귀를 만들고, 양옆과 위를 접은 뒤 뒤집어 흰 입을 만든다.
import { eye, fillPoly, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2, A = R / 2;
const has = (t) => (c) => c.tags.has(t);
const not = (t) => (c) => !c.tags.has(t);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
const mirror = (L) => L.map(([x, y]) => [-x, y]);
const STRIPE = '#2b2620';

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  earY: 귀 접는 선이 가운데 선과 만나는 높이, earX: 귀 접는 선이 날개 아래 변과 만나는 점의 x
//  side: 양옆을 접는 세로선의 x, top: 위 끝을 접어 내리는 선의 높이, chin: 아래 끝을 접는 선의 높이, nose: 흰 세모 끝을 접는 선의 높이
export const tigerParams = { earY: -0.344, earX: 0.258, side: 0.25, top: -0.137, chin: -0.55, nose: -0.43 };
export function makeTiger(P = tigerParams) {
  const { earY, earX, side, top, chin, nose } = P;
  const EAR = [[0, earY], [earX, -A - (A - earX)]]; // 날개 아래 변 (A,-A)→(0,-R) 위의 점
  return {
    id: 'tiger',
    name: '호랑이 얼굴',
    level: 2,
    desc: '양쪽 날개 끝을 위로 올려 뾰족한 귀를 만들고, 뒤집어 아래를 접으면 흰 입이 나와요. 줄무늬를 그려 주세요.',
    paper: '정사각형 색종이 (노란색)',
    colors: { front: '#fbf8f1', back: '#f4c430' },
    accent: '#c08a10',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: [0, -0.3, 1],
    done: '호랑이 얼굴 완성! 어흥!',
    params: P,
    make: makeTiger,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 반으로 접었다 펴서 가운데 세로선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, R], tag: 'top' }] },
      {
        text: '양쪽 모서리를 가운데 선에 맞춰 아래로 접어요.',
        moves: [
          { line: [[0, 0], [1, -1]], side: [R, 0], tag: 'flapR' },
          { line: [[0, 0], [-1, -1]], side: [-R, 0], tag: 'flapL' },
        ],
      },
      {
        text: '내린 날개의 아래 끝을 점선에서 위로 접어 올려요. 뾰족한 귀가 돼요.',
        moves: [
          { line: EAR, side: [0.02, -0.65], filter: has('flapR'), tag: 'ear' },
          { line: mirror(EAR), side: [-0.02, -0.65], filter: has('flapL'), tag: 'ear' },
        ],
      },
      {
        text: '양쪽 모서리를 세로 점선에서 안쪽으로 접어요.',
        moves: [1, -1].map((sx) => ({ line: [[sx * side, -1], [sx * side, 1]], side: [sx * A, -A], filter: not('ear'), tag: 'side' })),
      },
      { text: '위 끝을 점선에서 접어 내려요.', moves: [{ line: [[-1, top], [1, top]], side: [0, -0.02], filter: not('ear') }] },
      { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
      { text: '아래 끝의 앞장만 점선에서 위로 접어 올려요.', moves: [{ line: [[-1, chin], [1, chin]], side: [0, -R], filter: not('top'), tag: 'chin' }] },
      { text: '남은 아래 끝은 점선에서 뒤로 접어요.', moves: [{ line: [[-1, chin], [1, chin]], side: [0, -R], toward: -1 }] },
      { text: '흰 세모의 끝을 점선에서 조금 접어 내려요.', moves: [{ line: [[-1, nose], [1, nose]], side: [0, nose + 0.02], filter: has('chin') }] },
      {
        text: '연필로 눈과 코, 입을 그려요.',
        view: [0, -0.3, 1],
        draw: [
          ...eye(-0.11, -0.31, 0.028), ...eye(0.11, -0.31, 0.028),
          fillPoly([[-0.045, -0.425], [0.045, -0.425], [0, -0.47]], PENCIL),
          { line: [[0, -0.47], [0, -0.495]], w: 0.007, color: PENCIL },
        ],
      },
      {
        text: '검은 색연필로 이마와 양 볼에 줄무늬를 그리면 완성!',
        view: [0, -0.3, 1],
        draw: [
          // 이마: 윗변에서 내려오는 뾰족한 무늬
          ...[-0.15, -0.05, 0.05, 0.15].map((x) => fillPoly([[x - 0.035, -0.137], [x + 0.035, -0.137], [x, -0.2]], STRIPE)),
          // 양 볼: 옆 변에서 들어오는 가로 줄
          ...[-1, 1].flatMap((sx) => [-0.26, -0.31, -0.36].map((y) => fillPoly([[sx * 0.25, y + 0.012], [sx * 0.175, y + 0.008], [sx * 0.165, y], [sx * 0.175, y - 0.008], [sx * 0.25, y - 0.012]], STRIPE))),
        ],
      },
    ],
  };
}
export const tiger = makeTiger();
