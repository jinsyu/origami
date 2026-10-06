// 백합 (정사각형 색종이)
// 물풍선 기본형 → 날개 네 개를 모두 펼쳐 눌러 백합 기본형 → 네 면 꽃잎 접기 → 꽃잎을 펼쳐 꽃 모양으로.
import { flip, squashFlap } from './parts/folds.js';
import { tulip } from './tulip.js';

const none = (c) => !c.tags.has('f1') && !c.tags.has('f2');
const only1 = (c) => c.tags.has('f1') && !c.tags.has('f2');
const only2 = (c) => c.tags.has('f2') && !c.tags.has('f1');
const both = (c) => c.tags.has('f1') && c.tags.has('f2');
const fresh = (c) => ![...c.tags].some((t) => t.startsWith('sq'));
// 날개(두 겹) 중 위 겹과 아래 겹: 아직 펼쳐 누르지 않은 조각 가운데 높이로 구분
const flapOf = (sheet, sx, zCut) => ({
  top: (c) => sheet(c) && fresh(c) && sx * c.x > 0 && c.z > zCut,
  bot: (c) => sheet(c) && fresh(c) && sx * c.x > 0 && c.z <= zCut,
});
// 맨 위 겹이 경첩 건너편으로 넘어가는 펼쳐 누르기
const sq = (sx, f, tag) => squashFlap({ V: [0, 0], hd: [0, -1], sd: [sx, -1], size: 0.5, faceTag: tag, outer: f.bot, inner: f.top });
const R = Math.SQRT1_2;
// 백합 기본형 한 면의 꽃잎 접기: 맨 위 한 장의 옆을 연 모양 선으로 안에 넣고, 아래 끝을 꼭대기까지 들어 올린다.
// (그 아래에 접혀 있는 겹과 옆 이음선이 맞지 않아 tearOk 로 이완을 끈다 — 이음선은 꽃잎 아래에 가려진다)
const petalFace = (face, tag) => {
  const s1 = Math.sin(Math.PI / 8), c1 = Math.cos(Math.PI / 8);
  const kR = [[0, -R], [s1, -R + c1]], kL = [[0, -R], [-s1, -R + c1]];
  return [
    { line: kR, side: [0.18, -0.5], filter: face, toward: -1, insert: 1, at: [0, 0.6] },
    { line: kL, side: [-0.18, -0.5], filter: face, toward: -1, insert: 1, at: [0, 0.6] },
    { line: [[-1, -R / 2], [1, -R / 2]], side: [0, -1], filter: face, toward: 1, at: [0.2, 1], tag },
  ];
};
const turnLeftHalf = (tag) => ({ line: [[0, -1], [0, 1]], side: [-0.1, -0.3], filter: (c) => (c.tags.has(tag) || c.tags.has(`${tag}_in`)) && c.x < 0, tag: `turn_${tag}` });
// 오른쪽 묶음(지금 면의 오른쪽 반 + 꽃잎 + 앞서 넘겨 둔 반쪽)을 왼쪽으로 넘겨 다음 면을 연다
const openNext = (face, petal, turned) => ({ line: [[0, -1], [0, 1]], side: [0.1, -0.3], filter: (c) => c.x > 0 && ['sq' + face, 'sq' + face + '_in', petal, turned].some((t) => c.tags.has(t)), noRejoin: true });

export const lily = {
  id: 'lily',
  name: '백합',
  level: 10,
  desc: '물풍선 기본형의 네 날개를 모두 펼쳐 누르고, 네 면을 꽃잎 접기 한 뒤 꽃잎을 펼쳐요. 가장 긴 도전 과제예요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#f2a33a' },
  accent: '#a3600b',
  outline: tulip.outline,
  view: [0.3, -0.45, 1],
  finalView: [0.55, 0.25, 1],
  done: '백합 완성! 꽃잎 끝을 연필로 말아 주면 더 활짝 핀 꽃이 돼요.',
  steps: [
    ...tulip.steps.slice(0, 5),
    { text: '오른쪽 날개를 세워 틈을 벌리고, 가운데 선에 맞춰 마름모로 펼쳐 눌러요.', sim: true, moves: sq(1, flapOf(only1, 1, -0.001), 'sqA') },
    { text: '왼쪽 반을 책장 넘기듯 오른쪽으로 넘겨요.', moves: [turnLeftHalf('sqA')] },
    { text: '드러난 왼쪽 날개도 펼쳐 눌러요.', sim: true, moves: sq(-1, flapOf(none, -1, 0.0033), 'sqB') },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 오른쪽 날개도 펼쳐 눌러요.', sim: true, moves: sq(1, flapOf(only2, 1, 0.001), 'sqC') },
    { text: '왼쪽 반을 오른쪽으로 넘겨요.', moves: [turnLeftHalf('sqC')] },
    { text: '마지막 날개도 펼쳐 눌러요. 백합 기본형이 완성돼요.', sim: true, moves: sq(-1, flapOf(both, -1, 0.0055), 'sqD') },
    { text: '맨 위 한 장의 아래 끝을 꼭대기까지 들어 올리면서, 양옆을 안으로 접어 넣어요. 꽃잎 접기예요.', sim: true, tearOk: true, moves: petalFace((c) => c.tags.has('sqD'), 'petalD') },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 면도 똑같이 꽃잎 접기를 해요.', sim: true, tearOk: true, moves: petalFace((c) => c.tags.has('sqB'), 'petalB') },
    { text: '오른쪽 묶음을 책장 넘기듯 왼쪽으로 넘겨 새 면을 펼쳐요.', moves: [openNext('B', 'petalB', 'turn_sqA')] },
    { text: '새로 펼친 면도 꽃잎 접기를 해요.', sim: true, tearOk: true, moves: petalFace((c) => c.tags.has('sqA'), 'petalA') },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽도 오른쪽 묶음을 왼쪽으로 넘겨 새 면을 펼쳐요.', moves: [openNext('D', 'petalD', 'turn_sqC')] },
    { text: '마지막 면도 꽃잎 접기를 해요. 꽃잎 네 장이 생겼어요.', sim: true, tearOk: true, moves: petalFace((c) => c.tags.has('sqC'), 'petalC') },
    {
      text: '꽃잎 네 장을 바깥쪽으로 둥글게 펼치면 백합 완성!',
      moves: [
        { line: [[-1, -R / 2], [1, -R / 2]], filter: (c) => c.tags.has('petalC'), angle: 60, toward: 1 },
        { line: [[-1, -R / 2], [1, -R / 2]], filter: (c) => c.tags.has('petalD'), angle: 35, toward: 1 },
        { line: [[-1, -R / 2], [1, -R / 2]], filter: (c) => c.tags.has('petalB'), angle: 35, toward: -1 },
        { line: [[-1, -R / 2], [1, -R / 2]], filter: (c) => c.tags.has('petalA'), angle: 60, toward: -1 },
      ],
      view: [0.55, 0.25, 1],
    },
  ],
};
