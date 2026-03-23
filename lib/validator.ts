/**
 * 한국전력공사 생성형AI 프롬프트 보안 검증 시스템
 * Python prompt_security_validator.py → TypeScript 포팅
 * Railway 없이 Vercel API Routes에서 직접 실행
 */

// ============================================================
// Types
// ============================================================

export type SecurityLevel = '안전' | '경고' | '위험' | '차단'

export type ViolationType =
  | '개인정보'
  | '기밀정보'
  | '기술정보'
  | '조직정보'
  | '위치정보'
  | '재무정보'
  | '시스템정보'

export interface RegulationReference {
  law: string
  article: string
  description: string
  source: 'privacy' | 'security' | 'checklist'
}

export interface SecurityViolation {
  type: ViolationType
  description: string
  matched_text: string
  position: [number, number]
  severity: number
}

export interface ValidationResult {
  is_safe: boolean
  security_level: SecurityLevel
  risk_score: number
  violations: SecurityViolation[]
  sanitized_prompt: string
  original_prompt: string
  timestamp: string
  recommendation: string
  regulation_refs: RegulationReference[]
}

// ============================================================
// 패턴 정의
// ============================================================

interface PatternRule {
  regex: RegExp
  type: ViolationType
  severity: number
}

const PATTERNS: Record<string, PatternRule> = {
  '주민등록번호': { regex: /\d{6}[-\s]?[1-4]\d{6}/g, type: '개인정보', severity: 10 },
  '외국인등록번호': { regex: /\d{6}[-\s]?[5-8]\d{6}/g, type: '개인정보', severity: 10 },
  '여권번호': { regex: /[A-Z]{1,2}\d{8,9}/g, type: '개인정보', severity: 9 },
  '운전면허번호': { regex: /(?:\d{2}[-\s]?\d{2}[-\s]?\d{6}[-\s]?\d{2})|(?:[가-힣]+\d{2}-\d{6}-\d{2})/g, type: '개인정보', severity: 9 },
  '신용카드번호': { regex: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, type: '개인정보', severity: 10 },
  '계좌번호': { regex: /\d{3,6}[-\s]?\d{2,8}[-\s]?\d{4,}/g, type: '개인정보', severity: 9 },
  '휴대전화번호': { regex: /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/g, type: '개인정보', severity: 7 },
  '일반전화번호': { regex: /0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}/g, type: '개인정보', severity: 6 },
  '이메일주소': { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, type: '개인정보', severity: 7 },
  'IP주소': { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, type: '시스템정보', severity: 8 },
  'MAC주소': { regex: /(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/g, type: '시스템정보', severity: 8 },
  'URL경로': { regex: /https?:\/\/[^\s]+/g, type: '시스템정보', severity: 6 },
  '비밀번호패턴': { regex: /(?:password|passwd|pwd|pass)\s*[:=]\s*\S+/gi, type: '시스템정보', severity: 10 },
  'API키패턴': { regex: /(?:api[_-]?key|apikey|access[_-]?token)\s*[:=]\s*["']?[\w-]+["']?/gi, type: '시스템정보', severity: 10 },
  '상세주소': { regex: /[가-힣]+[시도]\s+[가-힣]+[구군]\s+[가-힣]+[동읍면]\s+\d+[-\d]*/g, type: '위치정보', severity: 8 },
  '지번주소': { regex: /[가-힣]+[동읍면리]\s+\d+[-\d]*번지/g, type: '위치정보', severity: 7 },
  '구체적금액_억': { regex: /\d{1,}[,\d]*\s*억\s*(?:\d+[,\d]*\s*만\s*)?원/g, type: '재무정보', severity: 7 },
  '구체적금액_원': { regex: /\d{6,}[,\d]*\s*원/g, type: '재무정보', severity: 6 },
  '변전소구체위치': { regex: /[가-힣]+\s*\d*호?\s*변전소/g, type: '기술정보', severity: 8 },
  '발전소구체위치': { regex: /[가-힣]+\s*(?:화력|원자력|수력)\s*발전소/g, type: '기술정보', severity: 9 },
  '전력량수치': { regex: /\d+\.?\d*\s*(?:kW|MW|GW|kWh|MWh|GWh)/g, type: '기술정보', severity: 7 },
  '임직원명': { regex: /[가-힣]{2,4}\s*(?:사장|부사장|전무|상무|이사|부장|차장|과장|대리|주임)/g, type: '조직정보', severity: 8 },
  '부서명상세': { regex: /(?:본부|실|부|팀|센터)\s*(?:장\s*)?[가-힣]{2,}/g, type: '조직정보', severity: 6 },
}

// ============================================================
// 키워드 규칙
// ============================================================

interface KeywordRule {
  keywords: string[]
  type: ViolationType
  severity: number
}

const KEYWORD_RULES: Record<string, KeywordRule> = {
  confidential_markers: {
    keywords: ['대외비', '비밀', '극비', '1급비밀', '2급비밀', '3급비밀', 'CONFIDENTIAL', 'SECRET', 'TOP SECRET', '내부자료', '사내전용', '열람제한', '배포금지'],
    type: '기밀정보', severity: 10,
  },
  power_infrastructure: {
    keywords: ['SCADA', 'EMS', 'DMS', 'OMS', 'ADMS', '배전자동화', '원격감시', '원격제어', '계통운영', '전력계통', '송배전망', '보호계전', '차단기위치', '개폐기', 'KEPCO-NET', 'KDN시스템'],
    type: '기술정보', severity: 9,
  },
  security_systems: {
    keywords: ['방화벽', 'firewall', 'IPS', 'IDS', 'VPN설정', 'ACL', '접근통제', '인증서버', 'Active Directory', 'LDAP', '백업서버', 'DB서버', '운영서버'],
    type: '시스템정보', severity: 9,
  },
  management_info: {
    keywords: ['입찰정보', '낙찰가', '계약금액', '견적서', '경영전략', '사업계획', '투자계획', '인사평가', '급여', '성과급', '인센티브', '재무제표', '손익계산서', '대차대조표'],
    type: '기밀정보', severity: 9,
  },
  customer_info: {
    keywords: ['고객명단', '수용가정보', '계약정보', '전력사용량', '요금정보', '미납정보', '고객DB', 'CRM시스템'],
    type: '개인정보', severity: 10,
  },
  access_info: {
    keywords: ['관리자권한', 'root', 'administrator', '마스터키', '인증키', '암호화키', '토큰', 'session', 'cookie값'],
    type: '시스템정보', severity: 10,
  },
}

// ============================================================
// 법규 매핑
// ============================================================

const REGULATION_MAP: Record<ViolationType, RegulationReference[]> = {
  '개인정보': [
    { law: '개인정보보호법', article: '제3조 (개인정보 보호 원칙)', description: '목적 명확성, 최소수집, 안전한 관리 원칙 위반 가능', source: 'privacy' },
    { law: '개인정보보호법', article: '제15조 (수집·이용)', description: '적법근거 없는 개인정보 수집·이용 금지', source: 'privacy' },
    { law: '개인정보보호법', article: '제34조의2 (노출된 개인정보 삭제·차단)', description: '고유식별정보, 계좌정보, 신용카드정보 등 노출 방지 의무', source: 'privacy' },
    { law: 'AI보안 가이드북', article: 'T07 민감정보 입력·유출', description: '사용자가 AI에 민감정보 입력 시 외부 유출 위험', source: 'security' },
    { law: '보안성검토 체크리스트', article: '⑦ AI시스템 입·출력 보안대책', description: '입·출력 필터링으로 민감정보 탐지·차단 필요', source: 'checklist' },
  ],
  '기밀정보': [
    { law: '국가정보보안 기본지침', article: '제15조', description: '첨단 정보통신기술 시스템 보안성검토 의무', source: 'security' },
    { law: 'N2SF (국가 망 보안체계)', article: 'C/S/O 등급분류', description: '기밀(C)등급 정보의 외부망 AI 입력 금지', source: 'security' },
    { law: 'AI보안 가이드북', article: 'T05 학습데이터 비인가자 접근', description: '권한 미보유자에게 기밀 학습데이터 노출 위험', source: 'security' },
    { law: '보안성검토 체크리스트', article: '③ 보안등급에 맞는 학습데이터 구성·활용', description: 'AI시스템 활용목적·등급에 맞는 데이터만 사용', source: 'checklist' },
  ],
  '기술정보': [
    { law: 'AI보안 가이드북', article: 'T01 학습데이터 오염', description: '오염된 데이터로 제어시스템 오동작 유도 위험', source: 'security' },
    { law: 'AI보안 가이드북', article: 'T13 AI시스템 권한관리 부실', description: 'AI가 제어시스템을 임의 조작할 위험', source: 'security' },
    { law: '보안성검토 체크리스트', article: '⑩ AI시스템 과도한 권한 부여 제한', description: '최소 권한 부여 및 담당자 검토·승인 필요', source: 'checklist' },
  ],
  '시스템정보': [
    { law: 'AI보안 가이드북', article: 'T06 AI모델 추출', description: 'AI모델 구조/가중치 등 추출 위험', source: 'security' },
    { law: 'AI보안 가이드북', article: 'T10 통신구간 공격', description: '패킷 가로채기로 인증키 탈취 위험', source: 'security' },
    { law: '보안성검토 체크리스트', article: '⑧ AI시스템 경계보안 수행', description: 'DMZ·중계서버로 접근 식별·통제 필요', source: 'checklist' },
    { law: '보안성검토 체크리스트', article: '⑨ AI시스템 통신구간 보호', description: '통신구간 암호화 등 보호조치 필요', source: 'checklist' },
  ],
  '조직정보': [
    { law: '개인정보보호법', article: '제15조 (수집·이용)', description: '목적 범위 내 최소 수집 원칙', source: 'privacy' },
    { law: '개인정보 처리 안내서', article: '데이터 전처리', description: 'AI 학습데이터의 개인정보 가명·익명처리 필요', source: 'privacy' },
  ],
  '위치정보': [
    { law: 'AI보안 가이드북', article: 'M07 보안등급에 맞는 학습데이터 구성·활용', description: '핵심 시설 위치정보는 보안등급에 따라 분류·관리', source: 'security' },
    { law: '보안성검토 체크리스트', article: '③ 보안등급에 맞는 학습데이터 구성·활용', description: '기밀·민감·공개등급 데이터 분류 활용', source: 'checklist' },
  ],
  '재무정보': [
    { law: '개인정보보호법', article: '제34조의2', description: '계좌정보, 신용카드정보 등 노출 방지 의무', source: 'privacy' },
    { law: '국가정보보안 기본지침', article: '비공개 업무자료 관리', description: '재무·계약 정보의 외부 유출 방지', source: 'security' },
    { law: '보안성검토 체크리스트', article: '④ 학습데이터 사용자 접근통제', description: '사용자, 그룹, 데이터별 최소 접근권한 부여', source: 'checklist' },
  ],
}

// ============================================================
// 위험도 임계값
// ============================================================

const THRESHOLDS: Record<SecurityLevel, number> = {
  '안전': 0,
  '경고': 15,
  '위험': 40,
  '차단': 60,
}

// ============================================================
// 검증 함수들
// ============================================================

function findPatternViolations(text: string): SecurityViolation[] {
  const violations: SecurityViolation[] = []
  for (const [patternName, rule] of Object.entries(PATTERNS)) {
    rule.regex.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = rule.regex.exec(text)) !== null) {
      violations.push({
        type: rule.type,
        description: `${patternName} 탐지`,
        matched_text: match[0],
        position: [match.index, match.index + match[0].length],
        severity: rule.severity,
      })
    }
  }
  return violations
}

function findKeywordViolations(text: string): SecurityViolation[] {
  const violations: SecurityViolation[] = []
  const textLower = text.toLowerCase()
  for (const [ruleName, rule] of Object.entries(KEYWORD_RULES)) {
    for (const keyword of rule.keywords) {
      const keywordLower = keyword.toLowerCase()
      let pos = 0
      while (true) {
        const idx = textLower.indexOf(keywordLower, pos)
        if (idx === -1) break
        violations.push({
          type: rule.type,
          description: `${ruleName}: '${keyword}' 키워드 발견`,
          matched_text: text.slice(idx, idx + keyword.length),
          position: [idx, idx + keyword.length],
          severity: rule.severity,
        })
        pos = idx + 1
      }
    }
  }
  return violations
}

function calculateRiskScore(violations: SecurityViolation[]): number {
  if (violations.length === 0) return 0
  const typeWeights: Record<ViolationType, number> = {
    '개인정보': 1.5, '기밀정보': 1.4, '시스템정보': 1.3, '기술정보': 1.2,
    '재무정보': 1.1, '조직정보': 1.0, '위치정보': 1.0,
  }
  const weightedScore = violations.reduce((sum, v) => sum + v.severity * (typeWeights[v.type] || 1.0), 0)
  const countPenalty = Math.min(violations.length * 2, 20)
  return Math.min(Math.floor(weightedScore + countPenalty), 100)
}

function determineSecurityLevel(riskScore: number): SecurityLevel {
  if (riskScore >= THRESHOLDS['차단']) return '차단'
  if (riskScore >= THRESHOLDS['위험']) return '위험'
  if (riskScore >= THRESHOLDS['경고']) return '경고'
  return '안전'
}

function sanitizePrompt(text: string, violations: SecurityViolation[]): string {
  let sanitized = text
  const sorted = [...violations].sort((a, b) => b.position[0] - a.position[0])
  for (const v of sorted) {
    const [start, end] = v.position
    sanitized = sanitized.slice(0, start) + '***' + sanitized.slice(end)
  }
  return sanitized
}

function getRegulationRefs(violations: SecurityViolation[]): RegulationReference[] {
  const seen = new Set<string>()
  const refs: RegulationReference[] = []
  for (const v of violations) {
    for (const ref of REGULATION_MAP[v.type] || []) {
      const key = `${ref.law}|${ref.article}`
      if (!seen.has(key)) {
        seen.add(key)
        refs.push(ref)
      }
    }
  }
  return refs
}

function generateRecommendation(level: SecurityLevel, violations: SecurityViolation[]): string {
  if (level === '안전') return '프롬프트를 안전하게 사용할 수 있습니다.'
  const lines: string[] = []
  if (level === '차단') lines.push('⛔ 전송 차단: 심각한 보안 위반이 탐지되었습니다.')
  else if (level === '위험') lines.push('⚠️ 전송 위험: 중대한 보안 문제가 있습니다.')
  else lines.push('⚡ 주의 필요: 보안 위험 요소가 있습니다.')

  const typeCounts: Record<string, number> = {}
  for (const v of violations) typeCounts[v.type] = (typeCounts[v.type] || 0) + 1

  lines.push(`\n탐지된 위반사항: 총 ${violations.length}건`)
  for (const [t, c] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`  - ${t}: ${c}건`)
  }
  lines.push('\n조치방법:')
  lines.push('1. 프롬프트에서 민감정보를 제거하세요')
  lines.push('2. 일반화된 표현으로 수정하세요')
  lines.push('3. 예시 데이터는 가상의 값을 사용하세요')
  return lines.join('\n')
}

// ============================================================
// 메인 검증 함수 (export)
// ============================================================

export function validatePrompt(prompt: string): ValidationResult {
  const patternViolations = findPatternViolations(prompt)
  const keywordViolations = findKeywordViolations(prompt)
  const allViolations = [...patternViolations, ...keywordViolations]

  const riskScore = calculateRiskScore(allViolations)
  const securityLevel = determineSecurityLevel(riskScore)
  const isSafe = securityLevel === '안전'
  const sanitized = sanitizePrompt(prompt, allViolations)
  const recommendation = generateRecommendation(securityLevel, allViolations)
  const regulationRefs = getRegulationRefs(allViolations)

  return {
    is_safe: isSafe,
    security_level: securityLevel,
    risk_score: riskScore,
    violations: allViolations,
    sanitized_prompt: sanitized,
    original_prompt: prompt,
    timestamp: new Date().toISOString(),
    recommendation,
    regulation_refs: regulationRefs,
  }
}
