// 불독 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Bulldog Face" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/bulldog-face/
// 세모로 반 접고 앞장 끝을 올렸다 내려 코를, 뒷장 끝을 올려 턱을 만든 뒤, 양옆을 뒤로 접고 위 모서리를 접어 귀를 만든다.
import { fillPoly, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);
const not = (t) => (c) => !c.tags.has(t);

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  nose: 올린 끝을 다시 접어 내리는 가로선의 높이, chin: 뒷장 끝을 올리는 가로선의 높이, side: 양옆을 뒤로 접는 세로선의 |x|
//  earA: 귀 접는 선이 윗변과 만나는 점이 모서리에서 들어온 길이, earB: 그 선이 옆 변과 만나는 점이 모서리에서 내려온 길이
export const bulldogParams = { nose: -0.142, chin: -0.5, side: R / 2, earA: 0.21, earB: 0.092 };
export function makeBulldog(P = bulldogParams) {
  const { nose, chin, side, earA, earB } = P;
  const V = [0, -0.25, 1];
  return {
    id: 'bulldog',
    name: '불독 얼굴',
    level: 1,
    desc: '세모 끝을 올렸다 내려 코와 턱을 만들고, 위 모서리를 접어 귀를 내린 불독이에요. 얼굴을 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#e2702f' },
    accent: '#b14f17',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: V,
    done: '불독 얼굴 완성! 멍멍!',
    params: P,
    make: makeBulldog,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 반으로 접었다 펴서 가운데 세로선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, R], tag: 'top' }] },
      { text: '앞장의 아래 끝을 점선에서 위 끝까지 접어 올려요.', moves: [{ line: [[-1, -R / 2], [1, -R / 2]], side: [0, -R], filter: has('top'), tag: 'up' }] },
      { text: '올린 끝을 점선에서 조금 접어 내려요. 코가 돼요.', moves: [{ line: [[-1, nose], [1, nose]], side: [0, 0], filter: has('up') }] },
      { text: '뒷장의 아래 끝을 점선에서 접어 올려요. 턱이 돼요.', moves: [{ line: [[-1, chin], [1, chin]], side: [0, -R], filter: not('top'), tag: 'chin' }] },
      { text: '양옆을 세로 점선에서 뒤로 접어요.', moves: [1, -1].map((sx) => ({ line: [[sx * side, -1], [sx * side, 1]], side: [sx * R, -0.05], toward: -1 })) },
      {
        text: '위의 두 모서리를 점선에서 접어 내려요. 귀가 돼요.',
        moves: [1, -1].map((sx) => ({ line: [[sx * (side - earA), 0], [sx * side, -earB]], side: [sx * (side - 0.01), -0.01], tag: 'ear' })),
      },
      {
        text: '연필로 눈과 까만 코, 입을 그려요.',
        view: V,
        draw: [
          { dot: [-0.145, -0.095], r: 0.017, ry: 0.026, color: PENCIL },
          { dot: [0.145, -0.095], r: 0.017, ry: 0.026, color: PENCIL },
          fillPoly([[-0.14, -0.145], [0.14, -0.145], [0, -0.285]], PENCIL),
          { line: [[0, -0.285], [0, -0.355]], w: 0.009, color: PENCIL },
        ],
      },
      {
        text: '흰 볼에 연필로 콕콕 점을 찍으면 완성!',
        view: V,
        draw: [[-0.05, 0.06], [0.03, 0.05], [-0.07, -0.02], [0.0, -0.01], [0.07, -0.02], [-0.03, -0.07], [0.04, -0.08], [0.0, 0.1]].map(([dx, dy]) => [0.165 + dx, -0.3 + dy]).flatMap(([x, y]) => [-1, 1].map((sx) => ({ dot: [sx * x, y], r: 0.008, color: PENCIL }))),
      },
    ],
  };
}
export const bulldog = makeBulldog();
