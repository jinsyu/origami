// 매미 (정사각형 색종이, 마름모 방향으로 놓음)
// 좌표: 화면 오른쪽 +x, 위쪽 +y, 보는 사람 쪽 +z. 앞면=흰 면, 뒷면=색깔 면
import { eye } from './parts/draw.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);
const isFlap = (c) => c.tags.has('flapR') || c.tags.has('flapL');
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

export const cicada = {
  id: 'cicada',
  name: '매미',
  level: 2,
  desc: '줄무늬 머리와 비스듬한 날개. 겹친 종이를 한 장씩 골라 접는 연습이에요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#4f9a5c' },
  accent: '#2f7d4a',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.32, -0.5, 1],
  finalView: [0, -0.3, 1],
  done: '매미 완성! 머리의 줄무늬와 양쪽으로 벌어진 날개를 확인해 보세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 마름모 모양으로 놓고, 아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'front' }],
    },
    {
      text: '양쪽 모서리를 위 꼭짓점에 맞춰 접어 올려요.',
      moves: [
        { line: [[0, 0], [R / 2, R / 2]], side: [1, 0], tag: 'flapR' },
        { line: [[0, 0], [-R / 2, R / 2]], side: [-1, 0], tag: 'flapL' },
      ],
    },
    {
      text: '접어 올린 두 장을 끝이 아래 바깥쪽으로 비스듬히 나오게 접어 내려요. 매미의 날개가 돼요.',
      moves: [
        { line: [[0, 0.38 * R], [R / 2, R / 2]], side: [0, R], filter: has('flapR') },
        { line: [[0, 0.38 * R], [-R / 2, R / 2]], side: [0, R], filter: has('flapL') },
      ],
    },
    {
      text: '위쪽 꼭짓점에서 맨 앞 한 장만 아래로 접어 내려요.',
      moves: [{ line: [[-1, 0.383], [1, 0.383]], side: [0, 1], filter: (c) => c.tags.has('front') && !isFlap(c) }],
    },
    {
      text: '남은 한 장도 접어 내려요. 앞 장보다 조금 위에서 접어 줄무늬가 보이게 해요.',
      moves: [{ line: [[-1, 0.43], [1, 0.43]], side: [0, 1], filter: (c) => !c.tags.has('front') && !isFlap(c) }],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '양쪽 옆을 비스듬히 접어 몸통 모양을 다듬어요.',
      moves: [
        { line: [[0.22, 0.75], [0.3, -0.1]], side: [1, 0.4] },
        { line: [[-0.22, 0.75], [-0.3, -0.1]], side: [-1, 0.4] },
      ],
    },
    { text: '다시 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '연필로 머리 양쪽 끝에 동그란 눈을 그리면 완성!',
      view: [0, -0.2, 1],
      draw: [...eye(-0.205, 0.36, 0.024), ...eye(0.205, 0.36, 0.024)],
    },
  ],
};
