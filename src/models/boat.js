// 돛단배 (정사각형 색종이, 마름모 방향)
// 아래 꼭짓점을 가운데로 접으면 위는 세모 돛, 아래는 사다리꼴 배 몸통이 된다. 몸통과 깃발은 색칠로.
import { fillPoly, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2, B = R / 2;

export const boat = {
  id: 'boat',
  name: '돛단배',
  level: 1,
  desc: '한 번만 접으면 세모 돛과 배 몸통이 생겨요. 색칠하고 깃발과 물결을 그려 바다로 띄워 보세요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#3a86c8' },
  accent: '#2a6aa3',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '돛단배 완성! 파란 도화지에 붙이면 바다를 항해하는 배가 돼요.',
  steps: [
    {
      text: '흰 면이 위로 오게 마름모로 놓고, 아래 꼭짓점을 가운데 점까지 접어 올려요. 위는 돛, 아래는 배 몸통이 돼요.',
      moves: [{ line: [[-1, -B], [1, -B]], side: [0, -1] }],
    },
    {
      text: '연필로 돛 가운데에 돛대를 긋고, 꼭대기에 작은 깃발을 그려요.',
      view: [0, 0, 1],
      draw: [
        { line: [[0, -0.02], [0, R - 0.04]], w: 0.012, color: PENCIL },
        { line: [[0, R - 0.04], [0.11, R - 0.09], [0, R - 0.14]], w: 0.009, color: PENCIL },
      ],
    },
    {
      text: '색연필로 배 몸통을 칠하고 깃발도 빨갛게 칠하면 완성!',
      view: [0, 0, 1],
      draw: [
        fillPoly([[-R, 0], [R, 0], [B, -B], [-B, -B]], '#b5713c'),
        fillPoly([[0, R - 0.04], [0.11, R - 0.09], [0, R - 0.14]], '#e04848'),
      ],
    },
  ],
};
