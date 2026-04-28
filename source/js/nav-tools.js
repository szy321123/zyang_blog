(() => {
  'use strict'

  const NAV_TOOLS_ID = 'nav-action-tools'
  const NAV_MENU_ROOT_SELECTOR = '#nav #menus'
  const NAV_MENU_ITEMS_SELECTOR = '#nav #menus .menus_items .menus_item'
  const NAV_GROUP_TRIGGER_SELECTOR = '#nav #menus .menus_items .menus_item > .site-page.group'
  const NAV_OPEN_CLASS = 'zy-open'
  const DESKTOP_QUERY = '(min-width: 769px)'
  const RESIZE_DEBOUNCE_MS = 150

  let resizeTimer = 0
  let dropdownEventsBound = false

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

  const closeAllDesktopDropdowns = (exceptItem = null) => {
    document.querySelectorAll(`${NAV_MENU_ITEMS_SELECTOR}.${NAV_OPEN_CLASS}`).forEach(item => {
      if (item !== exceptItem) item.classList.remove(NAV_OPEN_CLASS)
    })
  }

  const bindDesktopDropdownLock = () => {
    if (dropdownEventsBound) return
    dropdownEventsBound = true

    document.addEventListener('click', e => {
      if (!window.matchMedia(DESKTOP_QUERY).matches) return

      const trigger = e.target.closest(NAV_GROUP_TRIGGER_SELECTOR)
      if (trigger) {
        const menuItem = trigger.closest('.menus_item')
        if (!menuItem) return
        const willOpen = !menuItem.classList.contains(NAV_OPEN_CLASS)
        closeAllDesktopDropdowns(menuItem)
        menuItem.classList.toggle(NAV_OPEN_CLASS, willOpen)
        e.preventDefault()
        return
      }

      if (!e.target.closest(NAV_MENU_ROOT_SELECTOR)) {
        closeAllDesktopDropdowns()
      }
    })

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAllDesktopDropdowns()
    })
  }

  const init = () => {
    mountNavTools()
    bindDesktopDropdownLock()

    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      closeAllDesktopDropdowns()
    }
  }

  const onResize = () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => init(), RESIZE_DEBOUNCE_MS)
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
  window.addEventListener('resize', onResize, { passive: true })
})()
