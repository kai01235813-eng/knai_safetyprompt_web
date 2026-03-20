import { NextRequest, NextResponse } from 'next/server'

const RAILWAY_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'
    const level = searchParams.get('level') || 'all'
    const view = searchParams.get('view')

    let url: string
    if (view === 'dashboard') {
      const days = searchParams.get('days') || '30'
      url = `${RAILWAY_API_URL}/logs/stats/dashboard?days=${days}`
    } else {
      url = `${RAILWAY_API_URL}/logs?limit=${limit}&offset=${offset}&level=${level}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Logs fetch error:', error)
    return NextResponse.json(
      { error: '로그 조회 실패', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
