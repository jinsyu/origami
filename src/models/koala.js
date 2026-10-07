// 코알라 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Koala (face)" (Fumiaki Shingu) https://en.origami-club.com/easy/animal-face/koalaface/
// 세모의 양쪽을 아래로 내렸다가 바깥 위로 올려 큰 귀를 만들고, 뒤집어 아래를 접어 흰 입을 만든다.
import { eye, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2, A = R / 2;
const has = (t) => (c) => c.tags.has(t);
const ear = (c) => c.tags.has('earL') || c.tags.has('earR');
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
// 내린 날개만 접는 선: 가운데 선 위 (0,-0.169)에서 날개와 몸통이 이어진 변의 끝 (A,-A)까지
const UP = [[0, -0.169], [A, -A]]; // 귀 끝이 경첩 끝 바로 위에서 10° 바깥으로 기운 (0.44, 0.14) 에 온다
const mirror = (L) => L.map(([x, y]) => [-x, y]);

export const koala = {
  id: 'koala',
  name: '코알라 얼굴',
  level: 2,
  desc: '양쪽을 내렸다가 바깥 위로 올려 접으면 동그란 큰 귀가 생겨요. 커다란 코를 그려 주세요.',
  paper: '정사각형 색종이 (회색)',
  colors: { front: '#fbf8f1', back: '#9aa3ab' },
  accent: '#66707a',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.1, 1],
  done: '코알라 얼굴 완성!',
  steps: [
    { text: '색깔 면이 아래로 가게 마름모로 놓고, 반으로 접었다 펴서 가운데 세로 선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
    { text: '위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, R], tag: 'top' }] },
    {
      text: '양쪽 모서리를 아래 꼭짓점에 맞춰 내려 접어요.',
      moves: [
        { line: [[0, 0], [1, -1]], side: [R, 0], tag: 'flapR' },
        { line: [[0, 0], [-1, -1]], side: [-R, 0], tag: 'flapL' },
      ],
    },
    {
      text: '내린 날개를 점선에서 바깥 위로 접어 올려요. 귀가 돼요.',
      moves: [
        { line: UP, side: [0.02, -0.65], filter: has('flapR'), tag: 'earR' },
        { line: mirror(UP), side: [-0.02, -0.65], filter: has('flapL'), tag: 'earL' },
      ],
    },
    { text: '두 귀 사이의 작은 꼭짓점을 조금 접어 내려요.', moves: [{ line: [[-1, -0.06], [1, -0.06]], side: [0, -0.01], filter: (c) => !ear(c) }] },
    {
      text: '두 귀의 끝을 조금씩 접어 둥글게 만들어요.',
      moves: [
        { line: [[0.3, 0.07], [0.6, 0.07]], side: [0.44, 0.13], filter: has('earR') },
        { line: [[-0.3, 0.07], [-0.6, 0.07]], side: [-0.44, 0.13], filter: has('earL') },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '앞 장만 아래 끝을 점선에서 접어 올려요.', moves: [{ line: [[-1, -0.5], [1, -0.5]], side: [0, -R], filter: (c) => !c.tags.has('top'), tag: 'chin' }] },
    { text: '뒤에 남은 아래 끝을 점선에서 뒤로 접어요. 하얀 입이 생겨요.', moves: [{ line: [[-1, -0.5], [1, -0.5]], side: [0, -R], filter: (c) => c.tags.has('top'), toward: -1 }] },
    { text: '연필로 눈과 커다란 코를 그리면 완성!', view: [0, -0.1, 1], draw: [...eye(-0.14, -0.19, 0.022), ...eye(0.14, -0.19, 0.022), { dot: [0, -0.3], r: 0.055, ry: 0.075, color: PENCIL }] },
  ],
};
