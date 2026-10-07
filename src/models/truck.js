// 트럭 (정사각형 색종이)
// 출처: Origami Club "A Track" (Fumiaki Shingu) https://en.origami-club.com/easy/vehicle/track/
// 아래 띠의 양 끝을 내려 접어 바퀴를 만들고, 뒤집어 위를 접어 내린 뒤 오른쪽을 비스듬히 두 번 접어 운전석을 세운다.
// 접는 선은 도안 문장대로 작도하고(parts/axioms.js), 바퀴 크기·운전석 위치는 도안 그림에 맞춰 정했다 (scripts/diagram.mjs --fit).
import { through, parallelThrough } from './parts/axioms.js';
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
const DIAG = [[0, 0], [1, 1]]; // 오른쪽 위로 45° 기운 방향
const ANTI = [[0, 0], [1, -1]]; // 오른쪽 아래로 45° 기운 방향

// wheel: 바퀴 접는 선이 띠 윗변과 만나는 점의 x (가운데에서), cab: 운전석 모서리 선이 윗변과 만나는 점의 x
export const truckParams = { wheel: H / 6, cab: H / 2 }; // 도안 그림에 맞춘 값 (맞추기 결과 0.083·0.255)
export function makeTruck({ wheel, cab } = truckParams) {
  const B = -H + H / 3; // 띠를 접는 선: 아래 절반의 1/3
  const T = H / 3; // 위를 접어 내리는 선: 위 절반의 1/3 높이 (가운데 선 위)
  return {
    id: 'truck',
    name: '트럭',
    level: 2,
    desc: '띠 끝을 내려 접으면 바퀴가, 오른쪽을 비스듬히 두 번 접으면 운전석이 생겨요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#5ab4e5' },
    accent: '#2b86b8',
    outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
    view: [0.3, -0.45, 1],
    finalView: [0, 0, 1],
    done: '트럭 완성! 짐을 싣고 출발해요.',
    params: { wheel, cab },
    make: makeTruck,
    steps: [
      { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '아래 절반을 셋으로 나눈 첫 선에서 아래 변을 접어 올려요.', moves: [{ line: [[-1, B], [1, B]], side: [0, -1], tag: 'band' }] },
      {
        text: '띠의 양 끝을 점선을 따라 비스듬히 내려 접어요. 바퀴가 돼요.',
        // 띠 윗변의 점에서 띠 아래 모서리(접힌 변의 끝)까지
        moves: [-1, 1].map((sx) => ({
          line: through([sx * wheel, B + H / 3], [sx * H, B]),
          side: [sx * (H - 0.02), B + H / 3 - 0.01],
          filter: has('band'),
          tag: 'wheel',
        })),
      },
      { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
      { text: '위 절반을 셋으로 나눈 첫 선에서 위쪽을 접어 내려요.', moves: [{ line: [[-1, T], [1, T]], side: [0, 1], tag: 'roof' }] },
      {
        text: '내린 부분의 오른쪽 아래를 점선을 따라 비스듬히 접어 올려요.',
        // 내린 부분의 오른쪽 위 모서리에서 45° 로: 아래 변과 만나는 점은 가운데에서 1/3
        moves: [{ line: parallelThrough(DIAG, [H, T]), side: [H - 0.02, -T + 0.02], filter: has('roof') }],
      },
      {
        text: '오른쪽 위 모서리를 점선을 따라 비스듬히 접어 내려요. 운전석이 돼요.',
        moves: [{ line: parallelThrough(ANTI, [cab, T]), side: [H - 0.01, T - 0.01] }],
      },
    ],
  };
}
export const truck = makeTruck();
