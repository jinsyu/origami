// 피아노 (정사각형 색종이)
// 출처: Origami Club "Piano 2" (Fumiaki Shingu) https://en.origami-club.com/easy/other/piano2/
// 양옆을 좁게 접고 위 모서리를 비스듬히 접어 뚜껑을 만든 뒤, 뒤집어 아래를 접어 올려 건반을 만든다.
import { fill, PENCIL } from './parts/draw.js';
const H = 0.5, S = 0.375, K = -0.328; // 옆 띠 접는 선, 건반 접는 선
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
const key = (x) => fill(x - 0.022, -0.235, x + 0.022, -0.158, PENCIL);

export const piano = {
  id: 'piano',
  name: '피아노',
  level: 1,
  desc: '양옆을 좁게 접고 모서리를 비스듬히 접으면 그랜드 피아노 뚜껑이, 아래를 올려 접으면 하얀 건반이 생겨요.',
  paper: '정사각형 색종이 (검정·회색)',
  colors: { front: '#fbf8f1', back: '#4a4d55' },
  accent: '#3a3d44',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '피아노 완성! 도레미 연주해 볼까요?',
  steps: [
    { text: '흰 면이 위로 오게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '양쪽 끝을 점선에서 좁게 접어요.',
      moves: [
        { line: [[S, -1], [S, 1]], side: [H, 0] },
        { line: [[-S, -1], [-S, 1]], side: [-H, 0] },
      ],
    },
    { text: '왼쪽 위 모서리를 점선을 따라 비스듬히 접어요. 피아노 뚜껑이 돼요.', moves: [{ line: [[0, H], [-H, 0]], side: [-H, H] }] },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '아래 변을 점선에서 접어 올려요. 하얀 건반이 돼요.', moves: [{ line: [[-1, K], [1, K]], side: [0, -H] }] },
    { text: '연필로 검은 건반을 칠하면 완성!', view: [0, 0, 1], draw: [key(-0.12), key(0), key(0.12)] },
  ],
};
