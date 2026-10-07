// 수박 (정사각형 색종이)
// 출처: Origami Club "Watermelon" (Fumiaki Shingu) https://en.origami-club.com/easy/food/watermelon2/
// 아래 변을 띠로 접어 흰 껍질을 만들고, 뒤집어 양옆을 꼭대기에서 비스듬히 접으면 세모 조각이 된다.
import { PENCIL } from './parts/draw.js';
const H = 0.5;
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
const seed = (x, y) => ({ dot: [x, y], r: 0.016, ry: 0.024, color: PENCIL });

export const watermelon = {
  id: 'watermelon',
  name: '수박',
  level: 1,
  desc: '아래를 띠로 접어 하얀 껍질을 만들고 양옆을 비스듬히 접으면 수박 한 조각이 돼요. 까만 씨를 그려 주세요.',
  paper: '정사각형 색종이 (빨간색)',
  colors: { front: '#e23b3b', back: '#fbf8f1' },
  accent: '#c22a2a',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.1, 1],
  done: '수박 완성! 시원한 여름 과일이에요.',
  steps: [
    { text: '색깔 면이 위로 오게 놓고, 아래 변을 가운데 선까지 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, -0.25], [1, -0.25]], side: [0, -1], unfold: true }] },
    { text: '아래 변을 방금 만든 선에 맞춰 접어 올려요. 하얀 띠가 생겨요.', moves: [{ line: [[-1, -0.375], [1, -0.375]], side: [0, -1], tag: 'rind' }] },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '위 가운데에서 하얀 띠 바로 위 양끝까지 이어지는 선을 따라 양옆을 접어요.',
      moves: [
        { line: [[0, H], [H, -0.25]], side: [H, H] },
        { line: [[0, H], [-H, -0.25]], side: [-H, H] },
      ],
    },
    { text: '종이를 뒤집어요. 하얀 껍질이 달린 빨간 세모가 보여요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '연필로 까만 씨를 콕콕 그리면 완성!',
      view: [0, -0.1, 1],
      draw: [seed(0, 0.22), seed(-0.1, 0.05), seed(0.09, 0.08), seed(-0.2, -0.13), seed(0.02, -0.08), seed(0.19, -0.14)],
    },
  ],
};
