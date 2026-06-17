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
  // build 时 NEXT_PHASE=phase-production-build 宽松处理（让 CI 编译过）；
  // 运行时如果还是占位/未配置，不再抛 5xx，而是打 console.error 让用户从日志里看到，
  // 同时返回一个能用但可能不正确的 URL，避免整个站点崩溃。
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  const isProdRuntime = process.env.NODE_ENV === 'production' && !isBuild

  if (configured) {
    const parsed = parseSiteUrl(configured)
    if (parsed) {
      const hostname = parsed.hostname.toLowerCase()
      const isInvalidHost = isLocalHostname(hostname) || isPlaceholderHostname(hostname)
      const shouldWarn = isInvalidHost && (isBuild || isProdRuntime)

      if (shouldWarn) {
        // eslint-disable-next-line no-console
        console[isBuild ? 'warn' : 'error'](
          `[site-config] NEXT_PUBLIC_SITE_URL="${configured}" is a placeholder/local value. ` +
          `Set the real production domain in Cloudflare Workers → Settings → Variables (or wrangler.toml [vars]). ` +
          `Sitemap / RSS / OG tags will reference this value until then.`,
        )
      }
      return parsed.toString().replace(/\/$/, '')
    }

    // 配置了但 parse 失败（不是合法 URL）：退回 localhost 并打日志
    // eslint-disable-next-line no-console
    if (isProdRuntime) {
      console.error(
        `[site-config] NEXT_PUBLIC_SITE_URL="${configured}" is not a valid URL. Falling back to ${DEV_SITE_URL}.`,
      )
    }
    return DEV_SITE_URL
  }

  // 未配置：退回 localhost
  if (isProdRuntime) {
    // eslint-disable-next-line no-console
    console.error(
      `[site-config] NEXT_PUBLIC_SITE_URL is not set. Falling back to ${DEV_SITE_URL}. ` +
      `Set the real production domain in Cloudflare Workers → Settings → Variables.`,
    )
  }
  return DEV_SITE_URL
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
