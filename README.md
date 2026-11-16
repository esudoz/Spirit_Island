# 정령섬 보조 보드

아이패드 브라우저에서 정령보드를 표시하고 현신 칸을 터치하는 정적 웹페이지입니다.
현재 정령은 **햇살 아래 넘치는 강물** 하나입니다.

## GitHub Pages에 올리기

1. ZIP을 압축 해제합니다.
2. GitHub 저장소를 만들고 아래 파일과 `spirits` 폴더를 구조 그대로 저장소 최상위에 업로드한 뒤 커밋합니다.
   ZIP 자체나 바깥 폴더를 올리는 것이 아니라, `index.html`이 저장소 최상위에 있도록 올립니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Build and deployment → Source**에서 **Deploy from a branch**를 선택합니다.
5. **Branch**를 `main`, 폴더를 `/(root)`로 선택하고 **Save**를 누릅니다.
6. 배포가 완료되면 Pages에 표시되는 주소를 아이패드 Safari에서 엽니다.

일반적인 프로젝트 주소는 `https://사용자이름.github.io/저장소이름/`입니다.
GitHub Free에서는 공개 저장소로 Pages를 사용할 수 있습니다.

[GitHub 공식 배포 설정 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 파일

```text
index.html
README.md
.nojekyll
spirits/
└── river/
    ├── river.js      강물 정령 전용 현신 좌표·터치 동작·보드 스타일
    └── river.webp    현신 트랙이 드러난 보드 이미지
```

별도 설치, npm, 빌드 명령, 서버 API, 환경 변수는 필요하지 않습니다.
모든 앱 리소스는 상대 경로로 불러오므로 GitHub 프로젝트 하위 주소에서도 동작하도록 구성했습니다.
`.nojekyll`은 숨김 파일입니다. 이 프로젝트는 해당 파일이 없어도 기본 Pages 구성에서 사용할 수 있습니다.

## 사용

- 에너지 트랙 6개와 카드 사용 트랙 6개, 총 12개의 현신을 표시합니다.
- 현신이 있는 칸을 누르면 토큰이 사라지고 칸 효과가 드러납니다.
- 같은 칸을 다시 누르면 현신이 돌아옵니다.
- 처음부터 공개된 각 트랙의 첫 칸은 터치 대상이 아닙니다.
- 각 칸의 상태는 독립적입니다. 게임 규칙에 따른 제거 순서나 수치 계산은 강제하지 않습니다.
- 확대 UI, 상태 저장, 스팀 게임 연동은 없습니다. 새로고침하면 현신 12개가 다시 표시됩니다.
- 오프라인 캐시나 서비스 워커를 포함하지 않으므로 온라인 접속을 기준으로 합니다.

## 정령별 코드 구조

`spirits/river/river.js`에 강물 정령의 이미지 경로, 현신 칸 좌표, 초기 상태, 터치 동작이 들어 있습니다.
다른 정령은 `spirits/정령이름/` 폴더에 전용 JS 파일과 보드 이미지를 함께 넣은 뒤 시작 화면에 연결할 수 있습니다.
이미지는 해당 정령의 JS 파일 위치를 기준으로 불러옵니다.

다른 화면에서 이 정령만 표시할 때는 다음처럼 사용합니다.

```html
<div id="board"></div>
<script src="./spirits/river/river.js"></script>
<script>
  const board = RiverSurgesInSunlight.mount(document.getElementById('board'));
</script>
```

반환된 객체에는 `getState()`, `setPresence(id, present)`, `reset()`, `destroy()`가 있습니다.
칸 ID는 `energy-1`부터 `energy-6`, `cards-1`부터 `cards-6`까지입니다.
`present`가 `true`이면 현신이 놓여 있고, `false`이면 칸이 드러납니다.

## 현재 이미지와 검증 범위

현재 `spirits/river/river.webp`는 제공된 스크린샷 두 장을 내장 이미지 편집 도구로 합성한
1536×1024 초안입니다. 원본 픽셀을 그대로 잘라 붙인 합성은 아니므로 세부 그림이나
글자에 차이가 있을 수 있습니다. 현신 토큰은 코드로 그린 별도 표시입니다.

JavaScript 문법, 정적 파일 참조, ZIP 구성은 검사했습니다.
실제 iPad/Safari의 화면 및 터치 동작은 아직 검증하지 않았습니다.
