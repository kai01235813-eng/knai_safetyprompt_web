import { NextRequest, NextResponse } from 'next/server'

const OCR_SERVER = process.env.OCR_SERVER_URL || 'http://localhost:8100'
const HF_API_KEY = process.env.HF_API_KEY || ''
const HF_MODEL = 'Qwen/Qwen2.5-VL-72B-Instruct'
const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions'

/**
 * Qwen2-VL로 이미지에서 텍스트 추출 (1차)
 */
async function extractWithQwen(imageBase64: string, mimeType: string): Promise<string | null> {
  if (!HF_API_KEY) return null

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
              {
                type: 'text',
                text: '이 이미지에 포함된 모든 텍스트를 빠짐없이 추출해주세요. 표, 양식, 필기체 포함 모든 글자를 그대로 읽어주세요. 텍스트만 출력하고 다른 설명은 하지 마세요.',
              },
            ],
          },
        ],
        max_tokens: 2048,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(60000), // 60초 타임아웃
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      console.error(`Qwen2-VL API error: ${response.status} ${errBody}`)
      return null
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content?.trim()
    return text && text.length > 0 ? text : null
  } catch (error) {
    console.error('Qwen2-VL 호출 실패:', error)
    return null
  }
}

/**
 * EasyOCR 로컬 서버로 텍스트 추출 (2차 폴백)
 */
async function extractWithEasyOCR(formData: FormData): Promise<{ text: string; engine: string } | null> {
  try {
    const ocrRes = await fetch(`${OCR_SERVER}/ocr`, {
      method: 'POST',
      body: formData,
    })

    if (!ocrRes.ok) return null

    const data = await ocrRes.json()
    if (!data.extracted_text || data.extracted_text.trim().length === 0) return null

    return { text: data.extracted_text, engine: data.engine || 'easyocr' }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json({ error: '이미지 파일이 필요합니다.' }, { status: 400 })
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
    const imageBase64 = imageBuffer.toString('base64')
    const mimeType = imageFile.type || 'image/png'

    // 1차: Qwen2-VL (HuggingFace API)
    const qwenText = await extractWithQwen(imageBase64, mimeType)
    if (qwenText) {
      console.log(`[OCR] Qwen2-VL 성공: ${qwenText.length}자 추출`)
      return NextResponse.json({
        success: true,
        engine: 'qwen2-vl',
        extracted_text: qwenText,
        lines: [{ text: qwenText, confidence: 0.95 }],
        total_blocks: 1,
        total_chars: qwenText.length,
      })
    }

    // 2차: EasyOCR (로컬 폴백)
    console.log('[OCR] Qwen2-VL 실패, EasyOCR 폴백...')
    const ocrForm = new FormData()
    const blob = new Blob([imageBuffer], { type: imageFile.type })
    ocrForm.append('image', blob, imageFile.name)

    const easyResult = await extractWithEasyOCR(ocrForm)
    if (easyResult) {
      console.log(`[OCR] EasyOCR 성공: ${easyResult.text.length}자 추출`)
      return NextResponse.json({
        success: true,
        engine: easyResult.engine,
        extracted_text: easyResult.text,
        lines: [{ text: easyResult.text, confidence: 0.5 }],
        total_blocks: 1,
        total_chars: easyResult.text.length,
      })
    }

    // 둘 다 실패
    return NextResponse.json(
      { error: 'OCR 텍스트 추출에 실패했습니다. 다른 이미지를 시도해주세요.' },
      { status: 422 }
    )
  } catch (error) {
    console.error('OCR proxy error:', error)
    return NextResponse.json(
      { error: 'OCR 서버에 연결할 수 없습니다. 사내 OCR 서버가 실행 중인지 확인해주세요.' },
      { status: 502 }
    )
  }
}
