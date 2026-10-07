// 펭귄 (정사각형 색종이, 마름모 방향, 흰 면이 위)
// 양옆을 앞으로 접어 검은 날개, 위 끝을 내려 머리, 그 끝을 다시 올려 부리, 아래 끝은 뒤로 접어 세운다.
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);

export const penguin = {
  id: 'penguin',
  name: '펭귄',
  level: 1,
  desc: '양옆을 접으면 검은 날개와 흰 배가, 위 끝을 두 번 접으면 머리와 부리가 생겨요. 산 접기도 처음 해 봐요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#2b2f36' },
  accent: '#3a4f6b',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.1, 1],
  done: '펭귄 완성! 눈을 그리고 세워 보세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 마름모로 놓고, 양쪽 모서리를 가운데 가까이 접어요. 검은 날개가 돼요.',
      moves: [
        { line: [[0.42, -1], [0.42, 1]], side: [R, 0], tag: 'wing' },
        { line: [[-0.42, -1], [-0.42, 1]], side: [-R, 0], tag: 'wing' },
      ],
    },
    { text: '위 꼭짓점을 아래로 접어 내려요. 머리가 돼요.', moves: [{ line: [[-1, 0.3], [1, 0.3]], side: [0, R], tag: 'head' }] },
    { text: '내린 끝을 다시 조금 접어 올려요. 부리가 돼요.', moves: [{ line: [[-1, 0.02], [1, 0.02]], side: [0, -0.1], filter: has('head'), tag: 'beak' }] },
    { text: '아래 꼭짓점을 뒤로 접어 세울 수 있게 해요. 펭귄 완성!', moves: [{ line: [[-1, -0.48], [1, -0.48]], side: [0, -R], toward: -1 }] },
  ],
};
