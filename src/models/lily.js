// 백합 (정사각형 색종이, 마름모 방향)
// 사각 기본형 → 날개 네 개를 모두 펼쳐 눌러 개구리 기본형 → 네 면 꽃잎 접기 → 꽃잎을 펼쳐 꽃 모양으로.
import { has, not, and, flip, squash, squashFlap } from './parts/folds.js';
const R = Math.SQRT1_2;
const page = (filter, toward = 1) => ({ line: [[0, -1], [0, 1]], side: [filter.sideX ?? 0.1, -0.3], filter, toward });
const pageTurn = (pred, sideX) => ({ line: [[0, -1], [0, 1]], side: [sideX, -0.3], filter: pred });

// swaps[i]: i번째 날개 펼쳐 누르기에서 두 겹의 역할을 바꾼다 (개발용 탐색)
const pick = (sw, a, b) => (sw ? { outer: b, inner: a } : { outer: a, inner: b });
export const makeLily = (swaps = [1, 1, 1, 1]) => ({
  id: 'lily',
  name: '백합',
  level: 10,
  desc: '네 날개를 모두 펼쳐 누르고, 네 면을 꽃잎 접기 한 뒤 꽃잎을 펼쳐요. 가장 긴 도전 과제예요.',
  paper: '정사각형 색종이',
  colors: { front: '#f2a33a', back: '#fbf8f1' },
  accent: '#c97a10',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0.3, 0.6, 1],
  done: '백합 완성! 꽃잎 끝을 연필로 말아 주면 더 활짝 핀 꽃이 돼요.',
  steps: [
    { text: '색깔 면이 위로 오게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'f1' }] },
    { text: '오른쪽 끝을 왼쪽 끝에 맞춰 한 번 더 반으로 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], tag: 'f2' }] },
    { text: '위 날개를 세워 틈을 벌리고 꾹 눌러 마름모로 펼쳐 눌러요.', sim: true, moves: squash(-1, and(has('f2'), not('f1')), and(has('f2'), has('f1')), R, 'faceA') },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 날개도 펼쳐 눌러 사각 기본형을 만들어요.', sim: true, moves: squash(1, and(not('f2'), not('f1')), and(not('f2'), has('f1')), R, 'faceB') },
    {
      text: '오른쪽 날개를 세워 틈을 벌리고, 가운데 선에 맞춰 펼쳐 눌러요.',
      sim: true,
      moves: squashFlap({ V: [0, 0], hd: [0, -1], sd: [1, -1], size: R, faceTag: 'sqA',
        ...pick(swaps[0], (c) => !c.tags.has('f2') && !c.tags.has('f1') && !c.tags.has('faceB') && c.x > 0, (c) => c.tags.has('faceB') && c.x > 0) }),
    },
    { text: '왼쪽 반을 책장 넘기듯 오른쪽으로 넘겨요.', moves: [pageTurn((c) => (c.tags.has('sqA_in') || c.tags.has('sqA')) && c.x < 0, -0.1)] },
    {
      text: '드러난 왼쪽 날개도 똑같이 펼쳐 눌러요.',
      sim: true,
      moves: squashFlap({ V: [0, 0], hd: [0, -1], sd: [-1, -1], size: R, faceTag: 'sqB',
        ...pick(swaps[1], (c) => c.tags.has('f1') && !c.tags.has('f2') && !c.tags.has('faceB') && c.x < 0, (c) => c.tags.has('faceB') && c.tags.has('f1') && c.x < 0) }),
    },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    {
      text: '이쪽 오른쪽 날개도 펼쳐 눌러요.',
      sim: true,
      moves: squashFlap({ V: [0, 0], hd: [0, -1], sd: [1, -1], size: R, faceTag: 'sqC',
        ...pick(swaps[2], (c) => c.tags.has('f2') && c.tags.has('f1') && !c.tags.has('faceA') && c.x > 0, (c) => c.tags.has('f2') && c.tags.has('f1') && c.tags.has('faceA') && c.x > 0) }),
    },
    { text: '왼쪽 반을 오른쪽으로 넘겨요.', moves: [pageTurn((c) => (c.tags.has('sqC_in') || c.tags.has('sqC')) && c.x < 0, -0.1)] },
    {
      text: '마지막 날개도 펼쳐 눌러요. 개구리 기본형이 완성돼요.',
      sim: true,
      moves: squashFlap({ V: [0, 0], hd: [0, -1], sd: [-1, -1], size: R, faceTag: 'sqD',
        ...pick(swaps[3], (c) => c.tags.has('f2') && !c.tags.has('f1') && !c.tags.has('faceA') && c.x < 0, (c) => c.tags.has('f2') && !c.tags.has('f1') && c.tags.has('faceA') && c.x < 0) }),
    },
  ],
});
export const lily = makeLily();
