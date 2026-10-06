// 학 (정사각형 색종이, 마름모 방향)
import { has, not, and, flip, squash } from './parts/folds.js';
const R = Math.SQRT1_2;

export const crane = {
  id: 'crane',
  name: '학',
  level: 9,
  desc: '사각 기본형에서 꽃잎 접기를 앞뒤로 하고, 목과 꼬리를 뒤집어 접어 세워요. 종이접기의 대표 작품이에요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#2e86ab' },
  accent: '#1f6a8a',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0.5, 0.4, 1],
  done: '학 완성! 날개를 살짝 벌리고 몸통을 부풀려 보세요.',
  steps: [
    { text: '색깔 면이 위로 오게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'f1' }] },
    { text: '오른쪽 끝을 왼쪽 끝에 맞춰 한 번 더 반으로 접어요.', moves: [{ line: [[0, -1], [0, 1]], side: [1, 0], tag: 'f2' }] },
    { text: '위 날개를 세워 틈을 벌리고 꾹 눌러 마름모로 펼쳐 눌러요.', sim: true, moves: squash(-1, and(has('f2'), not('f1')), and(has('f2'), has('f1')), R) },
    { text: '종이를 뒤집어요.', moves: [flip], view: [0, 0.4, 1] },
    { text: '이쪽 날개도 똑같이 펼쳐 눌러요. 사각 기본형이 완성돼요.', sim: true, moves: squash(1, and(not('f2'), not('f1')), and(not('f2'), has('f1')), R) },
  ],
};
