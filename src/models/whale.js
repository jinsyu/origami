// 고래 (정사각형 색종이, 마름모 방향)
// 연 모양 → 위 끝을 내려 뭉툭한 머리 → 뒤로 반 접기 → 가는 끝을 바깥 뒤집어 접어 꼬리를 세운다.
import { eye, cheek } from './parts/draw.js';
const R = Math.SQRT1_2;
const s1 = Math.sin(Math.PI / 8), c1 = Math.cos(Math.PI / 8);
const TAIL_LINE = [[0.3, 0], [0.3 + 0.5, 0.866]]; // 눕힌 뒤 좌표, 60°

export const whale = {
  id: 'whale',
  name: '고래',
  level: 2,
  desc: '연 모양에서 머리를 뭉툭하게 접고, 가는 끝을 바깥으로 뒤집어 꼬리를 세워요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#2f6f9f' },
  accent: '#1f5580',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0.35, 0.3, 1],
  done: '고래 완성! 꼬리를 살랑살랑 흔들어 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 세로로 반 접었다 펴서 가운데 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '아래쪽 두 변을 가운데 선에 맞춰 접어 연 모양을 만들어요.',
      moves: [
        { line: [[0, -R], [s1, -R + c1]], side: [R, 0] },
        { line: [[0, -R], [-s1, -R + c1]], side: [-R, 0] },
      ],
    },
    { text: '위 꼭짓점을 아래로 접어 내려 머리를 뭉툭하게 만들어요.', moves: [{ line: [[-1, 0.3], [1, 0.3]], side: [0, R] }] },
    { text: '가운데 선을 따라 뒤로 반 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [-1, 0], toward: -1, tag: 'back' }] },
    { text: '접힌 쪽이 아래로 오게 눕혀요. 가는 끝이 오른쪽을 향해요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: 90 } }] },
    {
      text: '가는 끝을 바깥으로 뒤집어 접어 위로 세워요. 꼬리가 돼요.',
      sim: true,
      moves: [
        { line: TAIL_LINE, side: [0.6, 0.02], filter: (c) => !c.tags.has('back'), toward: 1, spine: [[0, 0], [1, 0]] },
        { line: TAIL_LINE, side: [0.6, 0.02], filter: (c) => c.tags.has('back'), toward: -1, spine: [[0, 0], [1, 0]] },
      ],
    },
    {
      text: '연필로 머리 쪽에 동그란 눈을 그리고, 색연필로 볼을 분홍색으로 칠하면 완성!',
      view: [0, 0.1, 1],
      draw: [...eye(-0.18, 0.318, 0.02), cheek(-0.2, 0.2, 0.03)],
    },
  ],
};
