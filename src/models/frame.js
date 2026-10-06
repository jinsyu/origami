// 액자 (정사각형 색종이)
// 방석 접기 → 가운데 끝을 되접기 → 뒤집어 한 번 더 방석 접기 → 다시 뒤집으면 흰 테두리 안에 색깔 판이 든 액자가 된다.
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

export const frame = {
  id: 'frame',
  name: '액자',
  level: 6,
  desc: '네 모서리를 가운데로 모으는 방석 접기를 앞뒤로 두 번 해서 흰 테두리가 있는 액자를 만들어요. 겹이 많아 꼼꼼함이 필요해요.',
  paper: '정사각형 색종이',
  colors: { front: '#7a4fb5', back: '#fbf8f1' },
  accent: '#5b3592',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0.1, -0.2, 1],
  done: '액자 완성! 가운데에 그림을 그리거나 사진을 붙여 보세요.',
  steps: [
    { text: '색깔 면이 위로 오게 놓고, 대각선으로 반 접었다 펴요.', moves: [{ line: [[-1, -1], [1, 1]], side: [0.5, -0.5], unfold: true }] },
    { text: '다른 대각선으로도 반 접었다 펴요. 가운데에 X 선이 생겨요.', moves: [{ line: [[-1, 1], [1, -1]], side: [0.5, 0.5], unfold: true }] },
    {
      text: '네 모서리를 가운데 점에 맞춰 접어요. 방석 접기예요.',
      moves: [
        { line: [[0, H], [H, 0]], side: [H, H], tag: 'a' },
        { line: [[H, 0], [0, -H]], side: [H, -H], tag: 'a' },
        { line: [[0, -H], [-H, 0]], side: [-H, -H], tag: 'a' },
        { line: [[-H, 0], [0, H]], side: [-H, H], tag: 'a' },
      ],
    },
    {
      text: '가운데에 모인 네 끝을 바깥쪽으로 조금 되접어요. 색깔 삼각형이 드러나요.',
      moves: [
        { line: [[0.2, 0], [0, 0.2]], side: [0.01, 0.01], filter: (c) => has('a')(c) && c.x > 0 && c.y > 0, tag: 'tip' },
        { line: [[0.2, 0], [0, -0.2]], side: [0.01, -0.01], filter: (c) => has('a')(c) && c.x > 0 && c.y < 0, tag: 'tip' },
        { line: [[-0.2, 0], [0, -0.2]], side: [-0.01, -0.01], filter: (c) => has('a')(c) && c.x < 0 && c.y < 0, tag: 'tip' },
        { line: [[-0.2, 0], [0, 0.2]], side: [-0.01, 0.01], filter: (c) => has('a')(c) && c.x < 0 && c.y > 0, tag: 'tip' },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '네 모서리를 다시 가운데 점에 맞춰 접어요.',
      moves: [
        { line: [[H / 2, -1], [H / 2, 1]], side: [H, 0], tag: 'b' },
        { line: [[-H / 2, -1], [-H / 2, 1]], side: [-H, 0], tag: 'b' },
        { line: [[-1, H / 2], [1, H / 2]], side: [0, H], tag: 'b' },
        { line: [[-1, -H / 2], [1, -H / 2]], side: [0, -H], tag: 'b' },
      ],
    },
    { text: '다시 뒤집어요. 액자 완성!', moves: [flip] },
  ],
};
