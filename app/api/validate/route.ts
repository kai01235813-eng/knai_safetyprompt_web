import { NextRequest, NextResponse } from 'next/server'
import { validatePrompt } from '@/lib/validator'

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

    // Python 검증 엔진 호출
    const result = await validatePrompt(prompt)

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
