// 개발용: 안쪽 뒤집어 접기 검증
export const test = {
  id: 'test', name: '테스트', level: 9, desc: '개발용 검증 모델', paper: '정사각형', colors: { front: '#fbf8f1', back: '#c0504d' }, accent: '#a33',
  outline: [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]], view: [0.32, -0.5, 1], finalView: [0.3, -0.4, 1], done: '끝',
  steps: [
    { text: '대각선으로 반 접어요.', moves: [{ line: [[-1, -1], [1, 1]], side: [0.5, -0.5], tag: 'front' }] },
    { text: '끝을 안쪽으로 뒤집어 접어요.', sim: true, moves: [
      { line: [[0.2, 0], [0.2, 1]], side: [0.5, 0.5], filter: (c) => c.tags.has('front'), toward: -1, shift: 0.35 },
      { line: [[0.2, 0], [0.2, 1]], side: [0.5, 0.5], filter: (c) => !c.tags.has('front'), toward: 1, shift: 0.35 },
    ] },
  ],
};
