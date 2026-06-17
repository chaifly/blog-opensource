const DEV_SITE_URL = 'http://localhost:3000'

function parseSiteUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    try {
      return new URL(`https://${value}`)
    } catch {
      return null
    }
  }
}

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
}

function isPlaceholderHostname(hostname: string): boolean {
  return (
    hostname === 'example.com' ||
    hostname.endsWith('.example.com') ||
    hostname === 'your-domain.com' ||
    hostname.endsWith('.your-domain.com')
  )
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  // 区分 build 阶段和运行时：build 时 NEXT_PHASE=phase-production-build，宽松处理，让 CI 编译能过；
  // 运行时（Cloudflare Workers 接到请求时）再严格校验，配置错了会 5xx 并给出明确报错。
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  const isProdRuntime = process.env.NODE_ENV === 'production' && !isBuild

  if (configured) {
    const parsed = parseSiteUrl(configured)
    if (parsed) {
      const hostname = parsed.hostname.toLowerCase()
      const isInvalidHost = isLocalHostname(hostname) || isPlaceholderHostname(hostname)
      const rejectInRuntime = isProdRuntime && isInvalidHost

      if (!rejectInRuntime) {
        if (isBuild && isInvalidHost) {
          // eslint-disable-next-line no-console
          console.warn(
            `[site-config] Building with placeholder/local NEXT_PUBLIC_SITE_URL="${configured}". ` +
            `Runtime must be set to your real production domain.`,
          )
        }
        return parsed.toString().replace(/\/$/, '')
      }
    }
  }

  // dev / build / 没设 env 变量：退回 localhost，不阻塞构建
  if (!isProdRuntime) {
    return DEV_SITE_URL
  }

  // 生产运行时：未配置或用了占位域名 → 抛错，避免 sitemap / RSS / OG 静默指向错误域名
  const reason = !configured
    ? 'NEXT_PUBLIC_SITE_URL is not set'
    : `NEXT_PUBLIC_SITE_URL is set to a placeholder value: \"${configured}\"`
  throw new Error(
    `${reason}. Set it to your real production domain (e.g., https://blog.example.com) before deploying. See DEPLOY.md for details.`,
  )
}

export interface TwitterConfig {
  /** 纯 handle，不含 @；为空则不渲染 Twitter 卡片 site/creator 字段 */
  handle: string | null
  /** 完整 URL；为空则导航里不显示 Twitter 链接 */
  url: string | null
}

export function getTwitterConfig(): TwitterConfig {
  const rawHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE?.trim() || null
  const handle = rawHandle ? rawHandle.replace(/^@/, '') : null
  const url = process.env.NEXT_PUBLIC_TWITTER_URL?.trim() || null
  return { handle, url }
}

export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl())
}

export function getSiteDisplayUrl(): string {
  return getSiteUrl().replace(/^https?:\/\//, '')
}
