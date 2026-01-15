'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ValidationResultProps {
  result: {
    security_level: 'SAFE' | 'WARNING' | 'DANGER' | 'BLOCKED'
    risk_score: number
    violations: Array<{
      type: string
      description: string
      matched_text: string
      severity: number
    }>
    recommendation: string
  }
}

const SECURITY_LEVEL_CONFIG = {
  SAFE: {
    label: '✅ 안전',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: '민감정보가 탐지되지 않았습니다. 안전하게 사용할 수 있습니다.',
  },
  WARNING: {
    label: '⚡ 경고',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: '주의가 필요한 정보가 포함되어 있습니다. 검토 후 사용하세요.',
  },
  DANGER: {
    label: '⚠️ 위험',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: '민감한 정보가 포함되어 있습니다. 수정 후 사용하세요.',
  },
  BLOCKED: {
    label: '⛔ 차단',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: '심각한 보안 위반이 탐지되었습니다. 전송을 차단합니다.',
  },
}

const VIOLATION_TYPE_LABELS: Record<string, string> = {
  PERSONAL_INFO: '개인정보',
  CONFIDENTIAL: '기밀정보',
  TECHNICAL_INFO: '기술정보',
  SYSTEM_INFO: '시스템정보',
  ORGANIZATION: '조직정보',
  LOCATION: '위치정보',
  FINANCIAL: '금융정보',
}

export function ValidationResult({ result }: ValidationResultProps) {
  const config = SECURITY_LEVEL_CONFIG[result.security_level]

  return (
    <Card className={`border-2 ${config.borderColor} animate-fade-in`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-3">
            <span className={`text-2xl ${config.color}`}>{config.label}</span>
            <span className="text-lg text-gray-600">검증 완료</span>
          </span>
          <span className={`text-3xl font-bold ${config.color}`}>
            {result.risk_score}/100
          </span>
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 위험도 바 */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">위험도 점수</span>
            <span className={`font-semibold ${config.color}`}>
              {result.risk_score}점
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                result.risk_score < 15
                  ? 'bg-green-500'
                  : result.risk_score < 40
                  ? 'bg-yellow-500'
                  : result.risk_score < 60
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(result.risk_score, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 (안전)</span>
            <span>50</span>
            <span>100 (위험)</span>
          </div>
        </div>

        {/* 위반사항 */}
        {result.violations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🚨</span>
              탐지된 위반사항 ({result.violations.length}개)
            </h4>
            <div className="space-y-2">
              {result.violations.map((violation, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {VIOLATION_TYPE_LABELS[violation.type] || violation.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          심각도: {violation.severity}/10
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        {violation.description}
                      </p>
                      <p className="text-xs text-gray-500 font-mono truncate">
                        탐지: "{violation.matched_text}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 권장사항 */}
        <div className={`p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor}`}>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>💡</span>
            권장사항
          </h4>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {result.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
