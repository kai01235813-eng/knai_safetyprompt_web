'use client'

import { useState } from 'react'
import SecurityRulesModal from './components/SecurityRulesModal'
import ValidationProcessModal from './components/ValidationProcessModal'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')
  const [inputType, setInputType] = useState<'text' | 'image'>('text')
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)

  const handleValidate = async () => {
    if (!prompt.trim() && !imageFile) {
      setError('프롬프트를 입력하거나 이미지를 업로드해주세요')
      return
    }

    setIsValidating(true)
    setError('')
    setResult(null)

    try {
      let response: Response

      if (inputType === 'image' && imageFile) {
        // 이미지 업로드
        const formData = new FormData()
        formData.append('image', imageFile)

        response = await fetch('/api/validate-image', {
          method: 'POST',
          body: formData,
        })
      } else {
        // 텍스트 검증
        response = await fetch('/api/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '검증 요청 실패')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || '검증 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setIsValidating(false)
    }
  }

  const getRiskColor = (level: string) => {
    // 한글 보안 등급에 맞춰 색상 매핑
    switch (level) {
      case '차단':
      case 'BLOCKED':
        return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', barColor: '#ef4444' }
      case '위험':
      case 'DANGER':
        return { bg: '#fed7aa', border: '#f97316', text: '#7c2d12', barColor: '#f97316' }
      case '경고':
      case 'WARNING':
        return { bg: '#fef3c7', border: '#f59e0b', text: '#78350f', barColor: '#f59e0b' }
      case '안전':
      case 'SAFE':
      default:
        return { bg: '#dcfce7', border: '#22c55e', text: '#14532d', barColor: '#22c55e' }
    }
  }

  const getRiskLevelText = (level: string) => {
    // 한글 그대로 반환 (이미 한글로 오는 경우)
    if (['안전', '경고', '위험', '차단'].includes(level)) {
      return level
    }
    
    // 영문인 경우 한글로 변환
    switch (level) {
      case 'BLOCKED': return '차단'
      case 'DANGER': return '위험'
      case 'WARNING': return '경고'
      default: return '안전'
    }
  }

  const getRiskEmoji = (level: string) => {
    const normalizedLevel = getRiskLevelText(level)
    switch (normalizedLevel) {
      case '차단': return '🚫'
      case '위험': return '⚠️'
      case '경고': return '⚡'
      default: return '✅'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
      {/* 헤더 */}
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h1 style={{
              fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
              fontWeight: 'bold',
              color: '#1e3a8a',
              margin: 0,
              lineHeight: 1.3
            }}>
              🛡️ AI 프롬프트 보안 검증
            </h1>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
              color: '#1e3a8a',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid #bfdbfe',
              width: 'fit-content'
            }}>
              <span style={{ fontSize: '1.1em' }}>⚡</span>
              <span>경남본부 AI혁신팀</span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {/* 탭 */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
              <button
                onClick={() => setInputType('text')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: inputType === 'text' ? '#4f46e5' : 'transparent',
                  color: inputType === 'text' ? 'white' : '#666',
                  border: 'none',
                  borderBottom: inputType === 'text' ? '3px solid #4f46e5' : 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginBottom: '-2px'
                }}
              >
                텍스트 입력
              </button>
              <button
                onClick={() => setInputType('image')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: inputType === 'image' ? '#4f46e5' : 'transparent',
                  color: inputType === 'image' ? 'white' : '#666',
                  border: 'none',
                  borderBottom: inputType === 'image' ? '3px solid #4f46e5' : 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginBottom: '-2px'
                }}
              >
                이미지 업로드
              </button>
            </div>

            {/* 입력 영역 */}
            {inputType === 'text' ? (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                  생성형AI에 전달할 프롬프트를 입력하세요
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="예: 우리 회사 직원 홍길동(010-1234-5678)의 정보를 알려줘"
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                  이미지 파일을 업로드하세요 (텍스트/이미지)
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '3rem',
                  textAlign: 'center',
                  background: '#f9fafb'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    style={{ marginBottom: '1rem' }}
                  />
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    PNG, JPG, JPEG 파일을 업로드하세요
                  </p>
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleValidate}
                disabled={isValidating}
                style={{
                  padding: '0.75rem 2rem',
                  background: isValidating ? '#9ca3af' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: isValidating ? 'not-allowed' : 'pointer',
                }}
              >
                {isValidating ? '검증 중...' : '🔍 보안 검증'}
              </button>
              <button
                onClick={() => { setPrompt(''); setResult(null); setError(''); setImageFile(null); }}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                🗑️ 초기화
              </button>
              <button
                onClick={() => setIsRulesModalOpen(true)}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'white',
                  color: '#3b82f6',
                  border: '2px solid #3b82f6',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                📋 보안규칙 확인
              </button>
              {result && (
                <button
                  onClick={() => setIsProcessModalOpen(true)}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'white',
                    color: '#10b981',
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  🔍 검증과정 보기
                </button>
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#991b1b'
              }}>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 검증 결과 */}
        {result && (
          <div>
            {/* 보안 등급 카드 */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
              <div style={{
                padding: '2rem',
                borderRadius: '12px',
                border: '3px solid',
                borderColor: getRiskColor(result.security_level).border,
                background: getRiskColor(result.security_level).bg,
              }}>
                {/* 등급 및 이모지 */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                    {getRiskEmoji(result.security_level)}
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: getRiskColor(result.security_level).text }}>
                    보안 등급: {getRiskLevelText(result.security_level)}
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: getRiskColor(result.security_level).text, fontWeight: '600' }}>
                    위험 점수: {result.risk_score}/100
                  </p>
                </div>

                {/* 위험도 프로그레스 바 */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#666'
                  }}>
                    <span>안전</span>
                    <span>위험</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '24px',
                    background: '#e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #d1d5db'
                  }}>
                    <div style={{
                      width: `${result.risk_score}%`,
                      height: '100%',
                      background: `linear-gradient(to right, ${getRiskColor(result.security_level).barColor}, ${getRiskColor(result.security_level).border})`,
                      transition: 'width 1s ease-out',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}>
                      {result.risk_score > 10 && `${result.risk_score}%`}
                    </div>
                  </div>
                  
                  {/* 위험도 레벨 표시 */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    <span>0</span>
                    <span style={{ color: result.risk_score >= 15 ? '#f59e0b' : '#9ca3af' }}>15 (경고)</span>
                    <span style={{ color: result.risk_score >= 40 ? '#f97316' : '#9ca3af' }}>40 (위험)</span>
                    <span style={{ color: result.risk_score >= 60 ? '#ef4444' : '#9ca3af' }}>60 (차단)</span>
                    <span>100</span>
                  </div>
                </div>

                {/* 위반사항 요약 */}
                {result.violations && result.violations.length > 0 && (
                  <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.7)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                      ⚠️ 총 {result.violations.length}건의 보안 위반사항이 탐지되었습니다
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      민감정보가 포함되어 있어 외부 AI 전송이 제한됩니다
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 위반사항 */}
            {result.violations && result.violations.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  🚨 탐지된 위반사항 ({result.violations.length}건)
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {result.violations.map((v: any, i: number) => (
                    <div key={i} style={{
                      padding: '1rem',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      background: '#fef2f2'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{v.type}</span>
                        <span style={{ fontSize: '0.875rem', color: '#991b1b' }}>심각도: {v.severity}/10</span>
                      </div>
                      <p style={{ color: '#7f1d1d', marginBottom: '0.25rem' }}>{v.description}</p>
                      <code style={{ fontSize: '0.875rem', background: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {v.matched_text}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 필터링된 프롬프트 */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                ✅ 안전하게 필터링된 프롬프트
              </h3>
              <div style={{
                padding: '1rem',
                background: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace'
              }}>
                {result.sanitized_prompt}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result.sanitized_prompt)}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                📋 복사하기
              </button>
            </div>

            {/* 권장사항 */}
            {result.recommendation && (
              <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#92400e' }}>
                  💡 권장사항
                </h3>
                <p style={{ color: '#78350f' }}>{result.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 모달들 */}
      <SecurityRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
      <ValidationProcessModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        result={result}
      />
    </div>
  )
}
