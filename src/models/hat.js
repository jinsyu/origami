// 종이 모자 (정사각형 색종이)
// 반으로 접어 직사각형 → 위 모서리 두 개를 비스듬히 내려 지붕 → 앞 띠는 앞으로, 뒤 띠는 뒤로 접어 올린다.
const H = 0.5;
const has = (t) => (c) => c.tags.has(t);
const corner = (c) => c.tags.has('cornerL') || c.tags.has('cornerR');

export const hat = {
  id: 'hat',
  name: '종이 모자',
  level: 3,
  desc: '모서리를 내려 뾰족하게 만들고 아래 띠를 앞뒤로 따로 접어 올리는 모자예요. 큰 종이로 접으면 쓸 수 있어요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#e9b44c' },
  accent: '#a87514',
  outline: [[-H, -H], [H, -H], [H, H], [-H, H]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.2, 1],
  done: '종이 모자 완성! 아래를 벌리면 머리에 쓸 수 있어요.',
  steps: [
    { text: '색깔 면이 아래로 가게 놓고, 위쪽 절반을 아래로 접어 내려요.', moves: [{ line: [[-1, 0], [1, 0]], side: [0, H], tag: 'front' }] },
    {
      text: '위쪽 두 모서리를 비스듬히 접어 내려요. 아래에 띠가 조금 남게 해요.',
      moves: [
        { line: [[0.1, 0], [0.5, -0.4]], side: [H, 0], tag: 'cornerR' },
        { line: [[-0.1, 0], [-0.5, -0.4]], side: [-H, 0], tag: 'cornerL' },
      ],
    },
    { text: '아래 띠의 앞쪽 한 장을 위로 접어 올려요.', moves: [{ line: [[-1, -0.4], [1, -0.4]], side: [0, -H], filter: (c) => has('front')(c) && !corner(c) }] },
    { text: '남은 뒤쪽 띠는 뒤로 접어 올려요. 종이 모자 완성!', moves: [{ line: [[-1, -0.4], [1, -0.4]], side: [0, -H], filter: (c) => !has('front')(c) && !corner(c), toward: -1 }] },
  ],
};
