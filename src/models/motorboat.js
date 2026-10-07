// 보트 (정사각형 색종이)
// 출처: Origami Club "Boat" (Fumiaki Shingu) https://en.origami-club.com/easy/vehicle/boat/
// 아래 1/3을 접어 올려 배 몸통을 만들고, 위 왼쪽과 아래 왼쪽을 비스듬히 뒤로 접어 조타실과 뱃머리를 만든다.
import { box, PENCIL } from './parts/draw.js';
const H = 0.5, T = 1 / 6; // 접어 올린 띠의 윗변 높이

export const motorboat = {
  id: 'motorboat',
  name: '보트',
  level: 1,
  desc: '세 번만 접으면 조타실이 있는 보트가 돼요. 창문을 그려 꾸며 보세요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#f39a1e' },
  accent: '#c97a0e',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '보트 완성! 파란 도화지에 붙이면 바다를 달리는 보트가 돼요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 아래 변을 3분의 1만큼 접어 올려요. 배 몸통이 돼요.', moves: [{ line: [[-1, -T], [1, -T]], side: [0, -1], tag: 'hull' }] },
    { text: '위 왼쪽을 점선을 따라 비스듬히 뒤로 접어요. 조타실이 돼요.', moves: [{ line: [[0.16, H], [-0.165, T]], side: [-0.4, 0.45], filter: (c) => c.y > T, toward: -1 }] },
    { text: '배 몸통의 왼쪽 아래 모서리를 비스듬히 뒤로 접어 뱃머리를 만들어요.', moves: [{ line: [[-H, T], [-0.183, -T]], side: [-0.48, -0.15], toward: -1 }] },
    {
      text: '연필로 조타실에 네모난 창문 두 개를 그리면 완성!',
      view: [0, 0, 1],
      draw: [box(0.07, 0.33, 0.14, 0.4), box(0.19, 0.33, 0.26, 0.4)],
    },
  ],
};
