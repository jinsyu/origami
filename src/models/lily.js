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
const turnLeftHalf = (tag) => ({ line: [[0, -1], [0, 1]], side: [-0.1, -0.3], filter: (c) => (c.tags.has(tag) || c.tags.has(`${tag}_in`)) && c.x < 0 });

export const lily = {
  id: 'lily',
  name: '백합',
  level: 10,
  desc: '물풍선 기본형의 네 날개를 모두 펼쳐 누르고, 네 면을 꽃잎 접기 한 뒤 꽃잎을 펼쳐요. 가장 긴 도전 과제예요.',
  paper: '정사각형 색종이',
  colors: { front: '#f2a33a', back: '#fbf8f1' },
  accent: '#c97a10',
  outline: tulip.outline,
  view: [0.3, -0.45, 1],
  finalView: [0.3, 0.6, 1],
  done: '백합 완성! 꽃잎 끝을 연필로 말아 주면 더 활짝 핀 꽃이 돼요.',
  steps: [
    ...tulip.steps.slice(0, 5),
    { text: '오른쪽 날개를 세워 틈을 벌리고, 가운데 선에 맞춰 마름모로 펼쳐 눌러요.', sim: true, moves: sq(1, flapOf(none, 1, 0.001), 'sqA') },
    { text: '왼쪽 반을 책장 넘기듯 오른쪽으로 넘겨요.', moves: [turnLeftHalf('sqA')] },
    { text: '드러난 왼쪽 날개도 펼쳐 눌러요.', sim: true, moves: sq(-1, flapOf(only1, -1, 0.001), 'sqB') },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 오른쪽 날개도 펼쳐 눌러요.', sim: true, moves: sq(1, flapOf(both, 1, 0.003), 'sqC') },
    { text: '왼쪽 반을 오른쪽으로 넘겨요.', moves: [turnLeftHalf('sqC')] },
    { text: '마지막 날개도 펼쳐 눌러요. 백합 기본형이 완성돼요.', sim: true, moves: sq(-1, flapOf(only2, -1, 0.0077), 'sqD') },
  ],
};
