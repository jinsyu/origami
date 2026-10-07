// 말 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Horse (face)" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/horse/
// 아래 꼭짓점을 뒤로 접어 흰 코를 만들고, 양옆을 접은 뒤 위 꼭짓점을 내렸다 다시 올려 귀를 만들고, 반으로 접어 옆얼굴로 돌린다.
// 접는 선 높이(위를 내리는 선, 다시 올리는 선)는 도안 그림에 맞춰 정했다 (scripts/diagram.mjs horse --fit).
import { through, along, pointToPoint } from './parts/axioms.js';
import { eye, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);

// side: 옆을 접는 선이 위 변과 만나는 자리(옆 꼭짓점에서 위 꼭짓점까지 비율), top: 위 꼭짓점을 내리는 선 높이,
// back: 내린 부분을 다시 올리는 선 높이, turn: 마지막에 돌리는 각도(도) — 모두 R 비율
export const horseParams = { side: 0.22, top: 0.29, back: 0.06, turn: -40 }; // 도안 그림에 맞춘 값 (맞추기 결과 0.219·0.288·0.060)
export function makeHorse({ side, top, back, turn } = horseParams) {
  const L = [-R, 0], T = [0, R], Rt = [R, 0];
  const yT = top * R, yB = back * R;
  const sides = [-1, 1];
  return {
    id: 'horse',
    name: '말 얼굴',
    level: 2,
    desc: '위 꼭짓점을 내렸다 다시 올리면 귀가, 아래를 뒤로 접으면 흰 코가 생겨요. 반으로 접어 옆얼굴을 만들어요.',
    paper: '정사각형 색종이 (갈색·살구색)',
    colors: { front: '#fbf8f1', back: '#f2cf7c' },
    accent: '#c08a2c',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: [0, 0, 1],
    done: '말 얼굴 완성! 히힝~',
    params: { side, top, back, turn },
    make: makeHorse,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '아래 꼭짓점을 가운데에 맞춰 접었다 펴서 선을 만들어요.', moves: [{ line: pointToPoint([0, -R], [0, 0]), side: [0, -R], unfold: true }] },
      { text: '아래 꼭짓점을 방금 만든 선에 맞춰 뒤로 접어요. 흰 코가 돼요.', moves: [{ line: pointToPoint([0, -R], [0, -R / 2]), side: [0, -R], toward: -1, tag: 'nose' }] },
      {
        text: '양쪽 모서리를 점선을 따라 안으로 접어요.',
        // 위 변 위의 점에서 아래 접힌 변의 끝까지
        moves: sides.map((sx) => ({ line: through(along([sx < 0 ? L : Rt, T], side), [sx * R / 4, -3 * R / 4]), side: [sx * (R - 0.02), 0] })),
      },
      { text: '위 꼭짓점을 점선에서 접어 내려요.', moves: [{ line: [[-1, yT], [1, yT]], side: [0, R], tag: 'top' }] },
      { text: '내린 부분을 점선에서 다시 접어 올려요. 귀가 돼요.', moves: [{ line: [[-1, yB], [1, yB]], side: [0, (yB + 2 * yT - R) / 2], filter: has('top') }] },
      {
        text: '양쪽 위 모서리를 흰 세모의 아래 모서리에 맞춰 접어요.',
        moves: sides.map((sx) => {
          const corner = [sx * (R - yT), yT], target = [sx * (yB - 2 * yT + R), yB];
          return { line: pointToPoint(corner, target), side: [corner[0] - sx * 0.01, corner[1] - 0.005] };
        }),
      },
      { text: '왼쪽을 오른쪽으로 반 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [-0.3, 0] }] },
      { text: '말 얼굴이 비스듬히 서도록 돌려요.', moves: [{ spin: { a: [R / 4, 0, 0], b: [R / 4, 0, 1], angle: turn } }], view: [0, 0, 1] },
      { text: '연필로 눈과 콧구멍을 그리면 완성!', view: [0, 0, 1], draw: [...eye(0.105, 0.015, 0.034), { dot: [-0.255, -0.28], r: 0.011, ry: 0.017, color: PENCIL }] },
    ],
  };
}
export const horse = makeHorse();
