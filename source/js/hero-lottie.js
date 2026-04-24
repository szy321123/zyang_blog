(() => {
  'use strict'

  const HERO_LOTTIE = {
    scriptUrl: 'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js',
    jsonPath: '/json/hero-panda.json'
  }

  const manager = {
    animation: null,
    mountedEl: null,
    scriptPromise: null,
    hooked: false,

    isHome () {
      return Boolean(window.GLOBAL_CONFIG_SITE && window.GLOBAL_CONFIG_SITE.pageType === 'home')
    },

    getHeader () {
      return document.querySelector('#page-header.full_page')
    },

    ensureScript () {
      if (window.lottie && typeof window.lottie.loadAnimation === 'function') {
        return Promise.resolve(window.lottie)
      }

      if (this.scriptPromise) return this.scriptPromise

      this.scriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-hero-lottie-lib="true"]')
        if (existing) {
          existing.addEventListener('load', () => resolve(window.lottie), { once: true })
          existing.addEventListener('error', reject, { once: true })
          return
        }

        const script = document.createElement('script')
        script.src = HERO_LOTTIE.scriptUrl
        script.async = true
        script.defer = true
        script.dataset.heroLottieLib = 'true'
        script.addEventListener('load', () => resolve(window.lottie), { once: true })
        script.addEventListener('error', reject, { once: true })
        document.head.appendChild(script)
      })

      return this.scriptPromise
    },

    mountContainer () {
      const header = this.getHeader()
      if (!header) return null

      let wrap = header.querySelector('.hero-lottie-wrap')
      if (!wrap) {
        wrap = document.createElement('div')
        wrap.className = 'hero-lottie-wrap'
        wrap.innerHTML = '<div id="hero-lottie" aria-hidden="true"></div>'
        header.appendChild(wrap)
      }

      this.mountedEl = wrap.querySelector('#hero-lottie')
      return this.mountedEl
    },

    init () {
      this.destroy()
      if (!this.isHome()) return

      const container = this.mountContainer()
      if (!container) return

      this.ensureScript()
        .then(lottie => {
          if (!this.isHome() || !container.isConnected || !lottie) return

          this.animation = lottie.loadAnimation({
            container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: HERO_LOTTIE.jsonPath,
            rendererSettings: {
              progressiveLoad: true,
              preserveAspectRatio: 'xMidYMid meet'
            }
          })
        })
        .catch(() => {
          const wrap = container.closest('.hero-lottie-wrap')
          if (wrap) wrap.remove()
        })
    },

    destroy () {
      if (this.animation) {
        this.animation.destroy()
        this.animation = null
      }

      const wrap = document.querySelector('.hero-lottie-wrap')
      if (wrap) wrap.remove()
      this.mountedEl = null
    },

    hookLifecycle () {
      if (this.hooked) return
      this.hooked = true

      if (window.btf && typeof window.btf.addGlobalFn === 'function') {
        window.btf.addGlobalFn('pjaxSend', () => this.destroy(), 'hero_lottie_destroy')
        window.btf.addGlobalFn('pjaxComplete', () => this.init(), 'hero_lottie_init')
      }

      document.addEventListener('pjax:send', () => this.destroy(), { passive: true })
      document.addEventListener('pjax:complete', () => this.init(), { passive: true })
    }
  }

  if (window.__heroLottieManager && typeof window.__heroLottieManager.destroy === 'function') {
    window.__heroLottieManager.destroy()
  }
  window.__heroLottieManager = manager

  manager.hookLifecycle()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => manager.init(), { once: true })
  } else {
    manager.init()
  }
})()
