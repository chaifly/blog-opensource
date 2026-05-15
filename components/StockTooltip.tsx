'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StockQuote {
  code: string
  name: string
  region: string
  price: string
  change: string
  changePercent: string
  open: string
  high: string
  low: string
  prevClose: string
  time: string
}

// 缓存已获取的行情数据
const quoteCache = new Map<string, StockQuote & { timestamp: number }>()
const CACHE_TTL = 60_000 // 1 分钟缓存

function isInCache(code: string): boolean {
  const item = quoteCache.get(code)
  return !!item && (Date.now() - item.timestamp < CACHE_TTL)
}

function getFromCache(code: string): StockQuote | null {
  const item = quoteCache.get(code)
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item
  }
  quoteCache.delete(code)
  return null
}

function setCache(code: string, quote: StockQuote) {
  quoteCache.set(code, { ...quote, timestamp: Date.now() })
}

// 新浪财经 API（支持跨域 JSONP）
function fetchSinaQuote(code: string, region: string): Promise<StockQuote | null> {
  return new Promise((resolve) => {
    let symbol = ''
    if (region === 'HK') symbol = `rt_hk${code}`
    else if (region === 'A-shares') symbol = `sh${code.startsWith('6') ? code : `sz${code}`}`
    else symbol = `gb_${code.toLowerCase()}`

    const script = document.createElement('script')
    script.src = `https://hq.sinajs.cn/rn=${Date.now()}&list=${symbol}`
    script.charset = 'gb2312'

    const timeout = setTimeout(() => {
      cleanup()
      resolve(null)
    }, 5000)

    function cleanup() {
      clearTimeout(timeout)
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }

    // 新浪 JS 会设置 window[`hq_str_${symbol}`]
    const checkData = () => {
      const dataStr = (window as unknown as Record<string, string>)[`hq_str_${symbol}`]
      if (dataStr) {
        cleanup()
        try {
          parseSinaResponse(dataStr, code, region, resolve)
        } catch {
          resolve(null)
        }
      } else {
        // 重试一次
        setTimeout(() => {
          const dataStr2 = (window as unknown as Record<string, string>)[`hq_str_${symbol}`]
          if (dataStr2) {
            cleanup()
            try {
              parseSinaResponse(dataStr2, code, region, resolve)
            } catch {
              resolve(null)
            }
          } else {
            cleanup()
            resolve(null)
          }
        }, 300)
      }
    }

    script.onload = checkData
    script.onerror = () => {
      cleanup()
      resolve(null)
    }
    document.head.appendChild(script)
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSinaResponse(dataStr: string, code: string, region: string, resolve: (result: StockQuote | null) => void) {
  if (region === 'A-shares') {
    // A股格式: 名称, 今日开盘价, 昨日收盘价, 当前价格, 最高, 最低, ...
    const parts = dataStr.split(',')
    if (parts.length < 30) { resolve(null); return }
    const name = parts[0]
    const open = parts[1]
    const prevClose = parts[2]
    const price = parts[3]
    const high = parts[4]
    const low = parts[5]
    const time = parts.length > 31 ? parts[31] : ''
    const changeVal = parseFloat(price) - parseFloat(prevClose)
    const changePct = (changeVal / parseFloat(prevClose) * 100).toFixed(2)

    resolve({ code, name, region, price, change: (changeVal >= 0 ? '+' : '') + changeVal.toFixed(2), changePercent: (changeVal >= 0 ? '+' : '') + changePct + '%', open, high, low, prevClose, time })
  } else if (region === 'HK') {
    // 港股格式
    const parts = dataStr.split(',')
    if (parts.length < 20) { resolve(null); return }
    const name = parts[1]
    const price = parts[6]
    const prevClose = parts[3]
    const open = parts[2]
    const high = parts[5]
    const low = parts[4]
    const time = parts[17] || ''
    const changeVal = parseFloat(price) - parseFloat(prevClose)
    const changePct = (changeVal / parseFloat(prevClose) * 100).toFixed(2)

    resolve({ code, name, region, price, change: (changeVal >= 0 ? '+' : '') + changeVal.toFixed(2), changePercent: (changeVal >= 0 ? '+' : '') + changePct + '%', open, high, low, prevClose, time })
  } else {
    // 美股格式
    const parts = dataStr.split(',')
    if (parts.length < 10) { resolve(null); return }
    const name = parts[0]
    const price = parts[1]
    const change = parts[2]
    const changePercent = parts[3]
    const open = parts[5]
    const prevClose = parts[26] || ''
    const high = parts[6]
    const low = parts[7]
    const time = parts[4] || ''

    resolve({ code, name, region, price, change, changePercent, open, high, low, prevClose, time })
  }
}

export function StockTooltip() {
  const [tooltip, setTooltip] = useState<{
    quote: StockQuote
    x: number
    y: number
  } | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<number | null>(null)

  const fetchQuote = useCallback(async (code: string, region: string, name: string): Promise<StockQuote | null> => {
    if (isInCache(code)) {
      return getFromCache(code)
    }

    setLoading(code)
    const quote = await fetchSinaQuote(code, region)
    setLoading(null)

    if (quote) {
      setCache(code, quote)
    } else if (name) {
      // 如果 API 失败，返回基础信息
      return { code, name, region, price: '--', change: '--', changePercent: '--', open: '--', high: '--', low: '--', prevClose: '--', time: '--' }
    }
    return quote
  }, [])

  useEffect(() => {
    const handleMouseEnter = async (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-stock-code]') as HTMLElement | null
      if (!target) return

      const code = target.dataset.stockCode
      const region = target.dataset.stockRegion
      const name = target.dataset.stockName || code || ''
      if (!code || !region) return

      // 清除隐藏的计时器
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }

      const cached = getFromCache(code)
      if (cached) {
        const rect = target.getBoundingClientRect()
        setTooltip({ quote: cached, x: rect.left, y: rect.bottom + 8 })
        return
      }

      // 显示加载中
      const rect = target.getBoundingClientRect()
      setTooltip({
        quote: { code, name, region: region!, price: '加载中...', change: '', changePercent: '', open: '', high: '', low: '', prevClose: '', time: '' },
        x: rect.left,
        y: rect.bottom + 8,
      })

      const quote = await fetchQuote(code, region, name)
      if (quote) {
        const rect2 = target.getBoundingClientRect()
        setTooltip({ quote, x: rect2.left, y: rect2.bottom + 8 })
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-stock-code]') as HTMLElement | null
      if (!target) return

      // 延迟隐藏，让用户有时间移动到 tooltip 上
      hideTimerRef.current = window.setTimeout(() => {
        setTooltip(null)
        hideTimerRef.current = null
      }, 200)
    }

    const handleTooltipEnter = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }

    const handleTooltipLeave = () => {
      setTooltip(null)
    }

    // 使用事件委托
    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)

    // tooltip 自身的事件需要在 tooltip 渲染后绑定
    // 我们用 ref 监听
    const currentContainer = containerRef.current
    if (currentContainer) {
      currentContainer.addEventListener('mouseenter', handleTooltipEnter)
      currentContainer.addEventListener('mouseleave', handleTooltipLeave)
    }

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      if (currentContainer) {
        currentContainer.removeEventListener('mouseenter', handleTooltipEnter)
        currentContainer.removeEventListener('mouseleave', handleTooltipLeave)
      }
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [fetchQuote])

  const isUp = tooltip?.quote.changePercent?.startsWith('+') ?? false

  return (
    <div
      ref={containerRef}
      className="fixed z-50 pointer-events-auto"
      style={{ left: tooltip?.x ?? 0, top: tooltip?.y ?? 0 }}
    >
      {tooltip && (
        <div
          className="rounded-xl border border-[var(--editor-line)] bg-[var(--editor-panel)] shadow-xl p-3 min-w-[220px]"
          style={{ maxWidth: 280 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold text-sm text-[var(--editor-ink)]">{tooltip.quote.name}</span>
              <span className="text-xs text-[var(--editor-muted)] ml-1.5 font-mono">{tooltip.quote.code}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--editor-soft)] text-[var(--editor-muted)]">
              {tooltip.quote.region === 'US' ? '美股' : tooltip.quote.region === 'HK' ? '港股' : 'A股'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-xl font-bold tabular-nums ${isUp ? 'text-red-500' : tooltip.quote.changePercent?.startsWith('-') ? 'text-green-500' : 'text-[var(--editor-ink)]'}`}>
              {tooltip.quote.price}
            </span>
            {tooltip.quote.change && tooltip.quote.change !== '--' && (
              <span className={`text-sm tabular-nums flex items-center gap-0.5 ${isUp ? 'text-red-500' : 'text-green-500'}`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {tooltip.quote.change} ({tooltip.quote.changePercent})
              </span>
            )}
          </div>

          {tooltip.quote.price !== '加载中...' && tooltip.quote.open !== '--' && (
            <div className="grid grid-cols-4 gap-x-3 gap-y-1 text-xs">
              <span className="text-[var(--editor-muted)]">今开</span>
              <span className="tabular-nums text-[var(--editor-ink)]">{tooltip.quote.open}</span>
              <span className="text-[var(--editor-muted)]">最高</span>
              <span className="tabular-nums text-[var(--editor-ink)]">{tooltip.quote.high}</span>
              <span className="text-[var(--editor-muted)]">昨收</span>
              <span className="tabular-nums text-[var(--editor-ink)]">{tooltip.quote.prevClose}</span>
              <span className="text-[var(--editor-muted)]">最低</span>
              <span className="tabular-nums text-[var(--editor-ink)]">{tooltip.quote.low}</span>
            </div>
          )}

          {tooltip.quote.price === '加载中...' && (
            <div className="text-xs text-[var(--editor-muted)] py-1">正在获取行情数据...</div>
          )}
        </div>
      )}
    </div>
  )
}
