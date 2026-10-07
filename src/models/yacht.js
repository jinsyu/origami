// 요트 (정사각형 색종이)
// 출처: Origami Club "Yacht" (Fumiaki Shingu) https://en.origami-club.com/easy/vehicle/yacht/
// 대각선으로 반 접고, 앞 장을 비스듬히 접어 흰 돛을 만든 뒤 아래를 접어 올려 배 몸통을 만든다.
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);

export const yacht = {
  id: 'yacht',
  name: '요트',
  level: 1,
  desc: '세 번만 접으면 하얀 돛을 단 요트가 돼요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#3fb0d4' },
  accent: '#238aae',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '요트 완성! 파란 바다 위에 띄워 보세요.',
  steps: [
    { text: '흰 면이 위로 오게 놓고, 왼쪽 위 모서리를 오른쪽 아래 모서리에 맞춰 대각선으로 반 접어요.', moves: [{ line: [[-H, -H], [H, H]], side: [-H, H], tag: 'front' }] },
    { text: '앞의 한 장을 점선에서 왼쪽으로 접어요. 하얀 돛이 생겨요.', moves: [{ line: [[0.03, -H], [H, H]], side: [0.45, -0.3], filter: has('front'), tag: 'sail' }] },
    { text: '아래쪽을 점선에서 접어 올려요. 배 몸통이 돼요.', moves: [{ line: [[-H, -0.27], [H, -0.33]], side: [0, -H] }] },
  ],
};
