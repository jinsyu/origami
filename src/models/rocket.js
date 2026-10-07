// 로켓 (정사각형 색종이)
// 출처: Origami Club "A Rocket" (Fumiaki Shingu) https://en.origami-club.com/easy/vehicle/rocket/
// 위를 1/4 접어 내리고 뒤집어 위 모서리를 가운데로 접은 뒤, 양옆을 안으로 접었다가 다시 바깥으로 되접어 날개를 만든다.
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

// fin: 날개를 되접는 선의 x (가운데에서). 도안 그림에서 약 1/6
export const rocketParams = { fin: 1 / 6 };
export function makeRocket({ fin } = rocketParams) {
  return {
    id: 'rocket',
    name: '로켓',
    level: 1,
    desc: '뾰족한 머리와 양옆 날개가 있는 로켓이에요. 접었다가 다시 바깥으로 접어 날개를 만들어요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#3fae94' },
    accent: '#23826c',
    outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
    view: [0.3, -0.45, 1],
    finalView: [0, 0, 1],
    done: '로켓 완성! 우주로 출발해요.',
    params: { fin },
    make: makeRocket,
    steps: [
      { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '위쪽 절반의 가운데 점선에서 위 끝을 접어 내려요.', moves: [{ line: [[-1, H / 2], [1, H / 2]], side: [0, H], tag: 'band' }] },
      { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
      {
        text: '위의 양쪽 모서리를 가운데 선에 맞춰 접어 뾰족한 머리를 만들어요.',
        moves: [-1, 1].map((sx) => ({ line: [[0, H / 2], [sx * H, -H / 2]], side: [sx * H, H / 2], tag: 'roof' })),
      },
      {
        text: '양옆을 점선에서 가운데로 접어요.',
        moves: [-1, 1].map((sx) => ({ line: [[sx * H / 2, -1], [sx * H / 2, 1]], side: [sx * H, -0.4], tag: sx > 0 ? 'wingR' : 'wingL' })),
      },
      {
        text: '가운데에서 만난 두 끝을 점선에서 바깥으로 되접어요. 날개가 생겨요.',
        moves: [-1, 1].map((sx) => ({ line: [[sx * fin, -1], [sx * fin, 1]], side: [sx * 0.02, -0.4], filter: has(sx > 0 ? 'wingR' : 'wingL') })),
      },
      { text: '종이를 뒤집으면 로켓 완성!', moves: [flip], view: [0, 0, 1] },
    ],
  };
}
export const rocket = makeRocket();
