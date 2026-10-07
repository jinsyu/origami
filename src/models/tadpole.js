// 올챙이 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Tadpole" (Fumiaki Shingu) https://en.origami-club.com/easy/sea/tadpole/
// 세모로 두 번 접고, 앞 날개를 펼쳐 눌러 네모(머리)를 만든 뒤 남은 세모를 뒤로 접어 올려 꼬리를 만든다.
import { squashFlap } from './parts/folds.js';
import { arc, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);
const not = (t) => (c) => !c.tags.has(t);

// 꼬리 접는 선: 윗변의 점 (tailTop, 0) 에서 머리 왼쪽 변 위의 점 (-tailSide, -tailSide) 까지
export const tadpoleParams = { tailTop: -0.25, tailSide: 0.19 };
// 눈: 동그란 흰자 테두리 + 까만 눈동자 (붙이는 눈처럼)
const ring = (x, y, r) => [
  { dot: [x, y], r, color: '#ffffff' },
  { line: arc([x, y], r, r, 0, 360, 28), w: 0.008, color: PENCIL },
  { dot: [x + r * 0.15, y - r * 0.1], r: r * 0.55, color: PENCIL },
];

export function makeTadpole({ tailTop, tailSide } = tadpoleParams) {
  return {
    id: 'tadpole',
    name: '올챙이',
    level: 2,
    desc: '세모를 펼쳐 눌러 동그란 머리를 만들고, 남은 끝을 뒤로 접어 올리면 꼬리가 돼요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#9fca55' },
    accent: '#5f8a25',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: [0, -0.2, 1],
    done: '올챙이 완성! 연못에서 헤엄쳐요.',
    params: { tailTop, tailSide },
    make: makeTadpole,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'top' }] },
      { text: '오른쪽 끝을 왼쪽 끝에 맞춰 반으로 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], tag: 'flap' }] },
      {
        text: '앞 장의 틈을 벌리고 비스듬한 점선을 따라 꾹 눌러 네모로 펼쳐요. 올챙이 머리가 돼요.',
        sim: true,
        moves: squashFlap({ V: [0, 0], hd: [0, -1], sd: [-1, 0], outer: (c) => has('flap')(c) && has('top')(c), inner: (c) => has('flap')(c) && !has('top')(c), faceTag: 'head', size: R }),
      },
      {
        text: '왼쪽에 남은 세모를 점선에서 뒤로 접어 올려요. 꼬리가 돼요.',
        moves: [{ line: [[tailTop, 0], [-tailSide, -tailSide]], side: [-R + 0.05, -0.02], filter: not('flap'), toward: -1, tag: 'tail' }],
      },
      {
        text: '연필로 동그란 눈을 그려요.',
        view: [0, -0.2, 1],
        draw: [...ring(-0.117, -0.51, 0.04), ...ring(0.117, -0.51, 0.04)],
      },
      {
        text: '색연필로 빨간 입을 그리면 완성!',
        view: [0, -0.2, 1],
        draw: [{ line: arc([0, -0.585], 0.04, 0.025, 200, 340), w: 0.011, color: '#d9534f' }],
      },
    ],
  };
}
export const tadpole = makeTadpole();
