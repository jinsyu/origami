// 백조 (정사각형 색종이, 마름모 방향)
// 연 모양 접기를 두 번 해서 길고 가는 목을 만들고, 마지막에 바깥 뒤집어 접기로 목을 세운다.
const R = Math.SQRT1_2;
const s1 = Math.sin(Math.PI / 8), c1 = Math.cos(Math.PI / 8);     // 22.5°
const s2 = Math.sin(Math.PI / 16), c2 = Math.cos(Math.PI / 16);   // 11.25°
const has = (t) => (c) => c.tags.has(t);
const NECK_LINE = [[-0.08, 0], [-0.08 - 0.643, 0.766]]; // 목을 세우는 선 (눕힌 뒤 좌표, 130°)

export const swan = {
  id: 'swan',
  name: '백조',
  level: 5,
  desc: '연 모양 접기를 두 번 해서 가늘고 긴 목을 만들어요. 마지막에 목을 바깥으로 뒤집어 세워요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbfaf6', back: '#5b8fd6' },
  accent: '#3c6fb8',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0.45, 0.35, 1],
  done: '백조 완성! 목을 살짝 앞으로 기울이면 더 우아해요.',
  steps: [
    {
      text: '흰 면이 위로 오게 마름모로 놓고, 세로로 반 접었다 펴서 가운데 선을 만들어요.',
      moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }],
    },
    {
      text: '아래쪽 두 변을 가운데 선에 맞춰 접어 연 모양을 만들어요.',
      moves: [
        { line: [[0, -R], [s1, -R + c1]], side: [R, 0] },
        { line: [[0, -R], [-s1, -R + c1]], side: [-R, 0] },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } }], view: [0, 0.4, 1] },
    {
      text: '아래쪽 두 변을 다시 가운데 선에 맞춰 접어 더 가늘게 만들어요.',
      moves: [
        { line: [[0, -R], [s2, -R + c2]], side: [R, -0.3] },
        { line: [[0, -R], [-s2, -R + c2]], side: [-R, -0.3] },
      ],
    },
    {
      text: '아래 뾰족한 끝을 위 꼭짓점에 맞춰 접어 올려요. 이 부분이 목이 돼요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'neck' }],
    },
    {
      text: '목 끝을 조금 접어 내려 머리를 만들어요.',
      moves: [{ line: [[-1, 0.5], [1, 0.5]], side: [0, 1], filter: has('neck'), tag: 'head' }],
    },
    {
      text: '가운데 선을 따라 뒤로 반 접어요.',
      moves: [{ line: [[0, -1], [0, 1]], side: [-1, 0], toward: -1, tag: 'back' }],
    },
    {
      text: '접힌 쪽이 아래로 오게 눕혀요. 목은 왼쪽을 향해요.',
      moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: 90 } }],
    },
    {
      text: '목을 바깥으로 뒤집어 접어 세워요. 목의 양쪽 면이 몸통을 감싸며 올라가요.',
      sim: true,
      moves: [
        { line: NECK_LINE, side: [-0.5, 0.02], filter: (c) => c.tags.has('neck') && !c.tags.has('back'), toward: 1, spine: [[0, 0], [-1, 0]] },
        { line: NECK_LINE, side: [-0.5, 0.02], filter: (c) => c.tags.has('neck') && c.tags.has('back'), toward: -1, spine: [[0, 0], [-1, 0]] },
      ],
    },
  ],
};
