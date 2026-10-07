// 튤립 꽃 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Tulip" 꽃 부분 (Fumiaki Shingu) https://en.origami-club.com/easy/flowers/tulip/
// 아래 꼭짓점을 올려 삼각형(꼭짓점 위)을 만들고, 양쪽 모서리를 꼭짓점 건너편 위로 올려 꽃잎 세 개를 만든 뒤 아래 끝을 뒤로 접는다.
const R = Math.SQRT1_2;
// 오른쪽 모서리 (R,0)을 꼭짓점 건너편 위 (tx, ty)로 보내는 선: 두 점의 수직이등분선
const bisect = ([ax, ay], [bx, by]) => { const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay; return [[mx, my], [mx - dy, my + dx]]; };
const mirror = (L) => L.map(([x, y]) => [-x, y]);

export const flowerParams = { tx: -0.384, ty: 0.618, b: 0.164 };

export function makeFlower({ tx, ty, b } = flowerParams) {
  const PETAL = bisect([R, 0], [tx, ty]);
  return {
  params: { tx, ty, b },
  make: makeFlower,
  id: 'flower',
  name: '튤립 꽃',
  level: 1,
  desc: '세모에서 양쪽 끝을 꼭짓점 건너편 위로 올려 접으면 꽃잎 세 개가 벌어진 튤립이 돼요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#d94f6b' },
  accent: '#b03a55',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0.1, 1],
  done: '튤립 꽃 완성! 도화지에 붙이고 초록 줄기와 잎을 그려 보세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 마름모로 놓고, 아래 꼭짓점을 위 꼭짓점에 맞춰 반으로 접어요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'front' }],
    },
    {
      text: '오른쪽 모서리를 점선에서 왼쪽 위로 접어 올려요. 끝이 꼭짓점 건너편으로 삐죽 나오게 해요.',
      moves: [{ line: PETAL, side: [R, 0], tag: 'petalR' }],
    },
    {
      text: '왼쪽 모서리도 오른쪽 위로 똑같이 접어 올려요. 위쪽에 뾰족한 꽃잎 세 개가 생겨요.',
      moves: [{ line: mirror(PETAL), side: [-R, 0], tag: 'petalL' }],
    },
    {
      text: '아래 끝을 점선에서 뒤로 접으면 튤립 꽃 완성!',
      moves: [{ line: [[-1, b], [1, b]], side: [0, b - 0.3], toward: -1 }],
    },
  ],
};
}

export const flower = makeFlower();
