# 종이접기 교실 — 개발 문서

색종이 한 장으로 따라 접는 3D 종이접기 학습 웹앱. https://origami.gyosil.app
GitHub `jinsyu/origami` → Vercel 자동 배포 (main 푸시 = 배포). 빌드 없음, three.js r0.169 CDN.

## 대상과 목표

- **학생(초등 중심)**: 혼자 화면만 보고 끝까지 접을 수 있어야 한다. 글보다 그림·움직임이 먼저.
- **교사**: 수업에 바로 쓸 수 있어야 한다. 난이도 구분, 인쇄용 도면, 큰 화면(전자칠판) 보기, 준비물 안내.
- 완성 모양이 실제 작품과 **닮아야** 한다. 안 닮으면 넣지 않는다 (부엉이·백조·공룡·펭귄·백합 등 제외 이력).

## 사용자 결정 사항 (바꾸지 말 것)

- 난이도는 **4구간**: 입문·초급·중급·고급 (`level` 1~4). 10단계 분류는 과하다는 피드백으로 폐기.
- 지붕 집은 초급. 무늬 색종이는 **쓰지 않는다** (단색만).
- 강아지·고양이처럼 얼굴이 있는 작품은 마지막에 **연필·색연필 꾸미기 단계**를 둔다.
- 루프 작업은 회차마다 커밋·푸시. 커밋 메시지는 한국어, 끝에 `Co-Authored-By` 줄.

## 구조

| 파일 | 역할 |
|---|---|
| `src/engine.js` | 접기 엔진: 다각형 분할·회전, 층 높이, unfold/insert/spine/axis3, 꾸미기 획(`draw`/`inked`) 전달 |
| `src/sim.js` | 복합 단계(`sim:true`): 연쇄 운동학 + 이완, 펼쳐 누르기·꽃잎 접기 해석 경로, 안내선·화살표 |
| `src/paper.js` | 종이 메시, 조명, 꾸미기 잉크(`setupInk`/`updateInk`), 카메라 맞춤 |
| `src/thumbs.js` | 오프스크린 렌더: 단계 그림·도면·완성 그림·저장 이미지 |
| `src/main.js` | 갤러리·접기 화면·인쇄 화면, 재생 제어, 이어서 접기, 언어 |
| `src/i18n/en.js` | 영어 문구 (작품별 steps 배열 길이를 한국어와 맞출 것) |
| `src/models/*.js`, `index.js` | 작품 데이터와 목록 (level 순 정렬) |
| `src/models/parts/folds.js` | squash, petal, flip 등 공용 접기 |
| `src/models/parts/draw.js` | 꾸미기 도우미: arc, eye, cheek, box, fill |
| `scripts/check.mjs` | `npm run check` — 끊김·NaN·튐 검사 |
| `scripts/layers.mjs` | 층 관통 진단 |
| `scripts/thumb-server.mjs` | 썸네일 저장 서버 (5199) |

### 작품 데이터 요약

```js
{ text, moves: [{ line, side, filter, toward, tag, unfold, insert, spine, ... }], sim, view }
{ text, draw: [{ line:[[x,y]...], w, color, under }, { dot:[x,y], r, ry, color }] } // 꾸미기 단계
```
꾸미기 좌표는 완성 모양을 정면에서 본 x,y. 좌표는 `endPose(buildModel(m).at(-1))` 로 뽑아 잡는다.

## 작업 방법

- 로컬: `python3 -m http.server 5173` (이미 띄워져 있으면 재사용). 브라우저 캐시 때문에 수정 파일은 `fetch(url,{cache:'reload'})` 후 새로고침.
- 검증: `npm run check` + `node --check src/i18n/en.js` (check는 en.js를 읽지 않음) + 브라우저 화면 확인.
- 썸네일: `node scripts/thumb-server.mjs` 띄우고 헤드리스 크롬(`--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader`)으로 `?live&save#/` 를 40초 열기. 작품·색을 바꾸면 반드시 다시 만든다.
- 브라우저 패널이 가려지면 rAF가 멈춘다 → 슬라이더(`#progress`)를 직접 바꿔 상태를 본다.

## 엔진 한계 (새 작품 고를 때 기준)

- 평평하게 접히는 작품만. 입체로 부풀리기는 불가.
- 여러 장: `sheets: [{ outline, colors, place: {x, y, z, rot} }]`. 장마다 태그 `sheet0`, `sheet1`… 로 골라 접는다. 옮기기·돌리기는 `axis3` (`offset` 으로 평행 이동). 예: `top2.js` (딱지 팽이)
- 아직 불가: 연꽃(입체), 몸 전체 강아지(다리 기본형 필요).

## 현재 작품 (31개)

- 입문: 강아지 얼굴, 고양이 얼굴, 여우 얼굴, 판다 얼굴, 토끼 얼굴, 수박, 보트, 눈 덮인 산, 병아리, 돛단배, 튤립 꽃, 집, 편지 봉투
- 초급: 딱지 팽이(2장), 딱지(2장), 컵, 모서리 책갈피, 매미, 투구, 종이 모자, 하트, 액자, 지붕 집
- 중급: 종이비행기, 글라이더, 고래, 오리, 두루미
- 고급: 튤립 꽃봉오리, 마스 상자, 학

## 앞으로의 방향 (우선순위)

1. **품질 점검**: 작품마다 완성 모양이 실물과 닮았는지, 안내 문구가 초등학생 눈높이인지, 화살표·접는 선이 헷갈리지 않는지.
2. **교사 기능**: 인쇄 도면 품질, 수업용 큰 화면, 준비물·소요 시간 표시.
3. **레이아웃**: 모바일·태블릿·전자칠판에서 모두 편하게. 첫 화면에서 바로 시작.
4. **작품 추가**: 한 장·평면 작품 위주로 도안 출처를 확인해 추가. 닮지 않으면 넣지 않는다.
