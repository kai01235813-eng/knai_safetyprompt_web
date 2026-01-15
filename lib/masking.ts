/**
 * 간단한 프롬프트 마스킹 로직
 */

// 민감정보 패턴
const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /01[016789]-?\d{3,4}-?\d{4}/g,
  ssn: /\d{6}-?[1-4]\d{6}/g,
  card: /\d{4}-?\d{4}-?\d{4}-?\d{4}/g,
  ip: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  url: /https?:\/\/[^\s]+/g,
  password: /(?:password|passwd|pwd|비밀번호)[\s:=]+[^\s]+/gi,
  apiKey: /(?:api[_-]?key|token|secret)[\s:=]+[a-zA-Z0-9\-_]+/gi,
}

export interface MaskResult {
  original: string
  masked: string
  detectedPatterns: {
    type: string
    count: number
  }[]
  riskLevel: 'safe' | 'warning' | 'danger'
}

export function maskPrompt(prompt: string): MaskResult {
  let masked = prompt
  const detected: { type: string; count: number }[] = []

  // 각 패턴별로 마스킹
  Object.entries(PATTERNS).forEach(([type, pattern]) => {
    const matches = prompt.match(pattern)
    if (matches && matches.length > 0) {
      detected.push({ type, count: matches.length })
      masked = masked.replace(pattern, (match) => {
        // 타입별 마스킹 처리
        if (type === 'email') {
          const [local, domain] = match.split('@')
          return `${local[0]}***@${domain}`
        } else if (type === 'phone') {
          return match.substring(0, 3) + '-****-****'
        } else if (type === 'ssn') {
          return '******-*******'
        } else if (type === 'card') {
          return '****-****-****-****'
        } else {
          return '[MASKED]'
        }
      })
    }
  })

  // 위험도 평가
  const totalCount = detected.reduce((sum, d) => sum + d.count, 0)
  let riskLevel: 'safe' | 'warning' | 'danger' = 'safe'
  
  if (totalCount > 0) {
    riskLevel = totalCount >= 3 ? 'danger' : 'warning'
  }

  return {
    original: prompt,
    masked,
    detectedPatterns: detected,
    riskLevel,
  }
}
