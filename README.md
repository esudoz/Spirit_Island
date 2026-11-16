# 정령섬 보조 보드

아이패드 브라우저에서 정령을 선택하고 현신 트랙을 터치하는 정적 웹페이지입니다.

정령 선택 배너는 기존 가로·세로의 각각 1/3 크기로 표시합니다(10:3 비율 유지).
배너 사이 간격은 8px이며, 정령이 적어도 빈 칸을 채우려고 배너가 늘어나지 않습니다.
선택 화면은 제목 없이 배너로 시작하며, 보드 상단에는 복귀·화면 유지·초기화 조작만 표시합니다.

| 정령 | 에너지 현신 | 카드 사용 현신 | 합계 |
| --- | ---: | ---: | ---: |
| 햇살 아래 넘치는 강물 | 6 | 6 | 12 |
| 번개의 신속한 일격 | 7 | 4 | 11 |
| 천둥으로 말하는 자 | 5 | 6 | 11 |

## 천둥으로 말하는 자 추가 (v7)

이 작업에서 제공한 `upload-spirit-island.command`를 실행하면 최신 파일을 한 번에 업로드합니다.
스크립트는 최신 작업 폴더를 읽으므로 새 ZIP을 내려받을 필요가 없습니다.

웹에서 직접 업데이트한다면 다음 위치에 올립니다.

1. 새 `spirits/thunderspeaker/` 폴더: `thunderspeaker.js`, `thunderspeaker.webp`, `thunderspeaker-banner.webp`
2. 저장소 최상위 덮어쓰기: `index.html`, `app.js`, `README.md`

이전의 작은 배너, 제목 없는 화면, 초기화 버튼과 화면 유지 기능을 그대로 사용합니다.
전체 파일 ZIP은 현재 버전의 모든 정령을 포함합니다.

## 처음 GitHub Pages에 올리기

1. 전체 ZIP을 압축 해제합니다.
2. 파일과 폴더 구조를 유지하여 저장소에 업로드합니다. `index.html`이 저장소 최상위에 있어야 합니다.
3. **Settings → Pages → Build and deployment → Source**에서 **Deploy from a branch**를 선택합니다.
4. **Branch**를 `main`, 폴더를 `/(root)`로 선택하고 **Save**를 누릅니다.
5. 배포가 끝나면 Pages에 표시되는 HTTPS 주소를 아이패드 Safari에서 엽니다.

GitHub Free에서는 공개 저장소로 Pages를 사용할 수 있습니다.
[GitHub 공식 배포 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 파일 구조

```text
index.html
app.js
wake-lock.js
styles.css
README.md
.nojekyll
spirits/
├── river/
│   ├── river.js
│   ├── river.webp
│   └── river-banner.webp
├── lightning/
│   ├── lightning.js
│   ├── lightning.webp
│   └── lightning-banner.webp
└── thunderspeaker/
    ├── thunderspeaker.js
    ├── thunderspeaker.webp
    └── thunderspeaker-banner.webp
```

별도 설치, npm, 빌드 명령, 서버 API, 환경 변수는 필요하지 않습니다.
모든 앱 리소스는 상대 경로로 연결됩니다. `.nojekyll`은 숨김 파일이며 이 구성에서는 생략해도 됩니다.

## 사용

- 메인 화면의 가로형 정령 그림 버튼을 눌러 보드를 엽니다.
- 정령 버튼은 10:3 그림, 검은 음영, 흰색 이름으로 표시됩니다.
- 현신 칸을 누르면 토큰이 사라지고 아래 효과가 드러납니다. 다시 누르면 복원됩니다.
- 처음부터 공개된 첫 칸은 터치 대상이 아닙니다. 강물과 천둥으로 말하는 자는 에너지 1 / 카드 사용 1, 번개는 에너지 1 / 카드 사용 2입니다.
- 우상단 흰색 원형 화살표는 현재 정령의 모든 현신을 초기화합니다.
- 좌상단 화살표는 정령 선택 화면으로 돌아갑니다.
- 칸은 독립적으로 토글됩니다. 게임 규칙에 따른 제거 순서나 에너지 계산은 강제하지 않습니다.
- 확대 UI, 상태 저장, 스팀 게임 연동은 없습니다. 다시 정령을 선택하면 모든 현신이 놓인 상태로 시작합니다.
- 서비스 워커나 오프라인 캐시는 포함하지 않습니다.

## 화면 꺼짐 방지

보드를 열면 Screen Wake Lock API로 화면 유지를 요청합니다.
다른 앱이나 탭으로 이동하면 해제되고 보드로 돌아오면 다시 요청합니다.
정령 선택 화면으로 돌아가면 화면 유지도 종료합니다.

보드 상단 중앙에서 실제 상태를 확인합니다.

- **화면 켜짐 유지 중**: 요청이 승인되었습니다. 누르면 끕니다.
- **화면 켜짐 유지**: 누르면 다시 켭니다.
- **화면 유지 안 됨 / 해제됨 · 재시도**: 눌러서 다시 요청합니다.
- **화면 유지 미지원**: 지원되는 Safari에서 HTTPS 사이트 주소로 열어주세요.

저전력 모드나 배터리 상태 등 기기 정책에 따라 요청이 거절되거나 해제될 수 있습니다.
[API 동작 조건](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
[Safari 지원 안내](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/)

## 정령별 코드

정령별 좌표, 토큰 스타일, 초기 상태와 터치 로직은 각 정령의 JS 파일에 독립적으로 들어 있습니다.
공통 화면 전환과 초기화 버튼은 `app.js`, 화면 유지 기능은 `wake-lock.js`에서 처리합니다.

새 정령은 전용 폴더에 JS와 보드·선택 이미지를 넣고, `index.html`에서 JS를 불러온 다음
`app.js`의 `spirits` 목록에 등록합니다. 정령 객체에는 `name`, `thumbnailUrl`, `mount(container)`가 필요합니다.
`mount()`는 `element`, `getState()`, `setPresence(id, present)`, `reset()`, `destroy()`를 반환합니다.

강물 객체는 `RiverSurgesInSunlight`, 번개 객체는 `LightningSwiftStrike`, 천둥으로 말하는 자 객체는 `Thunderspeaker`입니다.
강물 칸 ID는 `energy-1`~`energy-6`, `cards-1`~`cards-6`입니다.
번개 칸 ID는 `energy-1`~`energy-7`, `cards-1`~`cards-4`입니다.
천둥으로 말하는 자 칸 ID는 `energy-1`~`energy-5`, `cards-1`~`cards-6`입니다.
천둥으로 말하는 자의 공기·불·태양 원소 칸과 카드 1장 회수 칸도 일반 현신 칸처럼 토글됩니다.
`present: true`는 현신이 놓인 상태, `false`는 칸이 드러난 상태입니다.

## 이미지와 검증 범위

- 천둥으로 말하는 자: 두 번째 스크린샷에 첫 번째 스크린샷의 공개된 에너지 칸 5개를 조합했습니다.
  빨간 X가 겹친 에너지 2 칸 위쪽 테두리의 작은 부분은 같은 보드의 동일한 코인 테두리 픽셀로 보완했습니다.
  규칙 글자, 숫자, 원소는 원본 그대로이며 외곽을 제거한 보드는 2448×1604입니다.
  얼굴 그림을 자른 선택 이미지는 900×270이며 모두 무손실 WebP입니다.

- 번개: 첨부된 두 스크린샷의 원본 픽셀을 조합하여 모든 현신 트랙을 드러냈습니다.
  첫 번째 이미지에 두 번째 이미지의 에너지 칸 7개만 복사했습니다.
  두 번째 이미지의 빨간 X는 가져오지 않았습니다. 그림과 글자를 새로 생성하지 않았습니다.
  외곽을 제거한 보드는 2448×1604, 왼쪽 그림의 선택 이미지는 900×270이며 무손실 WebP입니다.
- 강물: 기존 AI 합성 초안을 크롭한 1507×988 이미지입니다. 최초 합성의 세부 차이 가능성은 남아 있습니다.
  선택 이미지는 560×168입니다.
- 토큰은 각 정령의 색상에 맞춰 코드로 그린 원형 표시입니다.

JavaScript 문법, 정적 경로, UTF-8, ZIP 구성, 번개 원본 픽셀 합성과 WebP 무손실 변환을 검사했습니다.
브라우저를 실행하지 않는 DOM 모형 테스트에서 세 정령 선택, 현신 12개/11개/11개의 개별 토글과 초기화,
정령 전환 시 정리 동작을 확인했습니다. 화면 유지 기능도 모의 API로 검사했습니다.
실제 iPad/Safari 화면과 터치, 자동 잠금 방지 여부는 실기기 검증이 필요합니다.
기기 제어는 사용하지 않았습니다.
