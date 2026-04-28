(() => {
  'use strict'

  const QRCODE_LIB_URL = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js'
  const DEFAULT_PREVIEW_PAYLOAD = '/tools/'

  const state = {
    scriptPromise: null,
    hooked: false,
    debounceTimer: null
  }

  const modeGroups = ['wifi', 'email', 'phone', 'sms']

  function byId (id) {
    return document.getElementById(id)
  }

  function isToolsPage () {
    const path = window.location.pathname.replace(/\/+$/, '')
    return path === '/tools' || path.endsWith('/tools')
  }

  function ensureLib () {
    if (window.qrcode && typeof window.qrcode === 'function') return Promise.resolve(window.qrcode)
    if (state.scriptPromise) return state.scriptPromise

    state.scriptPromise = new Promise((resolve, reject) => {
      const existed = document.querySelector('script[data-qr-lib="true"], script[src*="qrcode.min.js"]')
      if (existed) {
        existed.addEventListener('load', () => resolve(window.qrcode), { once: true })
        existed.addEventListener('error', reject, { once: true })
        return
      }
      const script = document.createElement('script')
      script.src = QRCODE_LIB_URL
      script.async = true
      script.defer = true
      script.dataset.qrLib = 'true'
      script.addEventListener('load', () => resolve(window.qrcode), { once: true })
      script.addEventListener('error', reject, { once: true })
      document.head.appendChild(script)
    })

    return state.scriptPromise
  }

  function safeValue (id) {
    const el = byId(id)
    return el ? String(el.value || '') : ''
  }

  function setMessage (text, type = 'normal') {
    const el = byId('qr-message')
    if (!el) return
    el.textContent = text
    el.dataset.type = type
  }

  function setCharCount (text) {
    const el = byId('qr-char-count')
    if (!el) return
    el.textContent = `${text.length} 字符`
  }

  function setRangesText () {
    const size = byId('qr-size')
    const margin = byId('qr-margin')
    const sizeValue = byId('qr-size-value')
    const marginValue = byId('qr-margin-value')
    if (size && sizeValue) sizeValue.textContent = `${size.value}px`
    if (margin && marginValue) marginValue.textContent = margin.value
  }

  function setModeLabel () {
    const mode = byId('qr-mode')
    const label = byId('qr-mode-label')
    if (!mode || !label) return
    const text = mode.options[mode.selectedIndex] ? mode.options[mode.selectedIndex].text : '文本 / 链接'
    label.textContent = `模式：${text}`
  }

  function setLastUpdate () {
    const el = byId('qr-last-update')
    if (!el) return
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    el.textContent = `更新时间：${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  }

  function setPayloadPreview (text) {
    const el = byId('qr-payload-preview')
    if (!el) return
    if (!text) {
      el.textContent = '尚未输入内容'
      return
    }
    el.textContent = text.length > 180 ? `${text.slice(0, 180)}...` : text
  }

  function toggleModeGroups (mode) {
    const basicGroup = byId('qr-basic-group')
    if (basicGroup) basicGroup.hidden = mode !== 'text'
    modeGroups.forEach(name => {
      const group = byId(`qr-${name}-group`)
      if (group) group.hidden = mode !== name
    })
  }

  function clearCanvas () {
    const canvas = byId('qr-canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = parseInt(safeValue('qr-size') || '320', 10)
    const bg = safeValue('qr-bg') || '#ffffff'
    canvas.width = size
    canvas.height = size
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, size, size)
  }

  function drawDefaultPreview () {
    const origin = window.location.origin || ''
    const fallback = `${origin}${DEFAULT_PREVIEW_PAYLOAD}`
    drawQrCanvas(fallback)
    setCharCount('')
    setPayloadPreview(`示例预览：${fallback}`)
    setLastUpdate()
    setMessage('输入内容后会实时替换此二维码。', 'normal')
  }

  function buildPayload () {
    const mode = safeValue('qr-mode') || 'text'
    if (mode === 'wifi') {
      const ssid = safeValue('qr-wifi-ssid').trim()
      const password = safeValue('qr-wifi-password')
      const auth = safeValue('qr-wifi-auth') || 'WPA'
      const hidden = byId('qr-wifi-hidden') && byId('qr-wifi-hidden').checked ? 'true' : 'false'
      if (!ssid) throw new Error('请输入 WiFi 名称 (SSID) 以实时预览')
      const authValue = auth === 'nopass' ? '' : auth
      const payload = `WIFI:T:${authValue};S:${ssid.replace(/([;,:\\])/g, '\\$1')};P:${password.replace(/([;,:\\])/g, '\\$1')};H:${hidden};;`
      return { payload, display: payload }
    }

    if (mode === 'email') {
      const to = safeValue('qr-email-to').trim()
      const subject = encodeURIComponent(safeValue('qr-email-subject'))
      const body = encodeURIComponent(safeValue('qr-email-body'))
      if (!to) throw new Error('请输入收件邮箱以实时预览')
      const payload = `mailto:${to}?subject=${subject}&body=${body}`
      return { payload, display: payload }
    }

    if (mode === 'phone') {
      const phone = safeValue('qr-phone-number').trim()
      if (!phone) throw new Error('请输入电话号码以实时预览')
      const payload = `tel:${phone}`
      return { payload, display: payload }
    }

    if (mode === 'sms') {
      const phone = safeValue('qr-sms-number').trim()
      const body = safeValue('qr-sms-body')
      if (!phone) throw new Error('请输入短信号码以实时预览')
      const payload = `SMSTO:${phone}:${body}`
      return { payload, display: payload }
    }

    const text = safeValue('qr-text').trim()
    if (!text) throw new Error('请输入内容以实时预览')
    return { payload: text, display: text }
  }

  function drawQrCanvas (payload) {
    const canvas = byId('qr-canvas')
    if (!canvas) throw new Error('二维码画布未找到')

    const size = parseInt(safeValue('qr-size') || '320', 10)
    const margin = parseInt(safeValue('qr-margin') || '2', 10)
    const ecc = safeValue('qr-ecc') || 'M'
    const fg = safeValue('qr-fg') || '#111827'
    const bg = safeValue('qr-bg') || '#ffffff'

    const qr = window.qrcode(0, ecc)
    qr.addData(payload)
    qr.make()

    const moduleCount = qr.getModuleCount()
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法初始化绘图上下文')

    canvas.width = size
    canvas.height = size
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, size, size)

    const cellSize = size / (moduleCount + margin * 2)
    const offset = margin * cellSize
    ctx.fillStyle = fg

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (!qr.isDark(row, col)) continue
        const x = Math.round(offset + col * cellSize)
        const y = Math.round(offset + row * cellSize)
        const w = Math.ceil(cellSize)
        const h = Math.ceil(cellSize)
        ctx.fillRect(x, y, w, h)
      }
    }
  }

  function generate (opts = {}) {
    const { silent = false } = opts
    try {
      const { payload, display } = buildPayload()
      setCharCount(payload)
      setPayloadPreview(display)
      drawQrCanvas(payload)
      setLastUpdate()
      setMessage('实时预览中，可直接下载 PNG。', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成失败，请检查输入内容。'
      if (msg.includes('请输入')) {
        drawDefaultPreview()
        return
      }
      setCharCount('')
      setPayloadPreview('')
      clearCanvas()
      setMessage(silent ? '等待输入中...' : msg, silent ? 'normal' : 'error')
    }
  }

  function scheduleGenerate (delay = 120, silent = true) {
    if (state.debounceTimer) window.clearTimeout(state.debounceTimer)
    state.debounceTimer = window.setTimeout(() => generate({ silent }), delay)
  }

  function downloadPng () {
    const canvas = byId('qr-canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qrcode-${Date.now()}.png`
    a.click()
  }

  function clearInputsByMode () {
    const mode = safeValue('qr-mode') || 'text'
    const clearIds = {
      text: ['qr-text'],
      wifi: ['qr-wifi-ssid', 'qr-wifi-password'],
      email: ['qr-email-to', 'qr-email-subject', 'qr-email-body'],
      phone: ['qr-phone-number'],
      sms: ['qr-sms-number', 'qr-sms-body']
    }
    ;(clearIds[mode] || []).forEach(id => {
      const el = byId(id)
      if (el) el.value = ''
    })
    const wifiHidden = byId('qr-wifi-hidden')
    if (mode === 'wifi' && wifiHidden) wifiHidden.checked = false
  }

  function bindEvents () {
    const mode = byId('qr-mode')
    const generateBtn = byId('qr-generate')
    const downloadBtn = byId('qr-download')
    const clearBtn = byId('qr-clear')
    if (!mode || !generateBtn || !downloadBtn) return
    if (mode.dataset.bound === 'true') return
    mode.dataset.bound = 'true'

    mode.addEventListener('change', () => {
      toggleModeGroups(mode.value)
      setModeLabel()
      scheduleGenerate(60, true)
    })

    generateBtn.addEventListener('click', () => generate({ silent: false }))
    downloadBtn.addEventListener('click', downloadPng)
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearInputsByMode()
        scheduleGenerate(10, true)
      })
    }

    const liveInputs = [
      'qr-size', 'qr-margin', 'qr-ecc', 'qr-fg', 'qr-bg', 'qr-text',
      'qr-wifi-ssid', 'qr-wifi-password', 'qr-wifi-auth', 'qr-wifi-hidden',
      'qr-email-to', 'qr-email-subject', 'qr-email-body',
      'qr-phone-number', 'qr-sms-number', 'qr-sms-body'
    ]

    liveInputs.forEach(id => {
      const el = byId(id)
      if (!el) return
      const handler = () => {
        setRangesText()
        scheduleGenerate(110, true)
      }
      el.addEventListener('input', handler)
      el.addEventListener('change', handler)
    })
  }

  function init () {
    if (!isToolsPage()) return
    const root = byId('qr-tool-page')
    if (!root) return

    ensureLib()
      .then(() => {
        toggleModeGroups(safeValue('qr-mode') || 'text')
        setModeLabel()
        setRangesText()
        bindEvents()
        generate({ silent: true })
      })
      .catch(() => {
        setMessage('二维码引擎加载失败，请稍后刷新重试。', 'error')
      })
  }

  if (!state.hooked) {
    state.hooked = true
    document.addEventListener('pjax:complete', init, { passive: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()
