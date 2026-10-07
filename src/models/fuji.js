// 눈 덮인 산 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Fuji Mountain" (Fumiaki Shingu) https://en.origami-club.com/easy/other/fuji/
// 세모를 접고 앞 장 꼭대기를 접어 내렸다 올려 흰 눈을 만든 뒤, 꼭대기를 뒤로 접어 평평하게 한다.
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);

export const fuji = {
  id: 'fuji',
  name: '눈 덮인 산',
  level: 1,
  desc: '세모의 꼭대기를 접었다 올려 하얀 눈을 만들고, 뒤로 접어 평평한 산꼭대기를 만들어요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#b8823a' },
  accent: '#8f6020',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0.1, 1],
  done: '산 완성! 하얀 눈이 쌓인 높은 산이에요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'front' }] },
    { text: '앞의 한 장만 꼭대기를 점선에서 접어 내려요. 하얀 안쪽이 보여요.', moves: [{ line: [[-1, 0.53], [1, 0.53]], side: [0, 0.65], filter: has('front'), tag: 'cap' }] },
    { text: '내려 접은 끝을 조금만 다시 올려 접어요.', moves: [{ line: [[-1, 0.42], [1, 0.42]], side: [0, 0.37], filter: has('cap') }] },
    { text: '꼭대기를 점선에서 뒤로 접어 평평하게 만들면 완성!', moves: [{ line: [[-1, 0.49], [1, 0.49]], side: [0, 0.65], toward: -1 }] },
  ],
};
