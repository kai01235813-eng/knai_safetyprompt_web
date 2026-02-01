'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  BookOpen,
  Brain,
  FileText,
  Scissors,
  MemoryStick,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Eye,
  RefreshCw,
  HelpCircle,
  Zap,
  Search,
  XCircle,
  Play,
  RotateCcw
} from 'lucide-react'

// 벡터 포인트 타입
interface VectorPoint {
  id: number
  x: number
  y: number
  value: number
  label: string
  color: string
}

// 랜덤 벡터 생성
const generateVectors = (count: number, labels: string[]): VectorPoint[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + Math.random() * 200,
    y: 30 + Math.random() * 140,
    value: Math.random(),
    label: labels[i % labels.length],
    color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5]
  }))
}

export default function RagSafetyPage() {
  // 데모 상태
  const [demoPhase, setDemoPhase] = useState(0) // 0: 대기, 1: PDF 업로드, 2: 질문, 3: 초기화, 4: 재질문
  const [vectors, setVectors] = useState<VectorPoint[]>([])
  const [queryVector, setQueryVector] = useState<{x: number, y: number} | null>(null)
  const [matchedVectors, setMatchedVectors] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResult, setShowResult] = useState<string>('')

  // 휘발 데모 상태 (섹션 2용)
  const [showVolatileDemo, setShowVolatileDemo] = useState(false)
  const [volatileStep, setVolatileStep] = useState(0)

  const documentLabels = ['프로젝트명', '무지개떡', '예산정보', '일정계획', '담당자']

  // 단계 1: PDF 업로드 시뮬레이션
  const runPhase1 = () => {
    setIsAnimating(true)
    setDemoPhase(1)
    setVectors([])
    setQueryVector(null)
    setMatchedVectors([])
    setShowResult('')

    // 벡터가 하나씩 생성되는 애니메이션
    const newVectors = generateVectors(8, documentLabels)
    newVectors.forEach((v, i) => {
      setTimeout(() => {
        setVectors(prev => [...prev, v])
        if (i === newVectors.length - 1) {
          setIsAnimating(false)
          setShowResult('PDF 문서가 벡터로 변환되었습니다. (임시 메모리에 저장)')
        }
      }, i * 300)
    })
  }

  // 단계 2: 질문 시뮬레이션
  const runPhase2 = () => {
    if (vectors.length === 0) return
    setIsAnimating(true)
    setDemoPhase(2)
    setShowResult('')

    // 질문 벡터 생성
    const qVector = { x: 150, y: 100 }
    setQueryVector(qVector)

    // 연관 벡터 찾기 (거리 기반)
    setTimeout(() => {
      const matched = vectors
        .map((v, i) => ({ i, dist: Math.sqrt((v.x - qVector.x) ** 2 + (v.y - qVector.y) ** 2) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3)
        .map(m => m.i)

      setMatchedVectors(matched)
      setIsAnimating(false)
      setShowResult('✅ "무지개떡" 정보를 찾았습니다! (벡터 유사도 검색)')
    }, 1500)
  }

  // 단계 3: 세션 초기화
  const runPhase3 = () => {
    setIsAnimating(true)
    setDemoPhase(3)
    setShowResult('')

    // 벡터들이 사라지는 애니메이션
    setTimeout(() => {
      setVectors([])
      setQueryVector(null)
      setMatchedVectors([])
      setIsAnimating(false)
      setShowResult('🗑️ 세션 종료 - 모든 벡터 데이터가 메모리에서 삭제되었습니다.')
    }, 1000)
  }

  // 단계 4: 재질문 (빈 상태)
  const runPhase4 = () => {
    setIsAnimating(true)
    setDemoPhase(4)
    setShowResult('')

    // 새 질문 벡터만 생성
    const qVector = { x: 150, y: 100 }
    setQueryVector(qVector)

    setTimeout(() => {
      setMatchedVectors([])
      setIsAnimating(false)
      setShowResult('❌ "무지개떡"에 대한 정보가 없습니다. (학습되지 않음 = 보안 확인!)')
    }, 1500)
  }

  // 전체 리셋
  const resetDemo = () => {
    setDemoPhase(0)
    setVectors([])
    setQueryVector(null)
    setMatchedVectors([])
    setShowResult('')
    setIsAnimating(false)
  }

  // 휘발 데모 (섹션 2)
  const runVolatileDemo = () => {
    setShowVolatileDemo(true)
    setVolatileStep(1)
    setTimeout(() => setVolatileStep(2), 1500)
    setTimeout(() => setVolatileStep(3), 3000)
    setTimeout(() => setVolatileStep(4), 4500)
    setTimeout(() => {
      setVolatileStep(0)
      setShowVolatileDemo(false)
    }, 6500)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <a href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.95rem',
            opacity: 0.9
          }}>
            <ArrowLeft size={18} />
            메인으로 돌아가기
          </a>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <Shield size={18} color="#4ade80" />
            <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>
              KEPCO AI Security Verified
            </span>
          </motion.div>
        </div>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <FileText size={36} />
            사내 문서(PDF) AI 활용 보안 가이드
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem' }}>
            RAG(검색 증강 생성) 기술의 보안성을 이해하고 직접 검증해보세요
          </p>
        </motion.div>

        {/* 섹션 1: 학습 vs 참조 */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px',
              padding: '0.75rem',
              display: 'flex'
            }}>
              <BookOpen size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1f2937' }}>
                개념 이해: 학습(Learning) vs 참조(Reference)
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                AI가 데이터를 다루는 두 가지 방식의 근본적인 차이
              </p>
            </div>
          </div>

          {/* 비교 테이블 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <Brain size={24} color="#dc2626" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#991b1b' }}>
                  학습 (Learning)
                </h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  '데이터가 AI 모델 내부에 영구 저장',
                  '한번 학습하면 삭제 불가능',
                  '모든 사용자에게 학습 내용 노출 가능',
                  '수개월의 재학습 필요'
                ].map((item, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    color: '#7f1d1d',
                    fontSize: '0.95rem'
                  }}>
                    <span style={{ color: '#dc2626' }}>✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              background: '#f0fdf4',
              border: '2px solid #bbf7d0',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <Eye size={24} color="#16a34a" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#166534' }}>
                  RAG 참조 (Reference)
                </h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  '필요할 때만 문서를 "읽기 전용"으로 참조',
                  '세션 종료 시 메모리에서 즉시 삭제',
                  '다른 사용자는 접근 불가 (세션 격리)',
                  '데이터 비보존(ZDR) 정책 적용'
                ].map((item, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    color: '#14532d',
                    fontSize: '0.95rem'
                  }}>
                    <span style={{ color: '#16a34a' }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 핵심 키워드 */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'center'
          }}>
            {[
              { icon: <Zap size={16} />, text: '휘발성 메모리', color: '#8b5cf6' },
              { icon: <Lock size={16} />, text: '데이터 비보존(ZDR)', color: '#3b82f6' },
              { icon: <Eye size={16} />, text: '읽기 전용 모델', color: '#10b981' },
              { icon: <Shield size={16} />, text: '세션 격리', color: '#f59e0b' }
            ].map((keyword, i) => (
              <span
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'white',
                  border: `2px solid ${keyword.color}`,
                  borderRadius: '20px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: keyword.color
                }}
              >
                {keyword.icon}
                {keyword.text}
              </span>
            ))}
          </div>
        </motion.section>

        {/* 섹션 2: 데이터 생애주기 */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              borderRadius: '12px',
              padding: '0.75rem',
              display: 'flex'
            }}>
              <RefreshCw size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1f2937' }}>
                기술 증명: 데이터 생애주기
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                문서가 업로드부터 삭제까지 거치는 과정
              </p>
            </div>
          </div>

          {/* 타임라인 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
            padding: '1rem 0'
          }}>
            <div style={{
              position: 'absolute',
              top: '45px',
              left: '10%',
              right: '10%',
              height: '4px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981, #ef4444)',
              borderRadius: '2px',
              zIndex: 0
            }} />

            {[
              { icon: <FileText size={28} />, title: '문서 업로드', desc: 'PDF/문서 선택', color: '#3b82f6' },
              { icon: <Scissors size={28} />, title: '벡터 변환', desc: 'Embedding 처리', color: '#8b5cf6' },
              { icon: <MemoryStick size={28} />, title: 'RAM 참조', desc: '임시 메모리 로드', color: '#10b981' },
              { icon: <Trash2 size={28} />, title: '즉시 삭제', desc: '세션 종료 시 Flush', color: '#ef4444' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '22%',
                  zIndex: 1
                }}
              >
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'white',
                  border: `4px solid ${step.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  boxShadow: `0 4px 15px ${step.color}40`
                }}>
                  <span style={{ color: step.color }}>{step.icon}</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem', textAlign: 'center' }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* 휘발 데모 버튼 */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={runVolatileDemo}
              disabled={showVolatileDemo}
              style={{
                background: showVolatileDemo ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: showVolatileDemo ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Sparkles size={20} />
              {showVolatileDemo ? '데모 실행 중...' : '휘발 과정 애니메이션 보기'}
            </button>
          </div>

          {/* 휘발 데모 애니메이션 */}
          <AnimatePresence>
            {showVolatileDemo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{
                  marginTop: '1.5rem',
                  background: '#1f2937',
                  borderRadius: '12px',
                  padding: '2rem',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                  <motion.div animate={{ opacity: volatileStep >= 1 ? 1 : 0.3, scale: volatileStep === 1 ? 1.1 : 1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={40} color="#60a5fa" />
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>문서</span>
                  </motion.div>
                  <ArrowRight size={24} color="#4b5563" />
                  <motion.div animate={{ opacity: volatileStep >= 2 ? 1 : 0.3, scale: volatileStep === 2 ? 1.1 : 1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <MemoryStick size={40} color="#34d399" />
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>RAM 로드</span>
                  </motion.div>
                  <ArrowRight size={24} color="#4b5563" />
                  <motion.div animate={{ opacity: volatileStep >= 3 ? 1 : 0.3, scale: volatileStep === 3 ? 1.1 : 1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={40} color="#a78bfa" />
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>AI 응답</span>
                  </motion.div>
                  <ArrowRight size={24} color="#4b5563" />
                  <motion.div animate={{ opacity: volatileStep >= 4 ? 1 : 0.3, scale: volatileStep === 4 ? [1, 1.3, 0] : 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Trash2 size={40} color="#f87171" />
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{volatileStep === 4 ? '휘발 완료!' : '메모리 삭제'}</span>
                  </motion.div>
                </div>
                {volatileStep === 4 && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', color: '#4ade80', marginTop: '1.5rem', fontSize: '1rem', fontWeight: 'bold' }}>
                    데이터가 메모리에서 완전히 사라졌습니다. AI는 더 이상 해당 정보를 알지 못합니다.
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 섹션 3: 인터랙티브 벡터 시각화 데모 */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              borderRadius: '12px',
              padding: '0.75rem',
              display: 'flex'
            }}>
              <CheckCircle2 size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1f2937' }}>
                실전 검증: 벡터 시각화 데모
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                RAG의 동작 원리를 직접 눈으로 확인하세요
              </p>
            </div>
          </div>

          {/* 단계 버튼들 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            {[
              { phase: 1, label: '1. PDF 업로드', icon: <FileText size={18} />, color: '#3b82f6', desc: '벡터 생성' },
              { phase: 2, label: '2. 질문하기', icon: <Search size={18} />, color: '#8b5cf6', desc: '유사도 검색' },
              { phase: 3, label: '3. 세션 초기화', icon: <Trash2 size={18} />, color: '#f59e0b', desc: '메모리 삭제' },
              { phase: 4, label: '4. 재질문', icon: <XCircle size={18} />, color: '#10b981', desc: '보안 확인' }
            ].map((btn) => (
              <button
                key={btn.phase}
                onClick={() => {
                  if (btn.phase === 1) runPhase1()
                  else if (btn.phase === 2) runPhase2()
                  else if (btn.phase === 3) runPhase3()
                  else if (btn.phase === 4) runPhase4()
                }}
                disabled={isAnimating || (btn.phase === 2 && vectors.length === 0) || (btn.phase === 3 && vectors.length === 0) || (btn.phase === 4 && vectors.length > 0)}
                style={{
                  padding: '1rem',
                  background: demoPhase === btn.phase
                    ? `linear-gradient(135deg, ${btn.color}, ${btn.color}dd)`
                    : '#f9fafb',
                  color: demoPhase === btn.phase ? 'white' : '#374151',
                  border: `2px solid ${demoPhase === btn.phase ? btn.color : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: isAnimating ? 'not-allowed' : 'pointer',
                  opacity: isAnimating ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  {btn.icon}
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{btn.label}</span>
                </div>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{btn.desc}</span>
              </button>
            ))}
          </div>

          {/* 벡터 시각화 캔버스 */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '1.5rem',
            position: 'relative',
            height: '280px',
            overflow: 'hidden'
          }}>
            {/* 그리드 배경 */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1 }}>
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* 축 레이블 */}
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', color: '#64748b', fontSize: '0.75rem' }}>
              Vector Dimension 2
            </div>
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', color: '#64748b', fontSize: '0.75rem' }}>
              Vector Dimension 1
            </div>

            {/* 벡터 포인트들 */}
            <AnimatePresence>
              {vectors.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: matchedVectors.includes(i) ? 1.3 : 1,
                    opacity: 1,
                    boxShadow: matchedVectors.includes(i) ? `0 0 20px ${v.color}` : 'none'
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    position: 'absolute',
                    left: v.x,
                    top: v.y,
                    width: matchedVectors.includes(i) ? '50px' : '40px',
                    height: matchedVectors.includes(i) ? '50px' : '40px',
                    borderRadius: '50%',
                    background: v.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: matchedVectors.includes(i) ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                    zIndex: matchedVectors.includes(i) ? 10 : 1
                  }}
                >
                  <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center' }}>
                    {v.label.slice(0, 3)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 질문 벡터 */}
            <AnimatePresence>
              {queryVector && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  style={{
                    position: 'absolute',
                    left: queryVector.x - 25,
                    top: queryVector.y - 25,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid white',
                    boxShadow: '0 0 30px rgba(236, 72, 153, 0.6)',
                    zIndex: 20
                  }}
                >
                  <Search size={20} color="white" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 연결선 */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
              {queryVector && matchedVectors.map((idx) => {
                const v = vectors[idx]
                if (!v) return null
                return (
                  <motion.line
                    key={idx}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    x1={queryVector.x}
                    y1={queryVector.y}
                    x2={v.x + 20}
                    y2={v.y + 20}
                    stroke="#ec4899"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )
              })}
            </svg>

            {/* 빈 상태 메시지 */}
            {demoPhase === 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <Play size={48} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p>위 버튼을 클릭하여 데모를 시작하세요</p>
              </div>
            )}

            {/* 단계 4: 빈 벡터 공간 표시 */}
            {demoPhase === 4 && vectors.length === 0 && (
              <div style={{
                position: 'absolute',
                top: '30%',
                right: '20%',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '2px dashed #ef4444',
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                color: '#fca5a5'
              }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>벡터 DB: 비어있음</p>
                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>학습된 데이터 없음</p>
              </div>
            )}
          </div>

          {/* 결과 메시지 */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: '1rem',
                  padding: '1rem 1.5rem',
                  background: demoPhase === 4 ? '#fef2f2' : demoPhase === 3 ? '#fefce8' : '#f0fdf4',
                  border: `2px solid ${demoPhase === 4 ? '#fecaca' : demoPhase === 3 ? '#fef08a' : '#bbf7d0'}`,
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: demoPhase === 4 ? '#991b1b' : demoPhase === 3 ? '#854d0e' : '#166534',
                  fontWeight: '600'
                }}
              >
                {showResult}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 리셋 버튼 */}
          {demoPhase > 0 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={resetDemo}
                style={{
                  background: 'transparent',
                  border: '2px solid #9ca3af',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                <RotateCcw size={16} />
                처음부터 다시 시작
              </button>
            </div>
          )}

          {/* 검증 완료 메시지 */}
          <AnimatePresence>
            {demoPhase === 4 && showResult.includes('보안 확인') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '1.5rem',
                  background: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Shield size={32} color="#16a34a" />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#166534' }}>
                    보안 검증 완료!
                  </h3>
                </div>
                <p style={{ color: '#15803d', fontSize: '1rem' }}>
                  RAG 시스템이 데이터를 학습하지 않고, 세션 종료 시 완전히 삭제됨을 직접 확인하셨습니다.
                </p>
                <p style={{ color: '#166534', fontSize: '0.9rem', marginTop: '0.75rem', fontWeight: '600' }}>
                  이제 안심하고 사내 문서를 AI와 함께 활용하세요!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 푸터 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem',
            marginTop: '2rem'
          }}
        >
          <p style={{ marginBottom: '0.5rem' }}>
            <HelpCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
            추가 문의사항은 AI혁신팀으로 연락해주세요.
          </p>
          <p style={{ opacity: 0.7 }}>
            KEPCO AI Security Guide v1.0
          </p>
        </motion.div>
      </div>
    </div>
  )
}
