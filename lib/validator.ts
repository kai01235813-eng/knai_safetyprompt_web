/**
 * Python 검증 엔진과 통신하는 라이브러리
 */

import { spawn } from 'child_process'
import path from 'path'

export interface ValidationResult {
  is_safe: boolean
  security_level: 'SAFE' | 'WARNING' | 'DANGER' | 'BLOCKED'
  risk_score: number
  violations: Array<{
    type: string
    description: string
    matched_text: string
    position: [number, number]
    severity: number
  }>
  sanitized_prompt: string
  original_prompt: string
  recommendation: string
}

/**
 * Python 검증 엔진을 호출하여 프롬프트 검증
 */
export async function validatePrompt(prompt: string): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    // Python 스크립트 경로
    const pythonScript = path.join(process.cwd(), 'python', 'validate_api.py')

    // Python 프로세스 생성 (Windows는 py 명령어 사용)
    const pythonCommand = process.platform === 'win32' ? 'py' : 'python3'
    const python = spawn(pythonCommand, [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1'
      }
    })

    let stdout = ''
    let stderr = ''

    // 표준 출력 수집
    python.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    // 표준 에러 수집
    python.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    // 프로세스 종료 시 처리
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

    // 에러 처리
    python.on('error', (error) => {
      reject(new Error(`Python 실행 오류: ${error.message}`))
    })

    // 프롬프트를 stdin으로 전달 (UTF-8 인코딩 명시)
    const inputData = JSON.stringify({ prompt }, null, 0)
    python.stdin.write(inputData, 'utf8')
    python.stdin.end()

    // 타임아웃 설정 (10초)
    const timeout = setTimeout(() => {
      python.kill()
      reject(new Error('검증 시간 초과 (10초)'))
    }, 10000)

    python.on('close', () => {
      clearTimeout(timeout)
    })
  })
}

/**
 * 이미지 OCR + 검증 (추후 구현)
 */
export async function validateImage(imageData: Buffer): Promise<ValidationResult> {
  // TODO: OCR API 연동
  throw new Error('이미지 검증 기능은 준비 중입니다')
}

/**
 * 검증 엔진 헬스체크
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await validatePrompt('test')
    return true
  } catch (error) {
    console.error('Health check failed:', error)
    return false
  }
}
