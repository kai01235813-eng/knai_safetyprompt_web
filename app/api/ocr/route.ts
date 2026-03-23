import { NextRequest, NextResponse } from 'next/server'

const OCR_SERVER = process.env.OCR_SERVER_URL || 'http://localhost:8100'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const ocrRes = await fetch(`${OCR_SERVER}/ocr`, {
      method: 'POST',
      body: formData,
    })

    if (!ocrRes.ok) {
      const err = await ocrRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.error || 'OCR 처리 실패' },
        { status: ocrRes.status }
      )
    }

    const data = await ocrRes.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('OCR proxy error:', error)
    return NextResponse.json(
      { error: 'OCR 서버에 연결할 수 없습니다. 사내 OCR 서버가 실행 중인지 확인해주세요.' },
      { status: 502 }
    )
  }
}
