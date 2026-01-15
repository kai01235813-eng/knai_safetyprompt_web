import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 임시 파일로 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.name}`)
    fs.writeFileSync(tempFilePath, buffer)

    // Python OCR + 검증 스크립트 실행
    const result = await runImageValidator(tempFilePath)

    return NextResponse.json({
      success: true,
      ...result,
    })

  } catch (error) {
    console.error('Image validation error:', error)
    return NextResponse.json(
      {
        error: '이미지 검증 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    // 임시 파일 삭제
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath)
      } catch (err) {
        console.error('Failed to delete temp file:', err)
      }
    }
  }
}

function runImageValidator(imagePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'validate_image_api.py')
    const pythonCommand = process.platform === 'win32' ? 'py' : 'python3'
    
    const python = spawn(pythonCommand, [pythonScript, imagePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1'
      }
    })

    let stdout = ''
    let stderr = ''

    python.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    python.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python 프로세스 오류: ${stderr}`))
        return
      }

      try {
        const result = JSON.parse(stdout)
        resolve(result)
      } catch (error) {
        reject(new Error(`JSON 파싱 오류: ${stdout}`))
      }
    })

    python.on('error', (error) => {
      reject(new Error(`Python 실행 오류: ${error.message}`))
    })

    // 타임아웃 설정 (30초 - OCR은 시간이 더 걸림)
    const timeout = setTimeout(() => {
      python.kill()
      reject(new Error('검증 시간 초과 (30초)'))
    }, 30000)

    python.on('close', () => {
      clearTimeout(timeout)
    })
  })
}
