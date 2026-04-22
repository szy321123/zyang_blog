(() => {
  'use strict'

  const NAV_TOOLS_ID = 'nav-action-tools'
  const DESKTOP_QUERY = '(min-width: 769px)'

  const ensureNavToolsContainer = () => {
    const navEl = document.querySelector('#nav')
    if (!navEl) return null

    let toolsEl = navEl.querySelector(`#${NAV_TOOLS_ID}`)
    if (!toolsEl) {
      toolsEl = document.createElement('div')
      toolsEl.id = NAV_TOOLS_ID
      navEl.appendChild(toolsEl)
    }
    return toolsEl
  }

  const getRightsideTarget = () => {
    return document.getElementById('rightside-config-hide') ||
      document.getElementById('rightside-config-show') ||
      document.getElementById('rightside')
  }

  const moveButtonTo = (button, target, inNav) => {
    if (!button || !target) return
    if (button.parentNode !== target) {
      target.appendChild(button)
    }
    button.classList.toggle('nav-tool-btn', inNav)
  }

  const syncDarkmodeIcon = button => {
    if (!button) return
    const iconEl = button.querySelector('i')
    if (!iconEl) return

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    iconEl.className = isDark ? 'fas fa-sun' : 'fas fa-moon'
  }

  const bindTranslate = button => {
    if (!button || button.dataset.navBound === '1') return
    button.dataset.navBound = '1'
    button.type = 'button'
    button.addEventListener('click', () => {
      if (window.translateFn && typeof window.translateFn.translatePage === 'function') {
        window.translateFn.translatePage()
      }
    })
  }

  const bindDarkmode = button => {
    if (!button || button.dataset.navBound === '1') return
    button.dataset.navBound = '1'
    button.type = 'button'
    syncDarkmodeIcon(button)

    button.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light'
      const willChangeMode = currentTheme === 'dark' ? 'light' : 'dark'

      if (window.btf && typeof window.btf.activateDarkMode === 'function' && typeof window.btf.activateLightMode === 'function') {
        if (willChangeMode === 'dark') {
          window.btf.activateDarkMode()
        } else {
          window.btf.activateLightMode()
        }
      } else {
        document.documentElement.setAttribute('data-theme', willChangeMode)
      }

      if (window.btf && window.btf.saveToLocal && typeof window.btf.saveToLocal.set === 'function') {
        window.btf.saveToLocal.set('theme', willChangeMode, 2)
      }

      syncDarkmodeIcon(button)
    })
  }

  const mountNavTools = () => {
    const isDesktop = window.matchMedia(DESKTOP_QUERY).matches
    const toolsEl = isDesktop ? ensureNavToolsContainer() : null
    const rightsideTarget = isDesktop ? null : getRightsideTarget()

    const translateBtn = document.getElementById('translateLink')
    if (translateBtn) {
      bindTranslate(translateBtn)
      moveButtonTo(translateBtn, isDesktop ? toolsEl : rightsideTarget, isDesktop)
    }

    const darkBtn = document.getElementById('darkmode')
    if (darkBtn) {
      bindDarkmode(darkBtn)
      moveButtonTo(darkBtn, isDesktop ? toolsEl : rightsideTarget, isDesktop)
    }
  }

  const init = () => {
    mountNavTools()
    window.setTimeout(mountNavTools, 60)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }

  if (window.btf && typeof window.btf.addGlobalFn === 'function') {
    window.btf.addGlobalFn('pjaxComplete', init, 'nav_tools_init')
  }
  document.addEventListener('pjax:complete', init, { passive: true })
  window.addEventListener('resize', init, { passive: true })
})()
