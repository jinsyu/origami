// 강아지 얼굴 (정사각형 색종이, 마름모 방향)
// 출처: Origami Club "Dog (face)"(전통, Fumiaki Shingu 도안) https://en.origami-club.com/easy/animal-face/dogface/
import { arc, eye, cheek, PENCIL } from './parts/draw.js';
const R = Math.SQRT1_2;
const ear = (c) => c.tags.has('earL') || c.tags.has('earR');

export const dogParams = { ex: 0.137, ey: -0.264, y3: -0.52, y4: -0.514 };

export function makeDog({ ex, ey, y3, y4 } = dogParams) {
  return {
  params: { ex, ey, y3, y4 },
  make: makeDog,
  id: 'dog',
  name: '강아지 얼굴',
  level: 1,
  desc: '네 번만 접으면 귀가 축 늘어진 강아지가 나와요. 처음 접어 보는 친구에게 좋아요.',
  paper: '정사각형 색종이',
  colors: { front: '#fbf8f1', back: '#b8794a' },
  accent: '#9a5a2c',
  outline: [[0, -R], [R, 0], [0, R], [-R, 0]],
  view: [0.3, -0.45, 1],
  finalView: [0, -0.2, 1],
  done: '강아지 얼굴 완성! 이름을 지어 주고 친구에게 보여 주세요.',
  steps: [
    {
      text: '색깔 면이 아래로 가게 마름모로 놓고, 위 꼭짓점을 아래 꼭짓점에 맞춰 반으로 접어요.',
      moves: [{ line: [[-1, 0], [1, 0]], side: [0, 1], tag: 'front' }],
    },
    {
      text: '양쪽 모서리를 비스듬히 아래로 접어요. 끝이 얼굴 밖으로 늘어지게 하면 귀가 돼요.',
      moves: [
        { line: [[ex, 0], [0.5285, ey]], side: [R, 0], tag: 'earR' },
        { line: [[-ex, 0], [-0.5285, ey]], side: [-R, 0], tag: 'earL' },
      ],
    },
    {
      text: '아래 꼭짓점에서 앞의 한 장만 위로 조금 접어 올려요. 코가 돼요.',
      moves: [{ line: [[-1, y3], [1, y3]], side: [0, -1], filter: (c) => c.tags.has('front') && !ear(c) }],
    },
    {
      text: '남은 한 장도 점선에서 앞으로 접어 올려요. 하얀 세모를 덮어 주둥이가 돼요.',
      moves: [{ line: [[-1, y4], [1, y4]], side: [0, -1], filter: (c) => !c.tags.has('front') && !ear(c) }],
    },
    {
      text: '연필로 눈과 코, 입을 그려요. 코는 접어 올린 세모 끝에 동그랗게 칠해요.',
      view: [0, -0.15, 1],
      draw: [
        ...eye(-0.105, -0.16), ...eye(0.105, -0.16),
        { dot: [0, -0.325], r: 0.038, ry: 0.027, color: PENCIL },
        { line: [[0, -0.35], [0, -0.395]], color: PENCIL },
        { line: arc([-0.035, -0.395], 0.035, 0.03, 0, -180), color: PENCIL },
        { line: arc([0.035, -0.395], 0.035, 0.03, 180, 360), color: PENCIL },
      ],
    },
    {
      text: '색연필로 볼과 혀를 분홍색으로 칠하면 완성!',
      view: [0, -0.15, 1],
      draw: [cheek(-0.16, -0.3), cheek(0.16, -0.3), { dot: [0, -0.44], r: 0.02, ry: 0.024, color: '#e66a7a' }],
    },
  ],
};
}

export const dog = makeDog();
