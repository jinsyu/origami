// 강아지 얼굴 (정사각형 색종이, 마름모 방향)
const R = Math.SQRT1_2;
const ear = (c) => c.tags.has('earL') || c.tags.has('earR');

export const dog = {
  id: 'dog',
  name: '강아지 얼굴',
  level: 1,
  desc: '네 번만 접으면 귀가 축 늘어진 강아지가 나와요. 처음 접어 보는 친구에게 좋아요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#b8794a' },
  accent: '#9a5a2c',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.2, 1],
  done: '강아지 얼굴 완성! 눈과 코를 그려 주세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'front' }],
    },
    {
      text: '양쪽 모서리를 비스듬히 아래로 접어요. 끝이 얼굴 밖으로 늘어지게 하면 귀가 돼요.',
      moves: [
        { line: [[0.245, 0], [0.5285, -0.225]], side: [R, 0], tag: 'earR' },
        { line: [[-0.245, 0], [-0.5285, -0.225]], side: [-R, 0], tag: 'earL' },
      ],
    },
    {
      text: '아래 꼭짓점에서 앞의 한 장만 위로 조금 접어 올려요. 코가 돼요.',
      moves: [{ line: [[-1, -0.5], [1, -0.5]], side: [0, -1], filter: (c) => c.tags.has('front') && !ear(c) }],
    },
    {
      text: '남은 한 장은 뒤로 접어 턱을 만들어요.',
      moves: [{ line: [[-1, -0.56], [1, -0.56]], side: [0, -1], filter: (c) => !c.tags.has('front') && !ear(c), toward: -1 }],
    },
  ],
};
