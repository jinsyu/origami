// 액자 (정사각형 색종이)
// 방석 접기 → 가운데 끝을 되접기 → 뒤집어 한 번 더 방석 접기 → 다시 뒤집으면 흰 테두리 안에 색깔 판이 든 액자가 된다.
import { arc, fillPoly, PENCIL } from './parts/draw.js';
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

export const frame = {
  id: 'frame',
  name: '액자',
  level: 2,
  desc: '네 모서리를 가운데로 모으는 방석 접기를 앞뒤로 두 번 해서 흰 테두리가 있는 액자를 만들어요. 겹이 많아 꼼꼼함이 필요해요.',
  paper: '정사각형 색종이',
  colors: { front: '#7a4fb5', back: '#fbf8f1' },
  accent: '#5b3592',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0.1, -0.2, 1],
  done: '액자 완성! 다른 그림을 그려 넣거나 사진을 붙여도 좋아요.',
  steps: [
    { text: '색깔 면이 위로 오게 놓고, 대각선으로 반 접었다 펴요.', moves: [{ line: [[-1, -1], [1, 1]], side: [0.5, -0.5], unfold: true }] },
    { text: '다른 대각선으로도 반 접었다 펴요. 가운데에 X 선이 생겨요.', moves: [{ line: [[-1, 1], [1, -1]], side: [0.5, 0.5], unfold: true }] },
    {
      text: '네 모서리를 가운데 점에 맞춰 접어요. 방석 접기예요.',
      moves: [
        { line: [[0, H], [H, 0]], side: [H, H], tag: 'a' },
        { line: [[H, 0], [0, -H]], side: [H, -H], tag: 'a' },
        { line: [[0, -H], [-H, 0]], side: [-H, -H], tag: 'a' },
        { line: [[-H, 0], [0, H]], side: [-H, H], tag: 'a' },
      ],
    },
    {
      text: '가운데에 모인 네 끝을 바깥쪽으로 조금 되접어요. 색깔 삼각형이 드러나요.',
      moves: [
        { line: [[0.2, 0], [0, 0.2]], side: [0.01, 0.01], filter: (c) => has('a')(c) && c.x > 0 && c.y > 0, tag: 'tip' },
        { line: [[0.2, 0], [0, -0.2]], side: [0.01, -0.01], filter: (c) => has('a')(c) && c.x > 0 && c.y < 0, tag: 'tip' },
        { line: [[-0.2, 0], [0, -0.2]], side: [-0.01, -0.01], filter: (c) => has('a')(c) && c.x < 0 && c.y < 0, tag: 'tip' },
        { line: [[-0.2, 0], [0, 0.2]], side: [-0.01, 0.01], filter: (c) => has('a')(c) && c.x < 0 && c.y > 0, tag: 'tip' },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '네 모서리를 다시 가운데 점에 맞춰 접어요.',
      moves: [
        { line: [[H / 2, -1], [H / 2, 1]], side: [H, 0], tag: 'b' },
        { line: [[-H / 2, -1], [-H / 2, 1]], side: [-H, 0], tag: 'b' },
        { line: [[-1, H / 2], [1, H / 2]], side: [0, H], tag: 'b' },
        { line: [[-1, -H / 2], [1, -H / 2]], side: [0, -H], tag: 'b' },
      ],
    },
    { text: '다시 뒤집어요.', moves: [flip] },
    {
      text: '연필로 액자 가운데에 꽃 한 송이를 그려요. 동그란 꽃잎과 줄기, 잎을 그려요.',
      view: [0, 0, 1],
      draw: [
        ...[0, 72, 144, 216, 288].map((a) => ({ line: arc([0.045 * Math.cos(((a + 90) * Math.PI) / 180), 0.05 + 0.045 * Math.sin(((a + 90) * Math.PI) / 180)], 0.028, 0.028, 0, 360, 18), w: 0.006, color: PENCIL })),
        { line: [[0, 0.005], [0, -0.17]], w: 0.008, color: PENCIL },
        { line: [[0, -0.09], [0.05, -0.06], [0.08, -0.08], [0.04, -0.1], [0, -0.09]], w: 0.006, color: PENCIL },
      ],
    },
    {
      text: '색연필로 꽃잎은 분홍, 가운데는 노랑, 잎은 초록으로 칠하면 완성!',
      view: [0, 0, 1],
      draw: [
        ...[0, 72, 144, 216, 288].map((a) => ({ dot: [0.045 * Math.cos(((a + 90) * Math.PI) / 180), 0.05 + 0.045 * Math.sin(((a + 90) * Math.PI) / 180)], r: 0.026, color: '#ef8fb0', under: true })),
        { dot: [0, 0.05], r: 0.024, color: '#f5c542' },
        fillPoly([[0, -0.09], [0.05, -0.06], [0.08, -0.08], [0.04, -0.1]], '#5aa36a'),
      ],
    },
  ],
};
