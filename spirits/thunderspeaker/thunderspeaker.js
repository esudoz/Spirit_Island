/**
 * 천둥으로 말하는 자 — 정령 전용 보드 및 현신 터치 처리.
 * 외부 라이브러리, 빌드, 서버 API, 저장소가 필요하지 않습니다.
 * <script src="./spirits/thunderspeaker/thunderspeaker.js"></script>
 * const board = Thunderspeaker.mount(document.querySelector('#board'));
 * thunderspeaker.webp는 기본적으로 이 스크립트와 같은 폴더에서 불러옵니다.
 */
(function (global) {
  'use strict';

  const WIDTH = 2448;
  const HEIGHT = 1604;
  const DIAMETER = 138;
  const scriptUrl = document.currentScript && document.currentScript.src;
  const defaultImageUrl = new URL('./thunderspeaker.webp?v=7', scriptUrl || document.baseURI).href;
  const thumbnailUrl = new URL('./thunderspeaker-banner.webp?v=7', scriptUrl || document.baseURI).href;
  // 외곽 크롭(왼쪽 18px, 위쪽 18px)을 좌표에도 동일하게 반영합니다.
  const energyColumns = [1210, 1393, 1576, 1758, 1941];
  const cardColumns = [1210, 1393, 1576, 1758, 1941, 2124];
  const energyLabels = ['공기 원소', '에너지 2', '불 원소', '태양 원소', '에너지 3'];
  const cardLabels = ['카드 사용 2', '카드 사용 2', '카드 사용 3', '카드 1장 회수', '카드 사용 3', '카드 사용 4'];

  // 첫 번째 칸(에너지 1 / 카드 사용 1)은 항상 공개되어 있으므로 버튼을 만들지 않습니다.
  // 좌표는 원본 이미지 기준이며 실제 버튼 배치에는 %로 변환합니다.
  const slots = Object.freeze([
    ...energyColumns.map((x, i) => Object.freeze({ id: `energy-${i + 1}`, track: 'energy', x, y: 470, label: energyLabels[i] })),
    ...cardColumns.map((x, i) => Object.freeze({ id: `cards-${i + 1}`, track: 'cards', x, y: 723, label: cardLabels[i] })),
  ]);

  const tokenMarkup = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" stroke-width="2" opacity=".45"/><path d="M80 58C86 36 69 17 47 20C24 23 16 48 29 65C42 82 70 76 73 56C76 39 57 28 43 37C30 46 37 64 50 63C61 62 65 49 56 45C50 42 45 47 47 52" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>';
  const css = `
    .thunderspeaker-board { position:relative; width:100%; max-width:calc(var(--board-available-height, 100svh) * ${WIDTH / HEIGHT}); aspect-ratio:${WIDTH}/${HEIGHT}; margin:auto; isolation:isolate; }
    .thunderspeaker-board__image { display:block; width:100%; height:100%; user-select:none; -webkit-user-select:none; -webkit-user-drag:none; }
    .thunderspeaker-board__slot { position:absolute; transform:translate(-50%,-50%); margin:0; padding:0; border:0; border-radius:50%; background:transparent; cursor:pointer; touch-action:manipulation; -webkit-tap-highlight-color:transparent; user-select:none; -webkit-user-select:none; appearance:none; -webkit-appearance:none; }
    .thunderspeaker-board__token { display:block; width:100%; height:100%; border-radius:50%; box-sizing:border-box; border:2px solid #15392e; background:radial-gradient(circle at 32% 25%,#568e75 0%,#224939 48%,#101e18 100%); color:#e0d2ac; box-shadow:0 2px 4px #071a1080,inset 0 0 0 2px #8cbd9d80; pointer-events:none; }
    .thunderspeaker-board__token svg { display:block; width:100%; height:100%; }
    .thunderspeaker-board__slot[aria-pressed="false"] .thunderspeaker-board__token { visibility:hidden; }
    .thunderspeaker-board__slot:focus { outline:none; }
    .thunderspeaker-board__slot:focus-visible { outline:3px solid #fff; outline-offset:3px; box-shadow:0 0 0 6px #14576a; }
    @media (prefers-reduced-motion:no-preference) { .thunderspeaker-board__slot:active .thunderspeaker-board__token { transform:scale(.96); } }
  `;

  /**
   * mount(container, { imageUrl?, initiallyRemoved? })
   * 새로 열면 현신 11개가 모두 놓인 상태입니다. 상태는 메모리에만 보관합니다.
   * 반환값: { element, getState, setPresence, reset, destroy }
   * 변경 이벤트: element의 'presencechange', detail = { id, present, state }
   */
  function mount(container, options = {}) {
    if (!container || container.nodeType !== 1) throw new TypeError('보드를 담을 HTML 요소가 필요합니다.');
    const removed = new Set(options.initiallyRemoved || []);
    for (const id of removed) {
      if (!slots.some(slot => slot.id === id)) throw new RangeError(`알 수 없는 현신 칸: ${id}`);
    }

    const element = document.createElement('div');
    element.className = 'thunderspeaker-board';
    element.setAttribute('role', 'group');
    element.setAttribute('aria-label', '천둥으로 말하는 자 정령보드');
    const style = document.createElement('style');
    style.textContent = css;
    const image = document.createElement('img');
    image.className = 'thunderspeaker-board__image';
    image.src = options.imageUrl || defaultImageUrl;
    image.alt = '천둥으로 말하는 자: 성장, 현신 트랙, 특수 규칙, 타고난 능력';
    image.width = WIDTH;
    image.height = HEIGHT;
    image.draggable = false;
    element.append(style, image);

    const state = new Map();
    const buttons = new Map();
    let destroyed = false;
    const getState = () => Object.fromEntries(state);
    function paint(slot) {
      const present = state.get(slot.id);
      const button = buttons.get(slot.id);
      button.setAttribute('aria-pressed', String(present));
      button.setAttribute('aria-label', `${slot.track === 'energy' ? '에너지' : '카드'} 트랙 ${slot.id.split('-')[1]}번째 현신, ${slot.label}: ${present ? '놓임, 누르면 제거' : '제거됨, 누르면 복원'}`);
    }
    function setPresence(id, present) {
      if (destroyed) throw new Error('이미 제거한 보드입니다.');
      if (!state.has(id)) throw new RangeError(`알 수 없는 현신 칸: ${id}`);
      if (typeof present !== 'boolean') throw new TypeError('현신 상태는 true 또는 false여야 합니다.');
      if (state.get(id) === present) return;
      state.set(id, present);
      paint(slots.find(slot => slot.id === id));
      element.dispatchEvent(new CustomEvent('presencechange', {
        bubbles: true,
        detail: { id, present, state: getState() },
      }));
    }
    for (const slot of slots) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'thunderspeaker-board__slot';
      button.dataset.presenceId = slot.id;
      button.style.left = `${slot.x / WIDTH * 100}%`;
      button.style.top = `${slot.y / HEIGHT * 100}%`;
      button.style.width = `${DIAMETER / WIDTH * 100}%`;
      button.style.height = `${DIAMETER / HEIGHT * 100}%`;
      const token = document.createElement('span');
      token.className = 'thunderspeaker-board__token';
      token.setAttribute('aria-hidden', 'true');
      token.innerHTML = tokenMarkup;
      button.append(token);
      state.set(slot.id, !removed.has(slot.id));
      buttons.set(slot.id, button);
      paint(slot);
      // click으로 마우스, 터치, 키보드를 함께 처리하여 터치 중복 실행을 피합니다.
      button.addEventListener('click', () => setPresence(slot.id, !state.get(slot.id)));
      element.append(button);
    }
    container.append(element);
    return Object.freeze({
      element,
      getState,
      setPresence,
      reset() { for (const slot of slots) setPresence(slot.id, true); },
      destroy() { destroyed = true; element.remove(); },
    });
  }

  global.Thunderspeaker = Object.freeze({
    id: 'thunderspeaker',
    name: '천둥으로 말하는 자',
    width: WIDTH,
    height: HEIGHT,
    imageUrl: defaultImageUrl,
    thumbnailUrl,
    slots,
    mount,
  });
})(window);
