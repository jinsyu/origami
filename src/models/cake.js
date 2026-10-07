// 케이크 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Shortcake" (Fumiaki Shingu) https://en.origami-club.com/easy/food/cake/
// 세모로 접은 뒤 앞 장의 꼭짓점을 내렸다 올렸다 네 번 접어 크림 무늬(톱니)를 만들고,
// 위를 뒤로 계단 접기해 크림 층을, 남은 꼭짓점을 내려 딸기를 만든다. 양옆을 뒤로 접어 컵 모양으로.
// 톱니 크기·계단 높이·딸기·옆 선은 도안 그림에 맞춰 정했다 (scripts/diagram.mjs cake --fit).
import { through } from './parts/axioms.js';
import { pleat } from './parts/folds.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);
const hor = (y) => [[-1, y], [1, y]];

// tooth: 톱니 하나의 높이(밑변은 두 배), step: 계단 접기 아래 선 높이, width: 계단 폭,
// berry: 딸기(꼭짓점을 내려 접는 깊이), cupTop·cupTopY·cupBot: 옆을 뒤로 접는 선의 위·아래 점 — 모두 R 비율
export const cakeParams = { tooth: 0.106, step: 0.69, width: 0.062, berry: 0.127, cupTop: 0.427, cupTopY: 0.543, cupBot: 0.335 }; // 도안 그림에 맞춘 값
export function makeCake(P = cakeParams) {
  const { tooth, step, width, berry, cupTop, cupTopY, cupBot } = P;
  // 톱니 무늬: 앞 장 꼭짓점을 a2 에서 내리고 a3 에서 올리고 다시 a2 에서 내리고 a3 에서 올린다.
  // a2 = 1 - 4·tooth, a3 = a2 - tooth 이면 흰 톱니 4개와 분홍 톱니 3개가 같은 크기로 번갈아 선다
  const a2 = (1 - 4 * tooth) * R, a3 = a2 - tooth * R;
  const tip1 = 2 * a2 - R, tip2 = 2 * a3 - tip1, tip3 = 2 * a2 - tip2; // 차례로 접힌 꼭짓점의 높이
  const top = R - 2 * width * R; // 계단 접기 뒤 꼭짓점 높이
  return {
    id: 'cake',
    name: '케이크',
    level: 2,
    desc: '꼭짓점을 내렸다 올렸다 하면 크림 톱니가, 위를 뒤로 계단 접기하면 크림 층과 딸기가 생겨요.',
    paper: '정사각형 색종이 (분홍)',
    colors: { front: '#fbf8f1', back: '#f191c6' },
    accent: '#d0559a',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: [0, -0.2, 1],
    done: '케이크 완성! 딸기 케이크 한 조각이에요.',
    params: { ...P },
    make: makeCake,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 세로로 반 접었다 펴서 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어 세모를 만들어요.', moves: [{ line: hor(0), side: [0, -R], tag: 'front' }] },
      { text: '앞 장의 위 꼭짓점을 점선에서 접어 내려요.', moves: [{ line: hor(a2), side: [0, R], filter: has('front'), tag: 'c1' }] },
      { text: '내린 꼭짓점을 점선에서 다시 접어 올려요.', moves: [{ line: hor(a3), side: [0, (a3 + tip1) / 2], filter: has('c1'), tag: 'c2' }] },
      { text: '올린 꼭짓점을 위쪽 점선에서 다시 접어 내려요.', moves: [{ line: hor(a2), side: [0, (a2 + tip2) / 2], filter: has('c2'), tag: 'c3' }] },
      { text: '내린 꼭짓점을 아래쪽 점선에서 다시 접어 올려요. 크림 톱니가 생겨요.', moves: [{ line: hor(a3), side: [0, (a3 + tip3) / 2], filter: has('c3') }] },
      {
        text: '위쪽 흰 부분을 점선에서 뒤로 계단 접기해요.',
        sim: true,
        moves: pleat({ a: hor(step * R), far: [0, R], width: width * R, toward: -1 }),
      },
      { text: '위 꼭짓점을 점선에서 접어 내려요. 딸기가 돼요.', moves: [{ line: hor(top - berry * R), side: [0, top - 0.005] }] },
      {
        text: '양옆을 점선을 따라 뒤로 접어요.',
        moves: [-1, 1].map((sx) => ({ line: through([sx * cupTop * R, cupTopY * R], [sx * cupBot * R, 0]), side: [sx * R * 0.9, 0.02], toward: -1 })),
      },
      {
        text: '가운데 선을 살짝 접어 세우면 완성!',
        moves: [-1, 1].map((sx) => ({ line: [[0, -1], [0, 1]], side: [sx * 0.2, 0.1], toward: -1, angle: 20 })),
        view: [0.4, 0.1, 1],
      },
    ],
  };
}
export const cake = makeCake();
