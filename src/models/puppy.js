// 강아지 (정사각형 색종이)
// 출처: Origami Club "A Dog" (Fumiaki Shingu) https://en.origami-club.com/easy/animal/dog/
// 오른쪽 두 모서리·왼쪽 아래 모서리·왼쪽 위 모서리를 접고 아래 절반을 뒤로 접은 뒤,
// 오른쪽을 펼쳐 눌러 얼굴을 만들고 귀를 당겨 내린다.
import { squashFlap } from './parts/folds.js';
import { arc, eye, cheek, fillPoly, PENCIL } from './parts/draw.js';
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);
const not = (t) => (c) => !c.tags.has(t);

// ear: 귀를 뒤집어 접는 선이 윗변과 만나는 점의 x (가운데에서). 도안·애니메이션 그림에서 약 0.16
export const puppyParams = { ear: 0.15 }; // 맞추기 결과 0.153
// 귀 접는 선: 윗변의 점 (sx·ear, H) 에서 귀 모서리 접힌 선과 대각선이 만나는 점 (sx·3H/4, 3H/4) 까지
const earMoves = (sx, ear) => {
  const B = [sx * 0.375, 0.375], hinge = [[sx * 0.25, H], B]; // 2단계에서 접은 모서리의 접힌 선 (펼쳐 누른 뒤 자리)
  const corner = sx > 0 ? has('cornerB') : has('cornerT');
  const face = has('face'), back = sx > 0 ? not('face') : (c) => c.tags.has('face_in') && !c.tags.has('face');
  const up = [sx * 0.27, 0.4], out = [sx * 0.27, 0.47];
  const line = [[sx * ear, H], B];
  return [
    // 안쪽에 접혀 있던 모서리를 꺼내 편다 (앞 겹은 앞으로, 뒤 겹은 뒤로 돌아 나온다)
    { line: hinge, side: up, filter: (c) => corner(c) && face(c), toward: 1 },
    { line: hinge, side: up, filter: (c) => corner(c) && !face(c), toward: -1 },
    // 귀를 바깥으로 뒤집어 접는다: 앞 겹은 앞으로, 뒤 겹은 뒤로
    { line, side: out, filter: face, toward: 1, tag: 'ear' },
    { line, side: out, filter: back, toward: -1, tag: 'ear' },
  ];
};

export function makePuppy({ ear } = puppyParams) {
  return {
    id: 'puppy',
    name: '귀 큰 강아지',
    level: 2,
    desc: '모서리를 접고 한쪽을 펼쳐 누르면 커다란 귀가 달린 강아지 얼굴이 나와요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#e8973f' },
    accent: '#c06f1c',
    outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
    view: [0.3, -0.45, 1],
    finalView: [0, 0.25, 1],
    done: '강아지 완성! 이름을 지어 주세요.',
    steps: [
      { text: '색깔 면이 아래로 가게 놓고, 가로·세로로 반씩 접었다 펴서 선을 만들어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], unfold: true }, { line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      {
        text: '오른쪽 위와 오른쪽 아래 모서리를 점선을 따라 조금 접어요.',
        moves: [
          { line: [[H / 2, H], [H, H / 2]], side: [H, H], tag: 'cornerT' },
          { line: [[H / 2, -H], [H, -H / 2]], side: [H, -H], tag: 'cornerB' },
        ],
      },
      { text: '왼쪽 아래 모서리를 가운데 점에 맞춰 접어요.', moves: [{ line: [[-H, 0], [0, -H]], side: [-H, -H] }] },
      { text: '왼쪽 위 모서리를 점선을 따라 비스듬히 접어 내려요.', moves: [{ line: [[-H, H / 3 * 2], [0, H]], side: [-H, H] }] },
      { text: '아래 절반을 가운데 선에서 뒤로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, -H], toward: -1, tag: 'back' }] },
      {
        text: '오른쪽 틈을 벌리고 비스듬한 점선을 따라 꾹 눌러 펼쳐요. 얼굴이 나와요.',
        sim: true,
        moves: squashFlap({ V: [0, 0], hd: [0, 1], sd: [1, 0], outer: has('back'), inner: not('back'), faceTag: 'face', size: 0.5 }),
      },
      {
        text: '양쪽 귀를 잡고 바깥 아래로 살살 당겨 내려요. 안에 접혀 있던 모서리가 나와 귀가 커져요.',
        sim: true,
        moves: [...earMoves(1, ear), ...earMoves(-1, ear)],
      },
      {
        text: '연필로 눈과 코, 입을 그려요.',
        view: [0, 0.25, 1],
        draw: [
          ...eye(-0.09, 0.29, 0.022), ...eye(0.09, 0.29, 0.022),
          fillPoly([[-0.035, 0.205], [0.035, 0.205], [0.012, 0.17], [-0.012, 0.17]], PENCIL),
          { line: [[-0.035, 0.205], [0.035, 0.205], [0.012, 0.17], [-0.012, 0.17], [-0.035, 0.205]], w: 0.008, color: PENCIL },
          { line: [[0, 0.17], [0, 0.14]], w: 0.007, color: PENCIL },
          { line: arc([-0.025, 0.14], 0.025, 0.02, 0, -180), color: PENCIL },
          { line: arc([0.025, 0.14], 0.025, 0.02, 180, 360), color: PENCIL },
        ],
      },
      {
        text: '색연필로 볼을 분홍색으로 칠하면 완성!',
        view: [0, 0.25, 1],
        draw: [cheek(-0.14, 0.18, 0.026), cheek(0.14, 0.18, 0.026)],
      },
    ],
    params: { ear },
    make: makePuppy,
  };
}
export const puppy = makePuppy();
