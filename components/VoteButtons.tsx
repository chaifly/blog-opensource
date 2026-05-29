'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { getSiteUrl } from '@/lib/site-config'

interface VoteInfo {
  slug: string
  votes_up: number
  votes_down: number
}

interface VoteButtonsProps {
  slug: string
  initialVotes?: VoteInfo
}

export function VoteButtons({ slug, initialVotes }: VoteButtonsProps) {
  const [votes, setVotes] = useState<VoteInfo>(
    initialVotes || { slug, votes_up: 0, votes_down: 0 }
  )
  const [hasVoted, setHasVoted] = useState(false)
  const [isHovered, setIsHovered] = useState<'none' | 'up' | 'down'>('none')
  const [isLoading, setIsLoading] = useState(false)

  // 从 localStorage 检查是否已投票
  useEffect(() => {
    if (typeof window === 'undefined') return
    const votedSlugs = JSON.parse(localStorage.getItem('voted_slugs') || '[]')
    setHasVoted(votedSlugs.includes(slug))
  }, [slug])

  const handleVote = async (type: 'up' | 'down') => {
    if (hasVoted || isLoading) return
    setIsLoading(true)

    try {
      const baseUrl = getSiteUrl()
      const response = await fetch(`${baseUrl}/api/posts/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type }),
      })

      if (response.ok) {
        const data: VoteInfo = await response.json()
        setVotes({ slug, votes_up: data.votes_up, votes_down: data.votes_down })
        setHasVoted(true)

        // 保存到 localStorage
        const votedSlugs = JSON.parse(localStorage.getItem('voted_slugs') || '[]')
        if (!votedSlugs.includes(slug)) {
          votedSlugs.push(slug)
          localStorage.setItem('voted_slugs', JSON.stringify(votedSlugs))
        }
      }
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <div className="flex items-center gap-2 mt-6">
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleVote('up')}
          onMouseEnter={() => setIsHovered('up')}
          onMouseLeave={() => setIsHovered('none')}
          disabled={hasVoted || isLoading}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors
            ${hasVoted
              ? 'bg-[var(--editor-accent)] text-white cursor-default'
              : isHovered === 'up'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-[var(--editor-panel)] hover:bg-[var(--editor-soft)] text-[var(--editor-muted)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="觉得有帮助？点赞支持"
        >
          <ThumbsUp className={`w-4 h-4 ${hasVoted || isHovered === 'up' ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{formatNumber(votes.votes_up)}</span>
        </button>

        <button
          onClick={() => handleVote('down')}
          onMouseEnter={() => setIsHovered('down')}
          onMouseLeave={() => setIsHovered('none')}
          disabled={hasVoted || isLoading}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors
            ${isHovered === 'down'
              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              : 'bg-[var(--editor-panel)] hover:bg-[var(--editor-soft)] text-[var(--editor-muted)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="有任何疑问？反馈改进"
        >
          <ThumbsDown className={`w-4 h-4 ${isHovered === 'down' ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{formatNumber(votes.votes_down)}</span>
        </button>
      </div>

      {/* 状态提示 */}
      {hasVoted && (
        <span className="text-xs text-[var(--editor-muted)] animate-fade-in">
          谢谢你的反馈！
        </span>
      )}
    </div>
  )
}
