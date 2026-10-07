// 참새 (정사각형 색종이, 마름모 방향) — 개발 중
// 출처: Origami Club "Sparrow" (Fumiaki Shingu) https://en.origami-club.com/animal/bird/sparrow/
import { fishBase } from './parts/bases.js';

export const sparrow = {
  id: 'sparrow',
  name: '참새',
  level: 4,
  desc: '물고기 기본형에서 계단 접기로 날개와 꼬리를 만들고, 부리를 당겨 내리는 참새예요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e9a23b' },
  accent: '#b8741a',
  outline: [[0, -Math.SQRT1_2], [Math.SQRT1_2, 0], [0, Math.SQRT1_2], [-Math.SQRT1_2, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '참새 완성!',
  steps: [...fishBase()],
};
