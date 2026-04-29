(() => {
  'use strict'

  const THEMES = {
    dark: {
      giant: '180,184,240',
      star: '226,225,142',
      comet: '226,225,224',
      density: 0.06,
      speed: 0.065,
      cometChance: 22,
      alphaBoost: 1.28,
      sizeBoost: 1.08
    },
    light: {
      giant: '48,86,156',
      star: '28,66,128',
      comet: '28,82,154',
      density: 0.05,
      speed: 0.058,
      cometChance: 20,
      alphaBoost: 1.42,
      sizeBoost: 1.18
    }
  }

  class Star {
    constructor(engine) {
      this.engine = engine
      this.reset()
    }

    reset() {
      const { width, height, speed } = this.engine
      this.giant = this.maybe(3)
      this.comet = !this.giant && !this.engine.booting && this.maybe(this.engine.themeConfig.cometChance)
      this.x = this.rand(0, Math.max(10, width - 10))
      this.y = this.rand(0, height)
      this.r = this.rand(1.1, 2.6)
      this.dx = this.rand(speed, 6 * speed) + (this.comet ? speed * this.rand(50, 120) : 0) + 2 * speed
      this.dy = -this.rand(speed, 6 * speed) - (this.comet ? speed * this.rand(50, 120) : 0)
      this.fadingOut = false
      this.fadingIn = true
      this.opacity = 0
      this.opacityThresh = this.comet ? this.rand(0.56, 0.92) : this.rand(0.42, 1)
      this.do = this.rand(0.001, 0.003) + (this.comet ? 0.0014 : 0)
    }

    resetAsComet() {
      this.reset()
      this.giant = false
      this.comet = true
      this.x = this.rand(-80, this.engine.width * 0.45)
      this.y = this.rand(this.engine.height * 0.35, this.engine.height * 0.95)
      this.dx = this.engine.speed * this.rand(95, 150)
      this.dy = -this.engine.speed * this.rand(80, 130)
      this.opacityThresh = this.rand(0.72, 1)
      this.do = this.rand(0.002, 0.0036)
    }

    fadeIn() {
      if (!this.fadingIn) return
      if (this.opacity > this.opacityThresh) this.fadingIn = false
      this.opacity += this.do
    }

    fadeOut() {
      if (!this.fadingOut) return
      if (this.opacity < 0) this.fadingOut = false
      this.opacity -= this.do / 2
      if (this.x > this.engine.width || this.y < 0) {
        this.fadingOut = false
        this.reset()
      }
    }

    move() {
      this.x += this.dx
      this.y += this.dy
      if (this.x > this.engine.width - this.engine.width / 4 || this.y < 0) this.fadingOut = true
      if (!this.fadingOut && (this.x > this.engine.width || this.y < -10)) this.reset()
    }

    draw() {
      const ctx = this.engine.ctx
      const theme = this.engine.themeConfig
      if (!ctx) return
      ctx.beginPath()
      const alpha = Math.min(1, this.opacity * theme.alphaBoost)
      const size = this.r * theme.sizeBoost
      if (this.giant) {
        ctx.fillStyle = `rgba(${theme.giant},${alpha})`
        ctx.arc(this.x, this.y, 2.25 * theme.sizeBoost, 0, 2 * Math.PI, false)
      } else if (this.comet) {
        ctx.fillStyle = `rgba(${theme.comet},${alpha})`
        ctx.arc(this.x, this.y, 1.8 * theme.sizeBoost, 0, 2 * Math.PI, false)
        for (let t = 0; t < 46; t++) {
          const tailOpacity = Math.max(0, alpha - (alpha / 30) * t)
          ctx.fillStyle = `rgba(${theme.comet},${tailOpacity})`
          ctx.fillRect(this.x - (this.dx / 4) * t, this.y - (this.dy / 4) * t - 2, 2.5 * theme.sizeBoost, 2.5 * theme.sizeBoost)
        }
      } else {
        ctx.fillStyle = `rgba(${theme.star},${alpha})`
        ctx.fillRect(this.x, this.y, size, size)
      }
      ctx.closePath()
      ctx.fill()
    }

    maybe(scale) {
      return Math.floor(Math.random() * 1000) + 1 < 10 * scale
    }

    rand(min, max) {
      return Math.random() * (max - min) + min
    }
  }

  class UniverseEngine {
    constructor() {
      this.canvas = null
      this.ctx = null
      this.width = 0
      this.height = 0
      this.speed = 0.05
      this.themeConfig = THEMES.dark
      this.stars = []
      this.rafId = 0
      this.booting = true
      this.frame = 0
      this.boundResize = () => this.resize()
      this.boundAnimate = () => this.animate()
    }

    ensureCanvas() {
      let canvas = document.getElementById('universe')
      if (!canvas) {
        canvas = document.createElement('canvas')
        canvas.id = 'universe'
        canvas.setAttribute('aria-hidden', 'true')
        document.body.appendChild(canvas)
      }
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
    }

    detectTheme() {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      this.themeConfig = THEMES[current]
      this.speed = this.themeConfig.speed
    }

    resize() {
      if (!this.canvas) return
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.canvas.width = this.width
      this.canvas.height = this.height
    }

    seed() {
      const count = Math.max(10, Math.floor(this.width * this.themeConfig.density))
      this.stars = []
      for (let i = 0; i < count; i++) this.stars.push(new Star(this))
    }

    injectComets(count = 3) {
      if (!this.stars.length) return
      for (let i = 0; i < count; i++) {
        const star = this.stars[Math.floor(Math.random() * this.stars.length)]
        if (star) star.resetAsComet()
      }
    }

    drawFrame() {
      if (!this.ctx) return
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.frame += 1
      if (!this.booting && this.frame % 220 === 0) this.injectComets(1)
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i]
        s.move()
        s.fadeIn()
        s.fadeOut()
        s.draw()
      }
    }

    animate() {
      this.detectTheme()
      if (document.visibilityState === 'visible') this.drawFrame()
      this.rafId = window.requestAnimationFrame(this.boundAnimate)
    }

    start() {
      this.ensureCanvas()
      this.detectTheme()
      this.resize()
      this.seed()
      window.addEventListener('resize', this.boundResize, { passive: true })
      this.booting = true
      window.setTimeout(() => {
        this.booting = false
        this.injectComets(window.innerWidth > 768 ? 2 : 1)
      }, 180)
      this.animate()
    }

    stop() {
      if (this.rafId) {
        window.cancelAnimationFrame(this.rafId)
        this.rafId = 0
      }
      window.removeEventListener('resize', this.boundResize)
    }

    destroy() {
      this.stop()
      const canvas = document.getElementById('universe')
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas)
      this.canvas = null
      this.ctx = null
      this.stars = []
    }
  }

  const manager = {
    engine: null,
    init() {
      this.destroy()
      this.engine = new UniverseEngine()
      this.engine.start()
    },
    destroy() {
      if (!this.engine) return
      this.engine.destroy()
      this.engine = null
    }
  }

  if (window.__universeParticlesManager && typeof window.__universeParticlesManager.destroy === 'function') {
    window.__universeParticlesManager.destroy()
  }
  window.__universeParticlesManager = manager

  document.addEventListener('pjax:send', () => manager.destroy(), { passive: true })
  document.addEventListener('pjax:complete', () => manager.init(), { passive: true })

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => manager.init(), { once: true })
  } else {
    manager.init()
  }
})()
