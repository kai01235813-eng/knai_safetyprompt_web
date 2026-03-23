import { NextRequest, NextResponse } from 'next/server'
import { getAllProfiles } from '@/lib/auth'
import { getRecentLogs, getDashboardStats, getUserValidationStats } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'users') {
      const profiles = await getAllProfiles()
      // 각 사용자의 검증 통계 추가
      const usersWithStats = await Promise.all(
        profiles.map(async (p) => {
          const stats = await getUserValidationStats(p.nickname)
          return { ...p, validationStats: stats }
        })
      )
      return NextResponse.json({ users: usersWithStats })
    }

    if (action === 'user-logs') {
      const nickname = searchParams.get('nickname')
      if (!nickname) {
        return NextResponse.json({ error: '닉네임이 필요합니다' }, { status: 400 })
      }
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
      const offset = parseInt(searchParams.get('offset') || '0')
      const logs = await getRecentLogs(limit, offset, undefined, nickname)
      return NextResponse.json(logs)
    }

    if (action === 'dashboard') {
      const days = Math.min(parseInt(searchParams.get('days') || '30'), 365)
      const stats = await getDashboardStats(days)
      return NextResponse.json(stats)
    }

    // 기본: 전체 로그
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')
    const level = searchParams.get('level') || 'all'
    const logs = await getRecentLogs(limit, offset, level)
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { error: '관리자 API 오류', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
