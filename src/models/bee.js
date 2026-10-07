// 꿀벌 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Bee" (Fumiaki Shingu) https://en.origami-club.com/easy/other/bee2/
// 위를 접어 내리고 양옆을 뒤로 접은 뒤, 양쪽 모서리 주머니를 벌려 눌러 날개를 만들고 뒤집어 줄무늬를 그린다.
import { squashFlap } from './parts/folds.js';
import { bigEye, fillPoly, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);
// 몸통(아래 세모) 안의 가로 띠: 몸통 반폭은 날개 사이 V 아래쪽에서 min(-y + BV, y + BT)
const BV = -0.19, BT = R - 0.005;
const half = (y) => Math.max(0, Math.min(BV - y, y + BT) - 0.004);
const band = (y0, y1) => {
  const ys = [y0, ...((BV + -BT) / 2 < y0 && (BV + -BT) / 2 > y1 ? [(BV - BT) / 2] : []), y1];
  return fillPoly([...ys.map((y) => [half(y), y]), ...ys.reverse().map((y) => [-half(y), y])], PENCIL);
};

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  top: 위 꼭짓점을 접어 내리는 가로선의 높이 (양옆을 뒤로 접는 선도 이 높이의 가운데 점을 지난다)
//  wingA·wingC: 날개 접는 선이 뒤로 접은 변(y = -x + top 의 거울)과 만나는 점의 x, 아래 변과 만나는 점의 x (왼쪽 기준)
//  head: 머리 끝을 접어 내리는 선이 꼭대기에서 내려온 길이
export const beeParams = { top: 0.259, wingA: -R / 2, wingC: -0.226, head: 0.1 };
export function makeBee(P = beeParams) {
  const { top, wingA, wingC, head } = P;
  // 왼쪽 날개: A 는 뒤로 접은 변 y = x + top 위, C 는 왼쪽 아래 변 y = -x - R 위
  const A = (sx) => [-sx * wingA, wingA + top], C = (sx) => [-sx * wingC, -wingC - R];
  const wing = (sx) => {
    const a = A(sx), c = C(sx);
    const hd = [c[0] - a[0], c[1] - a[1]];
    const sd = [sx, -1]; // 등선(뒤로 접은 변)을 따라 날개 끝 쪽으로
    const side = (q) => (c[0] - a[0]) * (q.y - a[1]) - (c[1] - a[1]) * (q.x - a[0]);
    // 경첩 바깥(날개 끝 쪽) 조각: 앞장은 몸통, 뒷장은 뒤로 접은 띠
    const corner = { x: sx * 0.48, y: -0.22 };
    const out = (q) => Math.sign(side(q)) === Math.sign(side(corner));
    return squashFlap({ V: a, hd, sd, outer: (q) => out(q) && q.tags.has(`back${sx}`), inner: (q) => out(q) && !q.tags.has(`back${sx}`), faceTag: `wing${sx}`, size: 0.5 });
  };
  return {
    id: 'bee',
    name: '꿀벌',
    level: 2,
    desc: '양쪽 모서리 주머니를 벌려 눌러 날개를 만드는 꿀벌이에요. 눈과 줄무늬를 그려 주세요.',
    paper: '정사각형 색종이 (노란색)',
    colors: { front: '#fbf8f1', back: '#f7c234' },
    accent: '#c98f0a',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: [0, -0.2, 1],
    done: '꿀벌 완성! 윙윙~',
    params: P,
    make: makeBee,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '위 꼭짓점을 점선에서 접어 내려요.', moves: [{ line: [[-1, top], [1, top]], side: [0, R], tag: 'head' }] },
      {
        text: '양쪽 위를 점선에서 뒤로 접어요.',
        moves: [1, -1].map((sx) => ({ line: [[0, top], [-sx, top - 1]], side: [-sx * R, 0.1], toward: -1, tag: `back${-sx}` })),
      },
      {
        text: '양쪽 모서리를 점선에서 접었다 펴서 선을 만들어요.',
        moves: [-1, 1].map((sx) => ({ line: [A(sx), C(sx)], side: [sx * R, -0.22], unfold: true })),
      },
      { text: '왼쪽 모서리 주머니를 벌리고 꾹 눌러 펴요. 날개가 돼요.', sim: true, moves: wing(-1) },
      { text: '오른쪽도 똑같이 벌려 눌러요.', sim: true, moves: wing(1) },
      { text: '위 끝을 점선에서 조금 접어 내려요.', moves: [{ line: [[-1, top - head], [1, top - head]], side: [0, top] }] },
      { text: '종이를 뒤집어요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } }], view: [0, -0.2, 1] },
      {
        text: '연필로 큰 눈과 날개 무늬를 그려요.',
        view: [0, -0.2, 1],
        draw: [
          ...[-1, 1].flatMap((sx) => bigEye(sx * 0.08, 0.1, 0.05, { look: [0, 0.3] })),
          ...[-1, 1].flatMap((sx) => [
            { line: [[sx * 0.36, -0.2], [sx * 0.22, -0.14]], w: 0.012, color: PENCIL },
            { line: [[sx * 0.31, -0.33], [sx * 0.2, -0.21]], w: 0.012, color: PENCIL },
          ]),
        ],
      },
      {
        text: '몸에 굵은 줄무늬를 칠하고 꼬리 끝을 까맣게 칠하면 완성!',
        view: [0, -0.2, 1],
        draw: [band(-0.33, -0.39), band(-0.47, -0.53), band(-0.6, -0.71)],
      },
    ],
  };
}
export const bee = makeBee();
