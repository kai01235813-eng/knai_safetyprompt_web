import { NextRequest, NextResponse } from 'next/server'
import { getRecentLogs, getLogDetail, getDashboardStats } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view')

    if (view === 'dashboard') {
      const days = Math.min(parseInt(searchParams.get('days') || '30'), 365)
      const stats = await getDashboardStats(days)
      return NextResponse.json(stats)
    }

    const logId = searchParams.get('id')
    if (logId) {
      const detail = await getLogDetail(logId)
      if (!detail) {
        return NextResponse.json({ error: '로그를 찾을 수 없습니다' }, { status: 404 })
      }
      return NextResponse.json(detail)
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')
    const level = searchParams.get('level') || 'all'
    const nickname = searchParams.get('nickname') || undefined

    const logs = await getRecentLogs(limit, offset, level, nickname)
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Logs fetch error:', error)
    return NextResponse.json(
      { error: '로그 조회 실패', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
