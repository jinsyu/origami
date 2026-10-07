// 유령 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "An Easy Ghost" (Fumiaki Shingu) https://en.origami-club.com/easy/other/ghost2/
// 아래쪽을 연 모양으로 접고 날개 위를 바깥으로 되접은 뒤, 양옆과 머리를 접고 아래 끝을 옆으로 꺾어 꼬리를 만든다.
import { arc, fillPoly, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const C = Math.cos(Math.PI / 8), S = Math.sin(Math.PI / 8);
const W = Math.SQRT2 - 1; // 연 날개 바깥 꼭짓점의 |x| (tan 22.5°)
const K = 1 - R; // 연 날개 바깥 꼭짓점의 높이 (0.293)
const TONGUE = '#ef8a9a';
// 혀: 웃는 입 아래로 내민 U 모양
const TG = [[-0.077, 0.24], ...arc([-0.045, 0.215], 0.032, 0.048, 180, 360, 14), [-0.013, 0.24]];
const has = (t) => (c) => c.tags.has(t);

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  side: 양옆을 접는 선이 위 변과 만나는 점의 x (선의 다른 끝은 되접은 날개의 아래 모서리)
//  top: 머리 끝을 접어 내리는 가로선의 높이, t0~t3: 꼬리 접는 선의 두 점 (t0, t1), (t2, t3)
export const ghostParams = { side: -0.18, top: 0.525, t0: 0.049, t1: -0.372, t2: -0.2, t3: -0.602 };
export function makeGhost(P = ghostParams) {
  const { side, top, t0, t1, t2, t3 } = P;
  const corner = (sx) => [sx * W, K - W]; // 되접은 날개의 아래 모서리 (45° 선이 세로가 되게 접은 끝)
  return {
    id: 'ghost',
    name: '유령',
    level: 2,
    desc: '연 모양에서 날개를 되접고 아래 끝을 옆으로 꺾으면 꼬리가 달린 귀여운 유령이 돼요. 얼굴을 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#e7a9cf' },
    accent: '#b2608f',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: [0, 0, 1],
    done: '유령 완성! 메롱~',
    params: P,
    make: makeGhost,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 반으로 접었다 펴서 가운데 세로선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      {
        text: '아래쪽 두 변을 가운데 선에 맞춰 접어요.',
        moves: [1, -1].map((sx) => ({ line: [[0, -R], [sx * S, -R + C]], side: [sx * R, -0.1], tag: sx > 0 ? 'kiteR' : 'kiteL' })),
      },
      {
        text: '접은 날개의 위쪽을 점선에서 바깥으로 되접어요.',
        moves: [1, -1].map((sx) => ({ line: [[sx * W, K], [0, K - W]], side: [sx * 0.05, K - 0.02], filter: has(sx > 0 ? 'kiteR' : 'kiteL'), tag: 'out' })),
      },
      {
        text: '양옆을 점선에서 안쪽으로 접어요.',
        moves: [1, -1].map((sx) => ({ line: [[-sx * side, side + R], corner(sx)], side: [sx * 0.38, 0.2], tag: 'side' })),
      },
      { text: '위 끝을 점선에서 접어 내려요.', moves: [{ line: [[-1, top], [1, top]], side: [0, R] }] },
      { text: '아래 끝을 점선에서 옆으로 꺾어 접어요. 꼬리가 돼요.', moves: [{ line: [[t0, t1], [t2, t3]], side: [0, -R], tag: 'tail' }] },
      { text: '종이를 뒤집어요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } }], view: [0, 0, 1] },
      {
        text: '연필로 눈과 웃는 입을 그려요.',
        view: [0, 0, 1],
        draw: [
          { dot: [-0.11, 0.345], r: 0.022, ry: 0.036, color: PENCIL },
          { dot: [0.11, 0.345], r: 0.022, ry: 0.036, color: PENCIL },
          { line: arc([0, 0.32], 0.17, 0.085, 195, 345, 24), w: 0.009, color: PENCIL },
        ],
      },
      {
        text: '빨간 색연필로 메롱 내민 혀를 그리면 완성!',
        view: [0, 0, 1],
        draw: [
          fillPoly(TG, TONGUE),
          { line: TG, w: 0.007, color: PENCIL },
          { line: [[-0.045, 0.232], [-0.045, 0.2]], w: 0.005, color: PENCIL },
        ],
      },
    ],
  };
}
export const ghost = makeGhost();
