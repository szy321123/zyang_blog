(() => {
  'use strict'

  const PAGE_PATH = '/downloads/'
  const APP_ID = 'downloads-app'
  const DATA_URL = '/json/downloads.json'

  const state = {
    items: [],
    filtered: []
  }

  function onDownloadsPage() {
    const path = window.location.pathname
    return path === PAGE_PATH || path === '/downloads/index.html'
  }

  function byId(id) {
    return document.getElementById(id)
  }

  function formatTime(iso) {
    if (!iso) return '未知时间'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '未知时间'
    return date.toLocaleString('zh-CN', { hour12: false })
  }

  function escapeHtml(input) {
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function renderShell(meta) {
    const app = byId(APP_ID)
    if (!app) return false

    const sourceUrl = escapeHtml(meta.source || '')
    const totalItems = Number(meta.totalItems || 0)
    const categoryCount = Object.keys(meta.categories || {}).length

    app.classList.remove('dlx-loading', 'dlx-error')
    app.innerHTML = `
      <section class="dlx-wrap">
        <div class="dlx-head">
          <div>
            <h2>自动同步下载中心</h2>
            <p class="dlx-meta">最近同步：${escapeHtml(formatTime(meta.generatedAt))}</p>
          </div>
          <div class="dlx-count" id="dlx-count">0 项</div>
        </div>
        <div class="dlx-summary">
          <article class="dlx-stat">
            <span class="dlx-stat-label">同步源</span>
            <a class="dlx-source-link" href="${sourceUrl || '#'}" target="_blank" rel="noopener">${sourceUrl || '未配置'}</a>
          </article>
          <article class="dlx-stat">
            <span class="dlx-stat-label">文件总数</span>
            <strong class="dlx-stat-value">${totalItems} 项</strong>
          </article>
          <article class="dlx-stat">
            <span class="dlx-stat-label">分类数量</span>
            <strong class="dlx-stat-value">${categoryCount} 类</strong>
          </article>
        </div>
        <div class="dlx-tools">
          <input id="dlx-search" class="dlx-input" type="search" placeholder="搜索软件名/路径...">
          <select id="dlx-category" class="dlx-select">
            <option value="">全部分类</option>
          </select>
          <select id="dlx-platform" class="dlx-select">
            <option value="">全部平台</option>
            <option value="Windows">Windows</option>
            <option value="macOS">macOS</option>
            <option value="Linux">Linux</option>
            <option value="Android">Android</option>
            <option value="iOS">iOS</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div id="dlx-list" class="dlx-grid"></div>
      </section>
    `

    return true
  }

  function fillCategoryOptions(items) {
    const select = byId('dlx-category')
    if (!select) return

    const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-CN'))

    categories.forEach(category => {
      const option = document.createElement('option')
      option.value = category
      option.textContent = category
      select.appendChild(option)
    })
  }

  function updateCount(count) {
    const countEl = byId('dlx-count')
    if (countEl) countEl.textContent = `${count} 项`
  }

  function renderList(items) {
    const list = byId('dlx-list')
    if (!list) return

    if (!items.length) {
      list.innerHTML = '<div class="dlx-empty">没有匹配的数据，试试清空筛选条件。</div>'
      updateCount(0)
      return
    }

    list.innerHTML = items.map(item => {
      const name = escapeHtml(item.name || '未命名文件')
      const sizeText = escapeHtml(item.sizeText || '-')
      const category = escapeHtml(item.category || '未分类')
      const platform = escapeHtml(item.platform || 'Other')
      const path = escapeHtml(item.path || '/')
      const modified = escapeHtml(formatTime(item.modified))
      const downloadUrl = escapeHtml(item.downloadUrl || '#')

      return `
        <article class="dlx-item">
          <h3 class="dlx-name">${name}</h3>
          <div class="dlx-badges">
            <span class="dlx-badge">${category}</span>
            <span class="dlx-badge">${platform}</span>
            <span class="dlx-badge">${sizeText}</span>
            <span class="dlx-badge">${modified}</span>
          </div>
          <div class="dlx-actions">
            <span class="dlx-path" title="${path}">${path}</span>
            <a class="dlx-btn" href="${downloadUrl}" target="_blank" rel="noopener">下载</a>
          </div>
        </article>
      `
    }).join('')

    updateCount(items.length)
  }

  function applyFilter() {
    const search = (byId('dlx-search')?.value || '').trim().toLowerCase()
    const category = byId('dlx-category')?.value || ''
    const platform = byId('dlx-platform')?.value || ''

    state.filtered = state.items.filter(item => {
      const hitSearch = !search || [item.name, item.path, item.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)

      const hitCategory = !category || item.category === category
      const hitPlatform = !platform || item.platform === platform
      return hitSearch && hitCategory && hitPlatform
    })

    renderList(state.filtered)
  }

  function bindFilters() {
    const search = byId('dlx-search')
    const category = byId('dlx-category')
    const platform = byId('dlx-platform')

    if (search) search.addEventListener('input', applyFilter)
    if (category) category.addEventListener('change', applyFilter)
    if (platform) platform.addEventListener('change', applyFilter)
  }

  async function loadData() {
    const response = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`)
    }

    const payload = await response.json()
    if (!payload || !Array.isArray(payload.items)) {
      throw new Error('下载清单格式不正确')
    }

    return payload
  }

  function showError(message) {
    const app = byId(APP_ID)
    if (!app) return

    app.classList.remove('dlx-loading')
    app.classList.add('dlx-error')
    app.textContent = message
  }

  async function init() {
    if (!onDownloadsPage()) return

    const app = byId(APP_ID)
    if (!app) return
    if (app.dataset.ready === '1') return

    try {
      const payload = await loadData()
      const ok = renderShell(payload.meta || {})
      if (!ok) return

      state.items = payload.items.slice()
      fillCategoryOptions(state.items)
      bindFilters()
      applyFilter()

      app.dataset.ready = '1'
    } catch (err) {
      const message = err instanceof Error ? err.message : '下载清单加载失败'
      showError(`下载列表加载失败：${message}`)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }

  if (window.btf && typeof window.btf.addGlobalFn === 'function') {
    window.btf.addGlobalFn('pjaxComplete', () => {
      const app = byId(APP_ID)
      if (app) app.dataset.ready = '0'
      init()
    }, 'downloads_page_init')
  }

  document.addEventListener('pjax:complete', () => {
    const app = byId(APP_ID)
    if (app) app.dataset.ready = '0'
    init()
  }, { passive: true })
})()
