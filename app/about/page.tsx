import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getSiteHeaderData } from '@/lib/site'
import { getAppCloudflareEnv } from '@/lib/cloudflare'
import type { Theme } from '@/lib/appearance'

export const metadata = {
  title: '关于我们',
  description: '了解读财报博客',
}

export default async function AboutPage() {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--editor-ink)] mb-8">关于我们 / About Us</h1>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">关于本站 / About This Site</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>「读财报」博客是自媒体「读财报」的自有站点，致力于成为投资者的财报学习助手。我们相信，通过系统性地学习财务报表解读和财务分析方法，普通投资者也能建立起自己的投资分析框架。</p>
              <p>"读财报学投资" blog is the self-owned site of the WeMedia account "读财报". We are dedicated to becoming a financial report learning assistant for investors. We believe that by systematically learning financial statement interpretation and financial analysis methods, ordinary investors can also build their own investment analysis framework.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">内容定位 / Content Focus</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>本站以学习财务知识、解读财报和市场分析为主要内容，通过研究上市公司财报，理解其商业模式、盈利能力、成长性和风险因素。我们也关注宏观经济和行业动态，力求从多个维度为投资决策提供参考。</p>
              <p>This site focuses on learning financial knowledge, interpreting financial reports and market analysis. Through studying listed company financial reports, we aim to understand their business models, profitability, growth potential, and risk factors. We also pay attention to macroeconomics and industry trends, striving to provide references for investment decisions from multiple dimensions.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">AI 辅助 / AI Assistance</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>在内容创作过程中，我们部分借助 AI 工具辅助分析、整理信息和生成初稿。AI 生成内容仅供参考，我们会对每一条信息进行人工核实，确保内容质量。</p>
              <p>In the content creation process, we partially use AI tools to assist with analysis, information organization, and draft generation. AI-generated content is for reference only, and we manually verify every piece of information to ensure content quality.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">免责声明 / Disclaimer</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>本站观点仅代表作者个人见解，不构成投资建议，也不承诺一定正确。投资有风险，入市需谨慎。投资者应根据自身风险承受能力和投资目标做出独立判断。</p>
              <p>The views on this site represent only the author's personal opinions, do not constitute investment advice, and do not guarantee correctness. Investment involves risk, and caution is advised when entering the market. Investors should make independent judgments based on their own risk tolerance and investment objectives.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">关注我们 / Follow Us</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>欢迎在以下平台关注「读财报」，获取更多投资学习内容：</p>
              <p>Welcome to follow "读财报" on the following platforms for more investment learning content:</p>
            </div>
            <div className="mt-4 p-6 border border-dashed border-[var(--editor-line)] rounded-xl text-center text-sm text-[var(--editor-muted)]">
              <p>社交媒体账号二维码预留区域</p>
              <p className="text-xs mt-2">Social Media Account QR Code Area</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--editor-ink)] mb-4">联系我们 / Contact Us</h2>
            <div className="text-sm text-[var(--editor-muted)] leading-relaxed space-y-3">
              <p>如有任何问题、建议或合作意向，欢迎通过以下方式联系我们。</p>
              <p>If you have any questions, suggestions, or cooperation inquiries, please feel free to contact us through the following methods.</p>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}