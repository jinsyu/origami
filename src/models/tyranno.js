// 티라노사우루스 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Tyrannosaurus" (Fumiaki Shingu) https://en.origami-club.com/easy/dinosaur/tyranno/
// 아래 변을 가운데 선에 맞춰 접고 위를 비스듬히 접어 내린 뒤, 오른쪽을 연 모양으로 모아 뒤로 반 접고 세워 꼬리와 입을 접는다.
import { eye, fillPoly, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const C = Math.cos(Math.PI / 8), S = Math.sin(Math.PI / 8);
const STRIPE = '#2b3a1a';
const VIEW = [-0.33, 0.02, 1];
// 끝 모양에서 흰 입의 윗변 (이빨 자리)
const U0 = [-0.45, 0.29], U1 = [-0.16, 0.06];

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  topA: 위를 접어 내리는 선이 왼쪽 위 변과 만나는 점의 x (선의 다른 끝은 오른쪽 위 변의 가운데)
//  backT·backB: 뒤로 반 접는 선이 y=±0.3 을 지나는 x, tail: 꼬리 접는 선 (세운 뒤 오른쪽 변에서 왼쪽으로 떨어진 거리)
//  snD·snAng: 입 끝을 뒤로 접는 선 (세운 뒤 입 끝에서 오른쪽으로 snD 떨어진 점을 지나고, 세로에서 snAng 도 기운 선)
export const tyrannoParams = { topA: -0.57, backT: -0.226, backB: -0.007, tail: 0.45, snD: 0.15, snAng: 45 };
export function makeTyranno(P = tyrannoParams) {
  const { topA, backT, backB, tail, snD, snAng } = P;
  const B = [R / 2, R / 2];
  // 뒤로 접는 선을 세로로 세우는 회전 (시계 방향이 음수)
  const turn = (Math.atan2(backT - backB, 0.6) * 180) / Math.PI;
  const th = (turn * Math.PI) / 180;
  const rot = ([x, y]) => [x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)];
  const fx = rot([backB, -0.3])[0]; // 세운 뒤 오른쪽 변(접힌 선)의 x
  const tip = rot([-R, 0]); // 세운 뒤 입 끝 (왼쪽 꼭짓점)
  return {
    id: 'tyranno',
    name: '티라노사우루스',
    level: 2,
    desc: '비스듬히 접고 뒤로 반 접어 세우면 큰 입을 벌린 티라노사우루스가 돼요. 이빨과 무늬를 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#8cc63f' },
    accent: '#4f8a1c',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: VIEW,
    done: '티라노사우루스 완성! 크앙!',
    params: P,
    make: makeTyranno,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 반으로 접었다 펴서 가운데 가로선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }] },
      { text: '왼쪽 아래 변을 가운데 선에 맞춰 접어요.', moves: [{ line: [[-R, 0], [-R + C, -S]], side: [0, -R], tag: 'low' }] },
      { text: '위 꼭짓점을 점선에서 비스듬히 접어 내려요.', moves: [{ line: [[topA, topA + R], B], side: [0, R], tag: 'top' }] },
      {
        text: '오른쪽 위와 오른쪽 아래 변을 가운데 선에 맞춰 접어요.',
        moves: [1, -1].map((sy) => ({ line: [[R, 0], [R - C, sy * S]], side: [0.55, sy * 0.15], tag: 'kite' })),
      },
      { text: '점선에서 오른쪽을 뒤로 접어요.', moves: [{ line: [[backB, -0.3], [backT, 0.3]], side: [R, 0], toward: -1, tag: 'tail' }] },
      { text: '접은 선이 세로가 되게 돌려 세워요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: turn } }], view: [0, 0, 1] },
      { text: '왼쪽 아래 꼬리 끝을 세로 점선에서 안쪽으로 접어요.', moves: [{ line: [[fx - tail, -1], [fx - tail, 1]], side: [-0.9, -0.3], tag: 'tailIn' }] },
      { text: '입 끝을 점선에서 조금 뒤로 접어요.', moves: [{ line: [[tip[0] + snD, tip[1]], [tip[0] + snD + Math.sin((snAng * Math.PI) / 180), tip[1] + Math.cos((snAng * Math.PI) / 180)]], side: tip, toward: -1, tag: 'snout' }] },
      {
        text: '연필로 눈과 뾰족한 이빨을 그려요.',
        view: VIEW,
        draw: [
          ...eye(-0.2, 0.2, 0.03),
          // 흰 입의 윗변에서 아래로 내려오는 이빨
          ...[0.22, 0.42, 0.62].map((t) => {
            const p = (u) => [U0[0] + (U1[0] - U0[0]) * u, U0[1] + (U1[1] - U0[1]) * u];
            const a = p(t - 0.08), b = p(t + 0.08), m = p(t);
            return fillPoly([a, b, [m[0] - 0.012, m[1] - 0.045]], PENCIL);
          }),
        ],
      },
      {
        text: '색연필로 몸에 뾰족한 무늬를 그리면 완성!',
        view: VIEW,
        draw: [[-0.47, 0.05], [-0.3, 0.0], [-0.17, -0.05], [-0.42, -0.12], [-0.26, -0.17], [-0.47, -0.22], [-0.16, -0.2]].map(([x, y]) => fillPoly([[x, y + 0.018], [x, y - 0.018], [x - 0.025, y]], STRIPE)),
      },
    ],
  };
}
export const tyranno = makeTyranno();
