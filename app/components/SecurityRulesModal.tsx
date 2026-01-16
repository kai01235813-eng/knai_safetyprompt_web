'use client'

interface SecurityRulesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SecurityRulesModal({ isOpen, onClose }: SecurityRulesModalProps) {
  if (!isOpen) return null

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
        maxWidth: '1000px',
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
            📋 보안 검증 규칙 및 기준
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
        <div style={{ padding: '20px', lineHeight: '1.8' }}>

          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
              1. 검증 목적
            </h3>
            <ul style={{ paddingLeft: '20px', color: '#4b5563' }}>
              <li>생성형AI 사용 시 민감정보 유출 방지</li>
              <li>외부 서버로 전송되는 프롬프트의 보안성 검토</li>
              <li>개인정보보호법, 정보보안 규정 준수</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
              2. 위반 유형 (7가지)
            </h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {[
                { type: '개인정보', risk: '최고', examples: '주민번호, 여권번호, 전화번호, 이메일' },
                { type: '기밀정보', risk: '최고', examples: '대외비, 비밀, 극비 문서' },
                { type: '기술정보', risk: '높음', examples: 'SCADA, EMS, 전력망 구성' },
                { type: '시스템정보', risk: '높음', examples: 'IP주소, 비밀번호, API키' },
                { type: '조직정보', risk: '중간', examples: '임직원 실명, 부서명' },
                { type: '위치정보', risk: '중간', examples: '변전소/발전소 상세 위치' },
                { type: '재무정보', risk: '중간', examples: '구체적 금액, 계약정보' }
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '15px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' }}>
                    {item.type} <span style={{
                      fontSize: '0.875rem',
                      color: item.risk === '최고' ? '#ef4444' : item.risk === '높음' ? '#f97316' : '#f59e0b',
                      marginLeft: '8px'
                    }}>(위험도: {item.risk})</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    예시: {item.examples}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
              3. 보안 등급 기준
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                { level: '안전', range: '0-14점', color: '#22c55e', action: '전송 허용 - 생성형AI 사용 가능' },
                { level: '경고', range: '15-39점', color: '#f59e0b', action: '재검토 필요 - 내용 수정 권장' },
                { level: '위험', range: '40-59점', color: '#f97316', action: '민감정보 제거 필수' },
                { level: '차단', range: '60-100점', color: '#ef4444', action: '전송 금지 - AI 사용 불가' }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9fafb',
                  border: `2px solid ${item.color}`,
                  borderRadius: '8px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: '80px',
                    fontWeight: 'bold',
                    color: item.color
                  }}>
                    {item.level}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.875rem', color: '#4b5563' }}>
                    {item.range} - {item.action}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
              4. 위험도 점수 계산 방식
            </h3>
            <div style={{
              padding: '15px',
              background: '#eff6ff',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#1e40af'
            }}>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>최종 점수</strong> = (각 위반사항의 심각도 × 유형별 가중치) + 위반 건수 페널티
              </p>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>유형별 가중치:</strong> 개인정보 ×1.5, 기밀정보 ×1.4, 시스템정보 ×1.3, 기술정보 ×1.2
              </p>
              <p style={{ margin: 0 }}>
                <strong>건수 페널티:</strong> 위반건수 × 2 (최대 20점)
              </p>
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
              5. 법적 근거
            </h3>
            <ul style={{ paddingLeft: '20px', color: '#6b7280', fontSize: '0.875rem' }}>
              <li>개인정보 보호법</li>
              <li>정보통신망 이용촉진 및 정보보호 등에 관한 법률</li>
              <li>위치정보의 보호 및 이용 등에 관한 법률</li>
              <li>한국전력공사 정보보안 규정</li>
              <li>한국전력공사 개인정보 보호지침</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  )
}
