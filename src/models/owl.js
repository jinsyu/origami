// 부엉이 (정사각형 색종이, 마름모 방향)
// 연 모양 기본형 → 위 끝을 내려 머리 → 끝을 다시 올려 부리 → 아래 끝을 뒤로 접어 세운다.
const R = Math.SQRT1_2;
const S = Math.sin(Math.PI / 8), C = Math.cos(Math.PI / 8);
const has = (t) => (c) => c.tags.has(t);

export const owl = {
  id: 'owl',
  name: '부엉이',
  level: 5,
  desc: '연 모양 기본형에서 머리와 부리를 접어 내는 부엉이예요. 접었던 끝을 다시 되접는 계단 접기를 배워요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#8a5a3b' },
  accent: '#6e4429',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.1, 1],
  done: '부엉이 완성! 동그란 눈을 크게 그려 주세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 세로로 반 접었다 펴서 가운데 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    {
      text: '아래쪽 두 변을 가운데 선에 맞춰 접어요. 연 모양이 돼요. 양쪽이 날개예요.',
      moves: [
        { line: [[0, -R], [S, -R + C]], side: [R, 0], tag: 'wing' },
        { line: [[0, -R], [-S, -R + C]], side: [-R, 0], tag: 'wing' },
      ],
    },
    { text: '위 꼭짓점을 아래로 접어 내려요. 머리가 돼요.', moves: [{ line: [[-1, 0.4], [1, 0.4]], side: [0, R], tag: 'head' }] },
    { text: '내린 끝을 다시 위로 조금 접어 올려요. 부리가 돼요.', moves: [{ line: [[-1, 0.18], [1, 0.18]], side: [0, 0.1], filter: has('head'), tag: 'beak' }] },
    { text: '아래 꼭짓점을 뒤로 접어 세울 수 있게 해요. 부엉이 완성!', moves: [{ line: [[-1, -0.45], [1, -0.45]], side: [0, -R], toward: -1 }] },
  ],
};
