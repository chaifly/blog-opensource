'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export interface QrPlatform {
  name: string
  src: string
  alt: string
}

interface QrGridProps {
  platforms: QrPlatform[]
}

export function QrGrid({ platforms }: QrGridProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const active = activeIdx !== null ? platforms[activeIdx] : null

  const open = useCallback((idx: number) => {
    setActiveIdx(idx)
    // 等下一帧让 React 渲染 children 后再调用 showModal，确保 dialog 内有内容
    requestAnimationFrame(() => {
      dialogRef.current?.showModal()
    })
  }, [])

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // 同步 dialog 关闭事件回 state，避免被 ESC 关掉后下次打开状态错位
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const handler = () => setActiveIdx(null)
    dlg.addEventListener('close', handler)
    return () => dlg.removeEventListener('close', handler)
  }, [])

  // 关闭时锁定 body 滚动由 <dialog>.showModal() 自带处理，无需额外逻辑

  return (
    <>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {platforms.map((p, i) => (
          <div
            key={p.name}
            role="button"
            tabIndex={0}
            onClick={() => open(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                open(i)
              }
            }}
            aria-label={`放大 ${p.name} 二维码`}
            className="group flex flex-col items-center p-4 border border-[var(--editor-line)] rounded-xl bg-[var(--background)] cursor-pointer transition-all duration-150 hover:border-[var(--editor-accent)] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editor-accent)] focus-visible:ring-offset-2"
          >
            <div className="relative w-full max-w-[160px] aspect-square flex items-center justify-center overflow-hidden">
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="max-w-full max-h-full object-contain transition-transform duration-150 group-hover:scale-[1.02]"
              />
            </div>
            <p className="mt-3 text-sm font-medium text-[var(--editor-ink)]">{p.name}</p>
            <p className="text-xs text-[var(--editor-muted)] mt-1 group-hover:text-[var(--editor-accent)]">点击放大 · 扫码关注</p>
          </div>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          // 点击 dialog 自身（背景）而非内部内容时关闭
          if (e.target === dialogRef.current) close()
        }}
        className="qr-modal"
        aria-labelledby="qr-modal-title"
      >
        {active && (
          <div
            className="qr-modal-card relative bg-[var(--background)] rounded-none sm:rounded-2xl p-5 sm:p-6 w-screen h-screen sm:h-auto sm:w-auto sm:min-w-[360px] sm:max-w-md shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="关闭"
              className="absolute top-3 right-3 p-2 rounded-full text-[var(--editor-muted)] hover:text-[var(--editor-ink)] hover:bg-[var(--editor-soft)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editor-accent)]"
            >
              <X size={20} />
            </button>

            <p id="qr-modal-title" className="mt-2 sm:mt-0 text-base font-medium text-[var(--editor-ink)]">
              {active.name}
            </p>

            <div className="mt-4 sm:mt-5 w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              <img
                src={active.src}
                alt={active.alt}
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
              />
            </div>

            <p className="mt-4 sm:mt-5 text-xs text-[var(--editor-muted)] text-center">
              长按或右键图片可保存到相册 · 按 Esc 关闭
            </p>
          </div>
        )}
      </dialog>
    </>
  )
}
