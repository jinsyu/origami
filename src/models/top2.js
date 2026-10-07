// 딱지 팽이 (정사각형 색종이 두 장 + 이쑤시개)
// 두 장을 각각 4겹 띠로 접고 양 끝을 반대 방향으로 꺾은 뒤, 엇갈려 겹쳐 끝을 차례로 접어 끼운다.
import { arc, PENCIL } from './parts/draw.js';
const H = 0.5;
const A = (c) => c.tags.has('sheet0'), B = (c) => c.tags.has('sheet1');
const Y0 = 0.62, Y1 = -0.62; // 두 장을 처음 놓는 자리 (위·아래)
const W = 0.25, X0 = -0.0625; // 띠 폭, 끝을 꺾는 선이 시작하는 자리
const MID = Y0 - W / 2, RT = X0 + W, TOP = MID + RT, BOT = MID - RT; // 완성 사각형의 가운데·오른쪽·위·아래
const sq = [[-H, -H], [H, -H], [H, H], [-H, H]];

export const top2 = {
  id: 'top2',
  name: '딱지 팽이',
  level: 2,
  desc: '색종이 두 장을 띠로 접어 딱지처럼 엇갈려 끼우고, 가운데에 이쑤시개를 꽂아 돌려요.',
  paper: '정사각형 색종이 2장, 이쑤시개',
  colors: { front: '#fbf8f1', back: '#e0563f' },
  sheets: [
    { outline: sq, colors: { front: '#fbf8f1', back: '#e0563f' }, place: { y: Y0 } },
    { outline: sq, colors: { front: '#fbf8f1', back: '#2f7fc1' }, place: { y: Y1 } },
  ],
  accent: '#b8432f',
  view: [0.2, -0.45, 1],
  finalView: [0.25, -0.4, 1],
  done: '딱지 팽이 완성! 이쑤시개 윗부분을 엄지와 검지로 잡고 비틀어 돌려 보세요. 두 색이 섞여 보여요.',
  steps: [
    {
      text: '두 장 모두 색깔 면이 아래로 가게 놓고, 위 변을 아래 변에 맞춰 반으로 접어요.',
      moves: [
        { line: [[-1, Y0], [1, Y0]], side: [0, Y0 + 0.4], filter: A },
        { line: [[-1, Y1], [1, Y1]], side: [0, Y1 + 0.4], filter: B },
      ],
    },
    {
      text: '한 번 더 아래 변을 위 변에 맞춰 반으로 접어 가늘고 긴 띠를 만들어요.',
      moves: [
        { line: [[-1, Y0 - 0.25], [1, Y0 - 0.25]], side: [0, Y0 - 0.45], filter: A },
        { line: [[-1, Y1 - 0.25], [1, Y1 - 0.25]], side: [0, Y1 - 0.45], filter: B },
      ],
    },
    {
      text: '빨간 띠는 오른쪽 끝을 위로, 왼쪽 끝을 아래로 비스듬히 꺾어 접어요.',
      moves: [
        { line: [[X0, Y0 - W], [X0 + W, Y0]], side: [0.45, Y0 - 0.12], filter: A, tag: 'aR' },
        { line: [[-X0 - W, Y0 - W], [-X0, Y0]], side: [-0.45, Y0 - 0.12], filter: A, tag: 'aL' },
      ],
    },
    {
      text: '파란 띠도 똑같이 오른쪽 끝은 위로, 왼쪽 끝은 아래로 꺾어 접어요.',
      moves: [
        { line: [[X0, Y1 - W], [X0 + W, Y1]], side: [0.45, Y1 - 0.12], filter: B, tag: 'bR' },
        { line: [[-X0 - W, Y1 - W], [-X0, Y1]], side: [-0.45, Y1 - 0.12], filter: B, tag: 'bL' },
      ],
    },
    {
      text: '파란 띠를 옆으로 돌려 빨간 띠 위에 십자 모양으로 겹쳐 놓아요.',
      sim: true,
      moves: [
        { axis3: { a: [0, Y1 - 0.125, 0], b: [0, Y1 - 0.125, 1], angle: 90 }, filter: B },
        { axis3: { a: [0, 0, 0], b: [0, 0, 1], angle: 0 }, offset: [0, Y0 - Y1, 0.012], filter: B },
      ],
    },
    {
      text: '아래에 깔린 빨간 띠의 위쪽 끝을 파란 띠 위로 접어 내려요.',
      moves: [{ line: [[-1, TOP], [1, TOP]], side: [RT / 2, TOP + 0.02], filter: A, tag: 'f1' }],
    },
    {
      text: '파란 띠의 오른쪽 끝을 왼쪽으로 접어 덮어요.',
      moves: [{ line: [[RT, -1], [RT, 2]], side: [RT + 0.02, MID - 0.05], filter: B, tag: 'f2' }],
    },
    {
      text: '빨간 띠의 아래쪽 끝을 위로 접어 덮어요.',
      moves: [{ line: [[-1, BOT], [1, BOT]], side: [-RT / 2, BOT - 0.02], filter: A, tag: 'f3' }],
    },
    {
      text: '파란 띠의 왼쪽 끝을 오른쪽으로 접으면서, 끝을 맨 처음 접은 빨간 날개 밑으로 끼워 넣어요.',
      moves: [{ line: [[-RT, -1], [-RT, 2]], side: [-RT - 0.02, MID + 0.05], filter: B, insert: 1, tag: 'f4' }],
    },
    {
      text: '가운데에 이쑤시개를 꽂아 위아래로 조금씩 나오게 하면 완성!',
      view: [0, 0, 1],
      draw: [{ dot: [0, MID], r: 0.016, color: '#d8a868' }, { line: arc([0, MID], 0.016, 0.016, 0, 360, 16), w: 0.005, color: PENCIL }],
    },
  ],
};
