/* 공통 화면: 정령 선택, 선택 화면 복귀, 현신 초기화. 정령별 동작은 각 정령 파일에 둡니다. */
(function () {
  'use strict';
  // 새 정령 파일을 index.html에서 불러온 다음 이 목록에 등록합니다.
  const spirits = [window.RiverSurgesInSunlight, window.LightningSwiftStrike];
  const selectionScreen = document.getElementById('selection-screen');
  const boardScreen = document.getElementById('board-screen');
  const list = document.getElementById('spirit-list');
  const boardHost = document.getElementById('board');
  const backButton = document.getElementById('back-button');
  const resetButton = document.getElementById('reset-button');
  const resetIcon = document.getElementById('reset-icon');
  const status = document.getElementById('board-status');
  const wakeButton = document.getElementById('wake-button');
  const wakeLabel = document.getElementById('wake-label');
  let wakeState = 'off';
  const awake = window.ScreenAwake.create(state => {
    wakeState = state;
    const labels = {
      off: '화면 켜짐 유지',
      pending: '화면 유지 요청 중…',
      active: '화면 켜짐 유지 중',
      paused: '화면 유지 대기 중',
      released: '화면 유지 해제됨 · 재시도',
      blocked: '화면 유지 안 됨 · 재시도',
      unsupported: '화면 유지 미지원',
    };
    wakeLabel.textContent = labels[state];
    wakeButton.dataset.state = state;
    wakeButton.setAttribute('aria-pressed', String(state === 'active'));
    wakeButton.disabled = state === 'pending' || state === 'unsupported';
    wakeButton.title = state === 'active' ? '화면 꺼짐 방지 끄기'
      : state === 'unsupported' ? '지원되는 Safari에서 HTTPS 사이트 주소로 열어주세요.'
      : state === 'blocked' || state === 'released' ? '저전력 모드 등으로 해제될 수 있습니다. 눌러서 다시 시도하세요.'
      : '화면 꺼짐 방지 켜기';
  });
  let currentBoard = null;
  let selectedCard = null;

  function openSpirit(spirit, card) {
    if (currentBoard) currentBoard.destroy();
    currentBoard = spirit.mount(boardHost);
    selectedCard = card;
    boardScreen.setAttribute('aria-label', `${spirit.name} 정령보드`);
    document.title = `${spirit.name} · 정령섬`;
    status.textContent = '';
    selectionScreen.hidden = true;
    boardScreen.hidden = false;
    resetButton.disabled = false;
    awake.start();
    backButton.focus({ preventScroll: true });
  }

  for (const spirit of spirits) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'spirit-card';
    card.setAttribute('aria-label', `${spirit.name} 선택`);
    const art = document.createElement('img');
    art.src = spirit.thumbnailUrl;
    art.alt = '';
    art.width = 560;
    art.height = 168;
    art.draggable = false;
    const name = document.createElement('span');
    name.className = 'spirit-card__name';
    name.textContent = spirit.name;
    card.append(art, name);
    card.addEventListener('click', () => openSpirit(spirit, card));
    list.append(card);
  }

  backButton.addEventListener('click', () => {
    awake.stop();
    if (currentBoard) currentBoard.destroy();
    currentBoard = null;
    boardScreen.hidden = true;
    selectionScreen.hidden = false;
    resetButton.disabled = true;
    status.textContent = '';
    document.title = '정령섬 · 정령 선택';
    if (selectedCard) selectedCard.focus({ preventScroll: true });
  });

  wakeButton.addEventListener('click', () => {
    if (!currentBoard) return;
    if (wakeState === 'active') awake.stop();
    else awake.start();
  });

  resetButton.addEventListener('click', () => {
    if (!currentBoard) return;
    currentBoard.reset();
    status.textContent = '현신을 모두 초기 위치로 되돌렸습니다.';
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && resetIcon.animate) {
      resetIcon.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 360, easing: 'ease-out' });
    }
  });
})();
