// 셔츠 (정사각형 색종이)
// 출처: Origami Club "A Shirt" https://en.origami-club.com/easy/clothes/shirt/ (작·도: 新宮文明)
// 위 끝을 조금 뒤로 접고 양옆을 가운데로 접은 뒤, 뒤에서 넘어온 흰 띠를 끄집어내 깃을 만들고 아래를 접어 소매를 낸다.
import { PENCIL } from './parts/draw.js';
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  band: 뒤로 접는 위 띠의 폭, collar: 깃 접는 선이 가운데 선에서 띠 위 끝보다 내려간 길이, hem: 아래를 접어 올리는 선의 높이 (도안 글은 '뒤로'지만 그림·애니메이션은 앞으로 올려 깃 밑에 끼운다)
export const shirtParams = { band: 0.095, collar: 0.035, hem: -0.065 };
export function makeShirt(P = shirtParams) {
  const { band, collar, hem } = P;
  const T = H - band; // 띠를 접은 뒤 위 끝
  // 깃 접는 선: 겉 모서리 (±H/2, T) 에서 가운데 (0, T - collar) 까지
  const CL = (sx) => [[sx * H / 2, T], [0, T - collar]];
  const flap = (sx) => has(sx > 0 ? 'flapR' : 'flapL');
  // 접어 올리면 깃 아래 끝(가운데 약 y=0.22)보다 위로 가는 부분: 지금 자리 y < 2·hem - 0.22
  const TUCK = 2 * hem - 0.22, INS = 1;
  return {
    id: 'shirt',
    name: '셔츠',
    level: 2,
    desc: '흰 띠를 끄집어내 깃을 만들고, 아래를 접으면 소매가 나오는 셔츠예요. 단추를 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#9fd17e' },
    accent: '#4f8f2f',
    outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
    view: [0.3, -0.45, 1],
    finalView: [0, 0.18, 1],
    done: '셔츠 완성! 단추를 더 그려도 좋아요.',
    params: P,
    make: makeShirt,
    steps: [
      { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '위 끝을 점선에서 조금 뒤로 접어요.', moves: [{ line: [[-1, T], [1, T]], side: [0, H], toward: -1, tag: 'band' }] },
      {
        text: '양옆을 가운데 선에 맞춰 접어요. 위에 흰 띠가 보여요.',
        moves: [1, -1].map((sx) => ({ line: [[sx * H / 2, -1], [sx * H / 2, 1]], side: [sx * H, 0], tag: sx > 0 ? 'flapR' : 'flapL' })),
      },
      {
        text: '흰 띠의 가운데 끝을 비스듬한 점선에서 접었다 펴요.',
        moves: [1, -1].map((sx) => ({ line: CL(sx), side: [sx * 0.03, T - 0.005], filter: flap(sx), unfold: true })),
      },
      {
        text: '흰 띠를 위로 끄집어내 펴고, 접은 선대로 앞으로 내려 접어요. 깃이 생겨요.',
        sim: true,
        moves: [1, -1].flatMap((sx) => [
          { line: [[-1, T], [1, T]], side: [sx * 0.1, T - 0.02], filter: (c) => flap(sx)(c) && has('band')(c), toward: 1, tag: 'collar', at: [0, 0.8] },
          { line: CL(sx), side: [sx * 0.03, T + 0.02], filter: flap(sx), toward: 1, tag: 'collar', at: [0.3, 1] },
        ]),
      },
      {
        text: '아래쪽 가운데의 세모를 비스듬한 점선에서 바깥으로 접어요. 소매가 돼요.',
        moves: [1, -1].map((sx) => ({ line: [[0, 0], [sx * H / 2, -H]], side: [sx * 0.03, -0.45], filter: flap(sx), tag: 'sleeve' })),
      },
      {
        text: '아래쪽을 점선에서 앞으로 접어 올려 끝을 깃 밑에 끼워 넣어요.',
        sim: true,
        // 접어 올린 끝 쪽(깃과 겹치는 부분)만 깃 밑으로 끼우고, 나머지는 앞에 놓는다
        moves: [
          { line: [[-1, TUCK], [1, TUCK]], side: [0, -H], angle: 0, seam: true },
          { line: [[-1, hem], [1, hem]], side: [0, -H], filter: (c) => c.y < TUCK, toward: 1, insert: INS },
          { line: [[-1, hem], [1, hem]], side: [0, -H], filter: (c) => c.y > TUCK, toward: 1 },
        ],
      },
      {
        text: '연필로 단추를 그리면 완성!',
        view: [0, 0.18, 1],
        draw: [{ dot: [0, 0.2], r: 0.016, color: PENCIL }, { dot: [0, 0.06], r: 0.016, color: PENCIL }],
      },
    ],
  };
}
export const shirt = makeShirt();
