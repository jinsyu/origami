// 게 (정사각형 색종이)
// 출처: Origami Club "Crab 2" (Fumiaki Shingu) https://en.origami-club.com/easy/sea/crab2/
// 세모 기본형(물풍선 기본형)을 만들어 거꾸로 놓고, 양쪽 끝을 안으로 뒤집어 접어 집게를 세운 뒤 다리를 접는다.
import { waterbombBase } from './parts/bases.js';
import { eye } from './parts/draw.js';
const H = 0.5;
const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };
const back = (c) => c.tags.has('f2'); // 뒤쪽 날개 (뒤집은 뒤에는 앞에 온다)
const flap = (c) => !c.tags.has('f2'); // 앞쪽 날개 두 겹
const top = (c) => c.z > -0.001;     // 그중 맨 앞 겹
const CL = [[-0.22, H], [0, 0]], CR = [[0.22, H], [0, 0]];

export const crab = {
  id: 'crab',
  name: '게',
  level: 3,
  desc: '세모 기본형에서 양쪽 끝을 안으로 뒤집어 접으면 집게가, 아래를 접으면 다리가 생겨요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#ee8aa8' },
  accent: '#c45d7d',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '게 완성!',
  steps: [
    ...waterbombBase(),
    { text: '꼭짓점이 아래로 오게 돌려 놓아요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: 180 } }], view: [0, 0, 1] },
    {
      text: '왼쪽 끝을 점선에서 안쪽으로 뒤집어 접어 위로 세워요. 집게가 돼요.',
      sim: true,
      swing: 'tuck', // 도안 화살표대로 모서리가 뒤로 돌아 넘어간다
      moves: [
        { line: CL, side: [-0.45, 0.45], filter: (c) => flap(c) && top(c) && c.x < 0, toward: -1, spine: [[0, 0], [-1, 1]], tag: 'clawL' },
        { line: CL, side: [-0.45, 0.45], filter: (c) => flap(c) && !top(c) && c.x < 0, toward: 1, spine: [[0, 0], [-1, 1]], tag: 'clawL' },
      ],
    },
    {
      text: '오른쪽 끝도 똑같이 안쪽으로 뒤집어 접어 집게를 세워요.',
      sim: true,
      swing: 'tuck', // 도안 화살표대로 모서리가 뒤로 돌아 넘어간다
      moves: [
        { line: CR, side: [0.45, 0.45], filter: (c) => flap(c) && top(c) && c.x > 0, toward: -1, spine: [[0, 0], [1, 1]], tag: 'clawR' },
        { line: CR, side: [0.45, 0.45], filter: (c) => flap(c) && !top(c) && c.x > 0, toward: 1, spine: [[0, 0], [1, 1]], tag: 'clawR' },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '아래 끝을 점선에서 접어 올려요.', moves: [{ line: [[-1, 0.22], [1, 0.22]], side: [0, 0.02], tag: 'belly' }] },
    {
      text: '앞쪽 날개의 양쪽 위 모서리를 점선에서 아래로 접어 내려요. 다리가 돼요.',
      moves: [
        { line: [[0, H], [-H, 0.32]], side: [-0.45, 0.48], filter: (c) => back(c) && c.x < 0, tag: 'legL' },
        { line: [[0, H], [H, 0.32]], side: [0.45, 0.48], filter: (c) => back(c) && c.x > 0, tag: 'legR' },
      ],
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '연필로 집게 아래에 동그란 눈을 그리면 완성!', view: [0, 0, 1], draw: [{ dot: [-0.19, 0.44], r: 0.035, color: '#ffffff' }, ...eye(-0.19, 0.44, 0.02), { dot: [0.19, 0.44], r: 0.035, color: '#ffffff' }, ...eye(0.19, 0.44, 0.02)] },
  ],
};
