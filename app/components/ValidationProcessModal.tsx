'use client'

interface ValidationProcessModalProps {
  isOpen: boolean
  onClose: () => void
  result: any | null
}

export default function ValidationProcessModal({ isOpen, onClose, result }: ValidationProcessModalProps) {
  if (!isOpen || !result) return null

  const riskScore = result.risk_score || 0
  const violations = result.violations || []
  const extractedText = result.extracted_text
  const llmCorrection = result.llm_correction

  // 단계 번호 계산 (LLM 교정 여부에 따라 동적으로)
  const hasLLM = llmCorrection?.used
  const getStepNumber = (baseStep: number) => {
    if (!extractedText) return baseStep
    if (hasLLM) return baseStep + 1
    return baseStep
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* 헤더 */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'white',
          borderBottom: '2px solid #e5e7eb',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>
            🔍 검증 과정 상세 분석
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            닫기
          </button>
        </div>

        {/* 내용 */}
        <div style={{ padding: '20px' }}>

          {/* OCR 분석 (이미지 검증인 경우) */}
          {extractedText && (
            <section style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem'
                }}>1</span>
                OCR 텍스트 추출
              </h3>
              <div style={{
                padding: '15px',
                background: '#f0f9ff',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1e40af' }}>
                  추출된 텍스트:
                </div>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  color: '#374151',
                  margin: 0
                }}>
                  {extractedText}
                </pre>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                ✓ Tesseract OCR 엔진을 사용하여 이미지에서 텍스트 추출 완료
              </div>
            </section>
          )}

          {/* LLM 텍스트 교정 (Hugging Face) */}
          {extractedText && llmCorrection && (
            <section style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  background: llmCorrection.used ? '#8b5cf6' : '#9ca3af',
                  color: 'white',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem'
                }}>2</span>
                🤗 Hugging Face LLM 텍스트 교정
              </h3>

              {llmCorrection.used ? (
                <div style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  border: '2px solid #8b5cf6',
                  borderRadius: '8px'
                }}>
                  {/* 모델 정보 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '15px',
                    padding: '8px 12px',
                    background: 'white',
                    borderRadius: '6px',
                    border: '1px solid #c4b5fd'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🤖</span>
                    <span style={{ fontWeight: 'bold', color: '#6d28d9' }}>모델:</span>
                    <code style={{
                      background: '#ede9fe',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: '#5b21b6'
                    }}>
                      {llmCorrection.model}
                    </code>
                    <span style={{
                      marginLeft: 'auto',
                      background: '#22c55e',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      신뢰도: {(llmCorrection.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* 원본 vs 교정 비교 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#991b1b', fontSize: '0.9rem' }}>
                        ❌ 원본 OCR (오타 포함)
                      </div>
                      <div style={{
                        padding: '10px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        maxHeight: '150px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {llmCorrection.original_ocr_text}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#166534', fontSize: '0.9rem' }}>
                        ✅ LLM 교정 완료
                      </div>
                      <div style={{
                        padding: '10px',
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        maxHeight: '150px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {llmCorrection.corrected_text}
                      </div>
                    </div>
                  </div>

                  {/* 교정 내역 */}
                  {llmCorrection.corrections && llmCorrection.corrections.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#6d28d9', fontSize: '0.9rem' }}>
                        📝 교정 내역 ({llmCorrection.corrections.length}건)
                      </div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        {llmCorrection.corrections.slice(0, 10).map((corr: any, i: number) => (
                          <div key={i} style={{
                            padding: '4px 10px',
                            background: 'white',
                            border: '1px solid #c4b5fd',
                            borderRadius: '20px',
                            fontSize: '0.8rem'
                          }}>
                            <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{corr.original}</span>
                            <span style={{ margin: '0 4px' }}>→</span>
                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{corr.corrected}</span>
                          </div>
                        ))}
                        {llmCorrection.corrections.length > 10 && (
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            +{llmCorrection.corrections.length - 10}건 더
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 추출된 필드 */}
                  {llmCorrection.extracted_fields && Object.keys(llmCorrection.extracted_fields).some(k => llmCorrection.extracted_fields[k]) && (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#6d28d9', fontSize: '0.9rem' }}>
                        📋 자동 추출된 필드
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '8px'
                      }}>
                        {Object.entries(llmCorrection.extracted_fields)
                          .filter(([_, value]) => value)
                          .map(([key, value]: [string, any]) => (
                            <div key={key} style={{
                              padding: '6px 10px',
                              background: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '0.8rem'
                            }}>
                              <span style={{ color: '#6b7280' }}>{key}:</span>{' '}
                              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{value}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#7c3aed' }}>
                    ✓ Hugging Face Inference API를 통해 전력산업 도메인 특화 텍스트 교정 완료
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '15px',
                  background: '#f9fafb',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  color: '#6b7280'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                    <span>LLM 텍스트 교정 미사용</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '8px' }}>
                    {llmCorrection.reason || llmCorrection.error || 'HF_API_KEY 환경변수가 설정되지 않았습니다'}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 패턴/키워드 탐지 */}
          <section style={{ marginBottom: '30px' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem'
              }}>{extractedText ? (hasLLM ? '3' : '2') : '1'}</span>
              패턴 및 키워드 탐지
            </h3>
            <div style={{
              padding: '15px',
              background: violations.length > 0 ? '#fef2f2' : '#f0fdf4',
              border: `2px solid ${violations.length > 0 ? '#ef4444' : '#22c55e'}`,
              borderRadius: '8px'
            }}>
              {violations.length === 0 ? (
                <div style={{ color: '#166534', fontWeight: 'bold' }}>
                  ✓ 민감정보가 탐지되지 않았습니다
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#991b1b' }}>
                    ⚠️ 총 {violations.length}건의 위반사항이 탐지되었습니다
                  </div>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {violations.map((v: any, i: number) => (
                      <div key={i} style={{
                        padding: '10px',
                        background: 'white',
                        border: '1px solid #fecaca',
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontWeight: 'bold', color: '#dc2626' }}>
                            [{v.type}] {v.description}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                            심각도: {v.severity}/10
                          </span>
                        </div>
                        <code style={{
                          fontSize: '0.875rem',
                          background: '#fee2e2',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {v.matched_text}
                        </code>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* 위험도 점수 계산 */}
          <section style={{ marginBottom: '30px' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem'
              }}>{extractedText ? (hasLLM ? '4' : '3') : '2'}</span>
              위험도 점수 계산
            </h3>
            <div style={{
              padding: '15px',
              background: '#f9fafb',
              border: '2px solid #d1d5db',
              borderRadius: '8px'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '5px' }}>
                  기본 점수 (각 위반의 심각도 합계):
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {violations.reduce((sum: number, v: any) => sum + v.severity, 0)}점
                </div>
              </div>

              {violations.length > 0 && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '5px' }}>
                      유형별 가중치 적용:
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                      {Array.from(new Set(violations.map((v: any) => v.type))).map((type: any) => (
                        <div key={type}>• {type}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '5px' }}>
                      위반 건수 페널티:
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                      {violations.length}건 × 2 = {Math.min(violations.length * 2, 20)}점
                    </div>
                  </div>
                </>
              )}

              <div style={{
                paddingTop: '15px',
                borderTop: '2px solid #d1d5db',
                marginTop: '15px'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '5px' }}>
                  최종 위험도 점수:
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {riskScore} / 100
                </div>
              </div>
            </div>
          </section>

          {/* 보안 등급 결정 */}
          <section>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem'
              }}>{extractedText ? (hasLLM ? '5' : '4') : '3'}</span>
              최종 보안 등급 결정
            </h3>
            <div style={{
              padding: '20px',
              background: riskScore >= 60 ? '#fef2f2' : riskScore >= 40 ? '#fff7ed' : riskScore >= 15 ? '#fefce8' : '#f0fdf4',
              border: `3px solid ${riskScore >= 60 ? '#ef4444' : riskScore >= 40 ? '#f97316' : riskScore >= 15 ? '#f59e0b' : '#22c55e'}`,
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                {riskScore >= 60 ? '🚫' : riskScore >= 40 ? '⚠️' : riskScore >= 15 ? '⚡' : '✅'}
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: riskScore >= 60 ? '#991b1b' : riskScore >= 40 ? '#9a3412' : riskScore >= 15 ? '#78350f' : '#14532d',
                marginBottom: '10px'
              }}>
                {result.security_level}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                {riskScore < 15 && '전송 허용 - 생성형AI 사용 가능'}
                {riskScore >= 15 && riskScore < 40 && '재검토 필요 - 내용 수정 권장'}
                {riskScore >= 40 && riskScore < 60 && '민감정보 제거 필수'}
                {riskScore >= 60 && '전송 금지 - 생성형AI 사용 불가'}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
