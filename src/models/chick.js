// 병아리 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Chick" (Fumiaki Shingu) https://en.origami-club.com/easy/animal/chick/
// 왼쪽 모서리를 접었다 바깥으로 되접어 부리를 만들고, 반으로 접어 아래 끝을 넣어 접는다.
import { eye } from './parts/draw.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);

export const chick = {
  id: 'chick',
  name: '병아리',
  level: 1,
  desc: '모서리를 접었다 되접어 작은 부리를 만들고, 반으로 접으면 귀여운 병아리가 돼요.',
  paper: '정사각형 색종이 (노란색)',
  colors: { front: '#fbf8f1', back: '#f6c935' },
  accent: '#c99a0e',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '병아리 완성! 삐약삐약 소리도 내 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '왼쪽 모서리를 가운데 쪽으로 3분의 1만큼 접어요.', moves: [{ line: [[-2 * R / 3, -1], [-2 * R / 3, 1]], side: [-R, 0], tag: 'beak' }] },
    { text: '접은 끝을 다시 바깥으로 되접어 왼쪽으로 조금 삐져나오게 해요. 부리가 돼요.', moves: [{ line: [[-0.45, -1], [-0.45, 1]], side: [-R / 3, 0], filter: has('beak') }] },
    { text: '위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, R] }] },
    { text: '아래 끝을 점선에서 뒤로 접어 넣어요.', moves: [{ line: [[-1, -R + 0.11], [1, -R + 0.11]], side: [0, -R], toward: -1 }] },
    { text: '부리가 위로 오게 병아리를 비스듬히 세워요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: -28 } }], view: [0, 0, 1] },
    { text: '연필로 부리 옆에 눈을 그리면 완성!', view: [0, 0, 1], draw: [...eye(-0.36, 0.12, 0.024)] },
  ],
};
