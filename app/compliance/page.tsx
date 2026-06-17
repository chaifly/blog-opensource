import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getSiteHeaderData } from '@/lib/site'
import { getAppCloudflareEnv } from '@/lib/cloudflare'
import type { Theme } from '@/lib/appearance'

export const metadata = {
  title: '合规声明',
  description: '本站合规信息和法律声明',
}

export default async function CompliancePage() {
  let navLinks = [{ label: '首页', url: '/', openInNewTab: false }]

  let defaultTheme: Theme = 'default'

  try {
    const env = await getAppCloudflareEnv()
    if (env?.DB) {
      const headerData = await getSiteHeaderData(env.DB)
      navLinks = headerData.navLinks

      defaultTheme = headerData.defaultTheme
    }
  } catch {}

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <SiteHeader
        initialTheme={defaultTheme}
        navLinks={navLinks}

        stickyOnMobile={false}
      />

      <main className="page-main mx-auto w-full max-w-3xl px-4 sm:px-6 flex-1 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--editor-ink)] mb-8">合规声明 / Compliance</h1>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">内容免责声明 / Content Disclaimer</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>本站所有内容仅代表作者个人观点，不构成任何投资建议。投资者据此操作，风险自担。</p>
              <p>All content on this site represents only the author's personal views and does not constitute any investment advice. Investors should make their own decisions based on their own risk assessment.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">信息来源 / Information Sources</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>本站部分内容来源于公开信息渠道，包括但不限于公司公告、财务报告、新闻报道等，我们力求但无法保证信息的准确性、完整性和时效性。</p>
              <p>Some content on this site is sourced from public information channels, including but not limited to company announcements, financial reports, and news reports. While we strive to ensure accuracy, we cannot guarantee the accuracy, completeness, or timeliness of the information.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">AI 工具使用说明 / AI Tool Usage</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>本站部分内容借助 AI 工具生成，AI 生成内容仅供参考，不承诺准确性。投资者应自行判断并承担相关风险。</p>
              <p>Some content on this site is generated with the assistance of AI tools. AI-generated content is for reference only and its accuracy is not guaranteed. Investors should make their own judgments and bear the associated risks.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">知识产权 / Intellectual Property</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>未经明确授权，任何人不得转载、复制或以其他方式使用本站内容。转载需注明出处，且不得用于商业目的。</p>
              <p>No one may reproduce, copy, or otherwise use the content of this site without explicit authorization. Reproduction must include proper attribution and may not be used for commercial purposes.</p>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}