'use client'

import { useState } from 'react'
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
  EyeOff,
  RefreshCw,
  HelpCircle,
  Zap,
  Database,
  Cloud,
  Server
} from 'lucide-react'

export default function RagSafetyPage() {
  const [checklist, setChecklist] = useState([false, false, false, false])
  const [showVolatileDemo, setShowVolatileDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  const toggleCheck = (index: number) => {
    const newChecklist = [...checklist]
    newChecklist[index] = !newChecklist[index]
    setChecklist(newChecklist)
  }

  const completedCount = checklist.filter(Boolean).length
  const allCompleted = completedCount === checklist.length

  // 휘발 데모 애니메이션
  const runVolatileDemo = () => {
    setShowVolatileDemo(true)
    setDemoStep(1)
    setTimeout(() => setDemoStep(2), 1500)
    setTimeout(() => setDemoStep(3), 3000)
    setTimeout(() => setDemoStep(4), 4500)
    setTimeout(() => {
      setDemoStep(0)
      setShowVolatileDemo(false)
    }, 6500)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      {/* 헤더 */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* 뒤로가기 & 보안 배지 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.95rem',
              opacity: 0.9
            }}
          >
            <ArrowLeft size={18} />
            메인으로 돌아가기
          </a>

          {/* KEPCO AI Security 배지 */}
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
            {/* 학습 방식 */}
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

            {/* RAG 참조 방식 */}
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
            {/* 연결선 */}
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
              { icon: <Scissors size={28} />, title: '조각화', desc: 'Chunking 처리', color: '#8b5cf6' },
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
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.25rem',
                  textAlign: 'center'
                }}>
                  {step.title}
                </h4>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* 휘발 데모 버튼 */}
          <div style={{
            marginTop: '2rem',
            textAlign: 'center'
          }}>
            <button
              onClick={runVolatileDemo}
              disabled={showVolatileDemo}
              style={{
                background: showVolatileDemo
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2rem'
                }}>
                  {/* 문서 */}
                  <motion.div
                    animate={{
                      opacity: demoStep >= 1 ? 1 : 0.3,
                      scale: demoStep === 1 ? 1.1 : 1
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FileText size={40} color="#60a5fa" />
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>문서</span>
                  </motion.div>

                  <ArrowRight size={24} color="#4b5563" />

                  {/* RAM */}
                  <motion.div
                    animate={{
                      opacity: demoStep >= 2 ? 1 : 0.3,
                      scale: demoStep === 2 ? 1.1 : 1
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <MemoryStick size={40} color="#34d399" />
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>RAM 로드</span>
                  </motion.div>

                  <ArrowRight size={24} color="#4b5563" />

                  {/* AI 응답 */}
                  <motion.div
                    animate={{
                      opacity: demoStep >= 3 ? 1 : 0.3,
                      scale: demoStep === 3 ? 1.1 : 1
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <MessageSquare size={40} color="#a78bfa" />
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>AI 응답</span>
                  </motion.div>

                  <ArrowRight size={24} color="#4b5563" />

                  {/* 삭제 (휘발) */}
                  <motion.div
                    animate={{
                      opacity: demoStep >= 4 ? 1 : 0.3,
                      scale: demoStep === 4 ? [1, 1.3, 0] : 1
                    }}
                    transition={{ duration: 0.5 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Trash2 size={40} color="#f87171" />
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                      {demoStep === 4 ? '휘발 완료!' : '메모리 삭제'}
                    </span>
                  </motion.div>
                </div>

                {demoStep === 4 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      textAlign: 'center',
                      color: '#4ade80',
                      marginTop: '1.5rem',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    데이터가 메모리에서 완전히 사라졌습니다. AI는 더 이상 해당 정보를 알지 못합니다.
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 섹션 3: 1분 보안 테스트 */}
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
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  실전 검증: 1분 보안 테스트 가이드
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  직접 따라하며 RAG의 보안성을 확인하세요
                </p>
              </div>
            </div>

            {/* 진행률 */}
            <div style={{
              background: allCompleted ? '#dcfce7' : '#f3f4f6',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: allCompleted ? '#16a34a' : '#6b7280'
              }}>
                {completedCount}/{checklist.length} 완료
              </span>
              {allCompleted && <CheckCircle2 size={18} color="#16a34a" />}
            </div>
          </div>

          {/* 체크리스트 카드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            {[
              {
                title: '1. 비밀 코드 심기',
                desc: '나만 아는 가짜 정보가 담긴 PDF를 준비하세요.',
                example: '예: "프로젝트명 \'무지개떡\'"',
                icon: <FileText size={24} />,
                color: '#3b82f6'
              },
              {
                title: '2. 참조 답변 확인',
                desc: 'RAG 시스템에 업로드 후 해당 정보를 질문하세요.',
                example: 'AI가 "무지개떡"을 언급하면 참조 성공!',
                icon: <MessageSquare size={24} />,
                color: '#8b5cf6'
              },
              {
                title: '3. 세션 초기화',
                desc: '대화창을 종료하고 새로고침하세요.',
                example: '브라우저 탭 닫기 또는 새 세션 시작',
                icon: <RefreshCw size={24} />,
                color: '#f59e0b'
              },
              {
                title: '4. 보안 확인',
                desc: '파일 없이 다시 질문하여 AI가 모른다고 답하는지 확인하세요.',
                example: '"무지개떡이 뭐야?" → "알 수 없습니다"',
                icon: <Shield size={24} />,
                color: '#10b981'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCheck(index)}
                style={{
                  background: checklist[index] ? '#f0fdf4' : '#f9fafb',
                  border: `2px solid ${checklist[index] ? '#22c55e' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                    <h4 style={{
                      fontSize: '1.05rem',
                      fontWeight: 'bold',
                      color: checklist[index] ? '#16a34a' : '#1f2937'
                    }}>
                      {item.title}
                    </h4>
                  </div>
                  {checklist[index] ? (
                    <CheckCircle2 size={24} color="#22c55e" />
                  ) : (
                    <Circle size={24} color="#d1d5db" />
                  )}
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#4b5563',
                  marginBottom: '0.5rem'
                }}>
                  {item.desc}
                </p>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#9ca3af',
                  fontStyle: 'italic'
                }}>
                  {item.example}
                </p>
              </motion.div>
            ))}
          </div>

          {/* 완료 메시지 */}
          <AnimatePresence>
            {allCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  marginTop: '1.5rem',
                  background: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
                  border: '2px solid #22c55e',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <Shield size={32} color="#16a34a" />
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#166534'
                  }}>
                    보안 검증 완료!
                  </h3>
                </div>
                <p style={{ color: '#15803d', fontSize: '1rem' }}>
                  축하합니다! RAG 시스템이 데이터를 학습하지 않고, 세션 종료 시 완전히 삭제됨을 직접 확인하셨습니다.
                </p>
                <p style={{ color: '#166534', fontSize: '0.9rem', marginTop: '0.75rem', fontWeight: '600' }}>
                  이제 안심하고 사내 문서를 AI와 함께 활용하세요!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* 푸터 안내 */}
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
