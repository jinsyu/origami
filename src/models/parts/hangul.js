// 한글 자모 접기 공통 — 종이쌤 '한글 종이접기 시리즈' https://www.youtube.com/playlist?list=PLOWU4Cdjwj1EagFkY0mgHXVysYHxFr_iE
// 자모마다 앞부분(틀)은 같고 마지막 몇 단계만 다르다. 작품은 letter() 로 만들고, 영어 문구도 여기서 함께 만든다(hangulEn).
// 좌표: 정사각형 [-H,H]², 색 면(글자 색)이 아래, 흰 면(바탕)이 위.
export const H = 0.5;
const yt = (v) => `https://www.youtube.com/watch?v=${v}`;

// ---- 틀 (5단계): 방석 접기 → 가운데 끝 되접기 → 마름모 꼭짓점을 흰 네모 변에 맞춰 접기 ----
// 끝 모양: 흰 네모(반 폭 H/2)를 색 팔각형 테두리(띠 폭 H/4)가 두른다.
const inA = (sx, sy) => (c) => c.tags.has('a') && sx * c.x > 0 && sy * c.y > 0;
export const frameBase = () => [
  {
    ko: '색깔 면이 아래로 가게 놓고, 세모로 반 접었다 펴요.',
    en: 'Place the paper colored side down. Fold it in half into a triangle and unfold.',
    moves: [{ line: [[-1, -1], [1, 1]], side: [0.5, -0.5], unfold: true }],
  },
  {
    ko: '다른 쪽으로도 세모로 반 접었다 펴요. 가운데에 X 선이 생겨요.',
    en: 'Fold it into a triangle the other way and unfold. You get an X in the middle.',
    moves: [{ line: [[-1, 1], [1, -1]], side: [0.5, 0.5], unfold: true }],
  },
  {
    ko: '네 모서리를 가운데 점에 맞춰 접어요. 방석 접기예요.',
    en: 'Fold all four corners to the center point. This is a blintz fold.',
    moves: [
      { line: [[0, H], [H, 0]], side: [H, H], tag: 'a' },
      { line: [[H, 0], [0, -H]], side: [H, -H], tag: 'a' },
      { line: [[0, -H], [-H, 0]], side: [-H, -H], tag: 'a' },
      { line: [[-H, 0], [0, H]], side: [-H, H], tag: 'a' },
    ],
  },
  {
    ko: '가운데에 모인 네 끝을 바깥쪽 접힌 선에 닿게 되접어요.',
    en: 'Fold the four tips at the center back out so they touch the outer folded edges.',
    moves: [
      { line: [[H / 2, 0], [0, H / 2]], side: [0.01, 0.01], filter: inA(1, 1) },
      { line: [[H / 2, 0], [0, -H / 2]], side: [0.01, -0.01], filter: inA(1, -1) },
      { line: [[-H / 2, 0], [0, -H / 2]], side: [-0.01, -0.01], filter: inA(-1, -1) },
      { line: [[-H / 2, 0], [0, H / 2]], side: [-0.01, 0.01], filter: inA(-1, 1) },
    ],
  },
  {
    ko: '마름모의 네 꼭짓점을 가운데 흰 네모의 변에 닿게 접어요.',
    en: 'Fold the four points of the diamond in so they touch the edges of the white square.',
    moves: [
      { line: [[3 * H / 4, -1], [3 * H / 4, 1]], side: [H, 0], tag: 'b' },
      { line: [[-3 * H / 4, -1], [-3 * H / 4, 1]], side: [-H, 0], tag: 'b' },
      { line: [[-1, 3 * H / 4], [1, 3 * H / 4]], side: [0, H], tag: 'b' },
      { line: [[-1, -3 * H / 4], [1, -3 * H / 4]], side: [0, -H], tag: 'b' },
    ],
  },
];

// ---- 테두리 띠 접기: 흰 네모 변(x·y = ±H/2)을 따라 안으로 접으면 획, 뒤로 넘기면 바탕 ----
const EDGE = {
  top: [[-1, H / 2], [1, H / 2], [0, H]],
  bottom: [[-1, -H / 2], [1, -H / 2], [0, -H]],
  right: [[H / 2, -1], [H / 2, 1], [H, 0]],
  left: [[-H / 2, -1], [-H / 2, 1], [-H, 0]],
};
const SIDE_KO = { top: '위쪽', bottom: '아래쪽', left: '왼쪽', right: '오른쪽' };
const SIDE_EN = { top: 'top', bottom: 'bottom', left: 'left', right: 'right' };
const IN_KO = { top: '아래로 접어 내려요', bottom: '위로 접어 올려요', left: '안쪽으로 접어요', right: '안쪽으로 접어요' };
const IN_EN = { top: 'down', bottom: 'up', left: 'inward', right: 'inward' };
// 뒤로 넘길 때 그 쪽이 보이게 비스듬히 본다
const BACK_VIEW = { top: [0, 0.4, 1], bottom: [0, -0.4, 1], left: [0.4, 0, 1], right: [-0.4, 0, 1] };
export const band = (dir, back = false) => {
  const [a, b, side] = EDGE[dir];
  return back ? { line: [a, b], side, toward: -1 } : { line: [a, b], side };
};
// 획: 띠를 안으로 접는 단계 (what: '가로 획' 같은 설명, 없으면 생략)
export const stroke = (dir, what) => ({
  ko: `${SIDE_KO[dir]} 테두리를 흰 네모의 변을 따라 ${IN_KO[dir]}.${what ? ` ${what.ko}이에요.` : ''}`,
  en: `Fold the ${SIDE_EN[dir]} border ${IN_EN[dir]} along the edge of the white square.${what ? ` This is ${what.en}.` : ''}`,
  moves: [band(dir)],
});
// 바탕: 띠를 뒤로 넘기는 단계
export const tuck = (dir) => ({
  ko: `${SIDE_KO[dir]} 테두리는 흰 네모의 변을 따라 뒤로 넘겨 접어요.`,
  en: `Fold the ${SIDE_EN[dir]} border behind along the edge of the white square.`,
  moves: [band(dir, true)],
  view: BACK_VIEW[dir],
});

// 바닥에 놓은 채 돌리기 (angle: 반시계 방향 도)
export const turn = (angle, ko, en) => ({ ko, en, moves: [{ spin: { a: [0, 0, 0], b: [0, 0, 1], angle } }], view: [0, 0, 1] });
// 가로 가운데 선(y=0)에서 아래 절반을 모든 겹째 뒤로 반 접기
export const flipOver = (ko = '종이를 뒤집어요.', en = 'Turn the paper over.') => ({ ko, en, moves: [{ spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } }], view: [0, 0.4, 1] });
// 가로 선 y 에서 위(dir 1) 또는 아래(dir -1) 부분을 앞으로 접기 / 세로 선 x 에서 오른쪽(1)·왼쪽(-1)
export const foldY = (y, dir) => ({ line: [[-1, y], [1, y]], side: [0, dir] });
export const foldX = (x, dir) => ({ line: [[x, -1], [x, 1]], side: [dir, 0] });
export const halfBehind = (ko, en) => ({ ko, en, moves: [{ line: [[-1, 0], [1, 0]], side: [0, -H], toward: -1 }], view: [0, -0.3, 1] });

// ---- 막대 기본(모음): 색 면이 위. 가운데·네 등분 선을 접었다 편다 ----
export const stripBase = () => [
  {
    ko: '색깔 면이 위로 오게 놓고, 옆으로 반 접었다 펴요.',
    en: 'Place the paper colored side up. Fold it in half side to side and unfold.',
    moves: [{ line: [[0, -1], [0, 1]], side: [H, 0], unfold: true }],
  },
  {
    ko: '위아래로도 반으로 접었다 펴요.',
    en: 'Fold it in half top to bottom and unfold too.',
    moves: [{ line: [[-1, 0], [1, 0]], side: [0, H], unfold: true }],
  },
];

// ---- 작품 만들기 ----
// 'ㄱ이 돼요'·'ㅏ가 돼요': 자음 이름(기역…)은 받침으로 끝나고, 모음 이름(아·야·이…)은 받침이 없다
const josa = (ch) => (ch >= 'ㅏ' && ch <= 'ㅣ' ? '가' : '이');
export const hangulEn = {};
const COLORS = { front: '#fbf8f1', back: '#2b2d33' };
// spec: { id, char, roman, video, level, desc: [ko, en], steps: [{ ko, en, moves, view, ... }] }
// blackUp: 처음에 색 면(글자 색)이 위로 오게 놓는 작품 (모음 막대 접기)
export function letter({ id, char, roman, video, level = 1, desc, steps, blackUp = false }) {
  const last = steps.length - 1;
  hangulEn[id] = {
    name: `Hangul ${char}`,
    desc: desc[1],
    paper: 'Square origami paper',
    done: `Your ${char} is done! Fold other letters too and make a word.`,
    steps: steps.map((s, i) => (i === last ? `${s.en} You have ${char} (${roman}).` : s.en)),
  };
  return {
    id,
    name: `한글 ${char}`,
    group: 'hangul',
    source: yt(video),
    level,
    desc: desc[0],
    paper: '정사각형 색종이',
    colors: blackUp ? { front: COLORS.back, back: COLORS.front } : COLORS,
    accent: COLORS.back,
    outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
    view: [0.3, -0.45, 1],
    finalView: [0, -0.1, 1],
    done: `${char} 완성! 다른 글자도 접어 낱말을 만들어 보세요.`,
    steps: steps.map(({ ko, en, ...rest }, i) => ({ text: i === last ? `${ko} ${char}${josa(char)} 돼요.` : ko, ...rest })),
  };
}
