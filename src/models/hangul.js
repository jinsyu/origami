// 한글 자모 (종이쌤 '한글 종이접기 시리즈'). 공통 틀·띠 접기·작품 만들기는 parts/hangul.js
import { H, letter, frameBase, stroke, tuck, turn, halfBehind, stripBase, flipOver, foldX, foldY } from './parts/hangul.js';

const ACROSS = { ko: '가로 획', en: 'the stroke across' };
const DOWN = { ko: '세로 획', en: 'the stroke down' };

export const giyeok = letter({
  id: 'giyeok', char: 'ㄱ', roman: 'giyeok', video: 'CWgBEGnMbqM',
  desc: ['방석 접기를 두 번 해서 테두리 틀을 만들고, 두 변을 뒤로 넘기면 한글 ㄱ 이 돼요.', 'Make a frame with two blintz folds, then fold two sides behind to leave the Korean letter ㄱ (giyeok).'],
  steps: [...frameBase(), stroke('top', ACROSS), stroke('right', DOWN), tuck('left'), tuck('bottom')],
});

export const nieun = letter({
  id: 'nieun', char: 'ㄴ', roman: 'nieun', video: 'tRma15N9DMo',
  desc: ['ㄱ 과 같은 테두리 틀을 만들고, 아래와 왼쪽 띠를 안으로 접으면 한글 ㄴ 이 돼요.', 'Make the same frame as ㄱ, then fold the bottom and left strips in to make the Korean letter ㄴ (nieun).'],
  steps: [...frameBase(), stroke('bottom', ACROSS), stroke('left', DOWN), tuck('right'), tuck('top')],
});

export const digeut = letter({
  id: 'digeut', char: 'ㄷ', roman: 'digeut', video: '61bcHYlqLSA',
  desc: ['테두리 틀에서 위·아래·왼쪽 띠를 안으로 접고 오른쪽만 뒤로 넘기면 한글 ㄷ 이 돼요.', 'Fold the top, bottom and left strips of the frame in and the right one behind to make the Korean letter ㄷ (digeut).'],
  steps: [...frameBase(), stroke('top'), stroke('bottom'), stroke('left'), tuck('right')],
});

export const mieum = letter({
  id: 'mieum', char: 'ㅁ', roman: 'mieum', video: 'aHHI5f5bI68',
  desc: ['테두리 틀의 네 띠를 모두 안으로 접으면 네모난 한글 ㅁ 이 돼요.', 'Fold all four strips of the frame in to make the square Korean letter ㅁ (mieum).'],
  steps: [...frameBase(), stroke('top'), stroke('bottom'), stroke('left'), stroke('right')],
});

const Q = (3 * H) / 4; // ㅇ 귀퉁이 접는 선 |x|+|y|=3H/4: 흰 창의 변을 늘인 선이 바깥 변과 만나는 점을 지난다
const corner = (sx, sy) => ({ line: [[sx * Q, 0], [0, sy * Q]], side: [sx * H, sy * H], toward: -1 });

export const ieung = letter({
  id: 'ieung', char: 'ㅇ', roman: 'ieung', video: 'dBbWGqU1pmM',
  desc: ['ㅁ 처럼 네 띠를 접은 뒤 네 귀퉁이를 뒤로 접으면 팔각형 고리 모양 한글 ㅇ 이 돼요.', 'Fold all four strips in like ㅁ, then fold the four corners behind to make the ring-shaped Korean letter ㅇ (ieung).'],
  steps: [
    ...frameBase(), stroke('top'), stroke('bottom'), stroke('left'), stroke('right'),
    {
      ko: '네 귀퉁이를 비스듬히 뒤로 접어요. 가운데 흰 창의 변을 늘인 선이 바깥 변과 만나는 점을 이어 접어요.',
      en: 'Fold the four corners behind at a slant, along lines joining the points where the edges of the white window, extended, meet the outer edges.',
      moves: [corner(1, 1), corner(1, -1), corner(-1, -1), corner(-1, 1)],
      view: [0.3, 0.3, 1],
    },
  ],
});

export const siot = letter({
  id: 'siot', char: 'ㅅ', roman: 'siot', video: 's-KnwiT-A6Q',
  desc: ['ㄱ 모양을 접은 뒤 비스듬히 돌려 반으로 접으면 지붕 같은 한글 ㅅ 이 돼요.', 'Fold a ㄱ shape, turn it on its corner and fold it in half to make the roof-shaped Korean letter ㅅ (siot).'],
  steps: [
    ...frameBase(), stroke('top'), stroke('right'), tuck('left'), tuck('bottom'),
    turn(45, '두 띠가 만나는 모서리가 위로 오게 비스듬히 돌려 마름모로 놓아요.', 'Turn the paper so the corner where the two strips meet points up, like a diamond.'),
    halfBehind('아래 절반을 가로 가운데 선에서 뒤로 반 접어요. 두 띠가 지붕처럼 남아요.', 'Fold the bottom half behind along the middle line. The two strips are left like a roof.'),
  ],
});

// ---- 모음: 색 면을 위로 놓고 접어 가는 막대 ----
export const i = letter({
  id: 'i', char: 'ㅣ', roman: 'i', video: 'cHuP7pYU5RI', blackUp: true,
  desc: ['종이를 위아래로 조금씩 접고, 양옆을 가운데로 두 번 모아 반 접으면 긴 막대 한글 ㅣ 가 돼요.', 'Fold the top and bottom in a little, then fold the sides to the middle twice and fold in half to make the long bar of the Korean letter ㅣ (i).'],
  steps: [
    ...stripBase(),
    { ko: '위쪽 끝을 조금(⅛) 접어 내려요. 흰 띠가 보여요.', en: 'Fold the top edge down a little (1/8). A white strip shows.', moves: [foldY(3 * H / 4, 1)] },
    flipOver(),
    { ko: '위쪽을 한 번 더 접어 내려요. 접는 선은 위에서 ¼ 되는 곳이에요.', en: 'Fold the top down once more, a quarter of the way from the top.', moves: [foldY(H / 2, 1)] },
    { ko: '아래쪽 끝을 조금(⅛) 접어 올려요.', en: 'Fold the bottom edge up a little (1/8).', moves: [foldY(-3 * H / 4, -1)] },
    { ko: '양쪽 끝을 가운데 선에 맞춰 접어요.', en: 'Fold both sides to the middle line.', moves: [foldX(H / 2, 1), foldX(-H / 2, -1)] },
    { ko: '양쪽을 한 번 더 가운데 선에 맞춰 접어요.', en: 'Fold both sides to the middle line once more.', moves: [foldX(H / 4, 1), foldX(-H / 4, -1)] },
    { ko: '가운데 선에서 반으로 접어 긴 막대를 만들어요.', en: 'Fold it in half along the middle line to make a long bar.', moves: [foldX(0, 1)] },
  ],
});

export const a = letter({
  id: 'a', char: 'ㅏ', roman: 'a', video: 'YFocQuNAT70', blackUp: true,
  desc: ['오른쪽 두 귀퉁이를 비스듬히 접으면서 가운데 띠를 남겨 짧은 획을 만들고, 막대로 접으면 한글 ㅏ 가 돼요.', 'Fold the two right corners at a slant, leaving a band in the middle for the short stroke, then fold it into a bar to make the Korean letter ㅏ (a).'],
  steps: [
    ...stripBase(),
    { ko: '위쪽 끝을 조금(⅛) 접어 내려요. 흰 띠가 보여요.', en: 'Fold the top edge down a little (1/8). A white strip shows.', moves: [foldY(3 * H / 4, 1)] },
    {
      ko: '오른쪽 위 귀퉁이를 비스듬히 접어 내려요. 귀퉁이 끝이 가운데 가로선 바로 위에 닿게 해요.',
      en: 'Fold the top right corner down at a slant so its tip touches just above the middle line.',
      moves: [{ line: [[H / 4, 3 * H / 4], [H, 0]], side: [0.45, 0.3] }],
    },
    {
      ko: '오른쪽 아래 귀퉁이도 비스듬히 접어 올려요. 두 귀퉁이 사이에 좁은 띠가 남아요. 짧은 획이 될 부분이에요.',
      en: 'Fold the bottom right corner up at a slant too. A narrow band is left between the two corners. It becomes the short stroke.',
      moves: [{ line: [[H, -H / 4], [H / 4, -H]], side: [0.45, -0.45] }],
    },
    flipOver(),
    { ko: '뾰족한 끝을 오른쪽으로 접어 넘겨요. 짧은 획 띠가 앞으로 나와요.', en: 'Fold the pointed end over to the right. The short-stroke band comes to the front.', moves: [foldX(-H / 2, -1)] },
    { ko: '위쪽을 한 번 더 접어 내려요. 접는 선은 위에서 ¼ 되는 곳이에요.', en: 'Fold the top down once more, a quarter of the way from the top.', moves: [foldY(H / 2, 1)] },
    { ko: '아래쪽 끝을 조금(⅛) 접어 올려요.', en: 'Fold the bottom edge up a little (1/8).', moves: [foldY(-3 * H / 4, -1)] },
    flipOver(),
    { ko: '왼쪽을 접어 넘겨 폭을 줄여요.', en: 'Fold the left side over to make it narrower.', moves: [foldX(-H / 2, -1)] },
    { ko: '가운데에서 반으로 뒤로 접어요.', en: 'Fold it in half behind along the middle.', moves: [{ ...foldX(0, 1), toward: -1 }] },
    flipOver(),
  ],
});

export const HANGUL = [giyeok, nieun, digeut, mieum, siot, ieung, i, a];
