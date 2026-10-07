// 아이스크림 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Soft cream 2" (Fumiaki Shingu) https://en.origami-club.com/easy/food/soft-cream2/
// 아래 두 변을 가운데로 접어 콘을 만들고, 뒤집어 위 꼭짓점을 접었다 올려 크림 끝을 만든다.
const R = Math.SQRT1_2;
const s = Math.sin(Math.PI / 8), c = Math.cos(Math.PI / 8);
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
const has = (t) => (q) => q.tags.has(t);

export const icecream = {
  id: 'icecream',
  name: '아이스크림',
  level: 1,
  desc: '아래 두 변을 가운데로 접으면 과자 콘이, 위를 접었다 올리면 뾰족한 크림이 돼요.',
  paper: '정사각형 색종이 (주황색)',
  colors: { front: '#fbf8f1', back: '#f0a53a' },
  accent: '#c9801a',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '아이스크림 완성! 크림에 알록달록 토핑을 그려도 좋아요.',
  steps: [
    {
      text: '흰 면이 위로 오게 마름모로 놓고, 아래쪽 두 변을 가운데 선에 맞춰 접어요.',
      moves: [
        { line: [[0, -R], [s, -R + c]], side: [R, 0] },
        { line: [[0, -R], [-s, -R + c]], side: [-R, 0] },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '위 꼭짓점을 점선에서 접어 내려요.', moves: [{ line: [[-1, 0.525], [1, 0.525]], side: [0, R], tag: 'tip' }] },
    { text: '내린 끝을 점선에서 다시 위로 접어 올려요.', moves: [{ line: [[-1, 0.46], [1, 0.46]], side: [0, 0.36], filter: has('tip') }] },
    { text: '종이를 뒤집으면 완성!', moves: [flip], view: [0, 0.4, 1] },
  ],
};
