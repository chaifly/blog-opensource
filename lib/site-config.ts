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

  if (configured) {
    const parsed = parseSiteUrl(configured)
    if (parsed) {
      const hostname = parsed.hostname.toLowerCase()
      const isInvalidProductionHost =
        process.env.NODE_ENV === 'production' &&
        (isLocalHostname(hostname) || isPlaceholderHostname(hostname))

      if (!isInvalidProductionHost) {
        return parsed.toString().replace(/\/$/, '')
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEV_SITE_URL
  }

  // 生产环境必须显式设置站点 URL；未设置或用了占位域名都抛错，
  // 避免 sitemap / RSS / OG 静默指向错误域名。
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
