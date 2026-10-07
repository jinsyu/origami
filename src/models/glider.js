// 글라이더 (정사각형 색종이): 앞을 뭉툭하게 접은 넓은 날개 비행기
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);
const WING = [[H, 0.12], [-H, 0.28]]; // 뒤집은 뒤의 날개 접는 선
const WING_A = [[-H, 0.12], [H, 0.28]];

export const glider = {
  id: 'glider',
  name: '글라이더',
  level: 3,
  desc: '앞을 뭉툭하게 접어 무게를 앞에 모은 넓은 날개 비행기예요. 천천히 오래 날아요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e76f51' },
  pattern: 'stripes',
  accent: '#c4502f',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.32, -0.5, 1],
  finalView: [0.75, 0.55, 1],
  done: '글라이더 완성! 수평으로 살짝 밀어 주면 천천히 미끄러지듯 날아요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 반으로 접었다 펴서 가운데 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '위쪽 두 모서리를 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[0, H], [0.5, 0]], side: [0.5, H] },
        { line: [[0, H], [-0.5, 0]], side: [-0.5, H] },
      ],
    },
    { text: '뾰족한 위 끝을 아래로 접어 내려 앞을 뭉툭하게 만들어요.', moves: [{ line: [[-1, 0.05], [1, 0.05]], side: [0, H], tag: 'nose' }] },
    { text: '접은 부분이 바깥으로 오도록 가운데 선을 따라 뒤로 반 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [-1, 0], toward: -1 }] },
    { text: '비행기를 옆으로 눕혀요. 뭉툭한 앞부분이 왼쪽을 향해요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: 90 } }] },
    { text: '앞쪽 날개를 접어 내려요.', moves: [{ line: WING_A, side: [0, 0.5], filter: (c) => c.uv[0] > 0, tag: 'wingA' }] },
    { text: '비행기를 뒤집어요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } }], view: [0, 0.4, 1] },
    { text: '반대쪽 날개도 똑같이 접어 내려요.', moves: [{ line: WING, side: [0, 0.5], filter: (c) => c.uv[0] < 0, tag: 'wingB' }] },
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
