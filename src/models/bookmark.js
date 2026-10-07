// 모서리 책갈피 (정사각형 색종이, 마름모 방향)
// 세모 → 앞장 꼭짓점을 아래로 내려 주머니 → 양쪽 모서리를 꼭대기로 올려 주머니 안에 끼운다. 책 모서리에 끼워 쓴다.
const R = Math.SQRT1_2;
const pocket = (c) => c.tags.has('pocket');

export const bookmark = {
  id: 'bookmark',
  name: '모서리 책갈피',
  level: 2,
  desc: '책 모서리에 쏙 끼우는 책갈피예요. 앞장으로 주머니를 만들고 양쪽 끝을 그 안에 끼워 넣어요. 얼굴을 그려 꾸며 보세요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#2bb3a3' },
  pattern: 'check',
  accent: '#178a7d',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0.1, 1],
  done: '모서리 책갈피 완성! 눈과 이빨을 그려 괴물 책갈피로 꾸며 보세요.',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'front' }] },
    { text: '앞의 한 장만 위 꼭짓점을 아래 변 가운데까지 접어 내려요. 이 장이 주머니가 돼요.', moves: [{ line: [[-1, R / 2], [1, R / 2]], side: [0, R], filter: (c) => c.tags.has('front'), tag: 'pocket' }] },
    { text: '오른쪽 모서리를 위 꼭짓점까지 올리면서 주머니 안으로 끼워 넣어요.', moves: [{ line: [[0, 0], [1, 1]], side: [R, 0.05], filter: (c) => !pocket(c), insert: 1, tag: 'tuckR' }] },
    { text: '왼쪽 모서리도 위 꼭짓점까지 올려 주머니 안으로 끼워 넣어요. 모서리 책갈피 완성!', moves: [{ line: [[0, 0], [-1, 1]], side: [-R, 0.05], filter: (c) => !pocket(c) && !c.tags.has('tuckR'), insert: 1, tag: 'tuckL' }] },
  ],
};
