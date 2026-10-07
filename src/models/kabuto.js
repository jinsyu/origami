// 투구 (정사각형 색종이, 마름모 방향)
// 세모 → 양 끝을 아래 꼭짓점으로 → 날개 끝을 꼭대기로 올렸다가 바깥으로 꺾어 뿔 → 앞 장은 위로, 뒷장은 뒤로 접어 챙.
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);
const flap = (c) => c.tags.has('flapR') || c.tags.has('flapL');

export const kabuto = {
  id: 'kabuto',
  name: '투구',
  level: 2,
  desc: '양쪽 날개를 올렸다가 바깥으로 꺾어 뿔을 만드는 옛 장수의 투구예요. 앞뒤 장을 따로 접는 연습이에요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#3d6fb6' },
  accent: '#2b5594',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.2, 1],
  done: '투구 완성! 큰 종이로 접으면 머리에 쓸 수 있어요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'front' }] },
    {
      text: '양쪽 모서리를 아래 꼭짓점에 맞춰 접어 내려요. 마름모가 돼요.',
      moves: [
        { line: [[0, 0], [R, -R]], side: [R, 0], tag: 'flapR' },
        { line: [[0, 0], [-R, -R]], side: [-R, 0], tag: 'flapL' },
      ],
    },
    { text: '방금 접은 두 날개의 아래 끝을 꼭대기에 맞춰 접어 올려요.', moves: [{ line: [[-1, -R / 2], [1, -R / 2]], side: [0, -R], filter: flap, tag: 'up' }] },
    {
      text: '올린 끝을 비스듬히 바깥으로 꺾어 접어요. 투구의 뿔이 돼요.',
      moves: [
        { line: [[0, -R / 2], [0.16, -0.05]], side: [0.02, -0.02], filter: (c) => has('up')(c) && c.x > 0, tag: 'horn' },
        { line: [[0, -R / 2], [-0.16, -0.05]], side: [-0.02, -0.02], filter: (c) => has('up')(c) && c.x < 0, tag: 'horn' },
      ],
    },
    { text: '아래쪽 앞의 한 장을 뿔 바로 아래까지 접어 올려요. 투구의 챙이 돼요.', moves: [{ line: [[-1, -0.5], [1, -0.5]], side: [0, -R], filter: (c) => has('front')(c) && !flap(c) }] },
    { text: '남은 뒷장은 뒤로 접어 넣어요. 투구 완성!', moves: [{ line: [[-1, -0.5], [1, -0.5]], side: [0, -R], filter: (c) => !has('front')(c) && !flap(c), toward: -1 }] },
  ],
};
