// 여우 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Fox (face)" (전통, Fumiaki Shingu 도안) https://en.origami-club.com/easy/animal-face/fox/
// 아래를 올려 세모를 만들고 위 끝을 밑변까지 내린 뒤, 밑변 가운데에서 양옆을 비스듬히 올려 귀를 세우고 뒤집는다.
import { arc, cheek, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2, A = R / 2;
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

export const foxParams = { ph: 0.74, t: A };

export function makeFox({ ph, t } = foxParams) {
  return {
  params: { ph, t },
  make: makeFox,
  id: 'fox',
  name: '여우 얼굴',
  level: 1,
  desc: '세모를 접고 위 끝을 내린 뒤 양옆을 올리면 뾰족한 귀가 서요. 뒤집으면 여우 얼굴!',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e2702a' },
  accent: '#b9531a',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '여우 얼굴 완성! 이름을 지어 주고 친구에게 보여 주세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1] }] },
    { text: '위 꼭짓점을 점선에서 밑변 가운데까지 접어 내려요.', moves: [{ line: [[-1, t], [1, t]], side: [0, R] }] },
    {
      text: '밑변 가운데에서 양쪽을 비스듬히 접어 올려요. 끝이 위로 서면 귀가 돼요.',
      moves: [
        { line: [[0, 0], [-Math.cos(ph), Math.sin(ph)]], side: [-0.6, 0.02] },
        { line: [[0, 0], [Math.cos(ph), Math.sin(ph)]], side: [0.6, 0.02] },
      ],
    },
    { text: '종이를 뒤집어요. 뾰족한 귀가 달린 여우 얼굴이 보여요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '연필로 웃는 눈을 그리고, 주둥이 끝에 까만 코를 칠해요.',
      view: [0, 0, 1],
      draw: [
        { line: arc([-0.1, 0.24], 0.04, 0.03, 20, 160), w: 0.014, color: PENCIL },
        { line: arc([0.1, 0.24], 0.04, 0.03, 20, 160), w: 0.014, color: PENCIL },
        { dot: [0, 0.07], r: 0.035, ry: 0.032, color: PENCIL },
      ],
    },
    {
      text: '색연필로 볼을 분홍색으로 칠하면 완성!',
      view: [0, 0, 1],
      draw: [cheek(-0.17, 0.17, 0.026), cheek(0.17, 0.17, 0.026)],
    },
  ],
};
}

export const fox = makeFox();
