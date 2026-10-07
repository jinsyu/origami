// 딱지 (정사각형 색종이 두 장): 딱지 팽이와 같은 순서로 접고, 이쑤시개 없이 딱지치기를 한다
import { top2 } from './top2.js';

export const ddakji = {
  ...top2,
  id: 'ddakji',
  name: '딱지',
  desc: '색종이 두 장을 띠로 접어 엇갈려 끼우면 단단한 딱지가 돼요. 친구와 딱지치기를 해 보세요.',
  paper: '정사각형 색종이 2장',
  sheets: [
    { ...top2.sheets[0], colors: { front: '#fbf8f1', back: '#f2b230' } },
    { ...top2.sheets[1], colors: { front: '#fbf8f1', back: '#3c9a5f' } },
  ],
  accent: '#b98213',
  done: '딱지 완성! 바닥에 놓인 친구 딱지 옆을 내 딱지로 세게 내리쳐 뒤집으면 이겨요.',
  // 단계 객체는 영어 문구로 바뀔 수 있으므로 복사해서 쓴다. 마지막(이쑤시개) 단계는 뺀다
  steps: top2.steps.slice(0, -1).map((s) => ({ ...s })),
};
ddakji.steps[2] = { ...ddakji.steps[2], text: '노란 띠는 오른쪽 끝을 위로, 왼쪽 끝을 아래로 비스듬히 꺾어 접어요.' };
ddakji.steps[3] = { ...ddakji.steps[3], text: '초록 띠도 똑같이 오른쪽 끝은 위로, 왼쪽 끝은 아래로 꺾어 접어요.' };
ddakji.steps[4] = { ...ddakji.steps[4], text: '초록 띠를 옆으로 돌려 노란 띠 위에 십자 모양으로 겹쳐 놓아요.' };
ddakji.steps[5] = { ...ddakji.steps[5], text: '아래에 깔린 노란 띠의 위쪽 끝을 초록 띠 위로 접어 내려요.' };
ddakji.steps[6] = { ...ddakji.steps[6], text: '초록 띠의 오른쪽 끝을 왼쪽으로 접어 덮어요.' };
ddakji.steps[7] = { ...ddakji.steps[7], text: '노란 띠의 아래쪽 끝을 위로 접어 덮어요.' };
ddakji.steps[8] = { ...ddakji.steps[8], text: '초록 띠의 왼쪽 끝을 오른쪽으로 접으면서, 끝을 맨 처음 접은 노란 날개 밑으로 끼워 넣으면 완성!' };
