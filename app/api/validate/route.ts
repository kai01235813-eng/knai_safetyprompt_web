import { NextRequest, NextResponse } from 'next/server'

// Railway API URL (환경변수에서 가져오기)
const RAILWAY_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: '유효한 프롬프트를 입력해주세요' },
        { status: 400 }
      )
    }

    // 프롬프트 길이 제한 (10MB)
    if (prompt.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '프롬프트가 너무 깁니다 (최대 10MB)' },
        { status: 400 }
      )
    }

    // Railway FastAPI로 요청
    const response = await fetch(`${RAILWAY_API_URL}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      throw new Error(`Railway API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.result

    // 응답 반환
    return NextResponse.json({
      success: true,
      ...result,
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      {
        error: '검증 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
