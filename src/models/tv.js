// 텔레비전 (정사각형 색종이)
// 출처: Origami Club "TV" (Fumiaki Shingu) https://en.origami-club.com/easy/other/tv/
// 위·양옆을 좁게 접어 테두리를 만들고, 아래를 접어 올려 조작판을 만든다.
import { arc, box, PENCIL } from './parts/draw.js';
const H = 0.5, T = 0.375, S = 0.375, B = -0.3;

export const tv = {
  id: 'tv',
  name: '텔레비전',
  level: 1,
  desc: '위와 양옆을 좁게 접으면 테두리가, 아래를 올려 접으면 조작판이 생겨요. 단추를 그려 주세요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#4bb3d8' },
  accent: '#2b8cb0',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '텔레비전 완성! 화면에 좋아하는 그림을 그려 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '위 변을 점선에서 좁게 접어 내려요.', moves: [{ line: [[-1, T], [1, T]], side: [0, H] }] },
    {
      text: '양쪽 변을 점선에서 좁게 접어요.',
      moves: [
        { line: [[S, -1], [S, 1]], side: [H, 0] },
        { line: [[-S, -1], [-S, 1]], side: [-H, 0] },
      ],
    },
    { text: '아래 변을 점선에서 접어 올려요. 조작판이 돼요.', moves: [{ line: [[-1, B], [1, B]], side: [0, -H] }] },
    {
      text: '연필로 동그란 전원 단추와 네모 단추를 그리면 완성!',
      view: [0, 0, 1],
      draw: [
        { line: arc([-0.25, -0.2], 0.045, 0.045, 0, 360, 24), w: 0.012, color: PENCIL }, { dot: [-0.25, -0.2], r: 0.015, color: PENCIL },
        box(0.07, -0.23, 0.13, -0.17), box(0.16, -0.23, 0.22, -0.17), box(0.25, -0.23, 0.31, -0.17),
      ],
    },
  ],
};
