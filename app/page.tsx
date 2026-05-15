import { getPosts, getPostsCount } from '@/lib/db'
import { getAppCloudflareEnv } from '@/lib/cloudflare'
import { type Theme } from '@/lib/appearance'
import type { SiteCategoryLink, SiteNavLink, SiteCategoryLink as RegionLink } from '@/lib/site'
import { getSiteHeaderData, REGION_CATEGORIES } from '@/lib/site'
import { HomeClient } from '@/components/HomeClient'
import { getSiteUrl } from '@/lib/site-config'

const PAGE_SIZE = 25
const BASE_URL = getSiteUrl()

// Cloudflare Workers 缓存策略
export const revalidate = 3600 // 1小时缓存
export const dynamicParams = true

export const metadata = {
  alternates: {
    canonical: BASE_URL,
  },
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; region?: string }>
}) {
  const { page: pageStr, region } = await searchParams
  const currentPage = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  let posts: Awaited<ReturnType<typeof getPosts>> = []
  let totalCount = 0
  let navLinks: SiteNavLink[] = []
  let categories: SiteCategoryLink[] = []
  let regions: { name: string; slug: string; count: number }[] = REGION_CATEGORIES.map(r => ({ name: r.name, slug: r.slug, count: 0 }))
  let defaultTheme: Theme = 'default'

  // 将前端 slug（hk/a-shares/us）映射为数据库 region 值（HK/A-shares/US）
  const regionSlugToDb: Record<string, string> = {
    hk: 'HK',
    'a-shares': 'A-shares',
    us: 'US',
  }
  const dbRegion = region ? regionSlugToDb[region] : undefined

  try {
    const env = await getAppCloudflareEnv()
    if (env?.DB) {
      const headerData = await getSiteHeaderData(env.DB)
      ;[posts, totalCount] = await Promise.all([
        getPosts(env.DB, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE, false, false, false, false, dbRegion),
        getPostsCount(env.DB, false, false, false, false, dbRegion),
      ])
      navLinks = headerData.navLinks
      categories = headerData.categories
      regions = headerData.regions || regions
      defaultTheme = headerData.defaultTheme
    }
  } catch (e) {
    console.error('Homepage: failed to fetch posts', e)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const categorySlugMap: Record<string, string> = Object.fromEntries(
    categories.map((cat) => [cat.name, cat.slug])
  )
  const regionSlugMap: Record<string, string> = Object.fromEntries(
    regions.map((r) => [r.name, r.slug])
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: '乔木博客',
            url: BASE_URL,
            description: '记录思考，分享所学，留住当下。港股、A股、美股公司研究的数字花园，AI驱动的投资分析社区。',
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: '乔木博客',
            url: BASE_URL,
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon-512.png` },
          }),
        }}
      />
      <HomeClient
        initialTheme={defaultTheme}
        posts={posts}
        categories={categories}
        regions={regions}
        navLinks={navLinks}
        currentPage={currentPage}
        totalPages={totalPages}
        categorySlugMap={categorySlugMap}
        regionSlugMap={regionSlugMap}
        selectedRegion={region || undefined}
      />
    </>
  )
}
