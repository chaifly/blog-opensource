import { normalizeTheme, type Theme } from '@/lib/appearance'
import { getPublicCategories, getSetting, getPosts } from '@/lib/db'

export interface SiteNavLink {
  label: string
  url: string
  openInNewTab: boolean
}

export interface SiteCategoryLink {
  name: string
  slug: string
}

// 区域分类定义（港股、A股、美股）
export const REGION_CATEGORIES = [
  { name: '港股', slug: 'hk', region: 'HK' },
  { name: 'A股', slug: 'a-shares', region: 'A-shares' },
  { name: '美股', slug: 'us', region: 'US' },
]

export async function getSiteHeaderData(db: D1Database): Promise<{
  navLinks: SiteNavLink[]
  categories: SiteCategoryLink[]
  defaultTheme: Theme
  regions: { name: string; slug: string; count: number }[]
}> {
  let navLinks: SiteNavLink[] = []
  let categories: SiteCategoryLink[] = []
  let defaultTheme: Theme = 'default'
  let regions: { name: string; slug: string; count: number }[] = []

  try {
    const [navJson, categoryRows, themeValue] = await Promise.all([
      getSetting(db, 'nav_links'),
      getPublicCategories(db),
      getSetting(db, 'default_theme'),
    ])

    if (navJson) {
      try {
        const parsed = JSON.parse(navJson)
        if (Array.isArray(parsed)) {
          navLinks = parsed
        }
      } catch {}
    }

    categories = categoryRows
      .filter((category) => category.slug && category.name && category.name !== '未分类')
      .map((category) => ({
        name: category.name,
        slug: category.slug,
      }))

    // 获取各区域的文章数
    const allPosts = await getPosts(db, 99999, 0, false, true, true, true)
    const regionCounts: Record<string, number> = { HK: 0, 'A-shares': 0, US: 0 }
    allPosts.forEach((post) => {
      if (post.region && regionCounts[post.region] !== undefined) {
        regionCounts[post.region]++
      }
    })

    regions = REGION_CATEGORIES.map((r) => ({
      name: r.name,
      slug: r.slug,
      count: regionCounts[r.region] || 0,
    }))

    defaultTheme = normalizeTheme(themeValue)
  } catch {
    // Keep graceful fallback behavior for public pages
  }

  return { navLinks, categories, defaultTheme, regions }
}
