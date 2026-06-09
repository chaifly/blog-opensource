import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getSiteHeaderData } from '@/lib/site'
import { getAppCloudflareEnv } from '@/lib/cloudflare'
import type { Theme } from '@/lib/appearance'

export const metadata = {
  title: '隐私政策',
  description: '本站隐私政策和数据保护说明',
}

export default async function PrivacyPage() {
  let navLinks = [{ label: '首页', url: '/', openInNewTab: false }]
  let categories: { name: string; slug: string }[] = []
  let defaultTheme: Theme = 'default'

  try {
    const env = await getAppCloudflareEnv()
    if (env?.DB) {
      const headerData = await getSiteHeaderData(env.DB)
      navLinks = headerData.navLinks
      categories = headerData.categories
      defaultTheme = headerData.defaultTheme
    }
  } catch {}

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <SiteHeader
        initialTheme={defaultTheme}
        navLinks={navLinks}
        categories={categories}
        activeCategorySlug={null}
        stickyOnMobile={false}
      />

      <main className="page-main mx-auto w-full max-w-3xl px-4 sm:px-6 flex-1 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--editor-ink)] mb-8">隐私政策 / Privacy Policy</h1>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">信息收集 / Information Collection</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>本站仅收集您主动提交的信息，如评论内容、联系方式等。我们不会收集您的个人敏感信息。</p>
              <p>We only collect information that you voluntarily submit, such as comment content and contact information. We do not collect your personal sensitive information.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">Cookies 使用 / Cookie Usage</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>本站使用 cookies 来改善用户体验，记住您的偏好设置，以及分析网站流量。您可以选择禁用 cookies，但这可能影响部分功能。</p>
              <p>This site uses cookies to improve user experience, remember your preferences, and analyze site traffic. You can choose to disable cookies, but this may affect some functionality.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">第三方服务 / Third-Party Services</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>本站可能使用第三方服务（如分析工具、评论系统等），这些服务可能有自己的隐私政策。我们建议您了解这些服务的隐私条款。</p>
              <p>This site may use third-party services (such as analytics tools, comment systems, etc.). These services may have their own privacy policies. We recommend that you review the privacy terms of these services.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">数据安全 / Data Security</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>我们采取合理的技术和管理措施来保护您的数据安全。但请注意，互联网传输无法保证 100% 安全。</p>
              <p>We take reasonable technical and management measures to protect your data security. However, please note that no internet transmission can guarantee 100% security.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">联系我们 / Contact Us</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>如果您对本隐私政策有任何疑问，请通过网站底部提供的方式联系我们。</p>
              <p>If you have any questions about this privacy policy, please contact us through the methods provided at the bottom of the site.</p>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}