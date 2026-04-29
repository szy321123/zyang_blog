(() => {
  'use strict';

  function initNavLottie() {
    const lottieEl = document.querySelector('.site-icon-lottie');
    if (!lottieEl) return;

    const dataPath = lottieEl.getAttribute('data-lottie');
    if (!dataPath) return;

    const loadLottie = () => {
      // 避免重复加载
      if (lottieEl.hasAttribute('data-loaded')) return;
      lottieEl.setAttribute('data-loaded', 'true');
      lottieEl.innerHTML = '';

      window.lottie.loadAnimation({
        container: lottieEl,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: dataPath,
      });
    };

    if (window.lottie && typeof window.lottie.loadAnimation === 'function') {
      loadLottie();
    } else {
      const existing = document.querySelector('script[src*="lottie.min.js"]');
      if (existing) {
        existing.addEventListener('load', loadLottie);
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js';
        script.async = true;
        script.addEventListener('load', loadLottie);
        document.head.appendChild(script);
      }
    }
  }

  // Hook into PJAX
  if (window.btf) {
    document.addEventListener('pjax:complete', initNavLottie);
  }
  document.addEventListener('DOMContentLoaded', initNavLottie);
})();
