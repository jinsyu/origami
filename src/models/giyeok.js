// 한글 ㄱ (기역) 접기 — 종이쌤 '한글 종이접기 시리즈' https://www.youtube.com/watch?v=CWgBEGnMbqM
// 방석 접기 → 끝 되접기 → 방석 접기 → 끝 되접기로 흰 바탕에 색 테두리 틀을 만들고, 두 변을 뒤로 넘겨 ㄱ 을 남긴다.
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);

export const giyeok = {
  id: 'giyeok',
  name: '한글 ㄱ',
  level: 1,
  desc: '방석 접기를 두 번 해서 테두리 틀을 만들고, 두 변을 뒤로 넘기면 한글 ㄱ 이 돼요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#2b2d33' },
  accent: '#2b2d33',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.1, 1],
  done: 'ㄱ 완성! 다른 자음도 접어 낱말을 만들어 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 세모로 반 접었다 펴요.', moves: [{ line: [[-1, -1], [1, 1]], side: [0.5, -0.5], unfold: true }] },
    { text: '다른 쪽으로도 세모로 반 접었다 펴요. 가운데에 X 선이 생겨요.', moves: [{ line: [[-1, 1], [1, -1]], side: [0.5, 0.5], unfold: true }] },
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
      text: '가운데에 모인 네 끝을 바깥쪽 접힌 선에 닿게 되접어요.',
      moves: [
        { line: [[H / 2, 0], [0, H / 2]], side: [0.01, 0.01], filter: (c) => has('a')(c) && c.x > 0 && c.y > 0 },
        { line: [[H / 2, 0], [0, -H / 2]], side: [0.01, -0.01], filter: (c) => has('a')(c) && c.x > 0 && c.y < 0 },
        { line: [[-H / 2, 0], [0, -H / 2]], side: [-0.01, -0.01], filter: (c) => has('a')(c) && c.x < 0 && c.y < 0 },
        { line: [[-H / 2, 0], [0, H / 2]], side: [-0.01, 0.01], filter: (c) => has('a')(c) && c.x < 0 && c.y > 0 },
      ],
    },
    {
      text: '마름모의 네 꼭짓점을 가운데 흰 네모의 변에 닿게 접어요.',
      moves: [
        { line: [[3 * H / 4, -1], [3 * H / 4, 1]], side: [H, 0], tag: 'b' },
        { line: [[-3 * H / 4, -1], [-3 * H / 4, 1]], side: [-H, 0], tag: 'b' },
        { line: [[-1, 3 * H / 4], [1, 3 * H / 4]], side: [0, H], tag: 'b' },
        { line: [[-1, -3 * H / 4], [1, -3 * H / 4]], side: [0, -H], tag: 'b' },
      ],
    },
    { text: '위쪽 테두리를 흰 네모의 변을 따라 아래로 접어 내려요. ㄱ 의 가로 획이에요.', moves: [{ line: [[-1, H / 2], [1, H / 2]], side: [0, H] }] },
    { text: '오른쪽 테두리도 흰 네모의 변을 따라 안쪽으로 접어요. ㄱ 의 세로 획이에요.', moves: [{ line: [[H / 2, -1], [H / 2, 1]], side: [H, 0] }] },
    { text: '왼쪽 테두리는 흰 네모의 변을 따라 뒤로 넘겨 접어요.', moves: [{ line: [[-H / 2, -1], [-H / 2, 1]], side: [-H, 0], toward: -1 }], view: [0.4, 0, 1] },
    { text: '아래 테두리도 뒤로 넘겨 접어요. 위와 오른쪽 획만 남아 ㄱ 이 돼요.', moves: [{ line: [[-1, -H / 2], [1, -H / 2]], side: [0, -H], toward: -1 }], view: [0, -0.4, 1] },
  ],
};
