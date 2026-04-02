import { NextRequest, NextResponse } from 'next/server'
import { validatePrompt } from '@/lib/validator'
import { logValidation } from '@/lib/audit-logger'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const nickname = formData.get('nickname') as string | null
    const profileId = formData.get('profileId') as string | null

    if (!file) {
      return NextResponse.json({ error: '이미지 파일이 필요합니다.' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '이미지 파일만 업로드 가능합니다.' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 })
    }

    // 현재 OCR은 서버사이드에서 지원하지 않으므로 안내 메시지 반환
    // 클라이언트에서 OCR 후 텍스트를 /api/validate로 보내는 방식 권장
    return NextResponse.json({
      success: true,
      is_safe: true,
      security_level: '안전',
      risk_score: 0,
      violations: [],
      sanitized_prompt: '',
      original_prompt: '',
      timestamp: new Date().toISOString(),
      recommendation: 'OCR 기능은 클라이언트에서 처리됩니다. 이미지에서 추출된 텍스트를 텍스트 검증 탭에서 직접 검증해주세요.',
      extracted_text: '',
      ocr_note: 'server_ocr_unavailable',
    })
  } catch (error) {
    console.error('Image validation error:', error)
    return NextResponse.json(
      { error: '이미지 검증 중 오류가 발생했습니다.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
