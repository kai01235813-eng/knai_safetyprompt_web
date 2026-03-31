'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Package,
  Search,
  FileCheck,
  Lock,
  Users,
  Building2,
  AlertTriangle,
  BookOpen,
  Download,
  Hash,
  Globe,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Layers,
  Eye
} from 'lucide-react'

// ─── 단계 데이터 ───
interface Step {
  id: number
  title: string
  who: '사용자부서' | '보안부서' | '공통'
  whoColor: string
  icon: any
  description: string
  details: string[]
  reference: string
  referenceDetail: string
  tools?: string[]
}

const STEPS: Step[] = [
  {
    id: 1,
    title: '사용 라이브러리 목록 작성',
    who: '사용자부서',
    whoColor: '#3b82f6',
    icon: Package,
    description: '개발에 사용한 오픈소스 라이브러리의 이름, 버전, 출처를 목록으로 정리합니다.',
    details: [
      '라이브러리 이름과 정확한 버전 기록',
      '다운로드한 출처 URL 기록 (예: pypi.org, npmjs.com)',
      '각 라이브러리의 용도를 간단히 기술',
    ],
    reference: 'M11',
    referenceDetail: 'AI시스템 구성요소 명세서 관리 — AI모델, 학습데이터, 라이브러리 등 구성요소에 대한 출처, 버전, 변경이력, 해시값 등을 형상관리',
    tools: [
      'Python: pip freeze > requirements.txt',
      'Node.js: npm list --all > dependencies.txt',
    ],
  },
  {
    id: 2,
    title: '공식 출처 여부 확인',
    who: '사용자부서',
    whoColor: '#3b82f6',
    icon: Globe,
    description: '각 라이브러리가 공식 사이트 또는 공인된 저장소에서 다운로드되었는지 확인합니다.',
    details: [
      '공식 패키지 저장소 사용 여부 확인 (PyPI, npm, Maven Central 등)',
      '배포자(개발사/개인)의 신뢰성 확인',
      '비공식 경로(개인 블로그, 출처불명 파일 등) 사용 금지',
    ],
    reference: 'M02',
    referenceDetail: '신뢰할 수 있는 출처의 AI모델·라이브러리 활용 — 오픈소스 AI모델·라이브러리·소프트웨어 등은 공식 사이트 등 신뢰성을 보장할 수 있는 출처를 통해서만 사용',
  },
  {
    id: 3,
    title: '해시값 추출 및 기록',
    who: '사용자부서',
    whoColor: '#3b82f6',
    icon: Hash,
    description: '다운로드한 라이브러리 파일의 SHA-256 해시값을 추출하여 기록합니다.',
    details: [
      '라이브러리 파일(.whl, .tar.gz, .tgz 등)의 SHA-256 해시값 생성',
      '공식 사이트에 게시된 해시값과 비교하여 일치 여부 확인',
      '해시값 비교 결과를 목록에 함께 기재',
    ],
    reference: 'M02 / M12',
    referenceDetail: '사용 전 배포자 전자서명과 해시값 검증 등을 통해 무결성을 검증 / AI시스템 구성요소 무결성 검증 — 원본과 동일한지 검증',
    tools: [
      'Windows: certutil -hashfile 파일명 SHA256',
      'Python: pip hash 파일명',
      'Linux/Mac: sha256sum 파일명',
    ],
  },
  {
    id: 4,
    title: '알려진 취약점 확인',
    who: '사용자부서',
    whoColor: '#3b82f6',
    icon: Search,
    description: '사용하려는 라이브러리에 공개된 보안 취약점(CVE)이 있는지 확인합니다.',
    details: [
      '취약점 스캔 도구를 실행하여 결과 보고서 생성',
      '발견된 취약점의 심각도(Critical/High/Medium/Low) 확인',
      '심각한 취약점이 있는 경우 대체 라이브러리 검토 또는 패치 버전 사용',
    ],
    reference: 'M25',
    referenceDetail: 'AI시스템 구성요소 취약점 점검 및 보안업데이트 — 소프트웨어, 라이브러리, 네트워크 구조 등에 대한 취약점을 점검하고 보안패치',
    tools: [
      'Python: pip-audit (취약점 자동 검출)',
      'Node.js: npm audit (취약점 자동 검출)',
    ],
  },
  {
    id: 5,
    title: '반입 신청서 작성 및 제출',
    who: '사용자부서',
    whoColor: '#3b82f6',
    icon: ClipboardCheck,
    description: '위 1~4단계 결과를 종합하여 반입 신청서를 작성하고 보안부서에 제출합니다.',
    details: [
      '라이브러리 목록 + 출처 확인 결과 + 해시값 + 취약점 스캔 보고서를 첨부',
      '사용 목적과 반입 사유를 명시',
      '보안부서 검토 요청',
    ],
    reference: 'M02 / M11',
    referenceDetail: '배포 경로와 배포자를 함께 검증하여 신뢰할 수 있는 출처에서 획득 / 구성요소에 대한 출처, 버전, 변경이력, 해시값 등을 형상관리',
  },
  {
    id: 6,
    title: '신청서 검토 및 출처 확인',
    who: '보안부서',
    whoColor: '#ef4444',
    icon: Eye,
    description: '사용자부서가 제출한 신청서의 출처 정보를 검토하고 신뢰성을 확인합니다.',
    details: [
      '라이브러리 출처가 공식 저장소(PyPI, npm 등)인지 확인',
      '배포자가 검증된 기관/개인인지 확인',
      '비공식 출처 사용 건이 있을 경우 반려 또는 추가 소명 요청',
    ],
    reference: 'M01 / M02',
    referenceDetail: '신뢰할 수 있는 출처의 데이터 활용 — 데이터 배포처(플랫폼)와 배포자(제공 주체)의 신뢰성을 함께 검증 / 신뢰할 수 있는 출처의 AI모델·라이브러리 활용',
  },
  {
    id: 7,
    title: '해시값 대조 확인',
    who: '보안부서',
    whoColor: '#ef4444',
    icon: FileCheck,
    description: '사용자부서가 기록한 해시값이 공식 사이트의 해시값과 일치하는지 대조합니다.',
    details: [
      '신청서에 기재된 해시값을 공식 사이트 해시값과 비교',
      '불일치 시 파일 변조 가능성을 판단하고 반려 처리',
      '일치 확인 후 검증 완료 기록',
    ],
    reference: 'M12',
    referenceDetail: 'AI시스템 구성요소 무결성 검증 — AI모델, 학습데이터, 라이브러리 등 구성요소가 원본과 동일한지 검증',
  },
  {
    id: 8,
    title: '취약점 보고서 검토 및 승인',
    who: '보안부서',
    whoColor: '#ef4444',
    icon: CheckCircle2,
    description: '취약점 스캔 결과를 검토하고, 문제가 없으면 반입을 승인합니다.',
    details: [
      '취약점 보고서에서 Critical/High 등급 취약점이 있는지 확인',
      '심각한 취약점이 있는 경우 반려 처리 및 대안 요청',
      '문제 없을 경우 반입 승인 및 기록 관리',
    ],
    reference: 'M25',
    referenceDetail: 'AI시스템 구성요소 취약점 점검 및 보안업데이트 — 정기적으로 취약점을 점검·확인하고 보안업데이트를 실시',
  },
]

// ─── 향후 확장 항목 ───
const FUTURE_ITEMS = [
  {
    id: 'M03',
    title: '데이터 검사 자동화',
    description: '반입 데이터에 악성코드·AI백도어 포함 여부를 자동으로 검사하는 체계',
    reference: 'M03 데이터 검사',
  },
  {
    id: 'M04',
    title: '데이터 암호화 저장',
    description: '반입된 학습데이터를 암호화하여 저장소에 보관하는 체계',
    reference: 'M04 데이터 암호화',
  },
  {
    id: 'M05',
    title: '데이터 접근통제 체계',
    description: '사용자·그룹·데이터별 최소 권한 부여 및 접근 이력 관리',
    reference: 'M05 데이터 접근통제',
  },
  {
    id: 'M08',
    title: '데이터 로깅·모니터링',
    description: '원시·학습데이터에 대한 접근·변경 행위를 기록하고 정기 분석하는 체계',
    reference: 'M08 데이터 로깅·모니터링',
  },
  {
    id: 'M10',
    title: '데이터 수집 명세서 관리',
    description: '수집한 데이터셋의 출처, 일자, 수집 방법·경로, 규모, 해시값 등을 기록하여 관리하는 체계',
    reference: 'M10 데이터 수집 명세서 관리',
  },
]

// ─── 본 시스템 보안성 평가 데이터 ───
interface AssessmentItem {
  code: string
  title: string
  status: '충족' | '부분충족'
  currentState: string
  gap?: string
}

// 카테고리 1: 본 도구(프롬프트 검증 시스템)가 직접 충족하는 항목
const TOOL_ASSESSMENT: AssessmentItem[] = [
  {
    code: 'M09',
    title: '입·출력 로깅·모니터링',
    status: '충족',
    currentState: '사용자의 AI 프롬프트 입·출력, 접속이력, 위험점수, 위반유형, 응답시간 등을 DB에 실시간 기록하고, 검증 이력(/logs) 및 관리자 대시보드(/admin)에서 분석·조회 가능',
  },
  {
    code: 'M13',
    title: '입·출력 필터링',
    status: '충족',
    currentState: '21개 탐지 패턴(주민번호, 여권번호, 신용카드, IP, API키 등)을 통해 7개 위반 유형의 민감정보를 자동 탐지하고, 위반 심각도(0~10)를 산출하여 차단 여부 판정',
  },
  {
    code: 'M30',
    title: '사용자 교육 및 보안정책 수립',
    status: '충족',
    currentState: 'RAG 보안 가이드(/rag-safety), 법규 매핑(/regulations), SW반입 가이드(/import-guide) 등 교육 페이지를 운영하여 AI 활용 시 보안 인식 제고',
  },
  {
    code: 'M14',
    title: '입력 길이·형식 제한',
    status: '부분충족',
    currentState: '프롬프트 입력 길이 제한 및 기본적인 형식 검증을 수행',
    gap: '프롬프트 인젝션 등 공격 패턴에 대한 탐지·차단 규칙 강화 필요',
  },
  {
    code: 'M05',
    title: '접근통제 (도구 사용자)',
    status: '충족',
    currentState: '역할별(admin/team/staff/guest) 권한 분리, 로그 열람은 team 이상 제한, 관리자 페이지는 admin 전용으로 접근통제',
  },
]

// 카테고리 2: 기관에서 AI시스템을 직접 구축할 때 적용해야 할 항목
interface FutureAIItem {
  code: string
  title: string
  description: string
  when: string
}

const AI_SYSTEM_ITEMS: FutureAIItem[] = [
  {
    code: 'M10',
    title: '데이터 수집 명세서 관리',
    description: '수집한 데이터셋의 출처, 일자, 수집 방법·경로, 규모, 해시값 등을 기록하여 이력 관리',
    when: 'AI모델 학습용 데이터를 수집·구성할 때',
  },
  {
    code: 'M11',
    title: 'AI시스템 구성요소 명세서 관리',
    description: 'AI모델, 학습데이터, 라이브러리 등 구성요소에 대한 출처·버전·해시값 등을 형상관리',
    when: 'AI모델을 도입하거나 학습 인프라를 구축할 때',
  },
  {
    code: 'M12',
    title: 'AI시스템 구성요소 무결성 검증',
    description: 'AI모델, 학습데이터, 라이브러리 등이 원본과 동일한지 정기적으로 검증',
    when: 'AI모델을 운영 환경에 배포·업데이트할 때',
  },
  {
    code: 'M08',
    title: '학습데이터 로깅·모니터링',
    description: '원시·학습데이터 저장소에 대한 접근·변경 행위를 로그로 기록하고 정기 분석',
    when: 'AI모델의 학습데이터를 저장·관리하는 체계를 운영할 때',
  },
  {
    code: 'M15',
    title: '가드레일 다중화',
    description: 'AI모델 입력·동작·출력 각 단계에 복수의 보호장치를 계층적으로 배치',
    when: '생성형 AI를 대민서비스 등에 직접 활용할 때',
  },
  {
    code: 'M18',
    title: 'AI시스템 통신구간 보호',
    description: '사용자-AI시스템 또는 AI시스템-타 시스템 통신구간에 암호화 등 보호조치 적용',
    when: 'AI시스템을 내·외부망과 연계하여 운영할 때',
  },
]

export default function ImportGuidePage() {
  const [currentStep, setCurrentStep] = useState(0) // 0 = 개요, 1~8 = 각 단계
  const [expandedRef, setExpandedRef] = useState<number | null>(null)

  const goNext = () => {
    if (currentStep < STEPS.length) setCurrentStep(prev => prev + 1)
  }
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1a4a6e 100%)',
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
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.25)'
            }}
          >
            <Shield size={18} color="#60a5fa" />
            <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>
              국가정보원 AI보안 가이드북 기반
            </span>
          </motion.div>
        </div>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <Lock size={32} />
            오픈소스 라이브러리 내부망 반입 보안검증 가이드
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: '1.6' }}>
            인터넷망에서 개발한 SW를 사내망으로 반입할 때,<br />
            사용자부서와 보안부서가 각각 수행해야 할 검증 절차를 안내합니다.
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.8rem',
            marginTop: '0.5rem'
          }}>
            근거: 국가정보원 「국가·공공기관 AI보안 가이드북」 (2025.12)
          </p>
        </motion.div>

        {/* 진행률 바 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
              {currentStep === 0 ? '개요' : `${currentStep} / ${STEPS.length} 단계`}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
              {currentStep === 0 ? '' : STEPS[currentStep - 1].who}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                onClick={() => setCurrentStep(i + 1)}
                style={{
                  flex: 1,
                  height: '8px',
                  borderRadius: '4px',
                  background: i + 1 <= currentStep
                    ? step.whoColor
                    : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
          {/* 범례 */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#3b82f6', display: 'inline-block' }} />
              사용자부서(개발자)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444', display: 'inline-block' }} />
              보안부서
            </span>
          </div>
        </motion.div>

        {/* 메인 컨텐츠 */}
        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            /* ─── 개요 화면 ─── */
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 왜 필요한가 */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '1.5rem',
              }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={24} color="#f59e0b" />
                  왜 보안검증이 필요한가요?
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { title: '공급망 공격 위험', desc: '오픈소스 라이브러리에 악성코드나 백도어가 삽입되어 배포된 사례가 다수 존재합니다.', color: '#ef4444' },
                    { title: '취약점 악용', desc: '알려진 취약점(CVE)이 있는 라이브러리를 사용하면 시스템이 공격에 노출됩니다.', color: '#f59e0b' },
                    { title: '위변조 파일 유입', desc: '비공식 경로로 받은 파일은 원본과 다르게 변조되었을 수 있습니다.', color: '#ef4444' },
                    { title: '관리 이력 부재', desc: '어떤 라이브러리를 사용했는지 기록이 없으면 사고 발생 시 추적이 불가합니다.', color: '#f59e0b' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: `1px solid ${item.color}30`,
                        background: `${item.color}08`,
                      }}
                    >
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: item.color, marginBottom: '0.3rem' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 전체 프로세스 요약 */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '1.5rem',
              }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={24} color="#3b82f6" />
                  검증 프로세스 전체 흐름
                </h2>

                {/* 사용자부서 영역 */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem',
                    padding: '0.5rem 1rem', background: '#3b82f610', borderRadius: '8px', border: '1px solid #3b82f630'
                  }}>
                    <Users size={18} color="#3b82f6" />
                    <span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '0.95rem' }}>사용자부서 (개발자)</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>— 자료 준비 및 신청</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {STEPS.filter(s => s.who === '사용자부서').map((step, i) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        onClick={() => setCurrentStep(step.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.5rem 0.8rem', borderRadius: '8px',
                          background: '#3b82f610', border: '1px solid #3b82f625',
                          cursor: 'pointer', fontSize: '0.82rem', color: '#1e40af',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#3b82f610'; e.currentTarget.style.color = '#1e40af' }}
                      >
                        <span style={{ fontWeight: 'bold' }}>{step.id}.</span>
                        {step.title}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 화살표 */}
                <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#94a3b8', fontSize: '1.5rem' }}>▼ 제출</div>

                {/* 보안부서 영역 */}
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem',
                    padding: '0.5rem 1rem', background: '#ef444410', borderRadius: '8px', border: '1px solid #ef444430'
                  }}>
                    <Building2 size={18} color="#ef4444" />
                    <span style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '0.95rem' }}>보안부서</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>— 검토 및 승인</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {STEPS.filter(s => s.who === '보안부서').map((step, i) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        onClick={() => setCurrentStep(step.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.5rem 0.8rem', borderRadius: '8px',
                          background: '#ef444410', border: '1px solid #ef444425',
                          cursor: 'pointer', fontSize: '0.82rem', color: '#b91c1c',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ef444410'; e.currentTarget.style.color = '#b91c1c' }}
                      >
                        <span style={{ fontWeight: 'bold' }}>{step.id}.</span>
                        {step.title}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 시작 버튼 */}
              <div style={{ textAlign: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goNext}
                  style={{
                    padding: '1rem 2.5rem',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.05rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  단계별 상세 보기
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ─── 각 단계 상세 ─── */
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                const step = STEPS[currentStep - 1]
                const StepIcon = step.icon
                return (
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                  }}>
                    {/* 단계 헤더 */}
                    <div style={{
                      background: `linear-gradient(135deg, ${step.whoColor}, ${step.whoColor}cc)`,
                      padding: '1.5rem 2rem',
                      color: 'white',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          background: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px',
                          fontSize: '0.8rem', fontWeight: 'bold'
                        }}>
                          {step.who === '사용자부서' ? <Users size={14} /> : <Building2 size={14} />}
                          {step.who}
                        </span>
                        <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>STEP {step.id} / {STEPS.length}</span>
                      </div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <StepIcon size={28} />
                        {step.title}
                      </h2>
                      <p style={{ fontSize: '0.95rem', opacity: 0.9, marginTop: '0.5rem', lineHeight: '1.5' }}>
                        {step.description}
                      </p>
                    </div>

                    {/* 상세 내용 */}
                    <div style={{ padding: '1.5rem 2rem' }}>
                      {/* 수행 항목 */}
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={18} color={step.whoColor} />
                        수행 항목
                      </h3>
                      <div style={{ marginBottom: '1.5rem' }}>
                        {step.details.map((detail, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              padding: '0.75rem 1rem',
                              background: i % 2 === 0 ? '#f8fafc' : 'white',
                              borderRadius: '8px',
                              marginBottom: '0.25rem',
                            }}
                          >
                            <span style={{
                              minWidth: '24px', height: '24px', borderRadius: '50%',
                              background: `${step.whoColor}15`, color: step.whoColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 'bold',
                            }}>
                              {i + 1}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>{detail}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* 실무 도구 (있는 경우) */}
                      {step.tools && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          style={{
                            padding: '1rem',
                            background: '#f0f9ff',
                            borderRadius: '10px',
                            border: '1px solid #bae6fd',
                            marginBottom: '1.5rem',
                          }}
                        >
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0369a1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Lightbulb size={16} />
                            실무 TIP — 활용 가능한 명령어/도구
                          </h4>
                          {step.tools.map((tool, i) => (
                            <div key={i} style={{
                              padding: '0.4rem 0.75rem',
                              background: 'white',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              color: '#334155',
                              fontFamily: 'monospace',
                              marginBottom: '0.25rem',
                              border: '1px solid #e0f2fe',
                            }}>
                              {tool}
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {/* 근거 조항 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                          padding: '1rem',
                          background: '#fffbeb',
                          borderRadius: '10px',
                          border: '1px solid #fde68a',
                          cursor: 'pointer',
                        }}
                        onClick={() => setExpandedRef(expandedRef === step.id ? null : step.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <BookOpen size={16} />
                            근거: AI보안 가이드북 {step.reference}
                          </h4>
                          {expandedRef === step.id ? <ChevronUp size={16} color="#92400e" /> : <ChevronDown size={16} color="#92400e" />}
                        </div>
                        <AnimatePresence>
                          {expandedRef === step.id && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: '1.6', marginTop: '0.5rem', overflow: 'hidden' }}
                            >
                              {step.referenceDetail}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </div>
                )
              })()}

              {/* 네비게이션 버튼 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1.5rem',
              }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goPrev}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <ArrowLeft size={18} />
                  {currentStep === 1 ? '개요로' : '이전 단계'}
                </motion.button>

                {currentStep < STEPS.length ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goNext}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: STEPS[currentStep]?.whoColor === '#ef4444'
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    다음 단계
                    <ArrowRight size={18} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(0)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    처음으로
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── 본 시스템(프롬프트 검증 도구) 보안성 평가 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            marginTop: '2rem',
          }}
        >
          <h3 style={{
            fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <ClipboardCheck size={24} color="#6366f1" />
            본 시스템 보안성 평가
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem', lineHeight: '1.5' }}>
            본 <strong>프롬프트 보안검증 도구</strong>가 AI보안 가이드북의 보안대책을 어느 수준까지 충족하고 있는지 평가한 결과입니다.
          </p>
          <p style={{
            fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5',
            padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0',
          }}>
            ※ 본 시스템은 AI모델을 학습·운영하는 "AI시스템"이 아니라, 사용자가 AI에 입력하는 프롬프트의 보안을 검증하는 <strong>보안 지원 도구</strong>입니다.
            따라서 AI시스템 구축 시 적용하는 항목(M10, M11, M12 등)은 본 도구의 평가 대상이 아니며, 별도로 안내합니다.
          </p>

          {/* 요약 점수 */}
          {(() => {
            const total = TOOL_ASSESSMENT.length
            const met = TOOL_ASSESSMENT.filter(a => a.status === '충족').length
            const partial = TOOL_ASSESSMENT.filter(a => a.status === '부분충족').length
            const score = Math.round(((met * 1 + partial * 0.5) / total) * 100)
            return (
              <div style={{
                display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
              }}>
                <div style={{
                  flex: '1 1 180px', padding: '1rem', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{score}%</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>충족률</div>
                </div>
                {[
                  { label: '충족', count: met, color: '#10b981', bg: '#10b98115' },
                  { label: '부분충족', count: partial, color: '#f59e0b', bg: '#f59e0b15' },
                ].map(s => (
                  <div key={s.label} style={{
                    flex: '1 1 120px', padding: '1rem', borderRadius: '12px',
                    background: s.bg, border: `1px solid ${s.color}30`, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: s.color }}>{s.count}</div>
                    <div style={{ fontSize: '0.8rem', color: s.color, fontWeight: '600' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* 평가 항목 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {TOOL_ASSESSMENT.map((item, i) => {
              const statusConfig = {
                '충족': { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅' },
                '부분충족': { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '🔶' },
              }[item.status]

              return (
                <motion.div
                  key={item.code}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '10px',
                    background: statusConfig.bg,
                    border: `1px solid ${statusConfig.border}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <span style={{
                        background: `${statusConfig.color}20`, color: statusConfig.color,
                        padding: '0.15rem 0.5rem', borderRadius: '4px',
                        fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap',
                      }}>
                        {item.code}
                      </span>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b' }}>{item.title}</span>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.2rem 0.6rem', borderRadius: '20px',
                      background: `${statusConfig.color}15`, color: statusConfig.color,
                      fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap',
                      border: `1px solid ${statusConfig.color}30`,
                    }}>
                      {statusConfig.icon} {item.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.5', marginBottom: item.gap ? '0.4rem' : '0' }}>
                    {item.currentState}
                  </p>
                  {item.gap && (
                    <p style={{ fontSize: '0.78rem', color: statusConfig.color, lineHeight: '1.4', fontStyle: 'italic' }}>
                      → 보완: {item.gap}
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ─── 기관 AI시스템 구축 시 적용 항목 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            marginTop: '1.5rem',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <h3 style={{
            fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <Building2 size={20} color="#94a3b8" />
            기관에서 AI시스템을 직접 구축할 때 적용해야 할 항목
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginBottom: '1rem', lineHeight: '1.5' }}>
            아래 항목은 AI모델을 직접 학습·운영하는 AI시스템을 구축할 때 적용하는 보안대책입니다.<br />
            본 프롬프트 검증 도구와는 적용 범위가 다르며, 향후 기관의 AI시스템 구축 사업 시 참고하시기 바랍니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {AI_SYSTEM_ITEMS.map((item, i) => (
              <motion.div
                key={item.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    background: 'rgba(148,163,184,0.25)', color: '#94a3b8',
                    padding: '0.15rem 0.5rem', borderRadius: '4px',
                    fontSize: '0.7rem', fontWeight: 'bold',
                  }}>
                    {item.code}
                  </span>
                  <span style={{ color: 'white', fontSize: '0.88rem', fontWeight: '600' }}>{item.title}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4', marginBottom: '0.25rem' }}>
                  {item.description}
                </p>
                <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.35)', lineHeight: '1.3' }}>
                  적용 시점: {item.when}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── 향후 보완 필요사항 섹션 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            marginTop: '1.5rem',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <h3 style={{
            fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <Lightbulb size={20} color="#fbbf24" />
            향후 보완이 필요한 영역
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', lineHeight: '1.5' }}>
            현재 가이드는 M01(신뢰할 수 있는 출처의 데이터), M02(신뢰할 수 있는 출처의 라이브러리) 검증에 초점을 두고 있습니다.<br />
            아래 항목은 보안 체계가 안정화된 후 순차적으로 도입을 검토할 수 있는 보안대책입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {FUTURE_ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    background: 'rgba(251,191,36,0.2)',
                    color: '#fbbf24',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                  }}>
                    {item.id}
                  </span>
                  <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>{item.title}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 출처 */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.75rem',
          lineHeight: '1.6',
        }}>
          <p>본 가이드는 국가정보원 「국가·공공기관 AI보안 가이드북」 (2025.12, v2.0)을 근거로 작성되었습니다.</p>
          <p>M01: 신뢰할 수 있는 출처의 데이터 활용 | M02: 신뢰할 수 있는 출처의 AI모델·라이브러리 활용</p>
          <p>M11: AI시스템 구성요소 명세서 관리 | M12: AI시스템 구성요소 무결성 검증 | M25: 취약점 점검 및 보안업데이트</p>
        </div>
      </div>
    </div>
  )
}
