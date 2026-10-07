// 판다 얼굴 (정사각형 색종이, 마름모 방향)
// 흰 면이 겉으로 오게 세모를 접고 귀를 올린 뒤, 귀 끝을 접어 둥글게 만든다. 검은 귀와 눈 둘레는 색칠로.
import { eye, cheek, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);
const ear = (c) => c.tags.has('earL') || c.tags.has('earR');
const INK = '#26282c';

export const panda = {
  id: 'panda',
  name: '판다 얼굴',
  level: 1,
  desc: '고양이 얼굴처럼 접고 귀 끝을 접어 둥글게 만들어요. 검은 귀와 눈 둘레를 칠하면 판다가 돼요.',
  paper: '정사각형 색종이 (흰 면 사용)',
  colors: { front: '#5aa36a', back: '#fbf8f1' },
  accent: '#3d7f4c',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.15, 1],
  done: '판다 얼굴 완성! 대나무 잎도 그려 주면 좋아해요.',
  steps: [
    {
      text: '흰 면이 아래로 가게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요. 흰 면이 겉으로 나와요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'front' }],
    },
    {
      text: '양쪽 모서리를 비스듬히 위로 접어 올려 귀를 세워요.',
      moves: [
        { line: [[0.38, 0], [0.26, -0.5]], side: [R, 0], tag: 'earR' },
        { line: [[-0.38, 0], [-0.26, -0.5]], side: [-R, 0], tag: 'earL' },
      ],
    },
    {
      text: '뾰족한 귀 끝을 아래로 조금 접어 둥근 귀를 만들어요.',
      moves: [
        { line: [[-1, 0.075], [1, 0.075]], side: [0.09, 0.14], filter: has('earR') },
        { line: [[-1, 0.075], [1, 0.075]], side: [-0.09, 0.14], filter: has('earL') },
      ],
    },
    {
      text: '아래 꼭짓점을 뒤로 조금 접어 턱을 둥글게 만들어요.',
      moves: [{ line: [[-1, -0.5], [1, -0.5]], side: [0, -1], filter: (c) => !ear(c), toward: -1 }],
    },
    {
      text: '검은 색연필로 두 귀와 눈 둘레를 칠해요.',
      view: [0, -0.15, 1],
      draw: [
        { dot: [-0.17, 0.03], r: 0.075, ry: 0.05, color: INK },
        { dot: [0.17, 0.03], r: 0.075, ry: 0.05, color: INK },
        { dot: [-0.1, -0.15], r: 0.055, ry: 0.068, color: INK },
        { dot: [0.1, -0.15], r: 0.055, ry: 0.068, color: INK },
      ],
    },
    {
      text: '눈 둘레 안에 흰 눈을 그리고, 연필로 코와 입을 그리면 완성!',
      view: [0, -0.15, 1],
      draw: [
        { dot: [-0.095, -0.145], r: 0.022, color: '#ffffff' }, { dot: [0.095, -0.145], r: 0.022, color: '#ffffff' },
        ...eye(-0.093, -0.147, 0.012), ...eye(0.093, -0.147, 0.012),
        { dot: [0, -0.255], r: 0.028, ry: 0.019, color: PENCIL },
        { line: [[0, -0.27], [0, -0.3]], color: PENCIL },
        cheek(-0.17, -0.3, 0.026), cheek(0.17, -0.3, 0.026),
      ],
    },
  ],
};
