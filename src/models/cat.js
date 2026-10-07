// 고양이 얼굴 (정사각형 색종이, 마름모 방향)
// 위 꼭짓점을 내려 삼각형(꼭짓점 아래)을 만들고, 양쪽 모서리를 위로 접어 귀를 세운다.
const R = Math.SQRT1_2;
const ear = (c) => c.tags.has('earL') || c.tags.has('earR');

export const cat = {
  id: 'cat',
  name: '고양이 얼굴',
  level: 1,
  desc: '세모를 접고 양쪽 끝을 위로 올리면 뾰족한 귀가 생겨요. 세 번이면 끝나요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e08a3c' },
  pattern: 'stripes',
  accent: '#b4621f',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.15, 1],
  done: '고양이 얼굴 완성! 눈과 수염을 그려 주세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'front' }],
    },
    {
      text: '양쪽 모서리를 비스듬히 위로 접어 올려요. 끝이 위로 뾰족하게 나오면 귀가 돼요.',
      moves: [
        { line: [[0.38, 0], [0.26, -0.5]], side: [R, 0], tag: 'earR' },
        { line: [[-0.38, 0], [-0.26, -0.5]], side: [-R, 0], tag: 'earL' },
      ],
    },
    {
      text: '아래 꼭짓점을 뒤로 조금 접어 턱을 둥글게 만들어요.',
      moves: [{ line: [[-1, -0.5], [1, -0.5]], side: [0, -1], filter: (c) => !ear(c), toward: -1 }],
    },
  ],
};
