'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'

interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area'
  title?: string
  data: Record<string, unknown>[]
  xKey?: string
  yKeys?: string[]
  colors?: string[]
  height?: number
  showGrid?: boolean
  fillOpacity?: number
}

const DEFAULT_COLORS = ['#c96442', '#4ade80', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const CHART_THEME_COLORS = {
  accent: '#c96442',
  ink: '#141413',
  muted: '#5e5d59',
  line: '#f0eee6',
  bg: '#f5f4ed',
}

function detectTheme() {
  if (typeof window === 'undefined') return CHART_THEME_COLORS
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (isDark) {
    return { accent: '#e08a67', ink: '#e8ecf3', muted: '#a5b0c5', line: '#2a3243', bg: '#0f1115' }
  }
  return CHART_THEME_COLORS
}

function renderChart(config: ChartConfig, theme: typeof CHART_THEME_COLORS) {
  const { type, data, xKey = 'name', yKeys = ['value'], colors = DEFAULT_COLORS, height = 300, showGrid = true, fillOpacity = 0.3 } = config

  const tooltipStyle = {
    backgroundColor: theme.bg,
    border: `1px solid ${theme.line}`,
    borderRadius: '8px',
    color: theme.ink,
    fontSize: '12px',
  }

  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.line} />}
            <XAxis dataKey={xKey} stroke={theme.muted} fontSize={12} />
            <YAxis stroke={theme.muted} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {yKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )

    case 'area':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.line} />}
            <XAxis dataKey={xKey} stroke={theme.muted} fontSize={12} />
            <YAxis stroke={theme.muted} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {yKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={fillOpacity} strokeWidth={2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.line} />}
            <XAxis dataKey={xKey} stroke={theme.muted} fontSize={12} />
            <YAxis stroke={theme.muted} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {yKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine
              label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={height * 0.35}
              fill="#8884d8"
              dataKey={yKeys[0] || 'value'}
              nameKey={xKey}
            >
              {data.map((_entry, i) => (
                <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )

    default:
      return null
  }
}

export function ChartEmbed() {
  const [charts, setCharts] = useState<{ id: string; config: ChartConfig }[]>([])
  const [theme, setTheme] = useState(CHART_THEME_COLORS)

  useEffect(() => {
    // detectTheme only runs once on mount to determine initial theme
    const t = detectTheme()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(t)

    // 扫描页面中的图表占位符
    const scanCharts = () => {
      const elements = document.querySelectorAll<HTMLDivElement>('[data-fin-chart]')
      const found: { id: string; config: ChartConfig }[] = []
      elements.forEach((el, index) => {
        try {
          const config = JSON.parse(el.dataset.finChart || '{}') as ChartConfig
          if (config.type && config.data) {
            const id = `chart-${index}`
            found.push({ id, config })
            el.id = id
            el.className = 'fin-chart-container'
          }
        } catch {
          // 忽略无效 JSON
        }
      })
      setCharts(found)
    }

    // 页面加载后扫描
    scanCharts()

    // 监听动态内容插入
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          scanCharts()
          break
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, []) // empty deps = intentional once-only initialization

  if (charts.length === 0) return null

  return (
    <>
      {charts.map(({ id, config }) => (
        <div key={id} id={id} className="fin-chart-container">
          {config.title && (
            <div className="text-sm font-semibold text-[var(--editor-ink)] mb-2">{config.title}</div>
          )}
          <div className="rounded-xl border border-[var(--editor-line)] bg-[var(--editor-panel)]/55 p-4">
            {renderChart(config, theme)}
          </div>
        </div>
      ))}
    </>
  )
}

// 辅助函数：在编辑器中插入图表 HTML
export function createChartEmbed(config: ChartConfig): string {
  return `<div data-fin-chart='${JSON.stringify(config)}' class="fin-chart-placeholder" style="border:2px dashed var(--editor-line);border-radius:8px;padding:2rem;text-align:center;color:var(--editor-muted);margin:1rem 0;">📊 ${config.title || config.type + ' chart'}</div>`
}
