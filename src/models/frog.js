// 개구리 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "A Frog" (Fumiaki Shingu) https://en.origami-club.com/easy/sea/frog/
// 세모로 반 접고 오른쪽 주머니를 벌려 눌러 머리와 입을 만든 뒤, 돌려 놓고 왼쪽 끝을 접어 앞다리를 만든다.
import { squashFlap } from './parts/folds.js';
import { bigEye } from './parts/draw.js';
const R = Math.SQRT1_2;
const has = (t) => (c) => c.tags.has(t);
const not = (t) => (c) => !c.tags.has(t);

// 도안 그림에서 잰 값 (scripts/diagram.mjs --fit)
//  hinge: 벌려 누르는 선이 윗변과 만나는 점의 x (선의 다른 끝은 아래 꼭짓점), turn: 돌려 놓는 각도(도)
//  leg: 돌린 뒤 왼쪽 끝을 접는 선이 y=0 을 지나는 x, legTilt: 그 선이 세로에서 기운 각도(도)
export const frogParams = { hinge: 0.18, turn: 45, leg: -0.08, legTilt: 0 };
export function makeFrog(P = frogParams) {
  const { hinge, turn, leg, legTilt } = P;
  const V = [0, 0.05, 1];
  return {
    id: 'frog',
    name: '개구리',
    level: 2,
    desc: '세모의 한쪽 주머니를 벌려 눌러 입을 크게 벌린 개구리를 만들어요. 눈을 그려 주세요.',
    paper: '정사각형 색종이',
    colors: { front: '#fbf8f1', back: '#a6d36a' },
    accent: '#5d9a2a',
    outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
    view: [0.3, -0.45, 1],
    finalView: V,
    done: '개구리 완성! 개굴개굴~',
    params: P,
    make: makeFrog,
    steps: [
      { text: '색깔 면이 아래로 가게 마름모로 놓고, 반으로 접었다 펴서 가운데 세로선을 만들어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], unfold: true }] },
      { text: '위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, R], tag: 'top' }] },
      {
        text: '오른쪽 주머니를 벌리고 비스듬한 점선을 따라 꾹 눌러 펴요. 머리와 입이 생겨요.',
        sim: true,
        moves: squashFlap({ V: [hinge, 0], hd: [-hinge, -R], sd: [1, 0], outer: not('top'), inner: has('top'), faceTag: 'head', size: 0.6 }),
      },
      { text: '머리가 오른쪽 위로 가게 돌려 놓아요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: turn } }], view: V },
      { text: '왼쪽 끝을 점선에서 오른쪽으로 접어요. 머리와 입 밑으로 넣으면 앞다리가 돼요.', moves: [{ line: [[leg, 0], [leg + Math.tan((legTilt * Math.PI) / 180), 1]], side: [-1, 0], tag: 'leg', insert: 2 }] },
      {
        text: '연필로 머리 양쪽에 동그란 눈을 그리면 완성!',
        view: V,
        draw: [...bigEye(0.42, 0.02, 0.042), ...bigEye(0.14, -0.16, 0.042)],
      },
    ],
  };
}
export const frog = makeFrog();
