// 개구리 얼굴 (정사각형 색종이)
// 출처: Origami Club "A Frog(face)" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/frogface/
// 위아래를 가운데로 접고 뒤집어 양옆 선을 만든 뒤, 위 끝을 접어 내리고 양쪽 위를 벌려 눌러 눈을 세운다.
import { bigEye, PENCIL } from './parts/draw.js';
const H = 0.5, Q = 0.25;
const MG = 0.012; // 위 변을 가운데에 조금 못 미치게 접어 남기는 틈 (뒤집으면 흰 입 선)
const has = (t) => (c) => c.tags.has(t);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  top: 위 끝을 접어 내리는 가로선의 높이 (도안: 위 변을 가운데에 맞춤 → Q/2)
//  side: 양옆을 접는 세로선의 |x| — 도안은 가운데에 조금 못 미치게 접어 틈을 남기고, 그 틈이 두 눈 사이가 된다
export const frogfaceParams = { top: Q / 2, side: 0.27 };
export function makeFrogface(P = frogfaceParams) {
  const { top, side } = P;
  const w = Q - top; // 접어 내린 띠의 폭
  const g = 2 * side - H; // 눈 혹 안쪽 변의 |x| (안으로 접힌 옆판 끝)
  const eyeC = 0.03, jaw = 0.088; // 눈 안쪽 위·아래 모서리를 접는 크기 (도안에서 잼)
  // 한쪽 위 벌려 누르기: 띠의 바깥 쪽을 비스듬한 선에서 위로 젖히고, 젖힌 끝을 되접은 뒤, 뒤판 끝을 세로선에서 안으로 접는다
  const squash = (sx) => {
    const pull = `pull${sx}`;
    const a = [sx * (side - w), top - w], b = [sx * side, top]; // 비스듬한 선: 띠 아래 변 위의 점 → 경첩 모서리
    return [
      { line: [a, b], side: [sx * 0.45, top - w + 0.01], filter: (c) => has('band')(c) && sx * c.x > 0 && (c.y - (top - w)) < sx * c.x - (side - w), toward: 1, tag: pull, at: [0, 0.6] },
      { line: [b, [b[0] - sx, b[1] + 1]], side: [sx * 0.3, top + 0.2], filter: (c) => has(pull)(c) && sx * c.x + c.y > side + top, toward: 1, at: [0.3, 0.9] },
      { line: [[sx * side, -1], [sx * side, 1]], side: [sx * 0.45, -0.1], filter: (c) => !has('band')(c) && !has(pull)(c) && sx * c.x > side, toward: 1, at: [0.4, 1] },
    ];
  };
  return {
    id: 'frogface',
    name: '개구리 얼굴',
    level: 2,
    desc: '양쪽 위를 벌려 눌러 눈이 톡 튀어나온 개구리 얼굴이에요. 눈을 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#a9d23a' },
    accent: '#5f8f12',
    outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
    view: [0.3, -0.45, 1],
    finalView: [0, 0, 1],
    done: '개구리 얼굴 완성! 개굴!',
    params: P,
    make: makeFrogface,
    steps: [
      { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '아래 변을 가운데 선에 맞춰 접어요.', moves: [{ line: [[-1, -Q], [1, -Q]], side: [0, -H], tag: 'fB' }] },
      { text: '위 변도 가운데 선 조금 앞까지 접어요. 가운데에 흰 틈이 남아 입이 돼요.', moves: [{ line: [[-1, Q + MG / 2], [1, Q + MG / 2]], side: [0, H], tag: 'fT' }] },
      { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0, 1] },
      { text: '양옆을 가운데 선 조금 앞까지 접어요.', moves: [1, -1].map((sx) => ({ line: [[sx * side, -1], [sx * side, 1]], side: [sx * H, 0], tag: `s${sx}` })) },
      { text: '접은 양옆을 다시 펴요.', moves: [1, -1].map((sx) => ({ line: [[sx * side, -1], [sx * side, 1]], side: [sx * 0.1, 0], filter: has(`s${sx}`), toward: 1 })) },
      { text: '위 변을 가운데 선에 맞춰 접어 내려요.', moves: [{ line: [[-1, top], [1, top]], side: [0, Q], tag: 'band' }] },
      { text: '오른쪽 위를 벌리고 꾹 눌러 펴요. 눈이 생겨요.', sim: true, moves: squash(1) },
      { text: '왼쪽 위도 똑같이 벌려 눌러요.', sim: true, moves: squash(-1) },
      {
        text: '두 눈의 안쪽 위 모서리와 아래 양쪽 모서리를 점선에서 조금씩 접어요.',
        moves: [1, -1].flatMap((sx) => [
          { line: [[sx * g, Q - eyeC], [sx * (g + eyeC), Q]], side: [sx * g, Q], filter: has(`pull${sx}`), toward: 1 },
          { line: [[sx * side, -Q + jaw], [sx * (side - jaw), -Q]], side: [sx * side, -Q], toward: 1 },
        ]),
      },
      { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0, 1] },
      {
        text: '연필로 큰 눈과 콧구멍을 그리면 완성!',
        view: [0, 0, 1],
        draw: [
          ...[1, -1].flatMap((sx) => bigEye(sx * 0.1, 0.19, 0.047, { look: [-sx * 0.35, -0.1] })),
          { dot: [-0.025, 0.09], r: 0.008, color: PENCIL },
          { dot: [0.025, 0.09], r: 0.008, color: PENCIL },
        ],
      },
    ],
  };
}
export const frogface = makeFrogface();
