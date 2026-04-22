(() => {
  'use strict'

  /**
   * Centralized parameters for quick tuning.
   */
  const PARALLAX_CONFIG = {
    maxTranslateX: 10,
    maxTranslateY: 7,
    easing: 0.125,
    returnSpeed: 0.07,
    spotlightSize: 340,
    spotlightSoftness: 90,
    spotlightOpacity: 0.24,
    darknessOpacity: 0.18,
    desktopOnly: true,
    useFrontLayer: true // false => single-layer mode
  }

  class HomeHeroMotion {
    constructor (headerEl, config) {
      this.headerEl = headerEl
      this.config = config

      this.sceneEl = null
      this.bgLayerEl = null
      this.frontLayerEl = null
      this.vignetteEl = null
      this.spotlightEl = null

      this.rafId = 0
      this.destroyed = false
      this.isPointerInside = false

      this.current = { x: 0, y: 0 }
      this.target = { x: 0, y: 0 }

      this.spotCurrent = { x: 0, y: 0 }
      this.spotTarget = { x: 0, y: 0 }

      this.originalBgImage = this.headerEl.style.backgroundImage || ''

      this.onPointerMove = this.onPointerMove.bind(this)
      this.onPointerLeave = this.onPointerLeave.bind(this)
      this.onVisibilityChange = this.onVisibilityChange.bind(this)
      this.tick = this.tick.bind(this)
    }

    setup () {
      const bgImage = this.resolveBgImage()
      if (!bgImage) return false

      this.headerEl.classList.add('hero-lite-enabled')
      this.headerEl.style.backgroundImage = 'none'

      this.sceneEl = document.createElement('div')
      this.sceneEl.className = 'hero-lite-scene'
      this.sceneEl.style.setProperty('--hero-bg-image', bgImage)
      this.sceneEl.style.setProperty('--spotlight-size', `${this.config.spotlightSize}px`)
      this.sceneEl.style.setProperty('--spotlight-softness', `${this.config.spotlightSoftness}px`)
      this.sceneEl.style.setProperty('--spotlight-opacity', `${this.config.spotlightOpacity}`)
      this.sceneEl.style.setProperty('--darkness-opacity', `${this.config.darknessOpacity}`)
      this.sceneEl.dataset.spotlightMode = 'glow'

      this.bgLayerEl = document.createElement('div')
      this.bgLayerEl.className = 'hero-lite-layer hero-lite-bg'
      this.sceneEl.appendChild(this.bgLayerEl)

      if (this.config.useFrontLayer) {
        this.frontLayerEl = document.createElement('div')
        this.frontLayerEl.className = 'hero-lite-layer hero-lite-front'
        this.sceneEl.appendChild(this.frontLayerEl)
      }

      this.vignetteEl = document.createElement('div')
      this.vignetteEl.className = 'hero-lite-vignette'
      this.sceneEl.appendChild(this.vignetteEl)

      this.spotlightEl = document.createElement('div')
      this.spotlightEl.className = 'hero-lite-spotlight'
      this.sceneEl.appendChild(this.spotlightEl)

      this.headerEl.prepend(this.sceneEl)

      const rect = this.headerEl.getBoundingClientRect()
      this.spotCurrent.x = rect.width / 2
      this.spotCurrent.y = rect.height / 2
      this.spotTarget.x = this.spotCurrent.x
      this.spotTarget.y = this.spotCurrent.y

      this.headerEl.addEventListener('pointermove', this.onPointerMove, { passive: true })
      this.headerEl.addEventListener('pointerleave', this.onPointerLeave, { passive: true })
      document.addEventListener('visibilitychange', this.onVisibilityChange, { passive: true })

      this.detectSpotlightMode(bgImage).then(mode => {
        if (this.destroyed || !this.sceneEl) return
        this.sceneEl.dataset.spotlightMode = mode
      }).catch(() => {})

      this.tick()
      return true
    }

    resolveBgImage () {
      const inlineBg = this.headerEl.style.backgroundImage
      if (inlineBg && inlineBg !== 'none') return inlineBg
      const computedBg = window.getComputedStyle(this.headerEl).backgroundImage
      if (computedBg && computedBg !== 'none') return computedBg
      return ''
    }

    extractImageUrl (bgImageValue) {
      const match = /url\((['"]?)(.*?)\1\)/.exec(bgImageValue || '')
      if (!match || !match[2]) return ''
      return match[2]
    }

    async detectSpotlightMode (bgImageValue) {
      const rawUrl = this.extractImageUrl(bgImageValue)
      if (!rawUrl) return 'glow'

      try {
        const url = new URL(rawUrl, window.location.href).href
        const img = new Image()
        img.decoding = 'async'
        img.crossOrigin = 'anonymous'

        const loaded = new Promise((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
        })
        img.src = url
        await loaded

        const canvas = document.createElement('canvas')
        const size = 24
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return 'glow'

        ctx.drawImage(img, 0, 0, size, size)
        const data = ctx.getImageData(0, 0, size, size).data

        let totalLuma = 0
        let count = 0
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3]
          if (alpha < 8) continue
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          totalLuma += 0.2126 * r + 0.7152 * g + 0.0722 * b
          count++
        }

        const avg = count ? totalLuma / count : 170
        return avg > 150 ? 'glow' : 'dim'
      } catch (_) {
        return 'glow'
      }
    }

    onPointerMove (event) {
      const rect = this.headerEl.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      this.isPointerInside = true
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1

      this.target.x = this.clamp(nx, -1, 1)
      this.target.y = this.clamp(ny, -1, 1)

      this.spotTarget.x = event.clientX - rect.left
      this.spotTarget.y = event.clientY - rect.top
    }

    onPointerLeave () {
      this.isPointerInside = false
      this.target.x = 0
      this.target.y = 0

      const rect = this.headerEl.getBoundingClientRect()
      this.spotTarget.x = rect.width / 2
      this.spotTarget.y = rect.height / 2
    }

    onVisibilityChange () {
      if (!document.hidden) return
      this.target.x = 0
      this.target.y = 0
      this.current.x = 0
      this.current.y = 0
      this.applyTransforms()
    }

    tick () {
      if (this.destroyed) return

      const lerp = this.isPointerInside ? this.config.easing : this.config.returnSpeed

      this.current.x += (this.target.x - this.current.x) * lerp
      this.current.y += (this.target.y - this.current.y) * lerp

      this.spotCurrent.x += (this.spotTarget.x - this.spotCurrent.x) * lerp
      this.spotCurrent.y += (this.spotTarget.y - this.spotCurrent.y) * lerp

      this.applyTransforms()
      this.rafId = window.requestAnimationFrame(this.tick)
    }

    applyTransforms () {
      if (!this.sceneEl || !this.bgLayerEl) return

      const tx = this.current.x * this.config.maxTranslateX
      const ty = this.current.y * this.config.maxTranslateY

      this.bgLayerEl.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.05)`

      if (this.frontLayerEl) {
        this.frontLayerEl.style.transform = `translate3d(${tx * 1.22}px, ${ty * 1.22}px, 0) scale(1.08)`
      }

      this.sceneEl.style.setProperty('--spot-x', `${this.spotCurrent.x}px`)
      this.sceneEl.style.setProperty('--spot-y', `${this.spotCurrent.y}px`)
    }

    clamp (value, min, max) {
      return Math.max(min, Math.min(max, value))
    }

    destroy () {
      this.destroyed = true

      if (this.rafId) {
        window.cancelAnimationFrame(this.rafId)
        this.rafId = 0
      }

      this.headerEl.removeEventListener('pointermove', this.onPointerMove)
      this.headerEl.removeEventListener('pointerleave', this.onPointerLeave)
      document.removeEventListener('visibilitychange', this.onVisibilityChange)

      if (this.sceneEl && this.sceneEl.parentNode) {
        this.sceneEl.parentNode.removeChild(this.sceneEl)
      }

      this.sceneEl = null
      this.bgLayerEl = null
      this.frontLayerEl = null
      this.vignetteEl = null
      this.spotlightEl = null

      this.headerEl.classList.remove('hero-lite-enabled')
      this.headerEl.style.backgroundImage = this.originalBgImage
    }
  }

  const manager = {
    instance: null,
    hooked: false,
    resizeTimer: 0,

    shouldEnable () {
      const isHome = window.GLOBAL_CONFIG_SITE && window.GLOBAL_CONFIG_SITE.pageType === 'home'
      if (!isHome) return false
      if (PARALLAX_CONFIG.desktopOnly && window.matchMedia('(max-width: 768px)').matches) return false
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
      return true
    },

    init () {
      this.destroy()
      if (!this.shouldEnable()) return

      const headerEl = document.querySelector('#page-header.full_page')
      if (!headerEl) return

      const instance = new HomeHeroMotion(headerEl, PARALLAX_CONFIG)
      const ok = instance.setup()
      if (!ok) {
        instance.destroy()
        return
      }
      this.instance = instance
    },

    destroy () {
      if (!this.instance) return
      this.instance.destroy()
      this.instance = null
    },

    hookLifecycle () {
      if (this.hooked) return
      this.hooked = true

      if (window.btf && typeof window.btf.addGlobalFn === 'function') {
        window.btf.addGlobalFn('pjaxSend', () => this.destroy(), 'hero_lite_destroy')
        window.btf.addGlobalFn('pjaxComplete', () => this.init(), 'hero_lite_init')
      }

      document.addEventListener('pjax:send', () => this.destroy(), { passive: true })
      document.addEventListener('pjax:complete', () => this.init(), { passive: true })

      window.addEventListener('resize', () => {
        window.clearTimeout(this.resizeTimer)
        this.resizeTimer = window.setTimeout(() => this.init(), 120)
      }, { passive: true })
    }
  }

  if (window.__homeHeroParallaxManager && typeof window.__homeHeroParallaxManager.destroy === 'function') {
    window.__homeHeroParallaxManager.destroy()
  }
  window.__homeHeroParallaxManager = manager

  manager.hookLifecycle()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => manager.init(), { once: true })
  } else {
    manager.init()
  }
})()
