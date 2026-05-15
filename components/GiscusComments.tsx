'use client'

import { useEffect, useRef } from 'react'

interface GiscusConfig {
  repo: string
  repoId: string
  category?: string
  categoryId?: string
  mapping?: 'url' | 'title' | 'og:title' | 'number' | 'pathname' | 'specific'
  term?: string
  reactionsEnabled?: '0' | '1'
  emitMetadata?: '0' | '1'
  inputPosition?: 'top' | 'bottom'
  theme?: string
  lang?: string
}

// Giscus 配置（基于 GitHub Discussions 的评论系统）
//
// 配置方式（二选一）：
// 1. 环境变量（推荐）：在 .env.local 中设置 NEXT_PUBLIC_GISCUS_REPO / REPO_ID / CATEGORY_ID
// 2. 直接修改下方 DEFAULT_CONFIG 中的值
//
// 获取参数：打开 https://giscus.app/zh-CN，按指引选择你的 GitHub 仓库并生成配置
// 前置条件：你的 GitHub 仓库必须开启 Discussions（Settings → General → Discussions）
const DEFAULT_CONFIG: GiscusConfig = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO || '', // 如 "username/repo"
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '', // 仓库 ID
  category: 'Announcements',
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '', // 分类 ID
  mapping: 'pathname',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  lang: 'zh-CN',
}

export function GiscusComments({ config }: { config?: Partial<GiscusConfig> }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || loadedRef.current) return
    const cfg = { ...DEFAULT_CONFIG, ...config }
    if (!cfg.repo || !cfg.repoId) return // 未配置则不渲染

    loadedRef.current = true

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', cfg.repo)
    script.setAttribute('data-repo-id', cfg.repoId)
    if (cfg.category) script.setAttribute('data-category', cfg.category)
    if (cfg.categoryId) script.setAttribute('data-category-id', cfg.categoryId)
    script.setAttribute('data-mapping', cfg.mapping || 'pathname')
    if (cfg.term) script.setAttribute('data-term', cfg.term)
    script.setAttribute('data-reactions-enabled', cfg.reactionsEnabled || '1')
    script.setAttribute('data-emit-metadata', cfg.emitMetadata || '0')
    script.setAttribute('data-input-position', cfg.inputPosition || 'top')
    script.setAttribute('data-lang', cfg.lang || 'zh-CN')

    // 自动主题
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    script.setAttribute('data-theme', prefersDark ? 'transparent_dark' : 'light')

    // 监听主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const iframe = containerRef.current?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
      if (iframe) {
        iframe.contentWindow?.postMessage(
          { giscus: { setConfig: { theme: e.matches ? 'transparent_dark' : 'light' } } },
          'https://giscus.app'
        )
      }
    }
    mediaQuery.addEventListener('change', handler)

    containerRef.current.appendChild(script)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [config])

  // 未配置时不渲染
  const effectiveConfig = { ...DEFAULT_CONFIG, ...config }
  if (!effectiveConfig.repo || !effectiveConfig.repoId) return null

  return (
    <section className="mt-14 sm:mt-16 border-t border-[var(--editor-line)] pt-8 sm:pt-10">
      <h2 className="text-lg sm:text-xl font-semibold text-[var(--editor-ink)] mb-6">评论</h2>
      <div ref={containerRef} className="giscus-container rounded-xl border border-[var(--editor-line)]/50 bg-[var(--editor-panel)]/30 p-4 sm:p-6" />
    </section>
  )
}
