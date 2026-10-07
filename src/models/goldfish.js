// 금붕어 (정사각형 색종이)
// 출처: Origami Club "Goldfish" (Fumiaki Shingu) https://en.origami-club.com/easy/sea/goldfish/
import { eye } from './parts/draw.js';
const H = 0.5;
const TILT = -Math.atan2(0.5, 1) * 180 / Math.PI; // 몸통 긴 변을 수평으로
const rot = ([x, y]) => { const a = (TILT * Math.PI) / 180; return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; };
const MOUTH = rot([-H, 0]); // 입 끝 (돌린 뒤)
const has = (t) => (c) => c.tags.has(t);
const DIAG = [[-H, 0], [H, H]];

export const goldfish = {
  id: 'goldfish',
  name: '금붕어',
  level: 2,
  desc: '반으로 접은 뒤 앞뒤를 대각선으로 접고 지느러미를 내려 접으면 꼬리가 큰 금붕어가 돼요.',
  paper: '정사각형 색종이',
  colors: { front: '#f06fa5', back: '#fbf8f1' },
  accent: '#c94c82',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, 0, 1],
  done: '금붕어 완성!',
  steps: [
    { text: '색깔 면이 위로 오게 놓고, 아래 변을 위 변에 맞춰 반으로 접어요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, -1], tag: 'front' }] },
    { text: '앞의 한 장을 점선을 따라 비스듬히 접어 내려요.', moves: [{ line: DIAG, side: [-0.4, 0.45], filter: has('front'), tag: 'fA' }] },
    { text: '뒤의 한 장도 같은 선을 따라 뒤로 접어요.', moves: [{ line: DIAG, side: [-0.4, 0.45], filter: (c) => !c.tags.has('front'), toward: -1, tag: 'fB' }] },
    { text: '앞쪽 오른쪽 위를 점선에서 아래로 접어 내려요. 지느러미가 돼요.', moves: [{ line: [[0, 0.25], [H, 0.05]], side: [0.45, 0.45], filter: has('front'), tag: 'fin' }] },
    { text: '금붕어가 옆으로 눕도록 돌려요.', moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle: TILT } }], view: [0, 0, 1] },
    { text: '입 끝을 점선에서 조금 뒤로 접어요.', moves: [{ line: [[MOUTH[0] + 0.07, -1], [MOUTH[0] + 0.07, 1]], side: [MOUTH[0], MOUTH[1]], toward: -1 }], view: [0, 0, 1] },
    { text: '연필로 눈을 그리면 완성!', view: [0, 0, 1], draw: [...eye(MOUTH[0] + 0.17, MOUTH[1] - 0.08, 0.024)] },
  ],
};
