'use strict'

const fs = require('fs/promises')
const path = require('path')
const https = require('https')

const DEFAULTS = {
  baseUrl: 'https://zyang.app',
  rootPath: '/',
  password: '',
  perPage: 200,
  requestTimeoutMs: 15000,
  outputRelPath: path.join('source', 'json', 'downloads.json')
}

function cleanBaseUrl(url) {
  return String(url || DEFAULTS.baseUrl).replace(/\/+$/, '')
}

function normalizePath(inputPath) {
  const raw = String(inputPath || '/').trim()
  if (!raw || raw === '/') return '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}

function joinPath(parentPath, name) {
  const safeName = String(name || '').replace(/^\/+/, '')
  if (parentPath === '/') return `/${safeName}`
  return `${parentPath.replace(/\/+$/, '')}/${safeName}`
}

function encodeOpenListPath(filePath) {
  const normalized = normalizePath(filePath)
  return normalized
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')
}

function formatBytes(bytes) {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value < 0) return '-'
  if (value === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const idx = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const size = value / (1024 ** idx)
  return `${size.toFixed(size >= 10 || idx === 0 ? 0 : 2)} ${units[idx]}`
}

function inferPlatform(fileName) {
  const lower = String(fileName || '').toLowerCase()
  if (/\.(exe|msi|bat|ps1)$/.test(lower)) return 'Windows'
  if (/\.(dmg|pkg)$/.test(lower)) return 'macOS'
  if (/\.(deb|rpm|appimage|run)$/.test(lower)) return 'Linux'
  if (/\.(apk|xapk)$/.test(lower)) return 'Android'
  if (/\.(ipa)$/.test(lower)) return 'iOS'
  return 'Other'
}

function toCategory(filePath) {
  const parts = normalizePath(filePath).split('/').filter(Boolean)
  return parts.length > 1 ? parts[0] : 'root'
}

function postJson(url, payload, timeoutMs) {
  return new Promise((resolve, reject) => {
    const target = new URL(url)
    const data = JSON.stringify(payload)

    const req = https.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || undefined,
      path: `${target.pathname}${target.search}`,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      },
      timeout: timeoutMs
    }, res => {
      let body = ''
      res.setEncoding('utf8')
      res.on('data', chunk => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          resolve({ statusCode: res.statusCode || 0, body: parsed })
        } catch (err) {
          reject(new Error(`OpenList 返回了非 JSON 数据: ${err.message}`))
        }
      })
    })

    req.on('timeout', () => {
      req.destroy(new Error(`OpenList 请求超时 (${timeoutMs} ms)`))
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function listDirectory(config, dirPath, page) {
  const endpoint = `${config.baseUrl}/api/fs/list`
  const payload = {
    path: dirPath,
    password: config.password,
    page,
    per_page: config.perPage,
    refresh: false
  }

  const response = await postJson(endpoint, payload, config.requestTimeoutMs)
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`OpenList API HTTP ${response.statusCode}`)
  }

  if (!response.body || response.body.code !== 200 || !response.body.data) {
    const msg = response.body && response.body.message ? response.body.message : 'unknown'
    throw new Error(`OpenList API 异常: ${msg}`)
  }

  return response.body.data.content || []
}

async function collectFiles(config) {
  const queue = [config.rootPath]
  const files = []

  while (queue.length > 0) {
    const currentDir = queue.shift()
    let page = 1

    while (true) {
      const content = await listDirectory(config, currentDir, page)

      content.forEach(item => {
        const itemPath = joinPath(currentDir, item.name)
        if (item.is_dir) {
          queue.push(itemPath)
          return
        }

        files.push({
          name: item.name,
          size: Number(item.size || 0),
          modified: item.modified || '',
          path: itemPath
        })
      })

      if (content.length < config.perPage) break
      page += 1
    }
  }

  return files
}

function buildOutput(config, files) {
  const items = files
    .map(file => {
      const normalizedPath = normalizePath(file.path)
      return {
        name: file.name,
        path: normalizedPath,
        size: file.size,
        sizeText: formatBytes(file.size),
        modified: file.modified,
        category: toCategory(normalizedPath),
        platform: inferPlatform(file.name),
        downloadUrl: `${config.baseUrl}/p${encodeOpenListPath(normalizedPath)}`
      }
    })
    .sort((a, b) => {
      const t1 = new Date(a.modified).getTime() || 0
      const t2 = new Date(b.modified).getTime() || 0
      return t2 - t1
    })

  const categories = {}
  items.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1
  })

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      source: config.baseUrl,
      rootPath: config.rootPath,
      totalItems: items.length,
      categories
    },
    items
  }
}

async function writeOutput(hexo, payload, outputRelPath) {
  const outputPath = path.join(hexo.base_dir, outputRelPath)
  const nextText = `${JSON.stringify(payload, null, 2)}\n`
  const normalizeForCompare = data => {
    if (!data || typeof data !== 'object') return data
    const cloned = JSON.parse(JSON.stringify(data))
    if (cloned.meta && typeof cloned.meta === 'object') delete cloned.meta.generatedAt
    return cloned
  }

  try {
    const prevText = await fs.readFile(outputPath, 'utf8')
    const prevObj = JSON.parse(prevText)
    const sameContent = JSON.stringify(normalizeForCompare(prevObj)) === JSON.stringify(normalizeForCompare(payload))
    if (sameContent) {
      return { outputPath, changed: false }
    }
  } catch (err) {
    // 文件不存在或旧文件 JSON 异常时，继续执行写入覆盖
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, nextText, 'utf8')
  return { outputPath, changed: true }
}

async function syncOpenList(hexo) {
  const config = {
    baseUrl: cleanBaseUrl(process.env.OPENLIST_BASE_URL || DEFAULTS.baseUrl),
    rootPath: normalizePath(process.env.OPENLIST_ROOT_PATH || DEFAULTS.rootPath),
    password: process.env.OPENLIST_PASSWORD || DEFAULTS.password,
    perPage: Number(process.env.OPENLIST_PER_PAGE || DEFAULTS.perPage),
    requestTimeoutMs: Number(process.env.OPENLIST_TIMEOUT_MS || DEFAULTS.requestTimeoutMs)
  }

  const startedAt = Date.now()
  const files = await collectFiles(config)
  const output = buildOutput(config, files)
  const { outputPath, changed } = await writeOutput(hexo, output, DEFAULTS.outputRelPath)
  const elapsed = Date.now() - startedAt

  if (changed) {
    hexo.log.info(`[sync-openlist] 已同步 ${output.meta.totalItems} 个文件 (${elapsed} ms) -> ${outputPath}`)
  } else {
    hexo.log.info(`[sync-openlist] 内容无变化，已跳过写入 (${elapsed} ms)`)
  }
}

hexo.extend.filter.register('before_generate', async () => {
  try {
    await syncOpenList(hexo)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    hexo.log.warn(`[sync-openlist] 同步失败，保留旧数据: ${message}`)
  }
})
