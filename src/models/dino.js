// 공룡 (정사각형 색종이, 마름모 방향)
// 연 모양 → 뒤로 반 접기 → 가는 끝을 뒤집어 접어 긴 목 → 목 끝을 뒤집어 머리 → 반대쪽 끝을 뒤집어 꼬리.
const R = Math.SQRT1_2;
const s1 = Math.sin(Math.PI / 8), c1 = Math.cos(Math.PI / 8);
const deg = Math.PI / 180;
const P = [0.16, 0];
const NECK = 78 * deg;
const nd = [Math.cos(NECK), Math.sin(NECK)];
const L = R - P[0];
const NECK_LINE = [P, [P[0] + Math.cos(NECK / 2), Math.sin(NECK / 2)]];
const Q = [P[0] + nd[0] * L * 0.7, nd[1] * L * 0.7];
const ha = (-5 * deg + NECK) / 2;
const HEAD_LINE = [Q, [Q[0] + Math.cos(ha), Q[1] + Math.sin(ha)]];
const TIP = [P[0] + nd[0] * L * 0.95, nd[1] * L * 0.95];
const T0 = [-0.3, 0];
const ta = (165 * deg + Math.PI) / 2;
const TAIL_LINE = [T0, [T0[0] + Math.cos(ta), Math.sin(ta)]];
const back = (c) => c.tags.has('back');

export const dino = {
  id: 'dino',
  name: '공룡',
  level: 7,
  desc: '뒤집어 접기를 세 번 해서 긴 목, 머리, 꼬리를 만드는 목 긴 공룡이에요. 접는 선의 각도를 잘 맞춰야 해요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#5a9e4b' },
  accent: '#3d7a31',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0.35, 0.3, 1],
  done: '공룡 완성! 등에 뾰족한 무늬를 그려 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 세로로 반 접었다 펴서 가운데 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '아래쪽 두 변을 가운데 선에 맞춰 접어 연 모양을 만들어요.',
      moves: [
        { line: [[0, -R], [s1, -R + c1]], side: [R, 0] },
        { line: [[0, -R], [-s1, -R + c1]], side: [-R, 0] },
      ],
    },
    { text: '가운데 선을 따라 뒤로 반 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [-1, 0], toward: -1, tag: 'back' }] },
    { text: '접힌 쪽이 아래로 오게 눕혀요. 가는 끝이 오른쪽을 향해요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: 90 } }] },
    {
      text: '가는 끝을 바깥으로 뒤집어 접어 높이 세워요. 긴 목이 돼요.',
      sim: true,
      moves: [
        { line: NECK_LINE, side: [0.6, 0.02], filter: (c) => !back(c) && c.x > 0, toward: 1, spine: [[0, 0], [1, 0]], tag: 'neck' },
        { line: NECK_LINE, side: [0.6, 0.02], filter: (c) => back(c) && c.x > 0, toward: -1, spine: [[0, 0], [1, 0]], tag: 'neck' },
      ],
    },
    {
      text: '목 끝을 앞으로 뒤집어 접어 머리를 만들어요.',
      sim: true,
      moves: [
        { line: HEAD_LINE, side: TIP, spine: [P, [P[0] + nd[0], nd[1]]], filter: (c) => c.tags.has('neck') && !back(c), toward: 1 },
        { line: HEAD_LINE, side: TIP, spine: [P, [P[0] + nd[0], nd[1]]], filter: (c) => c.tags.has('neck') && back(c), toward: -1 },
      ],
    },
    {
      text: '왼쪽 끝을 바깥으로 뒤집어 접어 살짝 들린 꼬리를 만들어요. 공룡 완성!',
      sim: true,
      moves: [
        { line: TAIL_LINE, side: [-0.6, 0.02], filter: (c) => !back(c) && c.x < 0, toward: 1, spine: [[0, 0], [-1, 0]] },
        { line: TAIL_LINE, side: [-0.6, 0.02], filter: (c) => back(c) && c.x < 0, toward: -1, spine: [[0, 0], [-1, 0]] },
      ],
    },
  ],
};
