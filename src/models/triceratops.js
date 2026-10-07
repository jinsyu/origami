// 트리케라톱스 (정사각형 색종이)
// 출처: Origami Club "A Triceratops" (Fumiaki Shingu) https://en.origami-club.com/easy/dinosaur/triceratops/
// 세모로 반 접고 앞장 모서리를 가운데로 접은 뒤 대각선에서 뒤로 접어 세모를 만들고, 뾰족한 끝을 비스듬히 접어 뿔을 낸다.
import { bigEye, PENCIL } from './parts/draw.js';
const H = 0.5;
const SPOT = '#7a2350';
const has = (t) => (c) => c.tags.has(t);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  hornA: 뿔 접는 선이 왼쪽 비탈(y=x)과 만나는 점의 x, hornB: 그 선이 밑변과 만나는 점의 x
//  leg: 뒤집은 뒤 왼쪽 끝을 접는 선이 밑변과 만나는 x, legTilt: 그 선이 세로에서 기운 각도(도) — 도안 완성 그림처럼 다리 끝이 몸 아래로 조금 나온다
export const triceratopsParams = { hornA: -0.385, hornB: -0.186, leg: -0.284, legTilt: 10 };
export function makeTriceratops(P = triceratopsParams) {
  const { hornA, hornB, leg, legTilt } = P;
  return {
    id: 'triceratops',
    name: '트리케라톱스',
    level: 2,
    desc: '세모로 접고 뾰족한 끝을 비스듬히 접으면 뿔이 솟은 트리케라톱스가 돼요. 얼굴과 무늬를 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#f59bc6' },
    accent: '#c2558a',
    outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
    view: [0.3, -0.45, 1],
    finalView: [0, -0.25, 1],
    done: '트리케라톱스 완성! 뿔이 멋져요.',
    params: P,
    make: makeTriceratops,
    steps: [
      { text: '색깔 면이 아래로 가게 놓고, 대각선으로 반 접었다 펴요.', moves: [{ line: [[-H, -H], [H, H]], side: [-H, H], unfold: true }] },
      { text: '다른 대각선으로 반 접어 세모를 만들어요.', moves: [{ line: [[-H, H], [H, -H]], side: [H, H], tag: 'half' }] },
      { text: '앞장의 왼쪽 아래 모서리를 가운데 점에 맞춰 접어요.', moves: [{ line: [[-H, 0], [0, -H]], side: [-H, -H], filter: has('half'), tag: 'flap' }] },
      { text: '접은 선을 따라 왼쪽 위를 뒤로 접어요.', moves: [{ line: [[-1, -1], [1, 1]], side: [-H, H], toward: -1, tag: 'back' }] },
      { text: '왼쪽 끝을 비스듬한 점선에서 위로 접어 올려요. 뿔이 돼요.', moves: [{ line: [[hornA, hornA], [hornB, -H]], side: [-H, -H], tag: 'horn' }] },
      { text: '종이를 뒤집어요.', moves: [flip], view: [0, -0.25, 1] },
      { text: '앞장의 왼쪽 끝을 점선에서 오른쪽으로 접어요. 끝이 아래로 조금 나오게 하면 다리가 돼요.', moves: [{ line: [[leg, -H], [leg + Math.tan((legTilt * Math.PI) / 180), 1 - H]], grab: [leg - 0.05, -H + 0.02], tag: 'leg' }] },
      {
        text: '연필로 눈과 머리 장식의 줄무늬를 그려요.',
        view: [0, -0.25, 1],
        draw: [
          ...bigEye(0.235, -0.37, 0.032, { look: [0.5, -0.2], brow: -0.8, side: 1 }),
          // 머리 장식: 비스듬한 굵은 줄 셋 (아래 왼쪽에서 위 오른쪽으로 늘어섬)
          ...[[0.035, -0.345], [0.085, -0.285], [0.14, -0.235]].map(([x, y]) => ({ line: [[x - 0.025, y + 0.033], [x + 0.025, y - 0.033]], w: 0.016, color: PENCIL })),
        ],
      },
      {
        text: '색연필로 몸에 점무늬를 그리면 완성!',
        view: [0, -0.25, 1],
        draw: [[-0.06, -0.07], [-0.04, -0.2], [-0.14, -0.15], [-0.03, -0.34], [-0.13, -0.28], [-0.22, -0.24], [-0.1, -0.43], [-0.2, -0.4], [-0.32, -0.38], [-0.05, -0.12]].map(([x, y]) => ({ dot: [x, y], r: 0.012, color: SPOT })),
      },
    ],
  };
}
export const triceratops = makeTriceratops();
