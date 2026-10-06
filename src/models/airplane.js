// 종이비행기 (정사각형 색종이)
// 좌표: 화면 오른쪽 +x, 위쪽 +y, 보는 사람 쪽 +z. 앞면=흰 면, 뒷면=색깔 면
const H = 0.5;
const T = Math.tan(Math.PI / 8);
const has = (t) => (c) => c.tags.has(t);
const WING = [[H, 0], [-H, 0.2]]; // 뒤집은 뒤의 날개 접는 선

export const airplane = {
  id: 'airplane',
  name: '종이비행기',
  level: 5,
  desc: '가운데 선에 맞춰 접고 날개를 펴는 뾰족한 비행기. 접은 뒤 직접 날려 보세요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#3b78c4' },
  accent: '#2a63a8',
  outline: [[-0.5, -H], [0.5, -H], [0.5, H], [-0.5, H]],
  view: [0.32, -0.5, 1],
  finalView: [0.75, 0.55, 1],
  done: '종이비행기 완성! 몸통 아래를 잡고 앞으로 살짝 밀듯이 날려 보세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 놓고, 반으로 접었다 펴서 가운데 선을 만들어요.',
      moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }],
    },
    {
      text: '위쪽 두 모서리를 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[0, H], [0.5, H - 0.5]], side: [0.5, H] },
        { line: [[0, H], [-0.5, H - 0.5]], side: [-0.5, H] },
      ],
    },
    {
      text: '비스듬한 가장자리를 한 번 더 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[0, H], [T, H - 1]], side: [0.5, 0] },
        { line: [[0, H], [-T, H - 1]], side: [-0.5, 0] },
      ],
    },
    {
      text: '접은 부분이 바깥으로 오도록 가운데 선을 따라 뒤로 반 접어요.',
      moves: [{ line: [[0, -1], [0, 1]], side: [-1, 0], toward: -1 }],
    },
    {
      text: '비행기를 옆으로 눕혀요. 뾰족한 앞부분이 왼쪽을 향해요.',
      moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: 90 } }],
    },
    {
      text: '앞쪽 날개를 접어 내려요. 윗변이 아래쪽 접힌 선에 닿게 맞춰요.',
      moves: [{ line: [[-H, 0], [H, 0.2]], side: [0, 0.5], filter: (c) => c.uv[0] > 0, tag: 'wingA' }],
    },
    {
      text: '비행기를 뒤집어요.',
      moves: [{ spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } }],
      view: [0, 0.4, 1],
    },
    {
      text: '반대쪽 날개도 똑같이 접어 내려요.',
      moves: [{ line: WING, side: [0, 0.5], filter: (c) => c.uv[0] < 0, tag: 'wingB' }],
    },
    {
      text: '두 날개를 펴서 몸통과 직각이 되게 하면 완성!',
      moves: [
        { line: WING, filter: has('wingB'), angle: 90, toward: 1 },
        { line: WING, filter: has('wingA'), angle: 90, toward: -1 },
      ],
      view: [0.6, 0.45, 1],
    },
  ],
};
