// 연필 (정사각형 색종이)
// 출처: Origami Club "Pencil" (Fumiaki Shingu) https://en.origami-club.com/easy/other/pencil/
// 위 변을 가늘게 접어 연필심 띠를 만들고, 양옆을 가운데로 접은 뒤 위 모서리를 접어 뾰족한 끝을 만든다.
const H = 0.5, T = 0.4375, B = 0.1875; // 띠를 접은 뒤 위 변, 모서리 접기 아래 끝

export const pencilParams = { sh: 0.11, ta: 0.03 };

export function makePencil({ sh, ta } = pencilParams) {
  return {
  params: { sh, ta },
  make: makePencil,
  id: 'pencil',
  name: '연필',
  level: 2,
  desc: '위를 가늘게 접어 연필심을 만들고, 모서리를 앞뒤로 접으면 뾰족한 연필이 돼요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#2f9fd0' },
  accent: '#1f7aa3',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '연필 완성! 여러 색으로 접어 필통에 넣어 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '위 변을 가운데 선에 맞춰 접었다 펴요.', moves: [{ line: [[-1, 0.25], [1, 0.25]], side: [0, 1], unfold: true }] },
    { text: '위 변을 방금 만든 선에 맞춰 접었다 펴요.', moves: [{ line: [[-1, 0.375], [1, 0.375]], side: [0, 1], unfold: true }] },
    { text: '위 변을 맨 위 선에 맞춰 가늘게 접어 내려요. 연필심이 돼요.', moves: [{ line: [[-1, T], [1, T]], side: [0, 1], tag: 'lead' }] },
    {
      text: '양쪽 변을 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[0.25, -1], [0.25, 1]], side: [H, 0], tag: 'sideR' },
        { line: [[-0.25, -1], [-0.25, 1]], side: [-H, 0], tag: 'sideL' },
      ],
    },
    {
      text: '가운데 위 모서리를 점선에서 바깥쪽 아래로 접어요. 하얀 나무가 보여요.',
      moves: [
        { line: [[0, B], [0.25, T]], side: [0.02, T - 0.02], filter: (c) => c.tags.has('sideR') },
        { line: [[0, B], [-0.25, T]], side: [-0.02, T - 0.02], filter: (c) => c.tags.has('sideL') },
      ],
    },
    {
      text: '바깥 위 모서리를 점선에서 뒤로 접어 뾰족한 연필 끝을 만들면 완성!',
      moves: [
        { line: [[0.25, sh], [ta, T]], side: [0.25, T], toward: -1 },
        { line: [[-0.25, sh], [-ta, T]], side: [-0.25, T], toward: -1 },
      ],
    },
  ],
};
}

export const pencil = makePencil();
