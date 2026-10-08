// 한글 자모 (종이쌤 '한글 종이접기 시리즈'). 공통 틀·띠 접기·작품 만들기는 parts/hangul.js
import { H, PIECE, letter, frameBase, stroke, tuck, turn, halfBehind, stripBase, flipOver, foldX, foldY, cutBand, glue, foldPiece, flipGlue, cutPiece, halveBands, discard, place, onSheet, onFirst } from './parts/hangul.js';

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

const ringSteps = () => [
  ...frameBase(), stroke('top'), stroke('bottom'), stroke('left'), stroke('right'),
  {
    ko: '네 귀퉁이를 비스듬히 뒤로 접어요. 가운데 흰 창의 변을 늘인 선이 바깥 변과 만나는 점을 이어 접어요.',
    en: 'Fold the four corners behind at a slant, along lines joining the points where the edges of the white window, extended, meet the outer edges.',
    moves: [corner(1, 1), corner(1, -1), corner(-1, -1), corner(-1, 1)],
    view: [0.3, 0.3, 1],
  },
];

export const ieung = letter({
  id: 'ieung', char: 'ㅇ', roman: 'ieung', video: 'dBbWGqU1pmM',
  desc: ['ㅁ 처럼 네 띠를 접은 뒤 네 귀퉁이를 뒤로 접으면 팔각형 고리 모양 한글 ㅇ 이 돼요.', 'Fold all four strips in like ㅁ, then fold the four corners behind to make the ring-shaped Korean letter ㅇ (ieung).'],
  steps: ringSteps(),
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

export const bieup = letter({
  id: 'bieup', char: 'ㅂ', roman: 'bieup', video: '-xVLMJNclHY',
  desc: ['테두리 틀의 위쪽 띠를 가위로 잘라 가운데에 풀로 붙이고, 나머지 띠를 접으면 한글 ㅂ 이 돼요.', 'Cut the top strip off the frame, glue it across the middle and fold the other strips in to make the Korean letter ㅂ (bieup).'],
  steps: [
    ...frameBase(),
    cutBand('top', 'bar'),
    stroke('bottom'),
    glue('bar', { from: 'top', move: [0, -5 * H / 8] }, '떼어 낸 띠를 검은 면이 위로 오게 가운데에 가로로 놓고 풀로 붙여요.', 'Lay the cut strip across the middle, black side up, and glue it down.'),
    stroke('left'), stroke('right'),
  ],
});

export const kieuk = letter({
  id: 'kieuk', char: 'ㅋ', roman: 'kieuk', video: 'N3nEvq11kS8',
  desc: ['테두리 틀의 왼쪽 띠를 가위로 잘라 가운데 가로 획으로 붙이면 한글 ㅋ 이 돼요.', 'Cut the left strip off the frame and glue it across the middle to make the Korean letter ㅋ (kieuk).'],
  steps: [
    ...frameBase(),
    cutBand('left', 'bar'),
    stroke('top'),
    glue('bar', { from: 'left', rot: 90, move: [0, 5 * H / 8] }, '떼어 낸 띠를 돌려 가운데에 가로로 놓고 풀로 붙여요. 오른쪽 끝은 오른쪽 띠 자리까지 닿게 해요.', 'Turn the cut strip, lay it across the middle and glue it down so its right end reaches the right strip.'),
    stroke('right'),
    tuck('bottom'),
  ],
});

export const tieut = letter({
  id: 'tieut', char: 'ㅌ', roman: 'tieut', video: 'ca4QSfRyVC8',
  desc: ['테두리 틀의 오른쪽 띠를 가위로 잘라 가운데 가로 획으로 붙이면 한글 ㅌ 이 돼요.', 'Cut the right strip off the frame and glue it across the middle to make the Korean letter ㅌ (tieut).'],
  steps: [
    ...frameBase(),
    cutBand('right', 'bar'),
    stroke('top'), stroke('bottom'),
    glue('bar', { from: 'right', rot: -90, move: [0, 5 * H / 8] }, '떼어 낸 띠를 돌려 가운데에 가로로 놓고 풀로 붙여요.', 'Turn the cut strip, lay it across the middle and glue it down.'),
    stroke('left'),
  ],
});

// ㅍ: 좌우 띠를 잘라 길이 방향으로 반 접어 가는 막대로 만들고, 뒤집어 안쪽 세로 획으로 붙인다.
// 잘라 낸 오른쪽 조각은 떼어 놓아 x∈[3H/4, H] (안쪽 변 = 자른 변). 가운데 x=7H/8 에서 바깥 절반을 접으면 x∈[3H/4, 7H/8].
// x=H/2 를 축으로 뒤집으면 x∈[H/8, H/4] — 긴 변(자른 변)이 바깥 H/4, 접힌 변이 안쪽 H/8 (영상 측정과 같음)
export const pieup = letter({
  id: 'pieup', char: 'ㅍ', roman: 'pieup', video: 'w5s8iuARnKk',
  desc: ['테두리 틀의 양옆 띠를 잘라 가늘게 접은 뒤 안쪽 세로 획으로 붙이면 한글 ㅍ 이 돼요.', 'Cut off the side strips of the frame, fold them thin and glue them on as the inner strokes to make the Korean letter ㅍ (pieup).'],
  steps: [
    ...frameBase(),
    cutBand('right', 'barR'),
    cutBand('left', 'barL'),
    {
      ko: '떼어 낸 띠 두 개를 각각 길이 방향으로 반 접어 가는 막대를 만들어요.',
      en: 'Fold each cut strip in half lengthwise to make two thin bars.',
      moves: [foldPiece('barR', foldX(7 * H / 4 / 2, 1)), foldPiece('barL', foldX(-7 * H / 4 / 2, -1))],
    },
    {
      ko: '막대를 뒤집어 흰 네모 위에 세로로 붙여요. 가운데에 흰 창이 남게 두 막대를 나란히 놓아요.',
      en: 'Turn the bars over and glue them upright on the white square, side by side with a white gap in the middle.',
      moves: [flipGlue('barR', [[H / 2, -1], [H / 2, 1]]), flipGlue('barL', [[-H / 2, -1], [-H / 2, 1]])],
      torn: true,
      view: [0, 0, 1],
    },
    stroke('top'), stroke('bottom'),
  ],
});

// ㄹ (영상 순서): 띠를 한 번 더 반 접어 가늘게(H/8) → 왼쪽 띠를 통째로, 오른쪽 띠의 아래 절반을 잘라 낸다 →
// 위·아래 띠를 안으로 접는다 → 왼쪽 띠를 돌려 가운데 가로 획(y∈[0, H/8])으로 붙이고 오른쪽 띠를 접어 그 끝을 덮는다 →
// 짧은 조각을 펼쳐 반대쪽으로 다시 접은 뒤 안쪽 왼쪽 아래(x∈[-H/2, -3H/8], y∈[-H/2, 0])에 붙인다
export const rieul = letter({
  id: 'rieul', char: 'ㄹ', roman: 'rieul', video: 'tzuSzLH3usE',
  desc: ['가늘게 접은 테두리 띠에서 두 조각을 가위로 잘라 가운데 획과 왼쪽 아래 획으로 옮겨 붙이면 한글 ㄹ 이 돼요.', 'Cut two pieces off the thin border strips and glue them on as the middle stroke and the lower left stroke to make the Korean letter ㄹ (rieul).'],
  steps: [
    ...frameBase(), halveBands(),
    cutBand('left', 'bar'),
    cutPiece({
      ko: '오른쪽 띠는 아래 절반만 잘라 내요. 가운데 높이에서 가로로 한 번, 흰 네모의 변을 따라 아래로 한 번 잘라요.',
      en: 'Cut off only the lower half of the right strip: once across at the middle, then down along the edge of the white square.',
      cuts: [
        // 흰 네모 변 x=H/2 로 모든 겹(띠 밑에 깔린 바탕 층까지)을 먼저 나눠 두고, 그 오른쪽을 가운데 높이에서 가로로 자른다
        { line: [[H / 2, -1], [H / 2, 1]], side: [H, 0], cut: false },
        { line: [[-1, 0], [1, 0]], side: [H, -H], filter: (c) => c.x > H / 2 },
      ],
      tag: 'leg', pull: [H / 4, 0],
    }),
    stroke('top'), stroke('bottom'),
    // 시계 방향으로 돌려 긴 변(자른 변)이 아래로: 왼쪽 끝이 아래에서 오른쪽 위로 비스듬해 왼쪽 아래 획과 이어진다 (영상 완성 모습)
    glue('bar', { from: 'left', rot: -90, move: [0, -H / 2] }, '왼쪽에서 떼어 낸 긴 띠를 돌려 흰 네모 가운데에 가로로 붙여요. ㄹ 의 가운데 획이에요.', 'Turn the long strip cut from the left and glue it across the middle of the white square. This is the middle stroke of ㄹ.'),
    { ...stroke('right'), ko: '오른쪽 띠를 흰 네모의 변을 따라 안쪽으로 접어 가운데 획의 끝을 덮어요.', en: 'Fold the right strip inward along the edge of the white square so it covers the end of the middle stroke.' },
    {
      ko: '오른쪽에서 잘라 낸 짧은 띠를 펼쳐, 반대쪽으로 다시 접어요.',
      en: 'Open the short strip cut from the right and fold it again the other way.',
      // 떼어 놓은 자리 x∈[3H/4, 7H/8], 바깥 변 x=7H/8 이 반 접은 선. 펼친 뒤 같은 선에서 뒤로 접는다
      sim: true, tearOk: true, // 잘린 조각만 움직이므로 이웃과 끌어당기지 않게
      // 위 겹(반 접혀 올라온 절반)만 오른쪽으로 펼친 뒤, 그 겹을 같은 선에서 뒤로 넘겨 접는다
      moves: [
        foldPiece('leg', { ...foldX(7 * H / 8, -1), grab: [13 * H / 16, -H / 4], layers: 'all', half: 'front', tag: 'legOpen' }),
        foldPiece('leg', { ...foldX(7 * H / 8, 1), toward: -1, filter: (q) => q.tags.has('legOpen') }),
      ],
    },
    {
      ko: '짧은 띠를 흰 네모 안쪽 왼쪽 아래에 세로로 붙여요.',
      en: 'Glue the short strip upright inside the white square at the lower left.',
      moves: [place('leg', { move: [-5 * H / 4, 0] })],
      torn: true,
      view: [0, 0, 1],
    },
  ],
});

// ㅑ (영상 0Ax-hbENp8Q 4:00~12:20 순서). 흰 면 위.
// 양옆: 오른쪽은 1/8 한 번, 왼쪽은 1/8 접고 1/4 선에서 한 번 더 말아(4:12) 폭 5/8 = 기둥 1/8 + 흰 3/8 + 기둥 1/8 → 띠 칸 5개가 모두 1/8.
// 위: 3/8 접어 내림(위 변을 아래 1/4 선에 맞춤, 4:48). 접어 내린 부분의 오른쪽·왼쪽 아래 모서리를 대각선으로 접었다 펴(5:24~7:13)
// 맨 위 1/8 띠는 내려 둔 채 그 아래 흰 부분을 띠 아래 변에서 올려 세운다(7:15~9:12). 띠가 맨 위 접는 선에서 통째로 내려가 있으므로
// 바탕 쪽 꼭짓점은 평평하게 접힌다. 다만 양옆 기둥 부분을 흰 부분 뒤로 넣는 곳(흰 부분 아래 모서리)과 칸 하나만 젖혀 세우는 곳(옆 칸과의 모서리)은
// 가와사키 조건을 맞출 수 없어 영상도 손으로 눌러 구겨 넣는다(기둥 칸의 비스듬한 자국, 9:53~9:58). 엔진은 그 두 단계만 tearOk.
// 세운 흰 부분의 위 절반을 접어 내리면 띠 줄(9:16~9:40): 종이 맨 위 1/8 의 뒷면(검정), 가운데 칸에 대각선 X 자국, 그 양옆 칸 밑에 뒤로 넣은 기둥 부분.
// 칸 세우기(9:50~10:40) → 아래를 세 번 접어 올려 막대(10:55~11:30) → 뒤집으면 짧은 획도 검정(11:43).
const Y8 = H / 4; // 1/8
const flap = (c) => c.tags.has('flap');
export const ya = letter({
  id: 'ya', char: 'ㅑ', roman: 'ya', video: '0Ax-hbENp8Q',
  desc: ['위쪽을 접어 내리고 모서리를 비스듬히 접어 띠를 만든 뒤, 띠의 두 칸을 세우고 막대로 접으면 한글 ㅑ 가 돼요.', 'Fold the top down, fold its corners at a slant to make a band, stand two of its squares up and fold the rest into a bar to make the Korean letter ㅑ (ya).'],
  steps: [
    { ko: '흰 면이 위로 오게 놓고, 위아래로 반 접었다 펴요.', en: 'Place the paper white side up. Fold it in half top to bottom and unfold.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, H], unfold: true }] },
    { ko: '위·아래 변을 가운데 선에 맞춰 접었다 펴서 가로로 네 칸을 만들어요.', en: 'Fold the top and bottom edges to the middle line and unfold, making four rows.', moves: [{ ...foldY(H / 2, 1), unfold: true }, { ...foldY(-H / 2, -1), unfold: true }] },
    { ko: '옆으로도 반 접었다 펴요.', en: 'Fold it in half side to side and unfold.', moves: [{ line: [[0, -1], [0, 1]], side: [H, 0], unfold: true }] },
    { ko: '양옆 변을 가운데 선에 맞춰 접었다 펴서 세로로 네 칸을 만들어요.', en: 'Fold both side edges to the middle line and unfold, making four columns.', moves: [{ ...foldX(H / 2, 1), unfold: true }, { ...foldX(-H / 2, -1), unfold: true }] },
    { ko: '오른쪽 변을 오른쪽 세로 선에 맞춰 접어요. 검은 기둥이 생겨요.', en: 'Fold the right edge to the nearest vertical line. A black column appears.', moves: [foldX(3 * Y8, 1)] },
    { ko: '왼쪽 변도 왼쪽 세로 선에 맞춰 접어요.', en: 'Fold the left edge to the nearest vertical line too.', moves: [foldX(-3 * Y8, -1)] },
    { ko: '왼쪽 기둥을 세로 선에서 한 번 더 접어 넘겨요. 왼쪽 기둥은 두 번 말려요.', en: 'Fold the left column over once more along the vertical line. The left column is rolled twice.', moves: [foldX(-2 * Y8, -1)] },
    { ko: '위 변을 아래쪽 가로 선에 맞춰 접어 내려요.', en: 'Fold the top edge down to the lower horizontal line.', moves: [{ ...foldY(Y8, 1), tag: 'flap' }] },
    { ko: '접어 내린 부분의 오른쪽 아래 모서리를 비스듬히 접어 올렸다가 펴요. 대각선 접는 선이 생겨요.', en: 'Fold the lower right corner of the folded part up at a slant, then unfold. You get a diagonal crease.', moves: [{ line: [[0, -2 * Y8], [3 * Y8, Y8]], side: [0.3, -0.2], filter: flap, unfold: true }] },
    { ko: '왼쪽 아래 모서리도 비스듬히 접어 올렸다가 펴요.', en: 'Fold the lower left corner up at a slant and unfold too.', moves: [{ line: [[-2 * Y8, Y8], [Y8, -2 * Y8]], side: [-0.2, -0.2], filter: flap, unfold: true }] },
    {
      ko: '맨 위 띠(1/8)는 내려 둔 채, 그 아래 부분을 띠 아래 변에서 위로 접어 올려 세워요. 양옆 검은 기둥 부분은 흰 부분 뒤로 접어 넣고, 기둥 칸의 대각선 자리를 꾹 눌러 정리해요.',
      en: 'Keep the top band (1/8) down and fold the part below it up along the lower edge of the band so it stands. Tuck the black column parts behind the white part and press the diagonal of each column square flat.',
      sim: true, tearOk: true, torn: true,
      moves: [
        { line: [[2 * Y8, -1], [2 * Y8, 1]], side: [0.33, -0.1], filter: (c) => flap(c) && c.y < 0 && c.x > 2 * Y8, at: [0, 0.6] },
        { line: [[-Y8, -1], [-Y8, 1]], side: [-0.2, -0.1], filter: (c) => flap(c) && c.y < 0 && c.x < -Y8, at: [0, 0.6] },
        { line: [[-1, 0], [1, 0]], side: [0, -0.1], filter: (c) => flap(c) && c.y < 0, tag: 'white', at: [0.25, 1] },
      ],
    },
    { ko: '세운 흰 부분의 위 절반을 접어 내려요. 맨 위에 검은 띠가 생겨요.', en: 'Fold the top half of the standing white part down. A black band forms along the top.', moves: [{ ...foldY(Y8, 1), tag: 'band' }] },
    {
      ko: '띠에서 왼쪽 기둥 옆 칸을 위로 젖혀 세워요. 옆 칸은 손가락으로 눌러 두고 그 칸만 들어 올려요.',
      en: 'Stand up the square of the band next to the left column. Hold the next square down with a finger and lift just that square.',
      sim: true, tearOk: true, torn: true,
      moves: [
        { line: [[0, -1], [0, 1]], side: [0.01, Y8 / 2], angle: 0, seam: true, filter: (c) => c.tags.has('band') },
        { line: [[-1, Y8], [1, Y8]], side: [-Y8 / 2, Y8 / 2], filter: (c) => c.tags.has('band') && c.x < 0, tag: 'tabA' },
      ],
      view: [0.15, -0.35, 1],
    },
    {
      ko: '세운 왼쪽 칸의 앞 겹 왼쪽 위 세모를 대각선으로 뒤로 접어 넣어요. 칸이 반은 검정, 반은 흰색이 돼요.',
      en: 'Fold the upper left triangle of the front layer of the left square behind along the diagonal. The square becomes half black, half white.',
      moves: [{ line: [[-Y8, Y8], [0, 2 * Y8]], side: [-Y8 + 0.01, 2 * Y8 - 0.01], filter: (c) => c.tags.has('tabA') && c.uv[0] > -2 * Y8 }], // 앞 겹과 칸 왼쪽 변에서 이어진 뒤 겹(기둥 부분)을 함께 앞으로 접어 넘긴다 (뒤로 돌리면 뒤의 기둥 겹을 뚫는다)
      view: [0, -0.2, 1],
    },
    {
      ko: '오른쪽 기둥 옆 칸도 같은 방법으로 세워요.',
      en: 'Stand up the square next to the right column the same way.',
      sim: true, tearOk: true, torn: true,
      moves: [
        { line: [[Y8, -1], [Y8, 1]], side: [Y8 - 0.01, Y8 / 2], angle: 0, seam: true, filter: (c) => c.tags.has('band') && !c.tags.has('tabA') },
        { line: [[-1, Y8], [1, Y8]], side: [1.5 * Y8, Y8 / 2], filter: (c) => c.tags.has('band') && !c.tags.has('tabA') && c.x > Y8, tag: 'tabB' },
      ],
      view: [0.15, -0.35, 1],
    },
    { ko: '아래 흰 부분을 띠 바로 밑까지 접어 올려요.', en: 'Fold the white bottom part up to just below the band.', moves: [foldY(-2 * Y8, -1)] },
    { ko: '한 번 더 접어 올려요.', en: 'Fold it up once more.', moves: [foldY(-Y8, -1)] },
    { ko: '한 번 더 접어 올려 띠를 덮어요. 짧은 획 두 개가 위로 나온 막대가 돼요.', en: 'Fold it up once more to cover the band. You get a bar with two short strokes sticking up.', moves: [foldY(0, -1)] },
    flipOver('종이를 뒤집어요. 짧은 획 두 개도 검은색이 돼요.', 'Turn the paper over. The two short strokes are black too.'),
    turn(-90, '짧은 획이 오른쪽을 향하게 돌려 세워요.', 'Turn it so the short strokes point to the right.'),
  ],
});

// ---- 두 장: 첫 장은 ㅅ 지붕(네 띠를 모두 접은 ㅁ 을 45° 돌려 반 접기), 둘째 장으로 위 가로 막대(ㅊ 은 꼭지까지) ----
const SX = 1.4; // 둘째 장을 놓는 자리 (첫 장 오른쪽)
const APEX = Math.SQRT2 / 4; // 지붕 꼭대기 높이 (ㅁ 의 반 폭 H/2 를 45° 돌린 것)
const roof = () => onFirst([
  ...frameBase(), stroke('top'), stroke('bottom'), stroke('left'), stroke('right'),
  turn(45, '모서리가 위로 오게 비스듬히 돌려 마름모로 놓아요.', 'Turn it on its corner like a diamond.'),
  halfBehind('아래 절반을 가로 가운데 선에서 뒤로 반 접어요. 지붕 모양이 돼요.', 'Fold the bottom half behind along the middle line. It looks like a roof.'),
]);
const sheet2 = (steps) => onSheet(steps, 1, [SX, 0]);
// 둘째 장: ㅁ 테두리 → 가로 가운데를 잘라 위 반쪽만 막대로 (아래 반쪽은 scrap)
const barSheet = () => sheet2([
  ...frameBase().map((st, i) => (i === 0 ? { ...st, ko: '두 번째 색종이도 ' + st.ko, en: 'With a second sheet: ' + st.en } : st)),
  stroke('top'), stroke('bottom'), stroke('left'), stroke('right'),
  cutPiece({
    ko: '가로 가운데 선을 따라 가위로 잘라 반으로 나눠요.', en: 'Cut it in half along the middle line with scissors.',
    cuts: [{ line: [[-1, 0], [1, 0]], side: [0, -H] }], tag: 'scrap', pull: [0, -H / 4],
  }),
]);
const foldBar = () => sheet2([
  { ko: '위 반쪽을 가로로 반 접어 검은 막대를 만들어요.', en: 'Fold the top half in half across to make a black bar.', moves: [foldY(H / 4, 1)] },
]);
// 막대(둘째 장 위 반쪽을 반 접은 것, 처음 y∈[0, H/4])를 가운데로 옮겨 위 변이 top 에 오게 얹는다
const placeBar = (top, ko = '막대를 지붕 꼭대기에 가로로 얹어 풀로 붙여요.', en = 'Lay the bar across the top of the roof and glue it on.') => ({
  ko, en,
  moves: [{ axis3: { a: [0, 0, 0], b: [0, 0, 1], angle: 0 }, offset: [-SX, top - H / 4, 0.02], filter: (c) => c.tags.has('sheet1') && ![...c.tags].some((t) => t.startsWith('cut:')) }],
  view: [0, 0, 1],
});
// 꼭지: 아래 반쪽(H/4 내려 둠)의 오른쪽 띠 x∈[H/4, H/2] 를 잘라 H/4 떼어 놓은 조각 → 가운데 x=0, 위 끝 top, 막대·지붕 뒤에
const stemCut = () => sheet2([cutPiece({
  ko: '아래 반쪽에서 오른쪽 검은 띠만 가위로 잘라 내요. 꼭지가 될 조각이에요.', en: 'From the bottom half, cut off just the black strip on the right. It becomes the stem.',
  cuts: [{ line: [[H / 4, -1], [H / 4, 1]], side: [H, 0], filter: (c) => c.tags.has(PIECE('scrap')) }], tag: 'stem', pull: [H / 4, 0],
})])[0];
const dropScrap = () => ({
  ...discard('scrap', [0, -2], '나머지 반쪽은 쓰지 않아요. 치워 두세요.', 'You do not need the rest of the bottom half. Put it aside.'),
  moves: [{ axis3: { a: [0, 0, 0], b: [0, 0, 1], angle: 0 }, offset: [0, -2, 0], filter: (q) => q.tags.has(PIECE('scrap')) && !q.tags.has(PIECE('stem')) }],
  drop: (q) => q.tags.has(PIECE('scrap')) && !q.tags.has(PIECE('stem')),
});
const placeStem = (top) => ({
  ko: '꼭지를 막대 뒤에 세로로 붙여요. 위쪽 끝만 막대 위로 나오게 해요.', en: 'Glue the stem upright behind the bar so only its top sticks out above the bar.',
  // 꼭지 처음 자리: x∈[SX+H/2, SX+3H/4], 위 끝 y=-H/4
  moves: [{ axis3: { a: [0, 0, 0], b: [0, 0, 1], angle: 0 }, offset: [-(SX + 5 * H / 8), top + H / 4, -0.05], filter: (q) => q.tags.has(PIECE('stem')) }],
  view: [0, 0, 1],
});

export const jieut = letter({
  id: 'jieut', char: 'ㅈ', roman: 'jieut', video: 'pi50oefrI4Q', sheets: [{ x: SX, y: 0 }],
  desc: ['색종이 두 장으로 지붕 모양과 막대를 접고, 막대를 가위로 잘라 지붕 위에 붙이면 한글 ㅈ 이 돼요.', 'Fold a roof and a bar from two sheets, cut the bar to size and glue it on top of the roof to make the Korean letter ㅈ (jieut).'],
  steps: [
    ...roof(), ...barSheet(),
    discard('scrap', [0, -2], '아래 반쪽은 쓰지 않아요. 치워 두세요.', 'You do not need the bottom half. Put it aside.'),
    ...foldBar(), placeBar(APEX),
  ],
});

export const chieut = letter({
  id: 'chieut', char: 'ㅊ', roman: 'chieut', video: 'qZsjb5P1tpg', sheets: [{ x: SX, y: 0 }],
  desc: ['ㅈ 처럼 지붕과 막대를 만들고, 남은 반쪽에서 꼭지를 잘라 막대 위에 붙이면 한글 ㅊ 이 돼요.', 'Make the roof and bar like ㅈ, then cut a small stem from the leftover half and glue it above the bar to make the Korean letter ㅊ (chieut).'],
  steps: [...roof(), ...barSheet(), stemCut(), dropScrap(), ...foldBar(), placeBar(APEX), placeStem(APEX + H / 5)],
});

// ㅎ: 첫 장은 ㅇ 고리를 45° 돌려 놓고(창이 마름모), 둘째 장으로 ㅊ 과 같이 막대·꼭지를 만들어 고리 위에 붙인다.
// 막대 위치는 영상 측정 y∈[0.16, 0.275] → 위 변 9H/16, 꼭지는 막대 위로 H/5
const RING_TOP = (9 * H) / 16;
export const hieut = letter({
  id: 'hieut', char: 'ㅎ', roman: 'hieut', video: 'o0Ipo5MfFPo', sheets: [{ x: SX, y: 0 }],
  desc: ['ㅇ 고리를 접고, 둘째 색종이로 만든 막대와 꼭지를 가위로 잘라 위에 붙이면 한글 ㅎ 이 돼요.', 'Fold a ㅇ ring, then cut a bar and a stem from a second sheet and glue them on top to make the Korean letter ㅎ (hieut).'],
  steps: [
    ...onFirst([...ringSteps(), turn(45, '고리를 비스듬히 돌려 가운데 창이 마름모가 되게 놓아요.', 'Turn the ring so the window in the middle becomes a diamond.')]),
    ...barSheet(), stemCut(), dropScrap(), ...foldBar(),
    placeBar(RING_TOP, '막대를 고리 위쪽에 가로로 얹어 풀로 붙여요.', 'Lay the bar across the top of the ring and glue it on.'),
    placeStem(RING_TOP + H / 5),
  ],
});

export const HANGUL = [giyeok, nieun, digeut, rieul, mieum, bieup, siot, ieung, jieut, chieut, kieuk, tieut, pieup, hieut, a, ya, i];
// 한글 자모 순서 (ㄱㄴㄷ… 사전 순서). 전체 목록에서도 이 순서로 끝에 모인다 (models/index.js)
HANGUL.forEach((m, i) => { m.groupOrder = i; });
