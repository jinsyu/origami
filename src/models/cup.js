// 컵 (정사각형 색종이, 마름모 방향)
// 옆 모서리를 맞은편 변에 닿게 접되, 접힌 윗변이 수평이 되도록 67.5° 선으로 접는다.
const R = Math.SQRT1_2;
const M = R * (1 - Math.SQRT1_2);            // 접는 선 위의 점 (≈0.207)
const C = M * (1 - Math.tan(Math.PI / 8));   // 접는 선이 아랫변과 만나는 점 (≈0.121)
const TOP = 2 * M;                   // 접힌 날개 윗변 높이 (≈0.414)
const flap = (c) => c.tags.has('flapL') || c.tags.has('flapR');

export const cup = {
  id: 'cup',
  name: '컵',
  level: 3,
  desc: '양쪽 모서리를 맞은편에 걸쳐 접는 컵. 정확히 맞춰 접는 연습에 좋아요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#2f8f9d' },
  accent: '#1f7381',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0.25, -0.3, 1],
  done: '컵 완성! 입구를 살짝 벌려 보세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 마름모로 놓고, 아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'front' }],
    },
    {
      text: '오른쪽 모서리를 왼쪽 변에 닿게 접어요. 접은 윗변이 바닥과 나란해야 해요.',
      moves: [{ line: [[C, 0], [M, M]], side: [R, 0], tag: 'flapR' }],
    },
    {
      text: '왼쪽 모서리도 똑같이 오른쪽 변에 닿게 접어요.',
      moves: [{ line: [[-C, 0], [-M, M]], side: [-R, 0], tag: 'flapL' }],
    },
    {
      text: '위쪽 꼭짓점의 앞 한 장을 앞으로 접어 내려요.',
      moves: [{ line: [[-1, TOP], [1, TOP]], side: [0, 1], filter: (c) => c.tags.has('front') && !flap(c) }],
    },
    {
      text: '남은 한 장은 뒤로 접어 내리면 컵 완성!',
      moves: [{ line: [[-1, TOP], [1, TOP]], side: [0, 1], filter: (c) => !c.tags.has('front') && !flap(c), toward: -1 }],
    },
  ],
};
