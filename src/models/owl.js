// 부엉이 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Owl" (Fumiaki Shingu) https://en.origami-club.com/easy/animal/owl/
// 위·아래 꼭짓점을 접고 양옆을 가운데로 접어 네모난 몸을 만든 뒤, 부리를 접고 눈과 날개를 그린다.
import { eye, arc, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2, A = R / 2, T = R - R / 3; // 위 꼭짓점 접는 선
const has = (t) => (c) => c.tags.has(t);
// 날개 무늬: 옆구리에 짧은 곡선 (sx -1 왼쪽, 1 오른쪽)
const wing = (sx, y) => ({ line: arc([sx * 0.36, y], 0.1, 0.06, sx < 0 ? -35 : 145, sx < 0 ? 35 : 215, 8), w: 0.012, color: PENCIL });

export const owl = {
  id: 'owl',
  name: '부엉이',
  level: 1,
  desc: '위아래 꼭짓점을 접고 양옆을 가운데로 모으면 네모난 부엉이가 돼요. 큰 눈을 그려 주세요.',
  paper: '정사각형 색종이 (갈색)',
  colors: { front: '#fbf8f1', back: '#d59a55' },
  accent: '#a8702f',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '부엉이 완성! 부엉부엉!',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '위 꼭짓점을 점선에서 접어 내려요.', moves: [{ line: [[-1, T], [1, T]], side: [0, R], tag: 'head' }] },
    { text: '아래 꼭짓점을 가운데 점까지 접어 올려요.', moves: [{ line: [[-1, -A], [1, -A]], side: [0, -R], tag: 'belly' }] },
    {
      text: '양쪽 모서리를 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[-A, -1], [-A, 1]], side: [-R, 0] },
        { line: [[A, -1], [A, 1]], side: [R, 0] },
      ],
    },
    { text: '위쪽 세모의 끝을 조금 접어 올려 부리를 만들어요.', moves: [{ line: [[-1, T - 0.17], [1, T - 0.17]], side: [0, T - 0.24], filter: has('head') }] },
    {
      text: '연필로 동그란 눈과 날개 무늬를 그리면 완성!',
      view: [0, 0, 1],
      draw: [
        { dot: [-0.12, 0.27], r: 0.055, color: '#ffffff' }, ...eye(-0.12, 0.27, 0.03),
        { dot: [0.12, 0.27], r: 0.055, color: '#ffffff' }, ...eye(0.12, 0.27, 0.03),
        wing(-1, -0.02), wing(-1, -0.11), wing(-1, -0.2), wing(1, -0.02), wing(1, -0.11), wing(1, -0.2),
      ],
    },
  ],
};
