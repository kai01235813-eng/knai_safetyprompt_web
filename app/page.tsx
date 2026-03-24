'use client'

import { useState, useEffect } from 'react'
import SecurityRulesModal from './components/SecurityRulesModal'
import ValidationProcessModal from './components/ValidationProcessModal'

interface UserSession {
  nickname: string
  role: 'admin' | 'team' | 'staff' | 'guest'
  isAdmin: boolean
  profileId?: string
}

const STORAGE_KEY = 'safety_prompt_user'

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
  const [ocrText, setOcrText] = useState('')
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  // 인증 상태
  const [user, setUser] = useState<UserSession | null>(null)
  const [loginNickname, setLoginNickname] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // 세션 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setUser(JSON.parse(saved))
    } catch {}
  }, [])

  const handleLogin = async () => {
    if (!loginNickname.trim() || !loginCode.trim()) {
      setLoginError('닉네임과 멤버코드를 모두 입력해주세요')
      return
    }
    setIsLoggingIn(true)
    setLoginError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: loginNickname.trim(), memberCode: loginCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || '로그인 실패')
        return
      }
      const session: UserSession = {
        nickname: data.user.nickname,
        role: data.user.role,
        isAdmin: data.user.isAdmin,
        profileId: data.user.profile?.id,
      }
      setUser(session)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch (err) {
      setLoginError('서버 연결 오류')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleValidate = async () => {
    if (!prompt.trim() && !imageFile) {
      setError('프롬프트를 입력하거나 이미지를 업로드해주세요')
      return
    }

    setIsValidating(true)
    setError('')
    setResult(null)

    try {
      let textToValidate = prompt

      // 이미지 모드: 로컬 OCR 서버에서 텍스트 추출 후 검증
      if (inputType === 'image' && imageFile) {
        setOcrStatus('loading')
        setOcrText('')

        const ocrForm = new FormData()
        ocrForm.append('image', imageFile)

        let ocrRes: Response
        try {
          ocrRes = await fetch('/api/ocr', { method: 'POST', body: ocrForm })
        } catch {
          setOcrStatus('error')
          throw new Error('OCR 서버에 연결할 수 없습니다. 사내 서버에서 실행 중인지 AI혁신팀에 문의해주세요.')
        }

        if (!ocrRes.ok) {
          setOcrStatus('error')
          const errData = await ocrRes.json().catch(() => ({}))
          throw new Error(errData.error || 'OCR 처리 실패')
        }

        const ocrData = await ocrRes.json()
        if (!ocrData.extracted_text || ocrData.extracted_text.trim().length === 0) {
          setOcrStatus('error')
          throw new Error('이미지에서 텍스트를 추출하지 못했습니다. 텍스트가 포함된 이미지를 업로드해주세요.')
        }

        textToValidate = ocrData.extracted_text
        setOcrText(textToValidate)
        setOcrStatus('done')
      }

      // 텍스트 보안 검증
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToValidate,
          nickname: user?.nickname,
          profileId: user?.profileId,
        }),
      })

      if (!response.ok) {
        let errorMessage = '검증 요청 실패'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {}
        throw new Error(errorMessage)
      }

      let data
      try {
        data = await response.json()
      } catch {
        throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.')
      }
      if (inputType === 'image') {
        data.ocr_extracted_text = textToValidate
      }
      setResult(data)
    } catch (err: any) {
      setError(err.message || '검증 중 오류가 발생했습니다')
    } finally {
      setIsValidating(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case '차단': case 'BLOCKED': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', barColor: '#ef4444' }
      case '위험': case 'DANGER': return { bg: '#fed7aa', border: '#f97316', text: '#7c2d12', barColor: '#f97316' }
      case '경고': case 'WARNING': return { bg: '#fef3c7', border: '#f59e0b', text: '#78350f', barColor: '#f59e0b' }
      default: return { bg: '#dcfce7', border: '#22c55e', text: '#14532d', barColor: '#22c55e' }
    }
  }

  const getRiskLevelText = (level: string) => {
    if (['안전', '경고', '위험', '차단'].includes(level)) return level
    switch (level) {
      case 'BLOCKED': return '차단'
      case 'DANGER': return '위험'
      case 'WARNING': return '경고'
      default: return '안전'
    }
  }

  const getRiskEmoji = (level: string) => {
    switch (getRiskLevelText(level)) {
      case '차단': return '\u{1F6AB}'
      case '위험': return '\u26A0\uFE0F'
      case '경고': return '\u26A1'
      default: return '\u2705'
    }
  }

  const ROLE_LABELS: Record<string, string> = {
    admin: 'ADMIN', team: '팀원', staff: '직원', guest: '기타',
  }

  // 로그인 화면
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', maxWidth: '420px', width: '90%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{'\u{1F6E1}\uFE0F'}</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>
              생성형 AI 프롬프트 보안 검증
            </h1>
            <p style={{ color: '#3b82f6', fontWeight: '600', fontSize: '0.95rem' }}>
              {'\u26A1'} 경남본부 AI혁신팀
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              KNAI-ZONE 계정으로 로그인하세요
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>닉네임</label>
              <input
                type="text"
                value={loginNickname}
                onChange={(e) => setLoginNickname(e.target.value)}
                placeholder="KNAI-ZONE 닉네임"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px',
                  fontSize: '1rem', outline: 'none', transition: 'border 0.2s',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>멤버코드</label>
              <input
                type="password"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                placeholder="멤버코드 입력"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px',
                  fontSize: '1rem', outline: 'none', transition: 'border 0.2s',
                }}
              />
            </div>

            {loginError && (
              <div style={{ padding: '0.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              style={{
                width: '100%', padding: '0.85rem', background: isLoggingIn ? '#9ca3af' : '#4f46e5',
                color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold',
                cursor: isLoggingIn ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
              }}
            >
              {isLoggingIn ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 메인 검증 화면
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
      {/* 헤더 */}
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h1 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', fontWeight: 'bold', color: '#1e3a8a', margin: 0, lineHeight: 1.3 }}>
                {'\u{1F6E1}\uFE0F'} 생성형 AI 프롬프트 보안 검증
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', color: '#3b82f6', fontWeight: '600' }}>
                <span>{'\u26A1'}</span>
                <span>경남본부 AI혁신팀</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)', padding: '0.5rem 1rem',
                borderRadius: '24px', border: '2px solid #bfdbfe', fontSize: '0.85rem',
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e',
                  boxShadow: '0 0 6px #22c55e',
                }} />
                <span style={{ fontWeight: 'bold', color: '#1e40af' }}>{user.nickname}</span>
                <span style={{
                  background: user.isAdmin ? '#ef4444' : '#3b82f6',
                  color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold',
                }}>
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
              {user.isAdmin && (
                <a href="/admin" style={{
                  padding: '0.4rem 0.8rem', background: '#1e293b', color: 'white', borderRadius: '12px',
                  textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold',
                }}>
                  {'\u{1F4CA}'} 관리자
                </a>
              )}
              <a href="/logs" style={{
                padding: '0.4rem 0.8rem', background: '#475569', color: 'white', borderRadius: '12px',
                textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold',
              }}>
                {'\u{1F4CB}'} 내 이력
              </a>
              <button onClick={handleLogout} style={{
                padding: '0.4rem 0.8rem', background: 'white', color: '#6b7280', border: '1px solid #d1d5db',
                borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer',
              }}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 퀵 네비게이션 */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.5rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {([
            { href: '/rag-safety', label: 'RAG 활용가이드', color: '#10b981', icon: '\u{1F4C4}', isNew: true },
            { href: '/regulations', label: '법규 가이드라인', color: '#f59e0b', icon: '\u{1F4CB}', isNew: true },
            { href: '/logs', label: '검증 이력 (팀원 이상)', color: '#3b82f6', icon: '\u{1F4CA}', isNew: false },
          ] as const).map(item => (
            <a key={item.href} href={item.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem',
              background: `${item.color}10`, color: item.color, borderRadius: '20px',
              textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600',
              border: `1px solid ${item.color}30`, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = item.color; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = `${item.color}10`; e.currentTarget.style.color = item.color }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.isNew && <span style={{ fontSize: '0.6rem', background: item.color, color: 'white', padding: '1px 5px', borderRadius: '4px' }}>NEW</span>}
            </a>
          ))}
        </div>
      </nav>

      {/* 메인 */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {/* 서비스 소개 버튼 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                style={{
                  width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <span>{'\u{1F4A1}'} 서비스 소개</span>
                <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                  {isIntroExpanded ? '접기' : 'Click'}
                </span>
              </button>

              {isIntroExpanded && (
                <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                    {'\u{1F4A1}'} 이 서비스는 무엇인가요?
                  </h2>
                  <p style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '1rem', textAlign: 'center' }}>
                    생성형 AI(ChatGPT, Claude 등)를 업무에 활용할 때 <strong>민감정보가 포함되어 있는지 자동으로 검증</strong>하는 서비스입니다.
                    <br />
                    개인정보, 기밀정보, 시스템 정보 등이 포함된 프롬프트를 AI에 전송하기 전에 사전 차단하여 정보 유출을 방지합니다.
                  </p>
                  <div style={{ background: 'rgba(255, 255, 255, 0.2)', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.75rem', textAlign: 'center' }}>
                      {'\u{1F4CC}'} 사용 방법
                    </h3>
                    <ol style={{ fontSize: '0.95rem', lineHeight: '1.8', paddingLeft: '1.5rem', margin: 0 }}>
                      <li>아래 탭에서 <strong>텍스트 입력</strong> 또는 <strong>이미지 업로드</strong>를 선택하세요</li>
                      <li>생성형 AI에 전달할 프롬프트를 입력하거나 이미지를 업로드하세요</li>
                      <li><strong>{'\u{1F50D}'} 보안 검증</strong> 버튼을 클릭하여 민감정보 포함 여부를 확인하세요</li>
                      <li>검증 결과를 확인하고 <strong>안전하게 필터링된 프롬프트</strong>를 복사하여 AI에 사용하세요</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* 검증 방식 선택 */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <button
                onClick={() => setInputType('text')}
                style={{
                  padding: '0.75rem 2rem',
                  background: inputType === 'text' ? '#4f46e5' : '#f1f5f9',
                  color: inputType === 'text' ? 'white' : '#64748b',
                  border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
                  borderRadius: '8px 0 0 8px',
                }}
              >
                {'\u{1F4DD}'} 텍스트 검증
              </button>
              <button
                onClick={() => setInputType('image')}
                style={{
                  padding: '0.75rem 2rem',
                  background: inputType === 'image' ? '#4f46e5' : '#f1f5f9',
                  color: inputType === 'image' ? 'white' : '#64748b',
                  border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
                  borderRadius: '0 8px 8px 0',
                }}
              >
                {'\u{1F5BC}\uFE0F'} 이미지 검증
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
                  style={{ width: '100%', minHeight: '200px', padding: '1rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151', textAlign: 'center' }}>
                  이미지 파일을 업로드하세요 (OCR로 텍스트 추출 후 보안 검증)
                </label>
                <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '3rem', textAlign: 'center', background: '#f9fafb' }}>
                  <input type="file" accept="image/*" onChange={(e) => { setImageFile(e.target.files?.[0] || null); setOcrStatus('idle'); setOcrText('') }} style={{ marginBottom: '1rem' }} />
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>PNG, JPG, JPEG 파일을 업로드하세요</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    사내 OCR 서버(EasyOCR)로 처리 - 외부 전송 없음
                  </p>
                </div>
                <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.78rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>ℹ️</span>
                  <span>
                    이미지 OCR은 사내 서버에서 처리됩니다 (외부 전송 없음). 사내망에서 접속해야 이용 가능합니다. 접속 방법은 <strong>경남본부 AI혁신팀</strong>에 문의해주세요.
                  </span>
                </div>
                {ocrStatus === 'loading' && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', textAlign: 'center', color: '#1e40af', fontSize: '0.9rem' }}>
                    OCR 텍스트 추출 중... (이미지 크기에 따라 수초 소요)
                  </div>
                )}
                {ocrStatus === 'done' && ocrText && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#15803d', marginBottom: '0.5rem' }}>
                      추출된 텍스트 ({ocrText.length}자)
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#374151', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto', background: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                      {ocrText}
                    </div>
                  </div>
                )}
                {ocrStatus === 'error' && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', textAlign: 'center', color: '#991b1b', fontSize: '0.85rem' }}>
                    OCR 서버 연결 실패 - 사내망에서 접속하거나 경남본부 AI혁신팀에 문의해주세요
                  </div>
                )}
              </div>
            )}

            {/* 버튼 */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={handleValidate} disabled={isValidating} style={{
                padding: '0.75rem 2rem', background: isValidating ? '#9ca3af' : '#4f46e5', color: 'white',
                border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold',
                cursor: isValidating ? 'not-allowed' : 'pointer',
              }}>
                {isValidating ? '검증 중...' : '\u{1F50D} 보안 검증'}
              </button>
              <button onClick={() => { setPrompt(''); setResult(null); setError(''); setImageFile(null); }} style={{
                padding: '0.75rem 2rem', background: 'white', color: '#6b7280', border: '2px solid #e5e7eb',
                borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
              }}>
                {'\u{1F5D1}\uFE0F'} 초기화
              </button>
              <button onClick={() => setIsRulesModalOpen(true)} style={{
                padding: '0.75rem 2rem', background: 'white', color: '#3b82f6', border: '2px solid #3b82f6',
                borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
              }}>
                {'\u{1F4CB}'} 보안규칙 확인
              </button>
              {result && (
                <button onClick={() => setIsProcessModalOpen(true)} style={{
                  padding: '0.75rem 2rem', background: 'white', color: '#10b981', border: '2px solid #10b981',
                  borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                }}>
                  {'\u{1F50D}'} 검증과정 보기
                </button>
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {/* 보안서약서 */}
            {!result && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0f9ff', border: '2px solid #3b82f6', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '1rem', textAlign: 'center' }}>
                  {'\u{1F4CB}'} 보안서약서
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#1e40af', marginBottom: '1rem', lineHeight: '1.6', textAlign: 'center' }}>
                  생성형AI 서비스를 업무에 활용함에 있어 아래의 보안수칙을 준수하여 안전한 사용 문화 정착에 적극 동참하여 주시기 바랍니다.
                </p>
                <ol style={{ fontSize: '0.9rem', color: '#1e40af', lineHeight: '1.8', paddingLeft: '1.5rem', margin: 0 }}>
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

        {/* 참고자료 섹션은 헤더 아래 네비게이션 바로 이동됨 */}

        {/* 검증 결과 */}
        {result && (
          <div>
            {/* 보안 등급 카드 */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
              <div style={{
                padding: '2rem', borderRadius: '12px', border: '3px solid',
                borderColor: getRiskColor(result.security_level).border,
                background: getRiskColor(result.security_level).bg,
              }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{getRiskEmoji(result.security_level)}</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: getRiskColor(result.security_level).text }}>
                    보안 등급: {getRiskLevelText(result.security_level)}
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: getRiskColor(result.security_level).text, fontWeight: '600' }}>
                    위험 점수: {result.risk_score}/100
                  </p>
                </div>

                {/* 위험도 프로그레스 바 */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                    <span>안전</span><span>위험</span>
                  </div>
                  <div style={{ width: '100%', height: '24px', background: '#e5e7eb', borderRadius: '12px', overflow: 'hidden', border: '2px solid #d1d5db' }}>
                    <div style={{
                      width: `${result.risk_score}%`, height: '100%',
                      background: `linear-gradient(to right, ${getRiskColor(result.security_level).barColor}, ${getRiskColor(result.security_level).border})`,
                      transition: 'width 1s ease-out', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      paddingRight: '0.5rem', color: 'white', fontWeight: 'bold', fontSize: '0.875rem',
                    }}>
                      {result.risk_score > 10 && `${result.risk_score}%`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                    <span>0</span>
                    <span style={{ color: result.risk_score >= 15 ? '#f59e0b' : '#9ca3af' }}>15 (경고)</span>
                    <span style={{ color: result.risk_score >= 40 ? '#f97316' : '#9ca3af' }}>40 (위험)</span>
                    <span style={{ color: result.risk_score >= 60 ? '#ef4444' : '#9ca3af' }}>60 (차단)</span>
                    <span>100</span>
                  </div>
                </div>

                {result.violations && result.violations.length > 0 && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.7)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                      {'\u26A0\uFE0F'} 총 {result.violations.length}건의 보안 위반사항이 탐지되었습니다
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>민감정보가 포함되어 있어 외부 AI 전송이 제한됩니다</div>
                  </div>
                )}
              </div>
            </div>

            {/* 위반사항 + 법규 매핑 */}
            {result.violations && result.violations.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                  {'\u{1F6A8}'} 탐지된 위반사항 ({result.violations.length}건)
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {result.violations.map((v: any, i: number) => {
                    const matchedRefs = (result.regulation_refs || []).filter((r: any) => {
                      const typeRegMap: Record<string, string[]> = {
                        '개인정보': ['개인정보보호법', 'T07', '⑦'],
                        '기밀정보': ['국가정보보안', 'N2SF', 'T05', '③'],
                        '기술정보': ['T01', 'T13', '⑩'],
                        '시스템정보': ['T06', 'T10', '⑧', '⑨'],
                        '조직정보': ['개인정보보호법', '개인정보 처리'],
                        '위치정보': ['M07', '③'],
                        '재무정보': ['제34조', '비공개', '④'],
                      }
                      const keywords = typeRegMap[v.type] || []
                      return keywords.some((kw: string) => r.law?.includes(kw) || r.article?.includes(kw))
                    })
                    return (
                      <div key={i} style={{ border: '1px solid #fecaca', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', background: '#fef2f2' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{v.type}</span>
                            <span style={{ fontSize: '0.875rem', color: '#991b1b' }}>심각도: {v.severity}/10</span>
                          </div>
                          <p style={{ color: '#7f1d1d', marginBottom: '0.25rem' }}>{v.description}</p>
                          <code style={{ fontSize: '0.875rem', background: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                            {v.matched_text}
                          </code>
                        </div>
                        {matchedRefs.length > 0 && (
                          <div style={{ padding: '0.75rem 1rem', background: '#eff6ff', borderTop: '1px solid #fecaca' }}>
                            <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                              위반 관련 법규/가이드라인:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {matchedRefs.slice(0, 3).map((r: any, ri: number) => {
                                const srcColor: Record<string, string> = { privacy: '#3b82f6', security: '#f59e0b', checklist: '#22c55e' }
                                return (
                                  <div key={ri} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ background: srcColor[r.source] || '#94a3b8', color: 'white', padding: '1px 6px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 'bold', flexShrink: 0 }}>
                                      {r.source === 'privacy' ? '개인정보' : r.source === 'security' ? 'AI보안' : '체크리스트'}
                                    </span>
                                    <span style={{ color: '#1e40af', fontWeight: '600' }}>{r.law}</span>
                                    <span style={{ color: '#64748b' }}>{r.article}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 필터링된 프롬프트 */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                {'\u2705'} 안전하게 필터링된 프롬프트
              </h3>
              <div style={{ padding: '1rem', background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                {result.sanitized_prompt}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button onClick={() => navigator.clipboard.writeText(result.sanitized_prompt)} style={{
                  padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
                }}>
                  {'\u{1F4CB}'} 복사하기
                </button>
              </div>
            </div>

            {/* 관련 법규 참조 */}
            {result.regulation_refs && result.regulation_refs.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
                  {'\u{1F4CB}'} 관련 법규 및 가이드라인
                </h3>
                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  탐지된 위반사항에 해당하는 법규 보안위협 체크리스트 항목
                </p>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {result.regulation_refs.map((ref: any, i: number) => {
                    const sourceColors: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
                      privacy: { bg: '#eff6ff', border: '#3b82f6', badge: '#3b82f6', badgeText: '개인정보보호' },
                      security: { bg: '#fefce8', border: '#f59e0b', badge: '#f59e0b', badgeText: 'AI보안' },
                      checklist: { bg: '#f0fdf4', border: '#22c55e', badge: '#22c55e', badgeText: '체크리스트' },
                    }
                    const sc = sourceColors[ref.source] || sourceColors.security
                    return (
                      <div key={i} style={{ padding: '12px 16px', background: sc.bg, borderLeft: `4px solid ${sc.border}`, borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ background: sc.badge, color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>{sc.badgeText}</span>
                          <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.9rem' }}>{ref.law}</span>
                        </div>
                        <div style={{ color: '#374151', fontSize: '0.85rem', fontWeight: '600', marginBottom: '2px' }}>{ref.article}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{ref.description}</div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <a href="/regulations" style={{ color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'underline' }}>
                    전체 법규 가이드라인 상세 보기 {'\u2192'}
                  </a>
                </div>
              </div>
            )}

            {/* 권장사항 */}
            {result.recommendation && (
              <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#92400e' }}>
                  {'\u{1F4A1}'} 권장사항
                </h3>
                <p style={{ color: '#78350f', whiteSpace: 'pre-line' }}>{result.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 모달들 */}
      <SecurityRulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
      <ValidationProcessModal isOpen={isProcessModalOpen} onClose={() => setIsProcessModalOpen(false)} result={result} />
    </div>
  )
}
