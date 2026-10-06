// 오리 (정사각형 색종이, 마름모 방향)
// 연 모양 → 위 끝을 내려 뭉툭한 꼬리 → 뒤로 반 접기 → 가는 끝을 뒤집어 접어 목 → 목 끝을 다시 뒤집어 접어 머리.
const R = Math.SQRT1_2;
const s1 = Math.sin(Math.PI / 8), c1 = Math.cos(Math.PI / 8);
const deg = Math.PI / 180;
const P = [0.22, 0];                                   // 목을 세우는 선이 등선과 만나는 점 (눕힌 뒤 좌표)
const NECK = 72 * deg;                                 // 세운 목의 방향
const NECK_LINE = [P, [P[0] + Math.cos(NECK / 2), Math.sin(NECK / 2)]];
const nd = [Math.cos(NECK), Math.sin(NECK)];
const L = R - P[0];                                    // 목 길이
const Q = [P[0] + nd[0] * L * 0.62, nd[1] * L * 0.62];  // 머리를 꺾는 점
const HEAD = -12 * deg;                                // 머리(부리) 방향
const ha = (HEAD + NECK) / 2;
const HEAD_LINE = [Q, [Q[0] + Math.cos(ha), Q[1] + Math.sin(ha)]];
const TIP = [P[0] + nd[0] * L * 0.95, nd[1] * L * 0.95];

export const duck = {
  id: 'duck',
  name: '오리',
  level: 6,
  desc: '가는 끝을 뒤집어 접어 목을 세우고, 목 끝을 한 번 더 뒤집어 부리를 만들어요. 뒤집어 접기를 두 번 이어서 해요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e9c46a' },
  accent: '#b38a1f',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0.35, 0.3, 1],
  done: '오리 완성! 눈을 그리고 물 위에 띄워 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 세로로 반 접었다 펴서 가운데 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '아래쪽 두 변을 가운데 선에 맞춰 접어 연 모양을 만들어요.',
      moves: [
        { line: [[0, -R], [s1, -R + c1]], side: [R, 0] },
        { line: [[0, -R], [-s1, -R + c1]], side: [-R, 0] },
      ],
    },
    { text: '위 꼭짓점을 아래로 접어 내려 뭉툭한 꼬리를 만들어요.', moves: [{ line: [[-1, 0.25], [1, 0.25]], side: [0, R] }] },
    { text: '가운데 선을 따라 뒤로 반 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [-1, 0], toward: -1, tag: 'back' }] },
    { text: '접힌 쪽이 아래로 오게 눕혀요. 가는 끝이 오른쪽을 향해요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: 90 } }] },
    {
      text: '가는 끝을 바깥으로 뒤집어 접어 위로 세워요. 목이 돼요.',
      sim: true,
      moves: [
        { line: NECK_LINE, side: [0.6, 0.02], filter: (c) => !c.tags.has('back'), toward: 1, spine: [[0, 0], [1, 0]], tag: 'neck' },
        { line: NECK_LINE, side: [0.6, 0.02], filter: (c) => c.tags.has('back'), toward: -1, spine: [[0, 0], [1, 0]], tag: 'neck' },
      ],
    },
    {
      text: '목 끝을 앞으로 뒤집어 접어 머리와 부리를 만들어요. 오리 완성!',
      sim: true,
      moves: [
        { line: HEAD_LINE, side: TIP, spine: [P, [P[0] + nd[0], nd[1]]], filter: (c) => c.tags.has('neck') && !c.tags.has('back'), toward: 1 },
        { line: HEAD_LINE, side: TIP, spine: [P, [P[0] + nd[0], nd[1]]], filter: (c) => c.tags.has('neck') && c.tags.has('back'), toward: -1 },
      ],
    },
  ],
};
