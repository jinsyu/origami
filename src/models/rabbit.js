// 토끼 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Rabbit (face)" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/rabbit/
// 세모의 아래 변을 띠로 접어 올리고, 양쪽을 가운데로 올려 접으면 띠 끝이 솟아 귀가 된다.
import { eye, cheek, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2, B = 0.16; // 띠 폭 (= 귀가 꼭대기 위로 나오는 길이)
const band = (c) => c.tags.has('band');
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

export const rabbit = {
  id: 'rabbit',
  name: '토끼 얼굴',
  level: 1,
  desc: '아래 변을 띠로 접어 올린 뒤 양쪽을 가운데로 모으면, 띠 끝이 쫑긋 솟아 긴 귀가 돼요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#f2a7b8' },
  accent: '#c9637c',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '토끼 얼굴 완성!',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1] }] },
    { text: '반으로 접었다 펴서 가운데 세로 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0.1], unfold: true }] },
    { text: '아래 변을 띠 모양으로 조금 접어 올려요.', moves: [{ line: [[-1, B], [1, B]], side: [0, 0.02], tag: 'band' }] },
    {
      text: '양쪽 모서리를 가운데 선에 맞춰 비스듬히 올려 접어요. 띠 끝이 위로 솟아 귀가 돼요.',
      moves: [
        { line: [[0, B], [1, 1 + B]], side: [R - 0.05, B + 0.02], tag: 'sideR' },
        { line: [[0, B], [-1, 1 + B]], side: [-R + 0.05, B + 0.02], tag: 'sideL' },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '아래 꼭짓점도 뒤로 접어 턱을 만들어요.', moves: [{ line: [[-1, 0.3], [1, 0.3]], side: [0, 0.2], toward: -1 }] },
    {
      text: '연필로 눈과 입을 그리고, 색연필로 코와 볼을 분홍색으로 칠하면 완성!',
      view: [0, 0, 1],
      draw: [
        ...eye(-0.115, 0.5, 0.022), ...eye(0.115, 0.5, 0.022),
        { line: [[-0.035, 0.41], [0, 0.425], [0.035, 0.41]], w: 0.008, color: PENCIL },
        { dot: [0, 0.44], r: 0.02, ry: 0.015, color: '#e04f62' },
        cheek(-0.2, 0.43, 0.026), cheek(0.2, 0.43, 0.026),
      ],
    },
  ],
};
