// UFO (정사각형 색종이)
// 출처: Origami Club "UFO" (Fumiaki Shingu) https://en.origami-club.com/easy/vehicle/ufo/
// 반으로 접고 앞 장을 내려 흰 띠를 만든 뒤, 띠를 V자로 내려 다리를 만들고 위 모서리를 접어 둥근 몸체를 만든다.
import { arc, PENCIL } from './parts/draw.js';
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
const win = (x) => ({ line: arc([x, 0.25], 0.055, 0.055, 0, 360, 24), w: 0.012, color: PENCIL });

export const ufo = {
  id: 'ufo',
  name: 'UFO',
  level: 1,
  desc: '띠를 V자로 내려 접으면 다리가 생기고, 위 모서리를 접으면 둥근 UFO가 돼요. 동그란 창문을 그려 주세요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#f39a2a' },
  accent: '#c97a12',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: 'UFO 완성! 우주로 날아가요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 반으로 접었다 펴서 가운데 세로 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '아래 변을 위 변에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'front' }] },
    { text: '앞의 한 장만 가운데에서 접어 내려요. 하얀 띠가 생겨요.', moves: [{ line: [[-1, 0.25], [1, 0.25]], side: [0, 0.45], filter: has('front'), tag: 'band' }] },
    {
      text: '띠의 양쪽을 점선을 따라 V자로 내려 접어요. 다리가 돼요.',
      moves: [
        { line: [[0, 0.25], [H, 0]], side: [0.45, 0.22], filter: has('front') },
        { line: [[0, 0.25], [-H, 0]], side: [-0.45, 0.22], filter: has('front') },
      ],
    },
    {
      text: '위 양쪽 모서리를 점선에서 접어요.',
      moves: [
        { line: [[0.18, H], [H, 0.18]], side: [H, H], filter: (c) => !c.tags.has('front') },
        { line: [[-0.18, H], [-H, 0.18]], side: [-H, H], filter: (c) => !c.tags.has('front') },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '연필로 동그란 창문 세 개를 그리면 완성!', view: [0, 0, 1], draw: [win(-0.22), win(0), win(0.22)] },
  ],
};
