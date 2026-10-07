// 도안 맞춤 검사: node scripts/diagram.mjs <작품 id> [--fit] [--img 저장할 png]
// 도안 그림(Origami Club zu.gif)의 단계 그림마다 종이 모양(실루엣)과 색 면(색깔/흰 면)을 읽어,
// 엔진이 접은 그 단계의 모습과 겹쳐 비교한다. 위치·크기는 그림마다 가장 잘 맞게 자동으로 맞춘다.
//   종이 IoU  : 두 실루엣이 겹치는 넓이 / 합친 넓이 (모양이 같으면 1)
//   색 일치    : 겹치는 곳에서 색깔 면·흰 면이 같은 비율 (앞뒤·겹 순서가 맞으면 1)
// --fit: 작품에 make(params)·params 가 있고 refs 에 fit 범위가 있으면, 모든 그림의 점수가 가장 높은 값을 찾는다
//        (도면에서 높이·길이를 눈으로 읽기 어려울 때 그림에 맞춰 정한다)
// --img: 그림마다 [도안 | 엔진 | 차이(빨강: 도안에만, 파랑: 엔진에만, 노랑: 색이 다름)] 를 한 장으로 저장
//
// 기준 파일 scripts/refs/<id>.json:
//   { "src": "zu.gif 주소", "panels": [{ "after": 접은 단계 수, "box": [x0, y0, x1, y1], "rot": 도, "note": "", "minIou": 0.9, "minColor": 0.85 }], "fit": { "이름": [최소, 최대] } }
//   after = 그 그림이 보여 주는 상태가 몇 단계를 접은 뒤인지 (도안의 n번 그림 = n-1 단계 뒤, 완성 그림 = 접기 단계 전부)
import { buildModel, rawPose, polyNormal } from '../src/engine.js';
import { MODELS, DEV } from '../src/models/index.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
// --all: 기준 파일이 있는 작품을 모두 검사 (npm run diagrams). 그림 하나라도 종이 IoU 0.9·색 일치 0.85 아래면 실패
if (args.includes('--all')) {
  const { readdirSync } = await import('node:fs');
  let bad = 0;
  for (const f of readdirSync(join(ROOT, 'scripts/refs')).filter((f) => f.endsWith('.json')).sort()) {
    try { process.stdout.write(execFileSync(process.execPath, [fileURLToPath(import.meta.url), f.slice(0, -5)])); }
    catch (e) { bad++; process.stdout.write(e.stdout || ''); }
  }
  console.log(bad ? `도안과 다른 작품 ${bad}개` : '모든 작품이 도안과 맞음');
  process.exit(bad ? 1 : 0);
}
const id = args.find((a) => !a.startsWith('--'));
const FIT = args.includes('--fit');
const imgOut = args.includes('--img') ? args[args.indexOf('--img') + 1] : null;
const model = [...MODELS, ...DEV].find((m) => m.id === id);
if (!model) { console.log(`작품 ${id} 없음`); process.exit(1); }
const ref = JSON.parse(readFileSync(join(ROOT, 'scripts/refs', `${id}.json`), 'utf8'));

// ---- 도안 그림 읽기 (PIL 로 풀어 RGBA 바이트로) ----
const cache = join(tmpdir(), 'origami-refs');
mkdirSync(cache, { recursive: true });
const gif = join(cache, `${id}.gif`);
// src 가 주소가 아니면 저장소 안의 그림 (영상 장면을 배경을 지우고 색 면만 칠해 둔 것 등)
if (!/^https?:/.test(ref.src)) execFileSync('cp', [join(ROOT, ref.src), gif]);
else if (!existsSync(gif)) execFileSync('curl', ['-sfL', '-o', gif, ref.src]);
const py = (code, input) => execFileSync('python3', ['-c', code], { input, maxBuffer: 1 << 28 });
const raw = py(`import sys; from PIL import Image
im = Image.open(sys.argv[1] if len(sys.argv) > 1 else ${JSON.stringify(gif)}).convert('RGBA')
sys.stdout.buffer.write(im.size[0].to_bytes(4, 'little') + im.size[1].to_bytes(4, 'little') + im.tobytes())`);
const IW = raw.readUInt32LE(0), IH = raw.readUInt32LE(4), RGBA = raw.subarray(8);

// 화소 분류: 0 바깥(투명·흰색), 1 흰 면, 2 색깔 면, 3 선(테두리·화살표·글자)
const isColor = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b) > 40;
function panelMask(box) {
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
  const cls = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = ((y + y0) * IW + x + x0) * 4, r = RGBA[o], g = RGBA[o + 1], b = RGBA[o + 2], a = RGBA[o + 3];
    cls[y * w + x] = a < 128 ? 0 : isColor(r, g, b) ? 2 : (r + g + b) / 3 < 215 ? 3 : 1;
  }
  // 그림 테두리에서 선·색깔 면을 넘지 않고 닿는 곳이 바깥 (선이 끊긴 틈으로 새지 않게 선을 1화소 두껍게)
  const wall = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (cls[y * w + x] < 2) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h) wall[yy * w + xx] = 1;
    }
  }
  const st = [];
  for (let x = 0; x < w; x++) st.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) st.push(y * w, y * w + w - 1);
  while (st.length) {
    const i = st.pop();
    if (out[i] || wall[i]) continue;
    out[i] = 1;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (y > 0) st.push(i - w); if (y < h - 1) st.push(i + w);
  }
  let paper = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) paper[i] = out[i] ? 0 : 1;
  // 가는 선(화살표·글자)을 지우고(열림 연산) 가장 큰 덩어리만 남긴다
  const morph = (m, r, keep) => {
    const res = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = keep;
      for (let dy = -r; dy <= r && v === keep; dy++) for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx, yy = y + dy, s = xx < 0 || yy < 0 || xx >= w || yy >= h ? 0 : m[yy * w + xx];
        if (s !== keep) { v = s; break; }
      }
      res[y * w + x] = v;
    }
    return res;
  };
  paper = morph(morph(paper, 2, 1), 2, 0);
  const lab = new Int32Array(w * h).fill(-1);
  let best = -1, bestN = 0;
  for (let i = 0; i < w * h; i++) {
    if (!paper[i] || lab[i] >= 0) continue;
    let n = 0; const q = [i]; lab[i] = i;
    while (q.length) {
      const k = q.pop(); n++;
      const x = k % w, y = (k / w) | 0;
      for (const j of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, y > 0 ? k - w : -1, y < h - 1 ? k + w : -1]) if (j >= 0 && paper[j] && lab[j] < 0) { lab[j] = i; q.push(j); }
    }
    if (n > bestN) { bestN = n; best = i; }
  }
  // 종이 안의 투명 화소는 흰 면 (도안에 따라 흰 면을 투명으로 칠한 곳이 있다)
  const m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) m[i] = lab[i] === best ? (cls[i] === 0 ? 1 : cls[i]) : 0;
  return { w, h, m, cls };
}

// ---- 엔진 모습을 격자로 그리기 (정면에서 본 맨 위 겹의 면) ----
const isWhite = (hex) => { const v = parseInt(hex.slice(1), 16), r = v >> 16, g = (v >> 8) & 255, b = v & 255; return !isColor(r, g, b); };
function stateOf(plans, mdl, k) {
  if (k === 0) return mdl.outline ? [mdl.outline.map(([x, y]) => [x, y, 0])] : null;
  return rawPose(plans[k - 1], 1);
}
const G = 360;
function engineGrid(P, colors) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const L of P) for (const p of L) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const pad = 0.02 * Math.max(x1 - x0, y1 - y0);
  x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
  const cell = Math.max(x1 - x0, y1 - y0) / G;
  const gw = Math.ceil((x1 - x0) / cell), gh = Math.ceil((y1 - y0) / cell);
  const cls = new Uint8Array(gw * gh), zb = new Float64Array(gw * gh).fill(-Infinity);
  let fw = isWhite(colors.front) ? 1 : 2, bw = isWhite(colors.back) ? 1 : 2;
  // dark: 검정·짙은 회색 종이처럼 채도가 없는 색 면 — 둘 중 어두운 면을 색 면으로 본다 (도안 그림도 그 면을 색으로 칠해 둔다)
  if (ref.dark) { const lum = (h) => { const v = parseInt(h.slice(1), 16); return (v >> 16) + ((v >> 8) & 255) + (v & 255); }; [fw, bw] = lum(colors.front) < lum(colors.back) ? [2, 1] : [1, 2]; }
  for (const L of P) {
    const n = polyNormal(L);
    if (Math.abs(n[2]) < 0.05) continue; // 옆으로 선 면은 정면에서 안 보인다
    const c = n[2] > 0 ? fw : bw;
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
    for (const p of L) { a0 = Math.min(a0, p[0]); a1 = Math.max(a1, p[0]); b0 = Math.min(b0, p[1]); b1 = Math.max(b1, p[1]); }
    const o = L[0], d = n[0] * o[0] + n[1] * o[1] + n[2] * o[2];
    for (let gy = Math.floor((b0 - y0) / cell); gy <= Math.ceil((b1 - y0) / cell); gy++) {
      if (gy < 0 || gy >= gh) continue;
      const y = y0 + (gy + 0.5) * cell;
      for (let gx = Math.floor((a0 - x0) / cell); gx <= Math.ceil((a1 - x0) / cell); gx++) {
        if (gx < 0 || gx >= gw) continue;
        const x = x0 + (gx + 0.5) * cell;
        let sg = 0, inside = true;
        for (let k = 0; k < L.length && inside; k++) {
          const a = L[k], b = L[(k + 1) % L.length], cr = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
          if (Math.abs(cr) < 1e-12) continue;
          if (sg && Math.sign(cr) !== sg) inside = false;
          sg = Math.sign(cr);
        }
        if (!inside) continue;
        const z = (d - n[0] * x - n[1] * y) / n[2], i = gy * gw + gx;
        if (z > zb[i]) { zb[i] = z; cls[i] = c; }
      }
    }
  }
  let area = 0;
  for (const v of cls) if (v) area++;
  return { x0, y0, cell, gw, gh, cls, area };
}

// ---- 맞추기: 도안 화소 (px, py) → 엔진 좌표 (s 배율, t 이동, r 회전) ----
function score(D, E, T) {
  const c = Math.cos(T.r), s = Math.sin(T.r);
  // 엔진 격자 네 귀퉁이가 도안 화소로 가는 범위 (그림 밖으로 나간 엔진 종이도 세려고 넓게 본다)
  const toPx = (x, y) => { const u = c * x + s * y, v = -s * x + c * y; return [T.tx + u * T.s, T.ty - v * T.s]; };
  const cs = [[E.x0, E.y0], [E.x0 + E.gw * E.cell, E.y0], [E.x0, E.y0 + E.gh * E.cell], [E.x0 + E.gw * E.cell, E.y0 + E.gh * E.cell]].map(([x, y]) => toPx(x, y));
  const px0 = Math.min(0, Math.floor(Math.min(...cs.map((q) => q[0])))), px1 = Math.max(D.w, Math.ceil(Math.max(...cs.map((q) => q[0]))));
  const py0 = Math.min(0, Math.floor(Math.min(...cs.map((q) => q[1])))), py1 = Math.max(D.h, Math.ceil(Math.max(...cs.map((q) => q[1]))));
  let inter = 0, dA = 0, eA = 0, agree = 0, known = 0;
  for (let py = py0; py < py1; py++) for (let px = px0; px < px1; px++) {
    const inD = px >= 0 && py >= 0 && px < D.w && py < D.h, dv = inD ? D.m[py * D.w + px] : 0;
    const u = (px + 0.5 - T.tx) / T.s, v = -(py + 0.5 - T.ty) / T.s;
    const x = c * u - s * v, y = s * u + c * v;
    const gx = Math.floor((x - E.x0) / E.cell), gy = Math.floor((y - E.y0) / E.cell);
    const ev = gx >= 0 && gy >= 0 && gx < E.gw && gy < E.gh ? E.cls[gy * E.gw + gx] : 0;
    if (dv) dA++;
    if (ev) eA++;
    if (dv && ev) {
      inter++;
      if (dv !== 3) { known++; if (dv === ev) agree++; }
    }
  }
  return { iou: inter / (dA + eA - inter || 1), color: known ? agree / known : 0 };
}
function fitPanel(D, E, rot) {
  // 처음 값: 두 실루엣의 무게중심과 넓이를 맞춘다
  let dn = 0, dx = 0, dy = 0;
  for (let i = 0; i < D.w * D.h; i++) if (D.m[i]) { dn++; dx += i % D.w; dy += (i / D.w) | 0; }
  let en = 0, ex = 0, ey = 0;
  for (let i = 0; i < E.gw * E.gh; i++) if (E.cls[i]) { en++; ex += E.x0 + ((i % E.gw) + 0.5) * E.cell; ey += E.y0 + (((i / E.gw) | 0) + 0.5) * E.cell; }
  const r = (rot * Math.PI) / 180;
  const s0 = Math.sqrt(dn / (en * E.cell * E.cell));
  ex /= en; ey /= en;
  // 엔진 무게중심이 도안 무게중심에 오도록 (회전 반영)
  const c = Math.cos(-r), si = Math.sin(-r), ux = c * ex - si * ey, uy = si * ex + c * ey;
  let T = { s: s0, tx: dx / dn - ux * s0, ty: dy / dn + uy * s0, r };
  const val = (T) => { const q = score(D, E, T); return q.iou + 0.25 * q.color; };
  let best = val(T);
  for (let step = 4; step > 0.2; step /= 2) {
    let moved = true;
    while (moved) {
      moved = false;
      for (const [k, dlt] of [['tx', step], ['tx', -step], ['ty', step], ['ty', -step], ['s', T.s * 0.01 * step], ['s', -T.s * 0.01 * step]]) {
        const T2 = { ...T, [k]: T[k] + dlt }, v = val(T2);
        if (v > best + 1e-6) { best = v; T = T2; moved = true; }
      }
    }
  }
  return { T, ...score(D, E, T) };
}

const panels = ref.panels.map((p) => ({ ...p, D: panelMask(p.box) }));
function evaluate(mdl, quiet) {
  const plans = buildModel(mdl), res = [];
  for (const p of panels) {
    const P = stateOf(plans, mdl, p.after);
    const E = engineGrid(P, mdl.colors);
    res.push({ p, E, ...fitPanel(p.D, E, p.rot || 0) });
  }
  const mean = res.reduce((s, r) => s + r.iou + 0.25 * r.color, 0) / res.length;
  if (!quiet) for (const r of res) console.log(`  그림 ${String(r.p.label ?? r.p.after).padStart(3)} (${String(r.p.after).padStart(2)}단계 뒤)  종이 IoU ${r.iou.toFixed(3)}  색 일치 ${r.color.toFixed(3)}${r.p.note ? '  ' + r.p.note : ''}`);
  return { res, mean };
}

let mdl = model;
if (FIT && model.make && ref.fit) {
  let prm = { ...model.params };
  let best = evaluate(model.make(prm), true).mean;
  console.log(`맞추기 시작: 점수 ${best.toFixed(4)}`, prm);
  for (let round = 0; round < 3; round++) {
    for (const [k, [lo, hi]] of Object.entries(ref.fit)) {
      let a = lo, b = hi;
      for (let it = 0; it < 4; it++) {
        const xs = Array.from({ length: 7 }, (_, i) => a + ((b - a) * i) / 6);
        let bi = 0, bv = -Infinity;
        xs.forEach((x, i) => { let v; try { v = evaluate(model.make({ ...prm, [k]: x }), true).mean; } catch { v = -Infinity; } if (v > bv) { bv = v; bi = i; } });
        const span = (b - a) / 6;
        a = Math.max(lo, xs[bi] - span); b = Math.min(hi, xs[bi] + span);
        if (bv > best) { best = bv; prm = { ...prm, [k]: xs[bi] }; }
      }
    }
    console.log(`  ${round + 1}회: 점수 ${best.toFixed(4)}`, Object.fromEntries(Object.entries(prm).map(([k, v]) => [k, typeof v === 'number' ? +v.toFixed(4) : v])));
  }
  mdl = model.make(prm);
}
console.log(`${model.name} (${id}) 도안 비교`);
const { res, mean } = evaluate(mdl);
console.log(`  평균 점수 ${mean.toFixed(3)} (종이 IoU + 0.25×색 일치, 최대 1.25)`);
// minIou·minColor: 도안 그림 자체가 실제로 접히는 모양과 다르게 그려진(찍힌) 그림에만 쓴다 (note 에 이유를 적는다)
const off = res.filter((r) => r.iou < (r.p.minIou ?? 0.9) || r.color < (r.p.minColor ?? 0.85));
if (off.length) console.log(`  ✗ 도안과 다른 그림: ${off.map((r) => r.p.label ?? r.p.after).join(', ')}`);
process.exitCode = off.length ? 1 : 0;

// ---- 비교 그림 ----
if (imgOut) {
  const S = 2, rows = res.map((r) => ({ w: r.p.D.w * S, h: r.p.D.h * S }));
  const W = Math.max(...rows.map((r) => r.w)) * 3 + 40, H = rows.reduce((s, r) => s + r.h + 10, 10);
  const buf = Buffer.alloc(W * H * 3, 60);
  const put = (x, y, c) => { const o = (y * W + x) * 3; buf[o] = c[0]; buf[o + 1] = c[1]; buf[o + 2] = c[2]; };
  const COL = { 0: [90, 90, 90], 1: [250, 250, 250], 2: [240, 150, 170], 3: [40, 40, 40] };
  let oy = 10;
  for (const r of res) {
    const { D } = r.p, E = r.E, T = r.T, c = Math.cos(T.r), s = Math.sin(T.r);
    for (let y = 0; y < D.h * S; y++) for (let x = 0; x < D.w * S; x++) {
      const px = x / S, py = y / S, i = (py | 0) * D.w + (px | 0), dv = D.m[i];
      const u = (px - T.tx) / T.s, v = -(py - T.ty) / T.s, X = c * u - s * v, Y = s * u + c * v;
      const gx = Math.floor((X - E.x0) / E.cell), gy = Math.floor((Y - E.y0) / E.cell);
      const ev = gx >= 0 && gy >= 0 && gx < E.gw && gy < E.gh ? E.cls[gy * E.gw + gx] : 0;
      put(10 + x, oy + y, COL[dv]);
      put(20 + D.w * S + x, oy + y, COL[ev]);
      const diff = dv && !ev ? [220, 40, 40] : ev && !dv ? [40, 90, 230] : dv && ev && dv !== 3 && dv !== ev ? [235, 200, 40] : dv ? [200, 200, 200] : [90, 90, 90];
      put(30 + 2 * D.w * S + x, oy + y, diff);
    }
    oy += D.h * S + 10;
  }
  const ppm = Buffer.concat([Buffer.from(`P6 ${W} ${H} 255\n`), buf]);
  py(`import sys, io; from PIL import Image; Image.open(io.BytesIO(sys.stdin.buffer.read())).save(${JSON.stringify(imgOut)})`, ppm);
  console.log(`  비교 그림: ${imgOut}`);
}
