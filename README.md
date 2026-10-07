# 종이접기 교실

색종이로 따라 접는 3D 종이접기 학습 웹앱. https://origami.gyosil.app

- 입문·초급·중급·고급 4구간, 작품 52개 (입문 24, 초급 23, 중급 4, 고급 1)
- 작품 대부분은 Origami Club(Fumiaki Shingu) 공개 도면을 따라 구현 (출처는 각 작품 파일 첫 줄)
- 접는 선(골짜기/산)과 움직임 화살표를 먼저 보여 주고 한 단계씩 3D로 접는다
- 인쇄용 도면, 완성 기록, 접기 기호 설명, 꾸미기(연필·색연필) 단계, 수업 활용 안내

## 실행

빌드 과정 없이 정적 파일로 동작한다 (three.js는 CDN).

```bash
python3 -m http.server 5173
```

`http://localhost:5173` 을 연다. `?dev` 를 붙이면 개발용 모델도 보인다.

## 구조

| 파일 | 역할 |
|---|---|
| `src/engine.js` | 접기 엔진. 볼록 다각형을 접힘선으로 정확히 잘라 회전시킨다. 층 높이(겹 순서), 다시 펴기, 끼워 넣기(insert), 3차원 축 회전(axis3) |
| `src/sim.js` | 복합 접기 움직임. 하위 동작 운동학 연쇄 + 이음매 이완(미리 계산), 펼쳐 누르기 해석적 경로, 안내선·화살표 |
| `src/paper.js` | 종이 메시 렌더링, 카메라 맞춤 |
| `src/main.js` | 화면(목록·접기·인쇄), 재생 제어 |
| `src/models/*.js` | 작품 데이터. 단계마다 접는 선·방향·고를 겹을 적는다 |
| `src/models/parts/folds.js` | 펼쳐 누르기·꽃잎 접기 등 공용 접기 |

## 작품 데이터

```js
{ text: '설명', moves: [{ line: [[x1, y1], [x2, y2]], side: [x, y], filter, toward: 1, angle: 180 }] }
```

- `line` 접는 선, `side` 접히는 쪽의 한 점, `filter(c)` 고를 조각(위치·태그), `toward` 1=앞으로(골짜기) -1=뒤로(산)
- `sim: true` 단계는 하위 동작을 차례로 적용해 최종 상태를 만들고 움직임을 풀이기로 만든다
- 옵션: `unfold`, `tag`, `insert`, `shift`, `spine`(뒤집어 접기 경로), `axis3`, `transient`, `at`

## 썸네일 다시 만들기

작품을 고친 뒤:

```bash
node scripts/thumb-server.mjs
```

브라우저에서 `http://localhost:5173/?live&save#/` 를 열면 `thumbs/*.webp` 가 갱신된다.
