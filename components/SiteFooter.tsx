'use client'

import Link from 'next/link'
import { useAdminSession } from '@/lib/admin-session-client'

export function SiteFooter() {
  const { authenticated: isAdmin } = useAdminSession()

  return (
    <>
      <footer className="border-t border-[var(--editor-line)] mt-auto">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs text-[var(--stone-gray)]">
          <span>© {new Date().getFullYear()}</span>
          <span>·</span>
          <Link
            href="/compliance"
            className="hover:text-[var(--editor-ink)] transition-colors duration-150 underline-offset-2 hover:underline"
          >
            合规
          </Link>
          <span>·</span>
          <Link
            href="/privacy"
            className="hover:text-[var(--editor-ink)] transition-colors duration-150 underline-offset-2 hover:underline"
          >
            隐私
          </Link>
          <span>·</span>
          <Link
            href="/about"
            className="hover:text-[var(--editor-ink)] transition-colors duration-150 underline-offset-2 hover:underline"
          >
            关于我们
          </Link>
          {isAdmin ? (
            <>
              <span>·</span>
              <Link
                href="/admin"
                className="hover:text-[var(--editor-ink)] transition-colors duration-150 underline-offset-2 hover:underline"
              >
                管理后台
              </Link>
              <span>·</span>
              <Link
                href="/editor?new=1"
                title="写新文章"
                className="inline-flex items-center gap-1 hover:text-[var(--editor-accent)] transition-colors duration-150"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>新文章</span>
              </Link>
            </>
          ) : null}
        </div>
      </footer>

      {/* 免责声明 */}
      <div className="border-t border-[var(--editor-line)]/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 text-[10px] text-[var(--editor-muted)] text-center leading-relaxed">
          本站内容仅为个人投资记录和观点分享，不构成任何投资建议。市场有风险，投资需谨慎。
        </div>
      </div>
    </>
  )
}
