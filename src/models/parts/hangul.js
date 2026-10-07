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
// 잘라 낸 조각은 태그 'cut:이름' 을 달고, 틀의 띠 접기에서는 빠진다 (옆에 떼어 놓은 조각까지 접히지 않게)
export const PIECE = (tag) => `cut:${tag}`;
const notPiece = (c) => ![...c.tags].some((t) => t.startsWith('cut:'));
export const band = (dir, back = false) => {
  const [a, b, side] = EDGE[dir];
  return back ? { line: [a, b], side, toward: -1, filter: notPiece } : { line: [a, b], side, filter: notPiece };
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

// ---- 가위로 잘라 붙이기 (영상의 가위·풀 단계) ----
// 자르기: 테두리 띠를 흰 네모 변을 따라 가위로 잘라 떼어 낸다. 떼어 낸 조각은 tag 로 고른다
export const cutBand = (dir, tag) => {
  const [a, b, side] = EDGE[dir];
  return {
    ko: `${SIDE_KO[dir]} 테두리 띠를 흰 네모의 변을 따라 가위로 잘라 떼어 내요.`,
    en: `Cut off the ${SIDE_EN[dir]} border strip with scissors along the edge of the white square.`,
    sim: true, // 자른 뒤 띠를 바깥으로 조금 떼어 놓는다 (잘렸다는 것이 보이게)
    moves: [
      { line: [a, b], side, angle: 0, seam: true, cut: true, tag: PIECE(tag) },
      { axis3: { a: [0, 0, 0], b: [0, 0, 1], angle: 0 }, offset: [Math.sign(side[0]) * PULL, Math.sign(side[1]) * PULL, 0], filter: (c) => c.tags.has(PIECE(tag)) },
    ],
    torn: true,
  };
};
const PULL = H / 4; // 잘라 낸 띠를 떼어 놓는 거리
// 붙이기: 떼어 낸 조각(tag)을 가운데(원점)를 축으로 rot 도 돌리고 move [dx, dy] 만큼 옮겨 풀로 붙인다.
// rot·move 는 자르기 전 자리 기준. from: 자를 때 떼어 놓은 쪽(cutBand 의 dir) — 떼어 놓은 거리만큼 빼서 맞춘다
export const glue = (tag, { from, rot = 0, move: [dx, dy] }, ko, en) => {
  const [, , side] = EDGE[from];
  const px = Math.sign(side[0]) * PULL, py = Math.sign(side[1]) * PULL;
  const r = (rot * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  // 돌린 뒤 자리 = R(v + pull) + off  →  R v + move 가 되려면 off = move - R pull
  const off = [dx - (c * px - s * py), dy - (s * px + c * py)];
  return {
    ko, en,
    moves: [{ axis3: { a: [0, 0, 0], b: [0, 0, 1], angle: rot }, offset: [off[0], off[1], 0.02], filter: (q) => q.tags.has(PIECE(tag)) }],
    torn: true, // 잘라 낸 조각이 떨어져 나가므로 끊김 검사에서 허용
    view: [0, 0, 1],
  };
};

// 여러 번 잘라 한 조각 떼어 내기: cuts = [{ line, side, filter, cut }] 를 차례로 자르고 (cut: false 는 겹을 나누기만 하는 보이지 않는 선), 마지막 조각(tag)을 pull 만큼 떼어 놓는다
export const cutPiece = ({ ko, en, cuts, tag, pull: [px, py] }) => ({
  ko, en, sim: true, torn: true,
  moves: [
    ...cuts.map((c, i) => ({ angle: 0, seam: true, cut: true, ...c, ...(i === cuts.length - 1 ? { tag: PIECE(tag) } : {}) })),
    { axis3: { a: [0, 0, 0], b: [0, 0, 1], angle: 0 }, offset: [px, py, 0], filter: (q) => q.tags.has(PIECE(tag)) },
  ],
});
// 띠 반 접기 (ㄹ): 틀의 네 띠를 바깥 변이 흰 네모 변에 닿게 한 번 더 접어 폭을 H/8 로
export const halveBands = () => ({
  ko: '네 띠를 한 번 더 반으로 접어 가늘게 만들어요. 띠의 바깥 변을 흰 네모의 변에 맞춰 접어요.',
  en: 'Fold each of the four strips in half once more to make them thin, bringing the outer edge to the edge of the white square.',
  moves: [
    { line: [[-1, 5 * H / 8], [1, 5 * H / 8]], side: [0, H] },
    { line: [[-1, -5 * H / 8], [1, -5 * H / 8]], side: [0, -H] },
    { line: [[5 * H / 8, -1], [5 * H / 8, 1]], side: [H, 0] },
    { line: [[-5 * H / 8, -1], [-5 * H / 8, 1]], side: [-H, 0] },
  ],
});

// 떼어 낸 조각(tag)만 접기 (move: foldX/foldY 같은 접기 동작)
export const foldPiece = (tag, mv) => ({ ...mv, filter: (q) => q.tags.has(PIECE(tag)) && (!mv.filter || mv.filter(q)) });
// 뒤집어 붙이기: 조각(tag)을 평면 위 직선 [[x1,y1],[x2,y2]] 을 축으로 180° 뒤집어 그 자리에 붙인다 (지금 놓인 좌표 기준)
export const flipGlue = (tag, [[x1, y1], [x2, y2]]) => ({
  axis3: { a: [x1, y1, 0], b: [x2, y2, 0], angle: 180 }, offset: [0, 0, 0.02], filter: (q) => q.tags.has(PIECE(tag)),
});

// 치우기: 쓰지 않는 조각(tag)을 (dx, dy) 쪽으로 밀어 치우고, 다음 단계부터 없앤다
export const discard = (tag, [dx, dy], ko, en) => ({
  ko, en,
  moves: [{ axis3: { a: [0, 0, 0], b: [0, 0, 1], angle: 0 }, offset: [dx, dy, 0], filter: (q) => q.tags.has(PIECE(tag)) }],
  drop: (q) => q.tags.has(PIECE(tag)),
  torn: true,
});
// 옮겨 붙이기 (일반): 조각(tag)을 점 c 를 축으로 rot 도 돌리고 (dx, dy) 옮겨 겹 위에 붙인다 (지금 놓인 좌표 기준)
export const place = (tag, { c = [0, 0], rot = 0, move: [dx, dy] }) => ({
  axis3: { a: [c[0], c[1], 0], b: [c[0], c[1], 1], angle: rot }, offset: [dx, dy, 0.02], filter: (q) => q.tags.has(PIECE(tag)),
});

// ---- 종이 여러 장: 둘째 장 이후는 옆에 놓고(place.x) 같은 단계 묶음을 옮겨 적용한다 ----
// steps 의 모든 동작을 k 번째 장으로 한정하고, 접는 선·고르는 점을 (dx, dy) 만큼 옮긴다
const shiftPt = ([x, y], dx, dy) => [x + dx, y + dy];
export const onSheet = (steps, k, [dx, dy]) => steps.map((st) => ({
  ...st,
  moves: st.moves.map((m) => {
    const inSheet = (c) => c.tags.has(`sheet${k}`) && (!m.filter || m.filter({ ...c, x: c.x - dx, y: c.y - dy }));
    const out = { ...m, filter: inSheet };
    if (m.line) out.line = m.line.map((q) => shiftPt(q, dx, dy));
    if (m.side) out.side = shiftPt(m.side, dx, dy);
    // spin 은 고르는 조건(filter)을 보지 않고 종이 전체를 돌리므로, 같은 회전을 조건을 따르는 axis3 로 바꾼다
    if (m.spin) { delete out.spin; out.axis3 = { a: [m.spin.a[0] + dx, m.spin.a[1] + dy, m.spin.a[2]], b: [m.spin.b[0] + dx, m.spin.b[1] + dy, m.spin.b[2]], angle: m.spin.angle }; }
    if (m.axis3) out.axis3 = { ...m.axis3, a: [m.axis3.a[0] + dx, m.axis3.a[1] + dy, m.axis3.a[2]], b: [m.axis3.b[0] + dx, m.axis3.b[1] + dy, m.axis3.b[2]] };
    return out;
  }),
}));
// 첫 장 동작은 첫 장(sheet0)에만 (둘째 장이 같은 선 위에 있지 않아도 안전하게)
export const onFirst = (steps) => onSheet(steps, 0, [0, 0]);

// ---- 작품 만들기 ----
// 'ㄱ이 돼요'·'ㅏ가 돼요': 자음 이름(기역…)은 받침으로 끝나고, 모음 이름(아·야·이…)은 받침이 없다
const josa = (ch) => (ch >= 'ㅏ' && ch <= 'ㅣ' ? '가' : '이');
export const hangulEn = {};
const COLORS = { front: '#fbf8f1', back: '#2b2d33' };
// spec: { id, char, roman, video, level, desc: [ko, en], steps: [{ ko, en, moves, view, ... }] }
// blackUp: 처음에 색 면(글자 색)이 위로 오게 놓는 작품 (모음 막대 접기)
// sheets: 여러 장일 때 둘째 장 이후의 놓는 자리 [{ x, y }] (첫 장은 가운데)
export function letter({ id, char, roman, video, level, desc, steps, blackUp = false, sheets }) {
  const last = steps.length - 1;
  // 가위로 자르는 단계가 있으면 준비물에 가위·풀을 적고 초급으로 (없으면 입문)
  const cuts = steps.some((st) => st.moves.some((m) => m.cut));
  level ??= cuts ? 2 : 1;
  const n = sheets ? sheets.length + 1 : 1;
  const paperKo = `정사각형 색종이${n > 1 ? ` ${n}장` : ''}${cuts ? ', 가위, 풀' : ''}`;
  const paperEn = `Square origami paper${n > 1 ? ` (${n} sheets)` : ''}${cuts ? ', scissors, glue' : ''}`;
  hangulEn[id] = {
    name: `Hangul ${char}`,
    desc: desc[1],
    paper: paperEn,
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
    paper: paperKo,
    colors: blackUp ? { front: COLORS.back, back: COLORS.front } : COLORS,
    accent: COLORS.back,
    ...(sheets
      ? { sheets: [{ x: 0, y: 0 }, ...sheets].map((pl) => ({ outline: [[-H, -H], [H, -H], [H, H], [-H, H]], colors: blackUp ? { front: COLORS.back, back: COLORS.front } : COLORS, place: pl })) }
      : { outline: [[-H, -H], [H, -H], [H, H], [-H, H]] }),
    view: [0.3, -0.45, 1],
    finalView: [0, -0.1, 1],
    done: `${char} 완성! 다른 글자도 접어 낱말을 만들어 보세요.`,
    knownTears: steps.flatMap((st, i) => (st.torn ? [i + 1] : [])),
    steps: steps.map(({ ko, en, torn, ...rest }, i) => ({ text: i === last ? `${ko} ${char}${josa(char)} 돼요.` : ko, ...rest })),
  };
}
