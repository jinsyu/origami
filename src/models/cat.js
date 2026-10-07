// 고양이 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Cat" (전통, Fumiaki Shingu 도안) https://en.origami-club.com/easy/animal-face/cat/
// 아래를 올려 세모(꼭짓점 위)를 만들고, 양쪽 모서리를 아래 가운데에서 비스듬히 올려 귀를 세운 뒤 위 끝을 내리고 뒤집는다.
import { arc, eye, cheek, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const ear = (c) => c.tags.has('earL') || c.tags.has('earR');

export const catParams = { ph: (180 - 143.75) * Math.PI / 180, tY: 0.56 };

export function makeCat({ ph, tY } = catParams) {
  return {
  params: { ph, tY },
  make: makeCat,
  id: 'cat',
  name: '고양이 얼굴',
  level: 1,
  desc: '세모를 접고 양쪽 끝을 위로 올리면 뾰족한 귀가 생겨요. 위 끝을 내리고 뒤집으면 끝!',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e08a3c' },
  accent: '#b4621f',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0.1, 1],
  done: '고양이 얼굴 완성! 이름을 지어 주고 친구에게 보여 주세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'front' }] },
    { text: '반으로 접었다 펴서 가운데 세로 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0.1], unfold: true }] },
    {
      text: '양쪽 모서리를 아래 가운데에서 비스듬히 위로 접어 올려요. 끝이 위로 뾰족하게 나오면 귀가 돼요.',
      moves: [
        { line: [[0, 0], [-Math.cos(ph), Math.sin(ph)]], side: [-0.6, 0.02], tag: 'earL' },
        { line: [[0, 0], [Math.cos(ph), Math.sin(ph)]], side: [0.6, 0.02], tag: 'earR' },
      ],
    },
    { text: '가운데 위 꼭짓점을 점선에서 접어 내려요.', moves: [{ line: [[-1, tY], [1, tY]], side: [0, R], filter: (c) => !ear(c) }] },
    { text: '종이를 뒤집어요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } }], view: [0, 0.4, 1] },
    {
      text: '연필로 눈과 입, 양쪽 수염을 그려요.',
      view: [0, 0.1, 1],
      draw: [
        ...eye(-0.1, 0.36, 0.022), ...eye(0.1, 0.36, 0.022),
        { line: arc([-0.025, 0.24], 0.025, 0.022, 0, -180), color: PENCIL },
        { line: arc([0.025, 0.24], 0.025, 0.022, 180, 360), color: PENCIL },
        { line: [[-0.08, 0.265], [-0.22, 0.29]], w: 0.007, color: PENCIL },
        { line: [[-0.08, 0.24], [-0.22, 0.23]], w: 0.007, color: PENCIL },
        { line: [[0.08, 0.265], [0.22, 0.29]], w: 0.007, color: PENCIL },
        { line: [[0.08, 0.24], [0.22, 0.23]], w: 0.007, color: PENCIL },
      ],
    },
    {
      text: '색연필로 코와 볼을 분홍색으로 칠하면 완성!',
      view: [0, 0.1, 1],
      draw: [{ dot: [0, 0.275], r: 0.02, ry: 0.014, color: '#e66a7a' }, cheek(-0.14, 0.2, 0.026), cheek(0.14, 0.2, 0.026)],
    },
  ],
};
}

export const cat = makeCat();
