import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/admin-auth'
import { getAppCloudflareEnv } from '@/lib/cloudflare'
import { getPostBySlug, incrementVotesUp, incrementVotesDown } from '@/lib/db'

// 点赞/反对 API
// 支持两种模式：
// 1. 管理员（后台）：可以设置具体的票数
// 2. 公开（前台）：只能增加票数，不能减少

export async function POST(req: NextRequest) {
  const env = await getAppCloudflareEnv()
  const db = env?.DB as D1Database | undefined

  if (!db) {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })
  }

  // 检查是否为管理员请求
  const isAuthenticated = await authenticateRequest(req, db)

  let body: { slug: string; type: 'up' | 'down' | 'set'; value?: number } | undefined
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '请求体不是有效 JSON' }, { status: 400 })
  }

  if (!body?.slug || !body.type) {
    return NextResponse.json({ error: '缺少必要参数：slug 和 type' }, { status: 400 })
  }

  // 获取文章是否存在
  const post = await getPostBySlug(db, body.slug)
  if (!post) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  // 非管理员只能进行增加操作
  if (!isAuthenticated && (body.type === 'set' || body.value !== undefined)) {
    return NextResponse.json({ error: '权限不足' }, { status: 403 })
  }

  try {
    switch (body.type) {
      case 'up':
        await incrementVotesUp(db, body.slug)
        break
      case 'down':
        await incrementVotesDown(db, body.slug)
        break
      case 'set':
        if (body.value === undefined) {
          return NextResponse.json({ error: '设置票数需要提供 value 参数' }, { status: 400 })
        }
        await db
          .prepare(`UPDATE posts SET votes_up = ?, votes_down = ? WHERE slug = ?`)
          .bind(body.value, body.value, body.slug)
          .run()
        break
      default:
        return NextResponse.json({ error: '无效的 type 参数' }, { status: 400 })
    }

    // 返回更新后的票数
    const updatedPost = await getPostBySlug(db, body.slug)
    return NextResponse.json({
      success: true,
      votes_up: updatedPost?.votes_up ?? 0,
      votes_down: updatedPost?.votes_down ?? 0,
    })
  } catch (error) {
    console.error('Vote operation failed:', error)
    return NextResponse.json({ error: '投票操作失败' }, { status: 500 })
  }
}

// 获取文章投票信息
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: '缺少 slug 参数' }, { status: 400 })
  }

  const env = await getAppCloudflareEnv()
  const db = env?.DB as D1Database | undefined

  if (!db) {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })
  }

  try {
    const post = await getPostBySlug(db, slug)
    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json({
      slug: post.slug,
      votes_up: post.votes_up ?? 0,
      votes_down: post.votes_down ?? 0,
    })
  } catch (error) {
    console.error('Failed to get vote info:', error)
    return NextResponse.json({ error: '获取投票信息失败' }, { status: 500 })
  }
}
