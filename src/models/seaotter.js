// 해달 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Sea otter" (Fumiaki Shingu) https://en.origami-club.com/easy/sea/sea-otter/
// 아래 꼭짓점을 올려 접고 위를 뒤로 접어 띠를 만든 뒤, 양옆을 비스듬히 올려 접고 왼쪽 끝을 접어 머리를 만든다.
import { eye, cheek, arc, fillPoly, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  low: 아래 꼭짓점을 올려 접는 가로선의 높이
//  headX: 왼쪽(머리)을 올려 접는 선이 띠 아래 변과 만나는 x — 오른쪽보다 가운데에 가까워 머리가 팔보다 크다
//  ear: 머리 끝을 접어 내리는 가로선이 끝에서 내려온 길이, nose: 머리 왼쪽 끝을 뒤로 접는 세로선이 끝에서 들어온 길이
export const seaotterParams = { low: -0.173, ear: 0.076, nose: 0.075, headX: -0.076 };
export function makeSeaotter(P = seaotterParams) {
  const { low, ear, nose, headX } = P;
  const back = (R + low) / 2; // 위 꼭짓점이 띠 아래 변에 닿게 뒤로 접는 선
  // 양옆을 올려 접는 선: 띠 아래 변 위의 점 (±R/2 + low, low) 을 지나는 45° 선
  const arm = (sx) => { const x0 = sx > 0 ? R / 2 + low : headX; return [[x0, low], [x0 + sx, low + 1]]; };
  const cL = headX + low; // 왼쪽 접는 선: x + y = cL
  const headTop = R + cL; // 왼쪽 꼭짓점이 올라간 자리 (cL, R + cL) — 머리 위 끝
  const headLeft = (cL - R) / 2; // 머리 왼쪽 끝의 x (왼쪽 위 변과 접는 선이 만나는 점)
  const left = (c) => c.tags.has('armL');
  const V = [0, 0.1, 1];
  return {
    id: 'seaotter',
    name: '해달',
    level: 2,
    desc: '띠를 만들고 양옆을 비스듬히 올려 접으면 물 위에 누운 해달이 돼요. 얼굴을 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#f5a64a' },
    accent: '#c8731a',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: V,
    done: '해달 완성! 조개를 그려 안겨 줘도 좋아요.',
    params: P,
    make: makeSeaotter,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '아래 꼭짓점을 가운데 점에 맞춰 접었다 펴요.', moves: [{ line: [[-1, -R / 2], [1, -R / 2]], side: [0, -R], unfold: true }] },
      { text: '아래 꼭짓점을 점선에서 접어 올려요.', moves: [{ line: [[-1, low], [1, low]], side: [0, -R], tag: 'low' }] },
      { text: '위 꼭짓점을 점선에서 뒤로 접어요. 앞에 올린 세모는 그대로 둬요.', moves: [{ line: [[-1, back], [1, back]], side: [0, R], filter: (c) => !c.tags.has('low'), toward: -1 }] },
      { text: '오른쪽을 비스듬한 점선에서 접어 올려요.', moves: [{ line: arm(1), side: [R, -0.1], tag: 'armR' }] },
      { text: '왼쪽도 똑같이 접어 올려요.', moves: [{ line: arm(-1), side: [-R, -0.1], tag: 'armL' }] },
      { text: '왼쪽 끝을 점선에서 조금 접어 내려요.', moves: [{ line: [[-1, headTop - ear], [0, headTop - ear]], side: [cL, headTop], filter: left, tag: 'ear' }] },
      { text: '왼쪽 끝을 점선에서 조금 뒤로 접어요. 머리가 돼요.', moves: [{ line: [[headLeft + nose, -1], [headLeft + nose, 1]], side: [-R, 0.18], toward: -1 }] },
      {
        text: '연필로 눈과 코를 그리고, 귀 안쪽을 칠해요.',
        view: V,
        draw: [
          ...eye(-0.315, 0.245, 0.03),
          // 귀: 접어 내린 흰 세모의 바깥쪽 절반
          fillPoly([[cL - ear + 0.004, headTop - ear - 0.002], [cL - 0.012, headTop - ear - 0.002], [cL - 0.004, headTop - 2 * ear + 0.01]], PENCIL),
          { dot: [-0.385, 0.195], r: 0.014, ry: 0.011, color: PENCIL },
          { line: arc([-0.36, 0.17], 0.022, 0.016, 200, 330), w: 0.007, color: PENCIL },
        ],
      },
      {
        text: '색연필로 볼을 칠하고, 배 위에 조개를 그려 안겨 주면 완성!',
        view: V,
        draw: [
          cheek(-0.27, 0.17, 0.026),
          // 조개: 부채꼴 + 골 줄
          fillPoly([[0, 0.17], ...arc([0, 0.17], 0.075, 0.075, 30, 150, 12)], '#fdf6e8'),
          { line: [[0, 0.17], ...arc([0, 0.17], 0.075, 0.075, 30, 150, 12), [0, 0.17]], w: 0.006, color: PENCIL },
          ...[50, 70, 90, 110, 130].map((a) => ({ line: [[0, 0.17], [0.07 * Math.cos((a * Math.PI) / 180), 0.17 + 0.07 * Math.sin((a * Math.PI) / 180)]], w: 0.005, color: PENCIL })),
        ],
      },
    ],
  };
}
export const seaotter = makeSeaotter();
