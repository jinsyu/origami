// 고양이 얼굴 (정사각형 색종이, 마름모 방향)
// 위 꼭짓점을 내려 삼각형(꼭짓점 아래)을 만들고, 양쪽 모서리를 위로 접어 귀를 세운다.
import { arc, eye, cheek, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const ear = (c) => c.tags.has('earL') || c.tags.has('earR');

export const cat = {
  id: 'cat',
  name: '고양이 얼굴',
  level: 1,
  desc: '세모를 접고 양쪽 끝을 위로 올리면 뾰족한 귀가 생겨요. 세 번이면 끝나요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e08a3c' },
  accent: '#b4621f',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.15, 1],
  done: '고양이 얼굴 완성! 이름을 지어 주고 친구에게 보여 주세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'front' }],
    },
    {
      text: '양쪽 모서리를 비스듬히 위로 접어 올려요. 끝이 위로 뾰족하게 나오면 귀가 돼요.',
      moves: [
        { line: [[0.38, 0], [0.26, -0.5]], side: [R, 0], tag: 'earR' },
        { line: [[-0.38, 0], [-0.26, -0.5]], side: [-R, 0], tag: 'earL' },
      ],
    },
    {
      text: '아래 꼭짓점을 뒤로 조금 접어 턱을 둥글게 만들어요.',
      moves: [{ line: [[-1, -0.5], [1, -0.5]], side: [0, -1], filter: (c) => !ear(c), toward: -1 }],
    },
    {
      text: '연필로 눈과 입, 양쪽 수염을 그려요.',
      view: [0, -0.1, 1],
      draw: [
        ...eye(-0.095, -0.13, 0.022), ...eye(0.095, -0.13, 0.022),
        { line: arc([-0.025, -0.25], 0.025, 0.022, 0, -180), color: PENCIL },
        { line: arc([0.025, -0.25], 0.025, 0.022, 180, 360), color: PENCIL },
        { line: [[-0.09, -0.225], [-0.3, -0.19]], w: 0.007, color: PENCIL },
        { line: [[-0.09, -0.25], [-0.3, -0.26]], w: 0.007, color: PENCIL },
        { line: [[0.09, -0.225], [0.3, -0.19]], w: 0.007, color: PENCIL },
        { line: [[0.09, -0.25], [0.3, -0.26]], w: 0.007, color: PENCIL },
      ],
    },
    {
      text: '색연필로 코와 볼을 분홍색으로 칠하면 완성!',
      view: [0, -0.1, 1],
      draw: [{ dot: [0, -0.215], r: 0.02, ry: 0.014, color: '#e66a7a' }, cheek(-0.135, -0.3, 0.028), cheek(0.135, -0.3, 0.028)],
    },
  ],
};
