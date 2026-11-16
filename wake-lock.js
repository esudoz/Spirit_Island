/* 화면 유지: 보드가 보일 때만 사용하고, 복귀 시 다시 요청합니다. */
(function (global) {
  'use strict';
  function create(onChange) {
    let wanted = false;
    let lock = null;
    let pending = false;
    let generation = 0;
    let suspended = false;
    const visible = () => !suspended && document.visibilityState === 'visible';
    const emit = state => onChange(state);

    function releaseCurrent() {
      const previous = lock;
      lock = null;
      if (previous && !previous.released) previous.release().catch(() => {});
    }

    async function acquire() {
      if (!wanted || !visible() || pending || (lock && !lock.released)) return;
      if (!global.isSecureContext || !global.navigator.wakeLock) {
        emit('unsupported');
        return;
      }
      const requestGeneration = generation;
      pending = true;
      emit('pending');
      try {
        const candidate = await global.navigator.wakeLock.request('screen');
        // 요청 도중 보드를 닫거나 앱을 전환했다면 늦게 도착한 잠금도 해제합니다.
        if (!wanted || !visible() || requestGeneration !== generation) {
          if (!candidate.released) await candidate.release();
          return;
        }
        lock = candidate;
        candidate.addEventListener('release', () => {
          if (lock !== candidate) return;
          lock = null;
          emit(wanted ? (visible() ? 'released' : 'paused') : 'off');
        });
        emit(candidate.released ? 'released' : 'active');
      } catch (_) {
        if (wanted && visible() && requestGeneration === generation) emit('blocked');
      } finally {
        pending = false;
        // 이전 화면의 요청을 기다리던 사이 새 보드로 돌아온 경우 한 번 재요청합니다.
        // 동일 요청의 거절이나 OS 해제는 무한 재시도하지 않습니다.
        if (wanted && visible() && requestGeneration !== generation) void acquire();
      }
    }

    function pause() {
      generation += 1;
      releaseCurrent();
      if (wanted) emit('paused');
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void acquire();
      else pause();
    });
    global.addEventListener('pagehide', () => { suspended = true; pause(); });
    global.addEventListener('pageshow', () => { suspended = false; void acquire(); });

    return Object.freeze({
      start() {
        if (!wanted) generation += 1;
        wanted = true;
        if (visible()) void acquire();
        else emit('paused');
      },
      stop() {
        wanted = false;
        generation += 1;
        releaseCurrent();
        emit('off');
      },
    });
  }
  global.ScreenAwake = Object.freeze({ create });
})(window);
