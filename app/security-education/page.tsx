'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trophy,
  RotateCcw,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Eye,
  Lock,
  UserX,
  Server,
  FileWarning,
  HelpCircle,
  Target,
  Lightbulb,
  BookOpen,
  Package,
  Settings,
  EyeOff,
  Unlink,
  KeyRound,
} from 'lucide-react'

/* ───────────────────────────── 퀴즈 데이터 ───────────────────────────── */

interface QuizItem {
  prompt: string
  isSafe: boolean
  category: string
  explanation: string
}

const quizData: QuizItem[] = [
  {
    prompt: '김철수(010-1234-5678)의 3월 전기요금을 조회해줘',
    isSafe: false,
    category: '개인정보',
    explanation: '이름 + 전화번호가 프롬프트에 그대로 포함되어 있습니다. 개인을 식별할 수 있는 정보는 절대 AI에 입력하지 마세요.',
  },
  {
    prompt: '변압기 정기점검 절차를 알려줘',
    isSafe: true,
    category: '일반업무',
    explanation: '일반적인 업무 절차 질문으로, 민감정보가 전혀 포함되지 않았습니다. 안전합니다.',
  },
  {
    prompt: '한국전력 경남본부 배전부 올해 예산 12억 3천만원 중 AI 투자 비용을 분석해줘',
    isSafe: false,
    category: '사내기밀',
    explanation: '특정 기관명(한국전력) + 부서명(경남본부 배전부) + 구체적 예산 금액(12억)이 모두 프롬프트에 포함되어 있어 사내 기밀이 특정됩니다.',
  },
  {
    prompt: '영어 이메일 작성을 도와줘. "회의 일정 변경 요청" 내용으로',
    isSafe: true,
    category: '일반업무',
    explanation: '구체적인 수신자나 민감한 회의 내용이 없는 일반적인 요청입니다. 안전합니다.',
  },
  {
    prompt: '사번 20240315 박영희 과장의 인사평가 결과를 요약해줘',
    isSafe: false,
    category: '개인정보',
    explanation: '사번(20240315) + 실명(박영희) + 인사평가 결과까지, 특정인의 민감한 인사정보가 프롬프트에 그대로 담겨있습니다.',
  },
  {
    prompt: '프레젠테이션 만들 때 효과적인 슬라이드 구성 방법을 알려줘',
    isSafe: true,
    category: '일반업무',
    explanation: '업무 스킬 향상을 위한 일반적인 질문입니다. 민감정보가 없으므로 안전합니다.',
  },
  {
    prompt: '경남본부 내부감사 결과 보고서를 요약해줘:\n- 계약업체 A사 리베이트 의혹\n- 경리팀 회계 부정 3건 발견...',
    isSafe: false,
    category: '사내기밀',
    explanation: '내부감사 결과, 리베이트 의혹, 회계 부정 등 조직 내부의 민감한 감사 정보가 구체적으로 포함되어 있습니다.',
  },
  {
    prompt: '보고서 작성할 때 표와 그래프를 효과적으로 배치하는 방법을 알려줘',
    isSafe: true,
    category: '일반업무',
    explanation: '문서 작성 기법에 대한 일반적인 질문입니다. 안전합니다.',
  },
  {
    prompt: '이과장(lee.kwang@kepco.co.kr) 내년 승진 대상자 명단에 포함됐는지 확인해줘',
    isSafe: false,
    category: '개인정보',
    explanation: '실명 + 사내 이메일 주소 + 승진 대상 여부까지, 특정인의 인사정보가 프롬프트에 노출되어 있습니다.',
  },
  {
    prompt: '회의록 작성 양식과 잘 쓰는 팁을 알려줘',
    isSafe: true,
    category: '일반업무',
    explanation: '양식/팁에 대한 일반적인 질문으로, 민감정보가 포함되지 않았습니다.',
  },
  {
    prompt: '한전 사내시스템 로그인 ID: admin2024 / 비밀번호: Kepco#2024! 인데 접속이 안 돼. 왜 그럴까?',
    isSafe: false,
    category: '시스템정보',
    explanation: '사내시스템의 실제 로그인 ID와 비밀번호가 프롬프트에 그대로 노출되어 있습니다. 유출 시 시스템 해킹 위험이 있습니다.',
  },
  {
    prompt: '업무용 메모를 깔끔하게 정리하는 방법을 알려줘',
    isSafe: true,
    category: '일반업무',
    explanation: '일반적인 업무 스킬 질문입니다. 안전합니다.',
  },
  {
    prompt: '삼성SDI와 체결한 전력공급 계약서 내용인데 단가 150원/kWh, 위약금 조항 3조를 검토해줘',
    isSafe: false,
    category: '사내기밀',
    explanation: '실제 거래처명(삼성SDI) + 구체적 계약 단가 + 위약금 조항까지, 사업상 기밀 계약 내용이 프롬프트에 포함되어 있습니다.',
  },
  {
    prompt: '고객 민원 응대할 때 좋은 표현과 나쁜 표현 예시를 알려줘',
    isSafe: true,
    category: '일반업무',
    explanation: '일반적인 고객 응대 기법 질문입니다. 특정 고객정보가 없으므로 안전합니다.',
  },
]

/* ──────────────────────────── 분류 게임 데이터 ──────────────────────────── */

interface ClassifyCard {
  text: string
  category: 'safe' | 'personal' | 'confidential' | 'system'
  label: string
}

const classifyCards: ClassifyCard[] = [
  { text: '홍길동, 주민번호 901215-1XXXXXX', category: 'personal', label: '개인정보' },
  { text: '사내시스템 접속 비밀번호: Kepco#2024!', category: 'system', label: '시스템정보' },
  { text: '엑셀에서 표 만드는 방법', category: 'safe', label: '안전' },
  { text: '한국전력 2025년 매출액 3,200억 달성 내부 전략 보고서', category: 'confidential', label: '사내기밀' },
  { text: '회의록 작성 양식 예시', category: 'safe', label: '안전' },
  { text: 'VPN 접속 계정: admin / Pass1234!', category: 'system', label: '시스템정보' },
  { text: '이메일: park.yh@kepco.co.kr', category: 'personal', label: '개인정보' },
  { text: '한전KDN 대비 당사 입찰가격 비교 내부 문서', category: 'confidential', label: '사내기밀' },
  { text: '비즈니스 이메일 잘 쓰는 방법', category: 'safe', label: '안전' },
  { text: '삼성SDI 전력공급 계약 단가 150원/kWh, 3년 장기계약', category: 'confidential', label: '사내기밀' },
  { text: '경남본부 AI혁신팀 직원 5명 연봉 테이블 (2025년)', category: 'personal', label: '개인정보' },
  { text: '고객 응대 매뉴얼 작성 팁', category: 'safe', label: '안전' },
  { text: '김영수 대리 건강검진 결과: 고혈압 판정', category: 'personal', label: '개인정보' },
  { text: '사내 인트라넷 관리자 페이지 URL과 접속 권한 정보', category: 'system', label: '시스템정보' },
  { text: '신입사원 교육자료 목차 구성 방법', category: 'safe', label: '안전' },
  { text: '경남본부 2025년 하반기 조직개편안 (미공개)', category: 'confidential', label: '사내기밀' },
]

/* ─────────────────────────── Before/After 데이터 ─────────────────────────── */

interface TransformExample {
  before: string
  after: string
  issue: string
  tip: string
}

const transformExamples: TransformExample[] = [
  {
    before: '박과장(사번 12345)의 연봉이 얼마인지 알려줘',
    after: '직급별 급여체계 기준을 설명해줘',
    issue: '특정인의 사번, 연봉 등 개인정보 포함',
    tip: '개인을 특정하지 말고, 일반적인 제도/기준을 질문하세요',
  },
  {
    before: '김민수 고객(계약번호 2024-A-3391)의 미납요금 독촉 문자를 보내줘',
    after: '요금 미납 고객에게 보내는 안내 문자 템플릿을 만들어줘',
    issue: '고객 실명, 계약번호 등 고객정보 포함',
    tip: '실제 고객정보 없이 템플릿/양식을 요청하세요',
  },
  {
    before: '경남본부 배전부 올해 예산 12억 중 장비구매 비용을 정리해줘',
    after: '부서 예산에서 장비구매 비용을 분석하는 보고서 양식을 만들어줘',
    issue: '특정 부서명 + 구체적 예산 금액이 기밀 특정',
    tip: '기관명/부서명/금액은 빼고 양식이나 방법을 질문하세요',
  },
  {
    before: '이영희(lee.yh@kepco.co.kr)한테 보낼 승진 축하 메일을 작성해줘',
    after: '동료의 승진을 축하하는 업무 메일 템플릿을 만들어줘',
    issue: '실명 + 사내 이메일 주소 + 인사정보(승진) 포함',
    tip: '이름, 이메일 등 개인정보를 빼고 일반적인 템플릿을 요청하세요',
  },
  {
    before: '사내시스템(erp.kepco.co.kr) 비밀번호를 Kepco#2024!로 바꿨는데 접속이 안 돼',
    after: '사내시스템 비밀번호 변경 후 접속 오류가 발생할 때 확인할 사항을 알려줘',
    issue: '시스템 URL + 실제 비밀번호가 프롬프트에 노출',
    tip: 'URL, 비밀번호 등은 제거하고 해결 방법만 질문하세요',
  },
]

/* ──────────── 상용 AI 활용 보안수칙 (국정원 가이드라인 p.56-59) ──────────── */

interface UsageRule {
  icon: 'eye-off' | 'unlink' | 'key' | 'settings'
  title: string
  desc: string
  threat: string
}

const aiUsageRules: UsageRule[] = [
  {
    icon: 'eye-off',
    title: '공개 가능한 수준의 데이터만 활용',
    desc: '상용 AI에는 텍스트, 음성, 이미지 등 다양한 형태의 정보를 입력할 수 있습니다. 민감·비공개 정보가 입력되면 AI가 학습하여 불특정 다수에게 노출될 수 있습니다.',
    threat: 'T07 민감정보 입력·유출',
  },
  {
    icon: 'settings',
    title: '입·출력 필터링 보안대책 마련',
    desc: '문장 단위로 이해하고 대응이 가능한 AI-DLP 등 보안제품을 통해 민감정보의 입·출력을 통제하고, 공개등급 수준의 데이터만 사용되도록 해야 합니다.',
    threat: 'M13 입·출력 필터링',
  },
  {
    icon: 'key',
    title: '로깅·모니터링 체계 수립',
    desc: '사용자와 상용 AI 서비스 간 발생하는 입·출력 결과를 모니터링하여 이상행위 발생 시 사용 중단 등 대응할 수 있어야 합니다.',
    threat: 'M09 AI시스템 로깅·모니터링',
  },
  {
    icon: 'unlink',
    title: '망연계구간 경계보안 강화',
    desc: '상용 AI 사용을 위한 내·외부망 연계구간에 중계서버 및 정보보호제품을 통한 접근통제로 인가된 사용자·시스템만 허용된 AI 서비스를 사용하도록 구성해야 합니다.',
    threat: 'M17 AI시스템 경계보안 강화',
  },
  {
    icon: 'key',
    title: 'AI 모델 개선·학습 기능 해제',
    desc: '상용 AI 서비스의 "모델 개선" 등 기능이 켜져 있으면 사용자 입력 데이터가 AI 학습에 활용됩니다. 반드시 해제하세요.',
    threat: 'M30 사용자 교육 및 보안정책 수립',
  },
  {
    icon: 'settings',
    title: 'API 키 및 계정 보안관리',
    desc: 'AI서비스 계정 탈취나 보안설정 미사용으로 개인·민감정보가 노출되지 않도록 2단계 인증 사용 등 계정관리를 강화해야 합니다.',
    threat: 'M30 사용자 교육 및 보안정책 수립',
  },
]

/* 상용 AI 활용 보안수칙 O/X 퀴즈 */
const usageQuizData: SettingQuizItem[] = [
  {
    question: '상용 AI 서비스(ChatGPT 등)에 텍스트뿐 아니라 음성, 이미지 파일도 업로드할 수 있으므로, 모든 형태의 민감정보 입력에 주의해야 한다.',
    isCorrect: true,
    explanation: '맞습니다. 상용 AI에는 텍스트, 음성, 이미지 등 다양한 형태의 정보가 입력 가능합니다. 모든 형태에서 민감정보 유출 위험이 있습니다.',
  },
  {
    question: '상용 AI 서비스에 RAG로 벡터DB를 구성·연결할 때는 민감정보 포함 여부를 확인할 필요가 없다.',
    isCorrect: false,
    explanation: '틀립니다. RAG 벡터DB에 민감정보가 포함되면 상용 AI 서비스에 전송·학습되어 불특정 다수에게 노출될 수 있습니다. 반드시 확인하세요.',
  },
  {
    question: '상용 AI 서비스 사용 시 입·출력 데이터를 로깅·모니터링하여 이상행위를 탐지하고 대응할 수 있는 체계를 마련해야 한다.',
    isCorrect: true,
    explanation: '맞습니다. 국정원 가이드라인(M09)에 따라 사용자와 AI 서비스 간 입·출력 결과를 모니터링하고 이상행위 발생 시 사용 중단 등 대응체계가 필요합니다.',
  },
  {
    question: '상용 AI 서비스 제공업체가 대기업이면 보안관리가 잘 되어 있으므로, 별도의 보안대책 없이 사용해도 안전하다.',
    isCorrect: false,
    explanation: '틀립니다. 국정원 가이드라인(T15)에 따르면 AI 서비스를 제공·관리하는 업체의 보안관리 부실로 사용자 입·출력, 계정정보 등이 외부 유출될 수 있습니다.',
  },
]

/* ──────────────── 상용 AI 보안설정 데이터 (국정원 가이드라인) ──────────────── */

interface AiServiceSetting {
  service: string
  color: string
  settings: { icon: 'eye-off' | 'unlink' | 'key' | 'settings'; title: string; desc: string }[]
}

const aiServiceSettings: AiServiceSetting[] = [
  {
    service: 'ChatGPT',
    color: '#10a37f',
    settings: [
      { icon: 'eye-off', title: '"모두를 위한 모델 개선" 해제', desc: '설정 > 데이터 제어 > 해당 기능을 끄면 입력한 텍스트가 AI 모델 훈련에 활용되지 않습니다.' },
      { icon: 'key', title: '개인/기관 정보 기재 금지', desc: '설정 > 개인 맞춤 설정 > 닉네임, 직업 등에 개인이나 기관을 특정할 수 있는 정보를 입력하지 마세요.' },
      { icon: 'unlink', title: '외부 클라우드 연결 해제', desc: '설정 > 연결된 앱 > Google Drive, OneDrive 등 외부 클라우드 서비스 연결을 해제하세요.' },
    ],
  },
  {
    service: 'Gemini (구글)',
    color: '#4285f4',
    settings: [
      { icon: 'eye-off', title: '활동 기록 보관 "사용 안함"', desc: '좌측 하단 활동 > 활동 기록 보관을 "사용 안함"으로 설정하여 기록이 보관되지 않도록 하세요.' },
      { icon: 'unlink', title: 'Google Workspace 연결 해제', desc: '설정 및 도움말 > 연결된 앱 > Gmail, Calendar, Drive 등 연결을 해제하세요.' },
      { icon: 'key', title: '2단계 인증 사용', desc: '구글 계정 탈취 시 연동된 핸드폰 등 타 기기까지 노출될 수 있으므로 2단계 인증을 반드시 설정하세요.' },
    ],
  },
  {
    service: 'Claude (클로드)',
    color: '#d4a574',
    settings: [
      { icon: 'eye-off', title: '"채팅 기록에서 기억 생성" 비활성화 (권고)', desc: '설정 > 기능 > 메모리 항목에서 "채팅 기록에서 기억 생성"을 꺼서 대화 내용이 기억되지 않도록 하세요. 단, 개발 등 프로젝트 맥락 유지가 필요한 업무의 경우 민감정보 입력 금지 교육 등 보완 대책을 마련한 후 유연하게 적용할 수 있습니다.' },
      { icon: 'key', title: '프로필에 개인/기관 정보 기재 금지', desc: '설정 > 프로필 > 닉네임, 직업 등에 개인이나 기관을 특정할 수 있는 정보를 입력하지 마세요.' },
      { icon: 'unlink', title: '커넥터 비활성화', desc: '관리자 설정 > 커넥터 > Google Drive, Gmail, Calendar, GitHub 등 연결을 해제하세요.' },
    ],
  },
  {
    service: 'Perplexity (퍼플렉시티)',
    color: '#20b2aa',
    settings: [
      { icon: 'eye-off', title: '"AI 데이터 보존" 해제', desc: '계정 > 선호 설정 > "AI 데이터 보존"을 끄면 입력 데이터가 AI 모델 훈련에 활용되지 않습니다.' },
      { icon: 'key', title: '자기소개에 개인/기관 정보 기재 금지', desc: '계정 > 개인화 > 자기소개란에 소속 기관, 직위 등 특정 가능한 정보를 입력하지 마세요.' },
      { icon: 'unlink', title: '외부 클라우드 연결 해제', desc: '계정 > 연결자 > Gmail, Google Drive, Outlook, Dropbox 등 연결을 해제하세요.' },
    ],
  },
]

/* 상용 AI 보안설정 O/X 퀴즈 */
interface SettingQuizItem {
  question: string
  isCorrect: boolean
  explanation: string
}

const settingQuizData: SettingQuizItem[] = [
  {
    question: 'ChatGPT의 "모두를 위한 모델 개선" 기능을 켜두면, 내가 입력한 텍스트가 AI 모델 훈련에 활용될 수 있다.',
    isCorrect: true,
    explanation: '맞습니다. 이 기능이 켜져 있으면 사용자가 입력한 텍스트가 AI 모델 개선에 활용됩니다. 반드시 해제하세요. (설정 > 데이터 제어)',
  },
  {
    question: 'Gemini 사용 시 구글 계정에 2단계 인증을 설정할 필요는 없다.',
    isCorrect: false,
    explanation: '틀립니다. 구글 계정이 탈취되면 Gemini뿐 아니라 연동된 핸드폰, 이메일 등 타 기기와 서비스까지 노출됩니다. 2단계 인증은 필수입니다.',
  },
  {
    question: 'Claude에서 "채팅 기록에서 기억 생성" 기능을 켜두면, AI가 과거 대화 내용을 기억하여 민감정보가 축적될 수 있다.',
    isCorrect: true,
    explanation: '맞습니다. 이 기능이 켜져 있으면 과거 대화에서 민감정보를 기억하게 됩니다. 원칙적으로 비활성화를 권고하나, 개발 등 맥락 유지가 필요한 업무는 민감정보 입력 금지 교육 등 보완 대책 하에 유연하게 적용할 수 있습니다.',
  },
  {
    question: 'Perplexity에 Google Drive를 연결하면 업무 효율이 올라가니 적극 연결해서 사용해야 한다.',
    isCorrect: false,
    explanation: '틀립니다. 외부 AI 서비스에 클라우드를 연결하면 저장된 업무 문서가 AI 서비스에 노출될 수 있습니다. 계정 > 연결자에서 해제하세요.',
  },
  {
    question: '상용 AI 서비스의 프로필/닉네임에 소속 기관명이나 직위를 입력하면 안 된다.',
    isCorrect: true,
    explanation: '맞습니다. 프로필에 기관명, 부서, 직위 등을 입력하면 AI가 이를 학습하거나 다른 사용자에게 노출될 수 있습니다.',
  },
  {
    question: '상용 AI 서비스에 Google Drive, OneDrive 등 클라우드를 연결하면 업무 문서가 AI에 노출될 위험이 있다.',
    isCorrect: true,
    explanation: '맞습니다. 클라우드를 연결하면 저장된 문서에 AI가 접근할 수 있어 민감정보 유출 위험이 있습니다. 모든 외부 클라우드 연결을 해제하세요.',
  },
]

/* ─────────────────────────── 카테고리 스타일 ─────────────────────────── */

const categoryStyle: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  personal: { bg: '#fef2f2', color: '#dc2626', icon: <UserX size={16} /> },
  confidential: { bg: '#fffbeb', color: '#d97706', icon: <Lock size={16} /> },
  system: { bg: '#f0f9ff', color: '#2563eb', icon: <Server size={16} /> },
  safe: { bg: '#f0fdf4', color: '#16a34a', icon: <ShieldCheck size={16} /> },
}

/* ═══════════════════════════ 메인 컴포넌트 ═══════════════════════════ */

export default function SecurityEducationPage() {
  const [stage, setStage] = useState(0) // 0: 인트로, 1: 퀴즈, 2: 분류, 3: Before/After, 4: 상용AI보안설정, 5: 결과
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<(boolean | null)[]>(Array(quizData.length).fill(null))
  const [showExplanation, setShowExplanation] = useState(false)
  const [classifyIndex, setClassifyIndex] = useState(0)
  const [classifyAnswers, setClassifyAnswers] = useState<(string | null)[]>(Array(classifyCards.length).fill(null))
  const [showClassifyResult, setShowClassifyResult] = useState(false)
  const [transformIndex, setTransformIndex] = useState(0)
  const [showTransform, setShowTransform] = useState(false)
  const [transformViewed, setTransformViewed] = useState<boolean[]>(Array(transformExamples.length).fill(false))
  const [settingStep, setSettingStep] = useState(0) // 0: 보안수칙, 1: 서비스별 설정, 2: 통합퀴즈
  const [settingServiceIndex, setSettingServiceIndex] = useState(0)
  const [settingQuizIndex, setSettingQuizIndex] = useState(0)
  const allSettingQuiz = [...usageQuizData, ...settingQuizData]
  const [settingQuizAnswers, setSettingQuizAnswers] = useState<(boolean | null)[]>(Array(usageQuizData.length + settingQuizData.length).fill(null))
  const [showSettingExplanation, setShowSettingExplanation] = useState(false)

  // 점수 계산
  const quizScore = quizAnswers.filter((a, i) => a === quizData[i].isSafe).length
  const classifyScore = classifyAnswers.filter((a, i) => {
    if (a === null) return false
    const card = classifyCards[i]
    if (a === 'danger' && card.category !== 'safe') return true
    if (a === 'safe' && card.category === 'safe') return true
    return false
  }).length
  const settingQuizScore = settingQuizAnswers.filter((a, i) => a !== null && a === allSettingQuiz[i]?.isCorrect).length
  const totalScore = Math.round(((quizScore + classifyScore + settingQuizScore) / (quizData.length + classifyCards.length + allSettingQuiz.length)) * 100)

  const handleQuizAnswer = useCallback((userSafe: boolean) => {
    const newAnswers = [...quizAnswers]
    newAnswers[quizIndex] = userSafe
    setQuizAnswers(newAnswers)
    setShowExplanation(true)
  }, [quizAnswers, quizIndex])

  const handleClassifyAnswer = useCallback((answer: string) => {
    const newAnswers = [...classifyAnswers]
    newAnswers[classifyIndex] = answer
    setClassifyAnswers(newAnswers)
    setShowClassifyResult(true)
  }, [classifyAnswers, classifyIndex])

  const nextQuiz = useCallback(() => {
    setShowExplanation(false)
    if (quizIndex < quizData.length - 1) {
      setQuizIndex(quizIndex + 1)
    } else {
      setStage(2)
    }
  }, [quizIndex])

  const nextClassify = useCallback(() => {
    setShowClassifyResult(false)
    if (classifyIndex < classifyCards.length - 1) {
      setClassifyIndex(classifyIndex + 1)
    } else {
      setStage(3)
    }
  }, [classifyIndex])

  const nextTransform = useCallback(() => {
    setShowTransform(false)
    if (transformIndex < transformExamples.length - 1) {
      setTransformIndex(transformIndex + 1)
    } else {
      setStage(4) // 상용AI 보안설정 단계로 이동
    }
  }, [transformIndex])

  const handleSettingQuizAnswer = useCallback((userAnswer: boolean) => {
    const newAnswers = [...settingQuizAnswers]
    newAnswers[settingQuizIndex] = userAnswer
    setSettingQuizAnswers(newAnswers)
    setShowSettingExplanation(true)
  }, [settingQuizAnswers, settingQuizIndex])

  const nextSettingQuiz = useCallback(() => {
    setShowSettingExplanation(false)
    if (settingQuizIndex < allSettingQuiz.length - 1) {
      setSettingQuizIndex(settingQuizIndex + 1)
    } else {
      setStage(5) // 결과 단계로 이동
    }
  }, [settingQuizIndex, allSettingQuiz.length])

  const resetAll = () => {
    setStage(0)
    setQuizIndex(0)
    setQuizAnswers(Array(quizData.length).fill(null))
    setShowExplanation(false)
    setClassifyIndex(0)
    setClassifyAnswers(Array(classifyCards.length).fill(null))
    setShowClassifyResult(false)
    setTransformIndex(0)
    setShowTransform(false)
    setTransformViewed(Array(transformExamples.length).fill(false))
    setSettingStep(0)
    setSettingServiceIndex(0)
    setSettingQuizIndex(0)
    setSettingQuizAnswers(Array(usageQuizData.length + settingQuizData.length).fill(null))
    setShowSettingExplanation(false)
  }

  // 스테이지 라벨
  const stages = [
    { label: '시작', icon: <GraduationCap size={16} /> },
    { label: '퀴즈', icon: <HelpCircle size={16} /> },
    { label: '분류', icon: <Target size={16} /> },
    { label: '작성법', icon: <Lightbulb size={16} /> },
    { label: '보안설정', icon: <Settings size={16} /> },
    { label: '결과', icon: <Trophy size={16} /> },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #fff7ed 100%)' }}>
      {/* 헤더 */}
      <header style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.9 }}>
              <ArrowLeft size={18} /> 메인으로
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} />
              <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>KNAI 보안교육</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 'bold', margin: 0 }}>
              AI 보안 인터랙티브 교육
            </h1>
            <p style={{ opacity: 0.85, marginTop: '0.5rem', fontSize: '0.9rem' }}>
              AI 사용 시 꼭 알아야 할 보안 수칙을 재미있게 배워보세요
            </p>
          </div>
        </div>
      </header>

      {/* 진행 바 */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {stages.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem',
                borderRadius: '20px', fontSize: '0.8rem', fontWeight: stage === i ? 'bold' : 'normal',
                background: stage > i ? '#dcfce7' : stage === i ? '#7c3aed' : '#f3f4f6',
                color: stage > i ? '#16a34a' : stage === i ? 'white' : '#9ca3af',
                transition: 'all 0.3s',
              }}>
                {stage > i ? <CheckCircle2 size={14} /> : s.icon}
                <span>{s.label}</span>
              </div>
              {i < stages.length - 1 && (
                <div style={{ width: '2rem', height: '2px', background: stage > i ? '#16a34a' : '#e5e7eb' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <AnimatePresence mode="wait">

          {/* ═══ 스테이지 0: 인트로 ═══ */}
          {stage === 0 && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '3rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: '4rem', marginBottom: '1.5rem' }}
                >
                  <ShieldAlert size={72} style={{ color: '#7c3aed', margin: '0 auto' }} />
                </motion.div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                  AI 사용, 안전하게 하고 계신가요?
                </h2>
                <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 2rem' }}>
                  ChatGPT, Copilot 등 AI 서비스에 <strong style={{ color: '#dc2626' }}>개인정보</strong>나
                  <strong style={{ color: '#d97706' }}> 사내기밀</strong>을 입력하면
                  데이터가 외부로 유출될 수 있습니다.<br /><br />
                  3단계 인터랙티브 교육을 통해 안전한 AI 사용법을 배워보세요!
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  {[
                    { icon: <HelpCircle size={20} />, title: '1단계: 시나리오 퀴즈', desc: '위험한 프롬프트를 판단해보세요', color: '#3b82f6' },
                    { icon: <Target size={20} />, title: '2단계: 민감정보 분류', desc: '정보의 위험도를 분류해보세요', color: '#f59e0b' },
                    { icon: <Lightbulb size={20} />, title: '3단계: 안전한 작성법', desc: 'Before/After로 배워보세요', color: '#10b981' },
                    { icon: <Settings size={20} />, title: '4단계: AI 보안설정', desc: '상용 AI 서비스 필수 설정', color: '#f97316' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                      style={{
                        flex: '1 1 200px', maxWidth: '250px', padding: '1.2rem',
                        background: `${item.color}08`, border: `1px solid ${item.color}25`,
                        borderRadius: '12px', textAlign: 'center',
                      }}
                    >
                      <div style={{ color: item.color, marginBottom: '0.5rem' }}>{item.icon}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1f2937', marginBottom: '0.3rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.desc}</div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStage(1)}
                  style={{
                    padding: '1rem 3rem', background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                    fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  교육 시작하기 <ArrowRight size={20} />
                </motion.button>
                <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                  약 10~15분 소요 | 총 {quizData.length + classifyCards.length + settingQuizData.length}문제 + 작성법 + 보안설정
                </p>
              </div>
            </motion.div>
          )}

          {/* ═══ 스테이지 1: 시나리오 퀴즈 (O/X) ═══ */}
          {stage === 1 && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={22} style={{ color: '#3b82f6' }} />
                    1단계: 이 프롬프트, 입력해도 될까요?
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold' }}>
                    {quizIndex + 1} / {quizData.length}
                  </span>
                </div>

                {/* 진행률 바 */}
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', marginBottom: '2rem', overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: `${((quizIndex + 1) / quizData.length) * 100}%` }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', borderRadius: '3px' }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={quizIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    {/* 카테고리 뱃지 */}
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{
                        fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '10px',
                        background: quizData[quizIndex].isSafe ? '#dcfce7' : '#fee2e2',
                        color: quizData[quizIndex].isSafe ? '#16a34a' : '#dc2626',
                        fontWeight: 'bold', opacity: showExplanation ? 1 : 0, transition: 'opacity 0.3s',
                      }}>
                        {quizData[quizIndex].category}
                      </span>
                    </div>

                    {/* 프롬프트 카드 */}
                    <div style={{
                      background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px',
                      padding: '1.5rem', marginBottom: '1.5rem', fontFamily: 'monospace',
                      fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <Eye size={14} /> AI에게 보내는 프롬프트
                      </div>
                      {quizData[quizIndex].prompt}
                    </div>

                    {/* 답변 버튼 */}
                    {!showExplanation ? (
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuizAnswer(true)}
                          style={{
                            flex: 1, maxWidth: '200px', padding: '1rem', background: '#f0fdf4',
                            border: '2px solid #86efac', borderRadius: '12px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                          }}
                        >
                          <ShieldCheck size={28} style={{ color: '#16a34a' }} />
                          <span style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '1rem' }}>안전해요 (O)</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>입력해도 괜찮습니다</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuizAnswer(false)}
                          style={{
                            flex: 1, maxWidth: '200px', padding: '1rem', background: '#fef2f2',
                            border: '2px solid #fca5a5', borderRadius: '12px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                          }}
                        >
                          <ShieldAlert size={28} style={{ color: '#dc2626' }} />
                          <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '1rem' }}>위험해요 (X)</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>입력하면 안됩니다</span>
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        {/* 정답/오답 표시 */}
                        {quizAnswers[quizIndex] === quizData[quizIndex].isSafe ? (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            style={{
                              background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px',
                              padding: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            }}
                          >
                            <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#16a34a', marginBottom: '0.3rem' }}>정답입니다!</div>
                              <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{quizData[quizIndex].explanation}</div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            style={{
                              background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '12px',
                              padding: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            }}
                          >
                            <XCircle size={24} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '0.3rem' }}>
                                아쉽지만 오답이에요! ({quizData[quizIndex].isSafe ? '안전한 프롬프트' : '위험한 프롬프트'}였습니다)
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{quizData[quizIndex].explanation}</div>
                            </div>
                          </motion.div>
                        )}

                        <div style={{ textAlign: 'center' }}>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={nextQuiz}
                            style={{
                              padding: '0.7rem 2rem', background: '#7c3aed', color: 'white',
                              border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            }}
                          >
                            {quizIndex < quizData.length - 1 ? (<>다음 문제 <ArrowRight size={16} /></>) : (<>2단계로 이동 <ArrowRight size={16} /></>)}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 점수 현황 */}
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'white', borderRadius: '10px', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.8rem', color: '#6b7280' }}>
                <span>맞힌 문제: <strong style={{ color: '#16a34a' }}>{quizScore}</strong></span>
                <span>현재 진행: <strong style={{ color: '#7c3aed' }}>{quizIndex + 1}/{quizData.length}</strong></span>
              </div>
            </motion.div>
          )}

          {/* ═══ 스테이지 2: 민감정보 분류 게임 ═══ */}
          {stage === 2 && (
            <motion.div key="classify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={22} style={{ color: '#f59e0b' }} />
                    2단계: 이 정보, 안전할까요?
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold' }}>
                    {classifyIndex + 1} / {classifyCards.length}
                  </span>
                </div>

                {/* 진행률 바 */}
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', marginBottom: '1rem', overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: `${((classifyIndex + 1) / classifyCards.length) * 100}%` }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '3px' }}
                  />
                </div>

                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' }}>
                  다음 정보를 AI에 입력해도 안전한지 판단해주세요
                </p>

                <AnimatePresence mode="wait">
                  <motion.div key={classifyIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    {/* 정보 카드 */}
                    <div style={{
                      background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px',
                      padding: '2rem', marginBottom: '1.5rem', textAlign: 'center',
                    }}>
                      <FileWarning size={24} style={{ color: '#64748b', marginBottom: '0.75rem' }} />
                      <div style={{ fontSize: '1.05rem', color: '#1e293b', fontWeight: '500', fontFamily: 'monospace' }}>
                        {classifyCards[classifyIndex].text}
                      </div>
                    </div>

                    {!showClassifyResult ? (
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleClassifyAnswer('safe')}
                          style={{
                            flex: 1, maxWidth: '200px', padding: '1rem', background: '#f0fdf4',
                            border: '2px solid #86efac', borderRadius: '12px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                          }}
                        >
                          <ShieldCheck size={28} style={{ color: '#16a34a' }} />
                          <span style={{ fontWeight: 'bold', color: '#16a34a' }}>안전</span>
                          <span style={{ fontSize: '0.73rem', color: '#6b7280' }}>AI에 입력 가능</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleClassifyAnswer('danger')}
                          style={{
                            flex: 1, maxWidth: '200px', padding: '1rem', background: '#fef2f2',
                            border: '2px solid #fca5a5', borderRadius: '12px', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                          }}
                        >
                          <ShieldAlert size={28} style={{ color: '#dc2626' }} />
                          <span style={{ fontWeight: 'bold', color: '#dc2626' }}>위험</span>
                          <span style={{ fontSize: '0.73rem', color: '#6b7280' }}>AI에 입력 금지</span>
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        {(() => {
                          const card = classifyCards[classifyIndex]
                          const userAnswer = classifyAnswers[classifyIndex]
                          const isCorrect = (userAnswer === 'safe' && card.category === 'safe') || (userAnswer === 'danger' && card.category !== 'safe')
                          const style = categoryStyle[card.category]
                          return (
                            <>
                              <div style={{
                                background: isCorrect ? '#f0fdf4' : '#fef2f2',
                                border: `2px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
                                borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem',
                                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                              }}>
                                {isCorrect ? <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} /> : <XCircle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />}
                                <div>
                                  <div style={{ fontWeight: 'bold', color: isCorrect ? '#16a34a' : '#dc2626', marginBottom: '0.5rem' }}>
                                    {isCorrect ? '정답!' : '오답!'}
                                  </div>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '8px', background: style.bg, color: style.color, fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {style.icon} {card.label}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#374151', marginTop: '0.5rem', lineHeight: 1.5 }}>
                                    {card.category === 'safe'
                                      ? '일반적인 정보로 AI에 안전하게 입력할 수 있습니다.'
                                      : card.category === 'personal'
                                        ? '개인을 식별할 수 있는 정보입니다. 개인정보보호법 위반 소지가 있습니다.'
                                        : card.category === 'confidential'
                                          ? '사내 기밀정보입니다. 외부 AI에 입력 시 정보 유출 위험이 있습니다.'
                                          : '시스템 접속 정보입니다. 유출 시 해킹 등 보안 사고로 이어질 수 있습니다.'}
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={nextClassify}
                                  style={{
                                    padding: '0.7rem 2rem', background: '#f59e0b', color: 'white',
                                    border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold',
                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                  }}
                                >
                                  {classifyIndex < classifyCards.length - 1 ? (<>다음 문제 <ArrowRight size={16} /></>) : (<>3단계로 이동 <ArrowRight size={16} /></>)}
                                </motion.button>
                              </div>
                            </>
                          )
                        })()}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 점수 현황 */}
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'white', borderRadius: '10px', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.8rem', color: '#6b7280' }}>
                <span>맞힌 문제: <strong style={{ color: '#16a34a' }}>{classifyScore}</strong></span>
                <span>현재 진행: <strong style={{ color: '#f59e0b' }}>{classifyIndex + 1}/{classifyCards.length}</strong></span>
              </div>
            </motion.div>
          )}

          {/* ═══ 스테이지 3: Before/After 안전한 작성법 ═══ */}
          {stage === 3 && (
            <motion.div key="transform" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lightbulb size={22} style={{ color: '#10b981' }} />
                    3단계: 안전한 프롬프트 작성법
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold' }}>
                    {transformIndex + 1} / {transformExamples.length}
                  </span>
                </div>

                {/* 진행률 바 */}
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: `${((transformIndex + 1) / transformExamples.length) * 100}%` }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '3px' }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={transformIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    {/* Before 카드 */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <XCircle size={18} style={{ color: '#dc2626' }} />
                        <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '0.9rem' }}>Before (위험한 프롬프트)</span>
                      </div>
                      <div style={{
                        background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '10px',
                        padding: '1.2rem', fontFamily: 'monospace', fontSize: '0.9rem', color: '#991b1b', lineHeight: 1.6,
                      }}>
                        {transformExamples[transformIndex].before}
                      </div>
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#fff7ed', borderRadius: '8px', fontSize: '0.78rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={14} />
                        {transformExamples[transformIndex].issue}
                      </div>
                    </div>

                    {/* 변환 버튼 */}
                    {!showTransform ? (
                      <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShowTransform(true)
                            const newViewed = [...transformViewed]
                            newViewed[transformIndex] = true
                            setTransformViewed(newViewed)
                          }}
                          style={{
                            padding: '0.8rem 2rem', background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem',
                            fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                          }}
                        >
                          <Sparkles size={18} /> 안전하게 변환하기
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        {/* 화살표 */}
                        <div style={{ textAlign: 'center', margin: '1rem 0', color: '#10b981' }}>
                          <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <ArrowRight size={28} style={{ transform: 'rotate(90deg)' }} />
                          </motion.div>
                        </div>

                        {/* After 카드 */}
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                            <span style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '0.9rem' }}>After (안전한 프롬프트)</span>
                          </div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            style={{
                              background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '10px',
                              padding: '1.2rem', fontFamily: 'monospace', fontSize: '0.9rem', color: '#166534', lineHeight: 1.6,
                            }}
                          >
                            {transformExamples[transformIndex].after}
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#ecfdf5', borderRadius: '8px', fontSize: '0.78rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <Lightbulb size={14} />
                            {transformExamples[transformIndex].tip}
                          </motion.div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={nextTransform}
                            style={{
                              padding: '0.7rem 2rem', background: '#10b981', color: 'white',
                              border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            }}
                          >
                            {transformIndex < transformExamples.length - 1 ? (<>다음 예시 <ArrowRight size={16} /></>) : (<>결과 확인하기 <Trophy size={16} /></>)}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ═══ 스테이지 4: 상용 AI 보안설정 (국정원 가이드라인) ═══ */}
          {stage === 4 && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={22} style={{ color: '#f97316' }} />
                    4단계: 상용 AI 서비스 업무 사용시 보안설정
                  </h2>
                </div>

                {/* 출처 표시 */}
                <div style={{ marginBottom: '1.5rem', padding: '0.6rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', fontSize: '0.75rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={14} />
                  <span>출처: <strong>국가정보원 &middot; 국가보안기술연구소</strong> &ldquo;국가&middot;공공기관 AI보안 가이드북&rdquo; (2025.12, v2.0) 제2장 제3절, 부록3</span>
                </div>

                {/* 단계 표시 */}
                <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                  {['보안수칙', '서비스별 설정', '확인 퀴즈'].map((label, i) => (
                    <div key={i} style={{ padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.7rem', fontWeight: settingStep === i ? 'bold' : 'normal', background: settingStep > i ? '#dcfce7' : settingStep === i ? '#f97316' : '#f3f4f6', color: settingStep > i ? '#16a34a' : settingStep === i ? 'white' : '#9ca3af' }}>
                      {label}
                    </div>
                  ))}
                </div>

                {settingStep === 0 ? (
                  <>
                    {/* 상용 AI 활용 보안수칙 (p.56-59) */}
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' }}>
                      상용 AI 서비스(ChatGPT, Gemini 등) 사용 시 반드시 지켜야 할 보안수칙입니다
                    </p>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {aiUsageRules.map((rule, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                          <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                            {rule.icon === 'eye-off' ? <EyeOff size={18} /> : rule.icon === 'unlink' ? <Unlink size={18} /> : rule.icon === 'key' ? <KeyRound size={18} /> : <Settings size={18} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1f2937', marginBottom: '0.25rem' }}>{rule.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{rule.desc}</div>
                            <div style={{ marginTop: '0.4rem', fontSize: '0.68rem', color: '#f97316', fontWeight: '600' }}>{rule.threat}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setSettingStep(1)} style={{ padding: '0.7rem 2rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        서비스별 설정 보기 <ArrowRight size={16} />
                      </motion.button>
                    </div>
                  </>
                ) : settingStep === 1 ? (
                  <>
                    {/* 서비스별 보안설정 카드 */}
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' }}>
                      ChatGPT, Gemini, Claude, Perplexity 사용 시 반드시 확인해야 할 보안설정입니다
                    </p>

                    <AnimatePresence mode="wait">
                      <motion.div key={settingServiceIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                        {(() => {
                          const svc = aiServiceSettings[settingServiceIndex]
                          return (
                            <div style={{ border: `2px solid ${svc.color}30`, borderRadius: '12px', overflow: 'hidden' }}>
                              <div style={{ background: svc.color, color: 'white', padding: '0.75rem 1.2rem', fontWeight: 'bold', fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{svc.service}</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{settingServiceIndex + 1} / {aiServiceSettings.length}</span>
                              </div>
                              <div style={{ padding: '1.2rem' }}>
                                {svc.settings.map((s, i) => (
                                  <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: i < svc.settings.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                    <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '8px', background: `${svc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: svc.color }}>
                                      {s.icon === 'eye-off' ? <EyeOff size={16} /> : s.icon === 'unlink' ? <Unlink size={16} /> : s.icon === 'key' ? <KeyRound size={16} /> : <Settings size={16} />}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#1f2937', marginBottom: '0.2rem' }}>{s.title}</div>
                                      <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{s.desc}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })()}
                      </motion.div>
                    </AnimatePresence>

                    {/* 네비게이션 */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                      {settingServiceIndex > 0 && (
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setSettingServiceIndex(settingServiceIndex - 1)} style={{ padding: '0.6rem 1.5rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ArrowLeft size={14} /> 이전
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => {
                        if (settingServiceIndex < aiServiceSettings.length - 1) {
                          setSettingServiceIndex(settingServiceIndex + 1)
                        } else {
                          setSettingStep(2) // 통합퀴즈로 이동
                        }
                      }} style={{ padding: '0.6rem 1.5rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {settingServiceIndex < aiServiceSettings.length - 1 ? (<>다음 서비스 <ArrowRight size={14} /></>) : (<>확인 퀴즈 풀기 <ArrowRight size={14} /></>)}
                      </motion.button>
                    </div>

                    {/* 서비스 인디케이터 */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem' }}>
                      {aiServiceSettings.map((_, i) => (
                        <div key={i} onClick={() => setSettingServiceIndex(i)} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === settingServiceIndex ? '#f97316' : '#d1d5db', cursor: 'pointer', transition: 'all 0.2s' }} />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* 상용 AI 활용 + 보안설정 통합 퀴즈 (O/X) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                        보안수칙과 설정을 잘 숙지하셨는지 확인해볼까요?
                      </p>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold' }}>
                        {settingQuizIndex + 1} / {allSettingQuiz.length}
                      </span>
                    </div>

                    {/* 진행률 바 */}
                    <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                      <motion.div animate={{ width: `${((settingQuizIndex + 1) / allSettingQuiz.length) * 100}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #f97316, #ef4444)', borderRadius: '3px' }} />
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div key={settingQuizIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                        {/* 문제 카드 */}
                        <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                            <Settings size={14} /> 보안설정 O/X 퀴즈
                          </div>
                          <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
                            {allSettingQuiz[settingQuizIndex].question}
                          </div>
                        </div>

                        {!showSettingExplanation ? (
                          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSettingQuizAnswer(true)} style={{ flex: 1, maxWidth: '200px', padding: '1rem', background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                              <CheckCircle2 size={28} style={{ color: '#16a34a' }} />
                              <span style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '1rem' }}>맞다 (O)</span>
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSettingQuizAnswer(false)} style={{ flex: 1, maxWidth: '200px', padding: '1rem', background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                              <XCircle size={28} style={{ color: '#dc2626' }} />
                              <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '1rem' }}>틀리다 (X)</span>
                            </motion.button>
                          </div>
                        ) : (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            {settingQuizAnswers[settingQuizIndex] === allSettingQuiz[settingQuizIndex].isCorrect ? (
                              <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                  <div style={{ fontWeight: 'bold', color: '#16a34a', marginBottom: '0.3rem' }}>정답!</div>
                                  <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{allSettingQuiz[settingQuizIndex].explanation}</div>
                                </div>
                              </div>
                            ) : (
                              <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <XCircle size={24} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                  <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '0.3rem' }}>오답!</div>
                                  <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>{allSettingQuiz[settingQuizIndex].explanation}</div>
                                </div>
                              </div>
                            )}
                            <div style={{ textAlign: 'center' }}>
                              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={nextSettingQuiz} style={{ padding: '0.7rem 2rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                {settingQuizIndex < allSettingQuiz.length - 1 ? (<>다음 문제 <ArrowRight size={16} /></>) : (<>결과 확인하기 <Trophy size={16} /></>)}
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ 스테이지 5: 최종 결과 ═══ */}
          {stage === 5 && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                {/* 점수에 따른 아이콘 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {totalScore >= 80 ? (
                    <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', marginBottom: '1rem' }}>
                      <Trophy size={56} style={{ color: '#16a34a' }} />
                    </div>
                  ) : totalScore >= 50 ? (
                    <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #fef9c3, #fef3c7)', marginBottom: '1rem' }}>
                      <AlertTriangle size={56} style={{ color: '#d97706' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, #fee2e2, #fecaca)', marginBottom: '1rem' }}>
                      <ShieldAlert size={56} style={{ color: '#dc2626' }} />
                    </div>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0.5rem 0' }}>
                    {totalScore >= 80 ? '훌륭합니다!' : totalScore >= 50 ? '조금 더 노력해볼까요?' : '보안 감수성을 키워봐요!'}
                  </h2>

                  {/* 큰 점수 */}
                  <div style={{ margin: '1.5rem 0' }}>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      style={{
                        fontSize: '4rem', fontWeight: 'bold',
                        color: totalScore >= 80 ? '#16a34a' : totalScore >= 50 ? '#d97706' : '#dc2626',
                      }}
                    >
                      {totalScore}
                    </motion.span>
                    <span style={{ fontSize: '1.5rem', color: '#9ca3af' }}>점</span>
                  </div>
                </motion.div>

                {/* 세부 점수 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}
                >
                  <div style={{ padding: '1rem 1.5rem', background: '#eff6ff', borderRadius: '12px', minWidth: '160px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold', marginBottom: '0.3rem' }}>1단계: 시나리오 퀴즈</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>{quizScore} / {quizData.length}</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', background: '#fffbeb', borderRadius: '12px', minWidth: '160px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.3rem' }}>2단계: 민감정보 분류</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>{classifyScore} / {classifyCards.length}</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', background: '#ecfdf5', borderRadius: '12px', minWidth: '160px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginBottom: '0.3rem' }}>3단계: 작성법 학습</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#065f46' }}>완료</div>
                  </div>
                  <div style={{ padding: '1rem 1.5rem', background: '#fff7ed', borderRadius: '12px', minWidth: '160px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 'bold', marginBottom: '0.3rem' }}>4단계: 상용AI 퀴즈</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9a3412' }}>{settingQuizScore} / {allSettingQuiz.length}</div>
                  </div>
                </motion.div>

                {/* 핵심 요약 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                    padding: '1.5rem', textAlign: 'left', marginBottom: '2rem',
                  }}
                >
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={18} style={{ color: '#7c3aed' }} /> AI 사용 보안 수칙 요약
                  </h3>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {[
                      { icon: <UserX size={16} />, color: '#dc2626', text: '개인정보(이름, 연락처, 사번 등)를 AI에 입력하지 마세요' },
                      { icon: <Lock size={16} />, color: '#d97706', text: '사내 기밀(매출, 전략, 계약조건 등)을 공유하지 마세요' },
                      { icon: <Server size={16} />, color: '#2563eb', text: '시스템 정보(서버 IP, 비밀번호, API키 등)를 노출하지 마세요' },
                      { icon: <Lightbulb size={16} />, color: '#10b981', text: '이름/금액/비밀번호 등은 빼고 일반적인 방법/절차를 질문하세요' },
                      { icon: <Settings size={16} />, color: '#f97316', text: '상용 AI 서비스 사용 시 "모델 학습" 기능 해제, 클라우드 연결 해제 필수' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                        <span style={{ color: item.color, flexShrink: 0 }}>{item.icon}</span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={resetAll}
                    style={{
                      padding: '0.8rem 2rem', background: '#f3f4f6', color: '#374151',
                      border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '0.9rem',
                      fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    }}
                  >
                    <RotateCcw size={16} /> 다시 도전하기
                  </motion.button>
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href="/"
                    style={{
                      padding: '0.8rem 2rem', background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem',
                      fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <Shield size={16} /> 보안검증 하러가기
                  </motion.a>
                </div>

                {/* 관련 가이드 링크 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                >
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569', marginBottom: '1rem', textAlign: 'center' }}>
                    더 알아보기
                  </h3>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[
                      { href: '/rag-safety', label: 'RAG 활용가이드', color: '#10b981', icon: <BookOpen size={15} />, desc: 'RAG의 휘발성 메모리와 안전한 문서 활용법' },
                      { href: '/import-guide', label: 'SW반입 보안검증', color: '#6366f1', icon: <Package size={15} />, desc: '해시검증, 취약점 스캔 등 반입 절차' },
                      { href: '/regulations', label: '법규 가이드라인', color: '#f59e0b', icon: <Shield size={15} />, desc: '개인정보보호법 등 관련 법규 매핑' },
                    ].map((item, i) => (
                      <a key={i} href={item.href} style={{
                        flex: '1 1 200px', maxWidth: '250px', padding: '1rem', background: 'white',
                        border: `1px solid ${item.color}30`, borderRadius: '10px', textDecoration: 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                        transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = `${item.color}30`; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <span style={{ color: item.color }}>{item.icon}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '0.82rem', color: item.color }}>{item.label}</span>
                        <span style={{ fontSize: '0.7rem', color: '#6b7280', textAlign: 'center' }}>{item.desc}</span>
                      </a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 푸터 */}
      <footer style={{ textAlign: 'center', padding: '2rem', fontSize: '0.75rem', color: '#9ca3af' }}>
        경남본부 AI혁신팀 | AI 보안 인터랙티브 교육
      </footer>
    </div>
  )
}
