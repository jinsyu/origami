// 방석 팽이 (정사각형 색종이 한 장): 네 모서리를 가운데로 접는 방석 접기를 세 번 하고, 색을 칠해 이쑤시개로 돌린다
import { flip } from './parts/folds.js';
import { arc, PENCIL } from './parts/draw.js';
const H = 0.5, Q = 0.25;
const ring = (r, color) => ({ line: arc([0, 0], r, r, 90, 450, 40), w: 0.034, color, under: true });

export const top = {
  id: 'top',
  name: '방석 팽이',
  level: 1,
  desc: '네 모서리를 가운데로 접는 방석 접기를 세 번 하면 단단한 팽이 몸통이 돼요. 색을 칠하고 이쑤시개를 꽂아 돌려 보세요.',
  paper: '정사각형 색종이, 이쑤시개',
  colors: { front: '#fbf8f1', back: '#5a8f3c' },
  accent: '#3f7326',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0.3, -0.5, 1],
  done: '방석 팽이 완성! 이쑤시개를 잡고 손가락으로 비틀어 돌리면 색이 섞여 보여요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 대각선으로 반 접었다 펴요.', moves: [{ line: [[-1, -1], [1, 1]], side: [H, -H], unfold: true }] },
    { text: '반대쪽 대각선으로도 접었다 펴요. 두 선이 만나는 곳이 가운데 점이에요.', moves: [{ line: [[-1, 1], [1, -1]], side: [H, H], unfold: true }] },
    {
      text: '네 모서리를 가운데 점에 맞춰 접어요. 방석 접기예요.',
      moves: [
        { line: [[0, H], [H, 0]], side: [H, H] }, { line: [[0, H], [-H, 0]], side: [-H, H] },
        { line: [[0, -H], [H, 0]], side: [H, -H] }, { line: [[0, -H], [-H, 0]], side: [-H, -H] },
      ],
    },
    {
      text: '새로 생긴 네 모서리를 한 번 더 가운데 점에 맞춰 접어요.',
      moves: [
        { line: [[Q, -1], [Q, 1]], side: [H, 0] }, { line: [[-Q, -1], [-Q, 1]], side: [-H, 0] },
        { line: [[-1, Q], [1, Q]], side: [0, H] }, { line: [[-1, -Q], [1, -Q]], side: [0, -H] },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '이쪽도 네 모서리를 가운데 점에 맞춰 꾹꾹 눌러 접어요. 두툼한 팽이 몸통이 돼요.',
      moves: [
        { line: [[0, Q], [Q, 0]], side: [Q, Q] }, { line: [[0, Q], [-Q, 0]], side: [-Q, Q] },
        { line: [[0, -Q], [Q, 0]], side: [Q, -Q] }, { line: [[0, -Q], [-Q, 0]], side: [-Q, -Q] },
      ],
    },
    {
      text: '색연필로 가운데를 둘러싸는 동그라미를 여러 색으로 칠해요.',
      view: [0, 0, 1],
      draw: [ring(0.155, '#e5484d'), ring(0.118, '#f5b83d'), ring(0.081, '#3d8fe0'), ring(0.044, '#8a5cd6')],
    },
    {
      text: '가운데 점에 이쑤시개를 꽂아 위아래로 조금씩 나오게 하면 완성!',
      view: [0, 0, 1],
      draw: [{ dot: [0, 0], r: 0.016, color: '#c99a5b' }, { line: arc([0, 0], 0.016, 0.016, 0, 360, 16), w: 0.005, color: PENCIL }],
    },
  ],
};
