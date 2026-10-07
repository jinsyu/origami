// 여러 작품이 함께 쓰는 접기 묶음
export const has = (t) => (c) => c.tags.has(t);
export const not = (t) => (c) => !c.tags.has(t);
export const and = (...fs) => (c) => fs.every((f) => f(c));
export const flip = { spin: { a: [0, 0, 0], b: [0, 1, 0], angle: 180 } };

// 펼쳐 누르기(squash): 경첩(세로선 x=0)과 등선(윗변)이 꼭짓점 (0,0)에서 만나는 날개를 누른다.
// sx: 날개가 있는 쪽 (-1 왼쪽, 1 오른쪽), size: 이등분선 길이, outer/inner: 바깥·안쪽 겹
// 최종 상태 (실제 종이와 같은 층 순서):
//  - 등선(두 겹을 잇는 접힌 선)은 펼쳐져 가운데 선 위에 놓이고, 등선 쪽 삼각형들이 맨 위 한 장이 된다.
//  - 경첩 쪽 삼각형들은 그 아래로 접혀 들어간다(경첩으로 몸통과 이어진 채).
//  - 바깥 겹: 등선 쪽 삼각형을 이등분선을 따라 위로 접어 올린다.
//  - 안쪽 겹: 경첩 건너편으로 넘긴 뒤, 등선 쪽 삼각형을 넘긴 쪽 이등분선을 따라 위로 접어 올린다.
// 움직임: 두 겹이 경첩을 축으로 60°까지 함께 들린 뒤 벌어져(바깥 겹은 돌아오고 안쪽 겹은 넘어감)
//        틈이 생기면 등선 쪽 삼각형이 그 안으로 접힌다. 같은 축을 도는 두 겹은 서로 뚫고 지나가지 않는다.
export const squash = (sx, outer, inner, size = 0.5, faceTag) => {
  const hinge = [[0, -1], [0, 1]];
  const side = [sx * 0.2, -0.2];
  return [
    { line: hinge, side, filter: outer, toward: 1, transient: true, curve: 'peak', peak: 1 / 3, role: 'lift' },
    { line: hinge, side, filter: inner, toward: 1, role: 'hinge' },
    { line: [[0, 0], [sx * size, -size]], side: [sx * size * 0.8, -size * 0.1], filter: outer, toward: 1, at: [0.33, 0.95], role: 'obis', tag: faceTag },
    { line: [[0, 0], [-sx * size, -size]], side: [-sx * size * 0.8, -size * 0.1], filter: inner, toward: 1, at: [0.33, 0.95], role: 'ibis', tag: faceTag },
  ];
};

// 꽃잎 접기(petal fold): 사각 기본형의 앞 날개를 길쭉한 마름모로 들어 올린다.
// 꼭대기 (0,0), 아래 끝 (0,-R). face: 맨 위 한 장을 고르는 조건, front: 앞쪽 날개 전체(맨 위 두 장)를 고르는 조건
// 최종 상태(구속 조건 탐색으로 확인):
//  - 맨 위 두 장의 연 모양 선 바깥 부분을 안으로 접는다.
//  - 맨 위 한 장(옆을 접어 넣은 부분 포함)의 가로선 아래를 위로 넘긴다.
export const petal = (R, face, front, tag) => {
  const s1 = Math.sin(Math.PI / 8), c1 = Math.cos(Math.PI / 8);
  const K = R * (1 - Math.SQRT1_2); // 연 모양 선이 옆 변과 만나는 높이 |y| (R=√½ 이면 0.2071)
  const kiteR = [[0, -R], [s1, -R + c1]], kiteL = [[0, -R], [-s1, -R + c1]];
  const top = (c) => front(c) && face(c), second = (c) => front(c) && !face(c);
  // 맨 위 장의 옆은 가운데 조각 '아래'로, 둘째 장의 옆은 그 위로 접혀 들어간다.
  // 들어 올리면 순서가 뒤집혀 맨 위 장의 옆 조각이 꽃잎 겉면이 된다 (실제 학의 기본형과 같은 겉면).
  return [
    // 옆 조각의 각도는 sim.js 가 들어 올리는 각도에 맞춰 이음선이 붙어 있도록 풀어 정한다 (role)
    { line: kiteR, side: [R / 2, -R / 2], filter: top, toward: -1, insert: 1, role: 'ptopR' },
    { line: kiteL, side: [-R / 2, -R / 2], filter: top, toward: -1, insert: 1, role: 'ptopL' },
    { line: kiteR, side: [R / 2, -R / 2], filter: second, toward: 1, insert: 2, role: 'psecR' },
    { line: kiteL, side: [-R / 2, -R / 2], filter: second, toward: 1, insert: 2, role: 'psecL' },
    { line: [[-1, -K], [1, -K]], side: [0, -1], filter: face, toward: 1, tag, role: 'plift', noRejoin: true },
  ];
};

// 일반 펼쳐 누르기: 꼭짓점 V에서 경첩 방향 hd(날개 쪽으로), 등선 방향 sd 가 만나는 날개를 누른다.
// 경첩과 등선이 이루는 각의 이등분선을 따라 등선 쪽 삼각형을 접고, 안쪽 겹은 경첩 건너편으로 넘긴다.
export const squashFlap = ({ V, hd, sd, outer, inner, faceTag, size = 1 }) => {
  const nrm = (v) => { const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; };
  const h = nrm(hd), s = nrm(sd), b = nrm([h[0] + s[0], h[1] + s[1]]);
  const perp = nrm([s[0] - h[0] * (s[0] * h[0] + s[1] * h[1]), s[1] - h[1] * (s[0] * h[0] + s[1] * h[1])]); // 경첩에 수직, 날개 쪽
  const at = (d, k) => [V[0] + d[0] * k, V[1] + d[1] * k];
  const refl = (d) => { const k = 2 * (d[0] * perp[0] + d[1] * perp[1]); return [d[0] - perp[0] * k, d[1] - perp[1] * k]; };
  const hinge = [V, at(h, 1)];
  const flapSide = at(nrm([b[0] + perp[0] * 0.3, b[1] + perp[1] * 0.3]), size * 0.3);
  const spineSide = at(nrm([b[0] + s[0], b[1] + s[1]]), size * 0.3);
  const b2 = refl(b), spineSide2 = at(refl(nrm([b[0] + s[0], b[1] + s[1]])), size * 0.3);
  return [
    { line: hinge, side: flapSide, filter: outer, toward: 1, transient: true, curve: 'peak', peak: 1 / 3, role: 'lift' },
    { line: hinge, side: flapSide, filter: inner, toward: 1, role: 'hinge', tag: `${faceTag}_in` },
    { line: [V, at(b, 1)], side: spineSide, filter: outer, toward: 1, at: [0.33, 0.95], role: 'obis', tag: faceTag },
    // 안쪽 겹은 경첩을 건너간 뒤이므로 위치가 아니라 표시로 고른다
    { line: [V, at(b2, 1)], side: spineSide2, filter: (c) => c.tags.has(`${faceTag}_in`), toward: 1, at: [0.33, 0.95], role: 'ibis', tag: faceTag },
  ];
};

// 계단 접기(pleat): 선 a 에서 골짜기, a 와 나란히 far 쪽으로 width 떨어진 선에서 산으로 접어 계단을 만든다.
// 끝 상태: a 와 두 번째 선 사이 띠는 뒤집혀 a 앞쪽에 겹치고, 그 너머는 원래 방향 그대로 width 의 두 배만큼 a 쪽으로 옮겨진다.
// 구현: (1) a 너머를 모두 a 를 따라 접어 넘긴다 (2) 넘어온 것 가운데 두 번째 선의 거울상 너머를 다시 접어 넘긴다.
// a: [[x,y],[x,y]], far: 접혀 넘어갈 쪽의 점, sel: 함께 접을 겹을 고르는 조건 (생략하면 그쪽 전부), toward: 앞(1)·뒤(-1)
export const pleat = ({ a, far, width, sel, toward = 1, tag = 'pleat' }) => {
  const [p, q] = a, dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
  let nx = -dy / L, ny = dx / L; // a 의 법선, far 쪽으로
  if ((far[0] - p[0]) * nx + (far[1] - p[1]) * ny < 0) { nx = -nx; ny = -ny; }
  const b2 = [[p[0] - nx * width, p[1] - ny * width], [q[0] - nx * width, q[1] - ny * width]]; // 두 번째 선의 거울상 (가까운 쪽)
  const near2 = [p[0] - nx * width * 2, p[1] - ny * width * 2];
  return [
    { line: a, side: far, filter: sel, toward, tag },
    { line: b2, side: near2, filter: (c) => c.tags.has(tag) && (c.x - p[0]) * nx + (c.y - p[1]) * ny < -width + 1e-6, toward, tag: `${tag}2` },
  ];
};

// 크림프 접기(crimp): 반으로 접힌 날개(등선으로 앞·뒤 겹이 이어짐)를 계단 접기로 꺾는다.
// 앞 겹은 앞으로(toward 1), 뒤 겹은 뒤로(toward -1) 같은 계단을 접어 두 겹이 대칭으로 꺾인다.
// front·back: 앞·뒤 겹 조건
export const crimp = ({ a, far, width, front, back, tag = 'crimp' }) => [
  ...pleat({ a, far, width, sel: front, toward: 1, tag: `${tag}F` }),
  ...pleat({ a, far, width, sel: back, toward: -1, tag: `${tag}B` }),
];

// 뒤집어 접기(reverse fold): 등선(spine)으로 앞·뒤 겹이 이어진 날개를 접는 선 line 에서 뒤집어 접는다.
// grab: 날개 위의 한 점 (그 점의 모든 겹을 잡는다), kind: 'inside'(안으로) | 'outside'(바깥으로)
// 앞 절반 겹과 뒤 절반 겹이 서로 반대로 접힌다. 복합 단계(sim: true)의 moves 로 쓴다.
// filter 로 후보를 좁힐 수 있다 (예: 이웃 날개가 같은 쪽에 이어져 있을 때)
export const reverseFold = ({ line, grab, side = grab, spine, kind = 'inside', filter, tag, shift = 0.5 }) => {
  const t = kind === 'inside' ? -1 : 1;
  const base = { line, side, spine, grab, layers: 'all', filter, tag, shift };
  return [
    { ...base, half: 'front', toward: t },
    { ...base, toward: -t }, // 앞 겹이 넘어간 뒤 남은 겹 = 뒤 절반
  ];
};

// 가라앉히기(sink): 여러 날개가 모인 꼭짓점을 선 line 에서 안으로 밀어 넣는다.
// 끝 상태는 그 점의 모든 겹을 line 에서 접되, 앞 절반 겹은 뒤로·뒤 절반 겹은 앞으로 접은 것과 같다.
// grab: 가라앉힐 꼭짓점 쪽의 점. 복합 단계(sim: true)의 moves 로 쓴다. 사각 기본형 꼭대기에서 끊김 없음 확인
export const sink = ({ line, grab, filter, tag = 'sink' }) => [
  { line, side: grab, grab, layers: 'all', half: 'front', toward: -1, filter, tag },
  { line, side: grab, grab, layers: 'all', toward: 1, filter, tag },
];
