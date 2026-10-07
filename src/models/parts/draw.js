// 꾸미기 단계용 획 도우미 (좌표는 완성된 모양을 정면에서 본 x, y)
export const PENCIL = '#34363a';
export const PINK = '#ef8f9c';
// 중심 c, 반지름 rx·ry, 각도 a0→a1(도) 의 호
export const arc = (c, rx, ry, a0, a1, n = 16) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [c[0] + rx * Math.cos(a), c[1] + ry * Math.sin(a)];
  });
// 눈: 까만 눈동자 + 반짝이는 흰 점
export const eye = (x, y, r = 0.024) => [
  { dot: [x, y], r, ry: r * 1.15, color: PENCIL },
  { dot: [x + r * 0.35, y + r * 0.4], r: r * 0.32, color: '#ffffff' },
];
// 볼: 색연필로 칠한 듯 옅은 분홍 원
export const cheek = (x, y, r = 0.032) => ({ dot: [x, y], r, ry: r * 0.7, color: PINK });
// 네모 윤곽 (왼쪽 아래 x0,y0 / 오른쪽 위 x1,y1)
export const box = (x0, y0, x1, y1, color = PENCIL) => ({ line: [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0 - 0.004]], color });
// 네모 칠하기: 색연필로 한 줄씩 칠하듯 (윤곽 아래에 깔린다)
export const fill = (x0, y0, x1, y1, color) => {
  const n = Math.max(1, Math.round((y1 - y0) / 0.03)), h = (y1 - y0) / n, w = h * 1.15, a = x0 + w / 2, b = x1 - w / 2, line = [];
  for (let i = 0; i < n; i++) { const y = y0 + h * (i + 0.5); line.push(i % 2 ? [b, y] : [a, y], i % 2 ? [a, y] : [b, y]); }
  return { line, w, color, under: true };
};
