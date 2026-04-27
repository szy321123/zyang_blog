(() => {
  'use strict'

  const CARD_ID = 'welcome-info'
  const CACHE_KEY = 'zy_aside_ip_info_cache'
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000

  const withTimeout = (promise, timeoutMs = 4500) => {
    let timer = 0
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error('timeout')), timeoutMs)
    })
    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer))
  }

  const escapeHtml = text => {
    return String(text || '').replace(/[&<>"']/g, s => (
      s === '&' ? '&amp;' :
      s === '<' ? '&lt;' :
      s === '>' ? '&gt;' :
      s === '"' ? '&quot;' : '&#39;'
    ))
  }

  const maskIp = ip => {
    if (!ip || typeof ip !== 'string') return ''
    if (ip.includes(':')) {
      const parts = ip.split(':').filter(Boolean)
      if (parts.length <= 2) return ip
      return `${parts[0]}:${parts[1]}:*:*`
    }
    const parts = ip.split('.')
    if (parts.length !== 4) return ip
    return `${parts[0]}.${parts[1]}.${parts[2]}.*`
  }

  const fetchQifu = async () => {
    const response = await withTimeout(
      fetch('https://qifu-api.baidubce.com/ip/local/geo/v1/district', { credentials: 'omit' })
    )
    if (!response.ok) throw new Error(`qifu_http_${response.status}`)
    const result = await response.json()
    const data = result && result.data ? result.data : null
    if (!data) throw new Error('qifu_empty')

    return {
      ip: data.ip || '',
      country: data.country || '中国',
      prov: data.prov || '',
      city: data.city || '',
      district: data.district || '',
      isp: data.isp || '',
      lng: Number(data.lng || data.long || data.longitude || 0),
      lat: Number(data.lat || data.latitude || 0)
    }
  }

  const fetchNsuuuIpip = async apiKey => {
    const key = (apiKey || '').trim()
    if (!key) throw new Error('nsuuu_key_missing')
    const response = await withTimeout(
      fetch(`https://v1.nsuuu.com/api/ipip?key=${encodeURIComponent(key)}`, { credentials: 'omit' })
    )
    if (!response.ok) throw new Error(`nsuuu_http_${response.status}`)
    const result = await response.json()
    const data = result && result.data ? result.data : null
    if (!data) throw new Error('nsuuu_empty')

    return {
      ip: data.ip || '',
      country: data.country || '中国',
      prov: data.province || '',
      city: data.city || '',
      district: '',
      isp: data.isp || data.operator || '',
      lng: Number(data.longitude || 0),
      lat: Number(data.latitude || 0)
    }
  }

  const fetchIpwho = async () => {
    const response = await withTimeout(
      fetch('https://ipwho.is/?lang=zh', { credentials: 'omit' })
    )
    if (!response.ok) throw new Error(`ipwho_http_${response.status}`)
    const result = await response.json()
    if (!result || result.success === false) throw new Error('ipwho_empty')

    return {
      ip: result.ip || '',
      country: result.country || '',
      prov: result.region || '',
      city: result.city || '',
      district: '',
      isp: result.connection && result.connection.isp ? result.connection.isp : '',
      lng: Number(result.longitude || 0),
      lat: Number(result.latitude || 0)
    }
  }

  const getDistanceKm = (lng1, lat1, lng2, lat2) => {
    if (![lng1, lat1, lng2, lat2].every(Number.isFinite)) return null
    const toRad = deg => deg * Math.PI / 180
    const phi1 = toRad(lat1)
    const phi2 = toRad(lat2)
    const dPhi = toRad(lat2 - lat1)
    const dLambda = toRad(lng2 - lng1)
    const a = Math.sin(dPhi / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(6371 * c)
  }

  const getCountryMessage = country => {
    const map = {
      '日本': 'よろしく，一起去看樱花吗',
      '美国': 'Let us live in peace!',
      '英国': '想同你一起夜乘伦敦眼',
      '俄罗斯': '干了这瓶伏特加！',
      '法国': "C'est La Vie",
      '德国': 'Die Zeit verging im Fluge.',
      '澳大利亚': '一起去大堡礁吧！',
      '加拿大': '拾起一片枫叶赠予你'
    }
    return map[country] || '带我去你的国家逛逛吧'
  }

  const getProvinceMessage = (prov, city) => {
    if (prov === '北京') return '北——京——欢迎你~~~'
    if (prov === '天津') return '讲段相声吧'
    if (prov === '上海') return '众所周知，中国只有两个城市'
    if (prov === '广东') {
      if (city === '广州') return '看小蛮腰，喝早茶了嘛~'
      if (city === '深圳') return '今天你逛商场了嘛~'
      return '欢迎来到岭南，来杯靓茶先~'
    }
    if (prov === '浙江') return city === '杭州' ? '东风渐绿西湖柳，雁已还人未南归' : '上有天堂，下有苏杭'
    if (prov === '江苏') return city === '南京' ? '这是我挺想去的城市啦' : '散装是必须要散装的'
    if (prov === '四川') return '康康川妹子'
    if (prov === '重庆') return '勒是雾都，火锅安排起~'
    if (prov === '湖北') return city === '武汉' ? '你想去长江游泳嘛？' : '来碗热干面~'
    if (prov === '陕西') return '来份臊子面加馍'
    if (prov === '河南') return '可否带我品尝河南烩面啦？'
    if (prov === '湖南') return '长沙斯塔克，热辣滚烫'
    if (prov === '福建') return '井邑白云间，岩城远带山'
    if (prov === '山东') return '遥望齐州九点烟，一泓海水杯中泻'
    if (prov === '广西') return '桂林山水甲天下'
    if (prov === '云南') return '彩云之南，风也温柔'
    if (prov === '新疆') return '驼铃古道丝绸路，胡马犹闻唐汉风'
    if (prov === '西藏') return '躺在茫茫草原上，仰望蓝天'
    return '带我去你的城市逛逛吧！'
  }

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) return '🌤️ 早上好，今天也要元气满满！'
    if (hour >= 11 && hour < 13) return '☀️ 中午好，记得按时吃饭喔~'
    if (hour >= 13 && hour < 17) return '🕞 下午好，来杯茶继续冲刺！'
    if (hour >= 17 && hour < 19) return '🚶‍♂️ 傍晚好，放松一下吧~'
    if (hour >= 19 && hour < 24) return '🌙 晚上好，欢迎来逛博客！'
    return '🌌 夜深了，注意休息呀。'
  }

  const getGeoInfo = async apiKey => {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved && saved.time && Date.now() - saved.time < CACHE_TTL_MS && saved.data) {
          return saved.data
        }
      }
    } catch (_) {}

    let info = null
    try {
      info = await fetchNsuuuIpip(apiKey)
    } catch (_) {
      try {
        info = await fetchQifu()
      } catch (_) {
        info = await fetchIpwho()
      }
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: info }))
    } catch (_) {}
    return info
  }

  const renderHtml = (data, owner) => {
    const country = data.country || '未知国家'
    const prov = data.prov || ''
    const city = data.city || ''

    const areaText = country === '中国'
      ? (prov === city || !city ? `中国 ${prov || '未知地区'}` : `中国 ${prov}${city}`)
      : country

    const customLine = country === '中国'
      ? getProvinceMessage(prov, city)
      : getCountryMessage(country)

    const ipMasked = escapeHtml(maskIp(data.ip) || '未知')
    const isp = escapeHtml(data.isp || '未知网络')
    const ownerName = escapeHtml(owner.name || '博主')
    const areaHtml = escapeHtml(areaText)

    let distanceHtml = ''
    const d = getDistanceKm(owner.lng, owner.lat, Number(data.lng), Number(data.lat))
    if (Number.isFinite(d)) {
      distanceHtml = `你目前距${ownerName}约 <b><span style="color: var(--default-bg-color)">${d}</span></b> 公里！<br>`
    }

    return `嗷嗷！热烈欢迎🤪！来自<br><b><span style="color: var(--default-bg-color)">${areaHtml}</span></b><br> 的朋友，你好呀！😝<br>${escapeHtml(customLine)}🍂<br>${distanceHtml}你的网络IP为：<b><span class="ip-address" style="font-size: 15px;">${ipMasked}</span></b><br>网络运营商：<b>${isp}</b><br>${escapeHtml(getTimeGreeting())}`
  }

  const renderWelcome = async () => {
    const el = document.getElementById(CARD_ID)
    if (!el) return
    if (el.dataset.loaded === '1') return
    el.dataset.loaded = '1'

    const loadingText = el.dataset.loading || '正在获取你的访问信息...'
    const fallbackText = el.dataset.fallback || '欢迎光临，很高兴你来到这里。'
    const errorText = el.dataset.error || fallbackText
    const owner = {
      name: el.dataset.ownerName || '博主',
      lng: Number(el.dataset.ownerLng || 121.476),
      lat: Number(el.dataset.ownerLat || 31.224)
    }
    const apiKey = el.dataset.apiKey || ''

    el.innerHTML = escapeHtml(loadingText)

    try {
      const info = await getGeoInfo(apiKey)
      el.innerHTML = renderHtml(info, owner)
    } catch (_) {
      el.innerHTML = escapeHtml(errorText)
    }
  }

  const init = () => {
    const el = document.getElementById(CARD_ID)
    if (el) el.dataset.loaded = '0'
    renderWelcome()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }

  if (window.btf && typeof window.btf.addGlobalFn === 'function') {
    window.btf.addGlobalFn('pjaxComplete', init, 'aside_ip_welcome_init')
  }
  document.addEventListener('pjax:complete', init, { passive: true })
})()
