import { NextRequest, NextResponse } from 'next/server'
import { validatePrompt } from '@/lib/validator'
import { logValidation } from '@/lib/audit-logger'

export async function POST(request: NextRequest) {
  try {
    const { prompt, nickname, profileId } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '유효한 프롬프트를 입력해주세요' }, { status: 400 })
    }

    if (prompt.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '프롬프트가 너무 깁니다 (최대 10MB)' }, { status: 400 })
    }

    const start = performance.now()
    const result = validatePrompt(prompt)
    const elapsed = Math.round(performance.now() - start)

    // 비동기로 감사 로그 저장 (응답 지연 없이)
    logValidation(prompt, result, {
      nickname,
      profileId,
      inputType: 'text',
      responseTimeMs: elapsed,
    }).catch(err => console.error('Log failed:', err))

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: '검증 중 오류가 발생했습니다', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
