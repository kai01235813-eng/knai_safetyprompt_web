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
  const [isIntroExpanded, setIsIntroExpanded] = useState(false)

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
              fontWeight: 'bold',
              color: '#1e3a8a',
              margin: 0,
              lineHeight: 1.3
            }}>
              🛡️ 생성형 AI 프롬프트 보안 검증
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
              color: '#3b82f6',
              fontWeight: '600'
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
            {/* 서비스 소개 & RAG 가이드 버튼 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <button
                  onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span>💡 서비스 소개</span>
                  <span style={{
                    fontSize: '0.85rem',
                    padding: '0.2rem 0.4rem',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px'
                  }}>
                    {isIntroExpanded ? '접기' : 'Click'}
                  </span>
                </button>
                <a
                  href="/rag-safety"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span>📄 RAG 보안 가이드</span>
                  <span style={{
                    fontSize: '0.85rem',
                    padding: '0.2rem 0.4rem',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px'
                  }}>
                    NEW
                  </span>
                </a>
              </div>

              {isIntroExpanded && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  color: 'white'
                }}>
                  <h2 style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    💡 이 서비스는 무엇인가요?
                  </h2>
                  <p style={{
                    fontSize: '1rem',
                    lineHeight: '1.8',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    생성형 AI(ChatGPT, Claude 등)를 업무에 활용할 때 <strong>민감정보가 포함되어 있는지 자동으로 검증</strong>하는 서비스입니다.
                    <br />
                    개인정보, 기밀정보, 시스템 정보 등이 포함된 프롬프트를 AI에 전송하기 전에 사전 차단하여 정보 유출을 방지합니다.
                  </p>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      marginBottom: '0.75rem',
                      textAlign: 'center'
                    }}>
                      📌 사용 방법
                    </h3>
                    <ol style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.8',
                      paddingLeft: '1.5rem',
                      margin: 0
                    }}>
                      <li>아래 탭에서 <strong>텍스트 입력</strong> 또는 <strong>이미지 업로드</strong>를 선택하세요</li>
                      <li>생성형 AI에 전달할 프롬프트를 입력하거나 이미지를 업로드하세요</li>
                      <li><strong>🔍 보안 검증</strong> 버튼을 클릭하여 민감정보 포함 여부를 확인하세요</li>
                      <li>검증 결과를 확인하고 <strong>안전하게 필터링된 프롬프트</strong>를 복사하여 AI에 사용하세요</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', justifyContent: 'center' }}>
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
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151', textAlign: 'center' }}>
                  생성형AI에 전달할 프롬프트를 입력하세요
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="예: 데이터 기반 배전선로 휴전 및 부하 전환 예측모델, 송변전 SCADA 고장전류 예측시스템을 업무망에서 구현할 수 있는지 알려줘 (서버IP정보 : 192.168.1.1)"
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
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151', textAlign: 'center' }}>
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
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                color: '#991b1b',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* 보안서약서 (검증 전에만 표시) */}
            {!result && (
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: '#f0f9ff',
                border: '2px solid #3b82f6',
                borderRadius: '12px'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  📋 보안서약서
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#1e40af',
                  marginBottom: '1rem',
                  lineHeight: '1.6',
                  textAlign: 'center'
                }}>
                  생성형AI 서비스를 업무에 활용함에 있어 아래의 보안수칙을 준수하여 안전한 사용 문화 정착에 적극 동참하여 주시기 바랍니다.
                </p>
                <ol style={{
                  fontSize: '0.9rem',
                  color: '#1e40af',
                  lineHeight: '1.8',
                  paddingLeft: '1.5rem',
                  margin: 0
                }}>
                  <li>민감한 정보(非공개 정보, 개인정보 등) 입력을 금지하겠습니다.</li>
                  <li>업무 보조 목적으로만 활용하고 개인 용도로 사용을 자제하겠습니다.</li>
                  <li>생성물에 대한 정확성·윤리성·적합성 등 재검증 후 활용하겠습니다.</li>
                  <li>생성물 활용 시 지적 재산권·저작권 등 법률 침해·위반 여부를 확인하겠습니다.</li>
                  <li>데이터 오남용 방지를 위해 과도 사용시 시간당 질의 건수 제한에 동의합니다.</li>
                  <li>사용자입력 데이터의 민감 정보 포함 여부 필터링 및 결과 모니터링에 동의합니다.</li>
                  <li>사용자입력 데이터 및 서비스 응답 로그의 일정기간 수집·저장에 동의합니다.</li>
                </ol>
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
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
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button
                  onClick={() => navigator.clipboard.writeText(result.sanitized_prompt)}
                  style={{
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
            </div>

            {/* 권장사항 */}
            {result.recommendation && (
              <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
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
