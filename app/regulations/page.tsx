'use client'

import { useState } from 'react'
import Link from 'next/link'

type TabId = 'overview' | 'privacy' | 'security' | 'checklist' | 'mapping'

interface Violation {
  type: string
  description: string
  laws: string[]
  securityThreats: string[]
  checklistItems: string[]
}

const violationLawMapping: Violation[] = [
  {
    type: '개인정보 (주민번호, 전화번호, 이메일 등)',
    description: '개인을 식별할 수 있는 정보가 AI 시스템에 입력되어 외부 서버에 전송/학습될 위험',
    laws: [
      '개인정보보호법 제3조 (개인정보 보호 원칙) - 목적 명확성, 최소수집, 안전한 관리',
      '개인정보보호법 제15조 (수집·이용) - 적법근거 없는 수집·이용 금지',
      '개인정보보호법 제34조의2 - 고유식별정보, 계좌정보 등 노출 방지',
      '개인정보보호법 제37조의2 - 자동화된 결정에 대한 정보주체 권리',
    ],
    securityThreats: [
      'T02 비인가 민감정보 학습 - AI가 개인정보를 학습하여 비인가자에게 제공',
      'T07 민감정보 입력·유출 - 사용자가 AI에 민감정보 입력, 외부 유출',
      'T04 학습데이터 추출 - 반복 질의로 학습된 개인정보 추출',
    ],
    checklistItems: [
      '③ AI시스템 보안등급에 맞는 학습데이터 구성·활용',
      '⑦ AI시스템 입·출력 보안대책 수립 (입·출력 필터링)',
      '⑥ AI시스템 로깅·모니터링',
    ],
  },
  {
    type: '기밀정보 (대외비, 극비, 비밀 문서)',
    description: '기관의 비공개 업무자료가 외부 AI 서비스를 통해 유출될 위험',
    laws: [
      '국가정보보안 기본지침 제15조 - 첨단 정보통신기술 시스템 보안성검토',
      'N2SF (국가 망 보안체계) - 기밀(C)/민감(S)/공개(O) 등급분류 및 차등 보안통제',
    ],
    securityThreats: [
      'T05 학습데이터 비인가자 접근 - 권한 미보유자에게 기밀 학습데이터 노출',
      'T07 민감정보 입력·유출 - AI시스템이 학습한 기밀정보를 비인가자에게 제공',
      'T10 통신구간 공격 - 통신구간에서 기밀정보 탈취',
    ],
    checklistItems: [
      '③ AI시스템 보안등급에 맞는 학습데이터 구성·활용',
      '④ 학습데이터에 대한 사용자 접근통제',
      '⑧ AI시스템 경계보안 수행',
      '⑨ AI시스템 통신구간 보호',
    ],
  },
  {
    type: '기술정보 (SCADA, EMS, 전력망 정보)',
    description: '핵심 인프라 기술정보가 AI를 통해 노출되어 사이버공격에 악용될 위험',
    laws: [
      '국가정보보안 기본지침 - 국가기밀 유출 방지',
      'AI보안 가이드북 M07 - 보안등급에 맞는 학습데이터 구성·활용',
    ],
    securityThreats: [
      'T01 학습데이터 오염 - 오염된 데이터로 제어시스템 오동작 유도',
      'T13 AI시스템 권한관리 부실 - AI가 제어시스템을 임의 조작',
      'T03 AI 백도어 삽입 - 특정 조건에서 기술정보 유출',
    ],
    checklistItems: [
      '⑩ AI시스템에 과도한 권한 부여 제한',
      '⑫ AI시스템 취약점 점검',
      '⑬ AI시스템 복구방안 마련',
    ],
  },
  {
    type: '시스템정보 (IP주소, 비밀번호, API키)',
    description: 'IT 인프라 접근 정보가 노출되어 시스템 침투에 악용될 위험',
    laws: [
      'AI보안 가이드북 M16 - AI모델 구조·가중치 유출 방지',
      'AI보안 가이드북 M17 - AI시스템 경계보안 강화',
      'AI보안 가이드북 M18 - AI시스템 통신구간 보호',
    ],
    securityThreats: [
      'T06 AI모델 추출 - AI모델 구조/가중치 등 추출',
      'T10 통신구간 공격 - 패킷 가로채기로 인증키 탈취',
      'T14 공급망 공격 - 구성요소 취약점 악용',
    ],
    checklistItems: [
      '⑧ AI시스템 경계보안 수행',
      '⑨ AI시스템 통신구간 보호',
      '⑫ AI시스템 취약점 점검',
    ],
  },
  {
    type: '조직정보 (직원명, 부서명, 직급)',
    description: '조직 내부 구조가 노출되어 사회공학 공격 등에 악용될 위험',
    laws: [
      '개인정보보호법 제15조 - 목적 범위 내 최소 수집 원칙',
      '개인정보 처리 안내서 - AI 학습데이터의 개인정보 전처리(가명·익명처리)',
    ],
    securityThreats: [
      'T02 비인가 민감정보 학습',
      'T07 민감정보 입력·유출',
    ],
    checklistItems: [
      '⑦ AI시스템 입·출력 보안대책 수립',
      '⑭ AI시스템 사용자·용역업체 보안관리',
    ],
  },
  {
    type: '위치정보 (상세 주소, 변전소 위치)',
    description: '핵심 시설 위치정보가 노출되어 물리적 보안 위협으로 이어질 위험',
    laws: [
      '위치정보의 보호 및 이용 등에 관한 법률',
      'AI보안 가이드북 - 보안등급에 맞는 데이터 분류·활용',
    ],
    securityThreats: [
      'T02 비인가 민감정보 학습',
      'T07 민감정보 입력·유출',
    ],
    checklistItems: [
      '③ AI시스템 보안등급에 맞는 학습데이터 구성·활용',
      '⑦ AI시스템 입·출력 보안대책 수립',
    ],
  },
  {
    type: '재무정보 (계약금액, 예산 정보)',
    description: '기관의 재무·계약 정보가 노출되어 경쟁사 등에 악용될 위험',
    laws: [
      '개인정보보호법 제34조의2 - 계좌정보, 신용카드정보 등 노출 방지',
      '국가정보보안 기본지침 - 비공개 업무자료 관리',
    ],
    securityThreats: [
      'T02 비인가 민감정보 학습',
      'T07 민감정보 입력·유출',
      'T05 학습데이터 비인가자 접근',
    ],
    checklistItems: [
      '③ AI시스템 보안등급에 맞는 학습데이터 구성·활용',
      '④ 학습데이터에 대한 사용자 접근통제',
      '⑦ AI시스템 입·출력 보안대책 수립',
    ],
  },
]

export default function RegulationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [expandedViolation, setExpandedViolation] = useState<number | null>(null)

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: '개요', icon: '📋' },
    { id: 'privacy', label: '개인정보보호법', icon: '🔒' },
    { id: 'security', label: 'AI보안 가이드북', icon: '🛡' },
    { id: 'checklist', label: '보안성검토 체크리스트', icon: '✅' },
    { id: 'mapping', label: '위반유형별 법규 매핑', icon: '🔗' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* 헤더 */}
      <div style={{
        background: 'rgba(30,58,138,0.95)',
        borderBottom: '2px solid #3b82f6',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            AI 보안 법규 및 가이드라인
          </h1>
          <p style={{ color: '#93c5fd', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
            생성형 AI 개발·활용을 위한 보안 규제 준수 안내
          </p>
        </div>
        <Link href="/" style={{
          background: '#3b82f6',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '0.875rem',
        }}>
          검증 시스템으로 이동
        </Link>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '12px 24px',
        background: 'rgba(15,23,42,0.8)',
        overflowX: 'auto',
        flexWrap: 'wrap',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              background: activeTab === tab.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#93c5fd' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>

        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card title="이 시스템의 목적" icon="🎯">
              <p style={{ color: '#d1d5db', lineHeight: 1.8 }}>
                생성형 AI(ChatGPT, Claude 등)를 업무에 활용할 때, <strong style={{ color: '#fbbf24' }}>사내 민감정보가 외부 AI 서버로 유출되지 않도록</strong> 입력 내용을 사전에 검증하는 시스템입니다.
              </p>
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <p style={{ color: '#fca5a5', fontWeight: 'bold', margin: '0 0 8px 0' }}>왜 필요한가?</p>
                <ul style={{ color: '#d1d5db', paddingLeft: '20px', lineHeight: 2 }}>
                  <li>2023.3월 삼성전자 직원 챗GPT 소스코드 유출 사건</li>
                  <li>2025.2월 딥시크 개인정보 무단 공유 우려</li>
                  <li>2025.6월 MS 코파일럿 제로클릭 취약점(EchoLeak) 발견</li>
                  <li>2025.8월 프롬프트웨어(PromptLock) - AI가 랜섬웨어 생성·실행</li>
                </ul>
              </div>
            </Card>

            <Card title="적용 법규 및 가이드라인 3종" icon="📚">
              <div style={{ display: 'grid', gap: '12px' }}>
                <LawCard
                  num="1"
                  title="개인정보보호위원회 - 생성형 AI 개인정보 처리 안내서 (2025.8)"
                  color="#3b82f6"
                  items={[
                    'AI 수명주기별 개인정보 처리 기준 제시',
                    '공개된 개인정보 수집·이용의 적법근거 (정당한 이익)',
                    '이용자 개인정보의 추가적 이용 요건',
                    '정보주체 권리보장 (옵트아웃, 삭제 요청 등)',
                  ]}
                />
                <LawCard
                  num="2"
                  title="국가정보원 - 국가·공공기관 AI보안 가이드북 (2025.12)"
                  color="#10b981"
                  items={[
                    '15개 보안위협 유형 및 30개 보안대책 제시',
                    '구축 유형별 보안대책 (내부망, 외부연계, 대민서비스, 상용 AI)',
                    '에이전틱·피지컬 AI 보안대책',
                    '상용 AI서비스 보안설정 권고 (챗GPT, 제미나이, 클로드 등)',
                  ]}
                />
                <LawCard
                  num="3"
                  title="국가정보원 - AI 정보화사업 보안성검토 체크리스트 (2026.1)"
                  color="#f59e0b"
                  items={[
                    '데이터 수집 ~ 시스템 폐기까지 15개 공통 체크리스트',
                    '에이전틱/피지컬 AI 추가 체크리스트',
                    '보안컨설팅 연락처 안내',
                  ]}
                />
              </div>
            </Card>

            <Card title="데이터 등급 분류 (N2SF 기준)" icon="📊">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                <GradeCard grade="기밀 (C)" color="#ef4444" desc="국가안보 관련 정보" rule="외부망 AI에 절대 입력 금지. 내부 폐쇄망에서만 처리." />
                <GradeCard grade="민감 (S)" color="#f59e0b" desc="비공개 업무자료" rule="내부망 전용 AI에서만 활용. 외부 전송 시 공개등급으로 한정." />
                <GradeCard grade="공개 (O)" color="#22c55e" desc="공개 가능 정보" rule="외부 상용 AI 서비스 활용 가능. 단, 보안설정 필수." />
              </div>
            </Card>
          </div>
        )}

        {/* 개인정보보호법 탭 */}
        {activeTab === 'privacy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card title="생성형 AI 개발·활용 단계별 개인정보 처리 기준" icon="🔒">
              <p style={{ color: '#94a3b8', marginBottom: '16px', lineHeight: 1.7 }}>
                개인정보보호위원회 안내서(2025.8)에 따른 AI 수명주기별 고려사항
              </p>

              <StepCard step="1" title="목적 설정" color="#3b82f6">
                <ul style={{ color: '#d1d5db', paddingLeft: '20px', lineHeight: 2 }}>
                  <li><strong>개인정보 처리 목적 구체화</strong> (법 제3조 개인정보 보호 원칙)</li>
                  <li><strong>적법근거 확보</strong>: 공개정보는 정당한 이익(제15조1항6호), 이용자 정보는 추가적 이용(제15조3항) 검토</li>
                  <li>민감정보·고유식별정보 처리 시 별도 동의/법적근거 필요</li>
                </ul>
              </StepCard>

              <StepCard step="2" title="전략 수립" color="#8b5cf6">
                <ul style={{ color: '#d1d5db', paddingLeft: '20px', lineHeight: 2 }}>
                  <li><strong>개인정보 안심설계(PbD)</strong> 원칙 반영 - 기획 단계부터 개인정보 보호 내재화</li>
                  <li><strong>개인정보 영향평가(PIA)</strong> 실시 권장 (공공기관 의무, 민간 권장)</li>
                  <li>서비스형 LLM 사용 시: 기업용 API 라이선스, DPA 체결, 국외이전 적법성 검토</li>
                  <li>기성 LLM 활용 시: 학습데이터 출처 검증, 모델카드·라이선스 확인</li>
                </ul>
              </StepCard>

              <StepCard step="3" title="AI 학습 및 개발" color="#10b981">
                <ul style={{ color: '#d1d5db', paddingLeft: '20px', lineHeight: 2 }}>
                  <li><strong>데이터 전처리</strong>: 주민번호, 계좌번호 등 고유식별정보는 학습 전 삭제/가명처리</li>
                  <li><strong>입·출력 필터링</strong>: 민감정보 탐지·차단 (이 시스템이 수행하는 역할)</li>
                  <li>미세조정(SFT, RLHF, DPO) 통한 안전장치 추가</li>
                  <li>차분 프라이버시(DP-SGD), 연합학습 등 PET 기술 적용 권장</li>
                </ul>
              </StepCard>

              <StepCard step="4" title="시스템 적용 및 관리" color="#f59e0b">
                <ul style={{ color: '#d1d5db', paddingLeft: '20px', lineHeight: 2 }}>
                  <li><strong>정보주체 권리보장</strong>: 열람, 정정·삭제, 처리정지 요구에 10일 내 대응</li>
                  <li><strong>투명성 확보</strong>: 개인정보 처리방침에 AI 학습데이터 수집 기준 공개</li>
                  <li><strong>옵트아웃(opt-out)</strong>: 학습데이터 수집 거부 방법 안내 및 기능 제공</li>
                  <li>자동화된 결정(제37조의2): 거부권, 설명요구권, 검토요구권 보장</li>
                </ul>
              </StepCard>
            </Card>

            <Card title="이 시스템이 준수하는 개인정보보호 사항" icon="✅">
              <div style={{ display: 'grid', gap: '8px' }}>
                {[
                  '입력 프롬프트에서 주민등록번호, 전화번호, 이메일 등 개인정보 자동 탐지·차단',
                  '검증 결과를 외부 서버에 저장하지 않음 (세션 단위 처리)',
                  '민감정보 마스킹 처리 후 안전한 프롬프트만 사용 가능하도록 안내',
                  '검증 이력 로깅을 통한 사후 감사 가능 (입출력 모니터링)',
                  '사용자에게 검증 기준 및 규칙을 투명하게 공개',
                ].map((item, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', color: '#86efac', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✅</span> {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* AI보안 가이드북 탭 */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card title="AI시스템 15대 보안위협" icon="⚠">
              <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                국가정보원 AI보안 가이드북(2025.12)에서 식별한 보안위협
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '8px' }}>
                {[
                  { id: 'T01', name: '학습데이터 오염', desc: '학습 데이터를 악의적으로 변조·삽입' },
                  { id: 'T02', name: '비인가 민감정보 학습', desc: '활용 목적에 맞지 않는 민감정보 학습' },
                  { id: 'T03', name: 'AI 백도어 삽입', desc: '특정 조건에서 악성행위 수행하도록 삽입' },
                  { id: 'T04', name: '학습데이터 추출', desc: '반복 질의로 학습된 데이터 재구성' },
                  { id: 'T05', name: '학습데이터 비인가자 접근', desc: '접근권한 통제 미흡으로 정보 노출' },
                  { id: 'T06', name: 'AI모델 추출', desc: 'AI모델 구조나 가중치 등 추출' },
                  { id: 'T07', name: '민감정보 입력·유출', desc: '사용자가 민감정보 입력, AI가 학습·유출' },
                  { id: 'T08', name: '프롬프트 인젝션', desc: '악의적 지시로 AI 출력·동작 변경' },
                  { id: 'T09', name: '회피 공격', desc: '적대적 예제로 AI의 잘못된 예측 유도' },
                  { id: 'T10', name: '통신구간 공격', desc: '통신구간 패킷 가로채기, 인증키 탈취' },
                  { id: 'T11', name: '서비스 거부 공격', desc: '과도한 프롬프트로 시스템 과부하' },
                  { id: 'T12', name: '모니터링 체계 부재', desc: '사고·이상행위 탐지 불가' },
                  { id: 'T13', name: 'AI시스템 권한관리 부실', desc: '과도한 권한으로 임의 시스템 제어' },
                  { id: 'T14', name: '공급망 공격', desc: '구성요소에 취약점·악성코드 삽입 배포' },
                  { id: 'T15', name: '용역업체 보안관리 부실', desc: '위탁 업체 통한 모델·데이터 유출' },
                ].map(t => (
                  <div key={t.id} style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    borderLeft: '3px solid #f59e0b',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ background: '#f59e0b', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{t.id}</span>
                      <span style={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.875rem' }}>{t.name}</span>
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="이 시스템이 대응하는 주요 보안대책" icon="🛡">
              <div style={{ display: 'grid', gap: '10px' }}>
                {[
                  { id: 'M07', title: '보안등급에 맞는 학습데이터 구성·활용', desc: '데이터 등급분류에 맞는 정보만 AI가 활용하도록 통제' },
                  { id: 'M09', title: 'AI시스템 로깅·모니터링', desc: '입·출력정보, 접근이력 로그 기록 및 이상행위 탐지' },
                  { id: 'M13', title: '입·출력 필터링', desc: 'AI-DLP 등으로 민감정보 및 공격 문구 탐지·차단' },
                  { id: 'M14', title: '입력 길이·형식 제한', desc: '공격용 프롬프트 차단을 위한 입력 제한' },
                  { id: 'M15', title: '가드레일 다중화', desc: '복수의 보호장치를 계층적으로 배치' },
                  { id: 'M30', title: '사용자 교육 및 보안정책 수립', desc: '보안수칙 안내·교육, 경고 배너 표시' },
                ].map(m => (
                  <div key={m.id} style={{
                    padding: '14px',
                    background: 'rgba(59,130,246,0.1)',
                    borderRadius: '8px',
                    borderLeft: '3px solid #3b82f6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{m.id}</span>
                      <span style={{ color: '#e5e7eb', fontWeight: 'bold' }}>{m.title}</span>
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>{m.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 보안성검토 체크리스트 탭 */}
        {activeTab === 'checklist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card title="AI 정보화사업 보안성검토 체크리스트" icon="✅">
              <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                국가정보원 보안성검토 체크리스트(2026.1.19) - 15개 공통 보안대책
              </p>

              <ChecklistSection title="데이터 수집" items={[
                { num: '①', text: '신뢰할 수 있는 출처의 데이터 활용', desc: '공신력 있는 출처·배포자를 통해 내·외부 데이터 수집' },
                { num: '②', text: '오염데이터 유입 방지를 위한 데이터 검사', desc: 'AI 학습·재학습 시 오염데이터 탐지·제거. RAG 등 신규데이터 참조 시도 포함' },
              ]} />

              <ChecklistSection title="AI 학습" items={[
                { num: '③', text: 'AI시스템 보안등급에 맞는 학습데이터 구성·활용', desc: '기밀·민감·공개등급 데이터를 목적에 맞게 분류 활용. 비인가자에게 기밀등급 데이터 제공 차단' },
                { num: '④', text: '학습데이터에 대한 사용자 접근통제', desc: '사용자, 그룹, 데이터별로 최소 접근권한 부여. 관리자 다중 인증' },
                { num: '⑤', text: '신뢰할 수 있는 출처의 AI모델·라이브러리 활용', desc: '공신력 있는 출처의 오픈소스 AI모델·라이브러리 사용' },
                { num: '⑥', text: 'AI시스템 로깅·모니터링', desc: '요청·응답·접속이력 로깅. 비정상 입력 패턴 탐지·경보·차단' },
              ]} />

              <ChecklistSection title="AI시스템 구축·운영" items={[
                { num: '⑦', text: 'AI시스템 입·출력 보안대책 수립', desc: '입·출력 필터링, 입력 길이·형식 제한, 요청 속도 제한' },
                { num: '⑧', text: 'AI시스템 경계보안 수행', desc: 'DMZ·중계서버로 접근 식별·통제. 인가된 시스템·데이터만 활용' },
                { num: '⑨', text: 'AI시스템 통신구간 보호', desc: '사용자-AI, AI-타시스템 통신구간 암호화' },
                { num: '⑩', text: 'AI시스템에 과도한 권한 부여 제한', desc: '최소 권한 부여, 민감 작업 시 담당자 검토·승인' },
                { num: '⑪', text: '설명 가능한 AI 구성', desc: '추론 과정·판단 근거를 시각화하도록 구성 (권고)' },
                { num: '⑫', text: 'AI시스템 취약점 점검', desc: '소프트웨어·라이브러리 취약점 점검. 무작위 공격값 입력 이상동작 확인' },
                { num: '⑬', text: 'AI시스템 복구방안 마련', desc: '이상행위 시 정상 모델·학습데이터로 복원. 백업·버전관리' },
                { num: '⑭', text: 'AI시스템 사용자·용역업체 보안관리', desc: '사용자 보안수칙 교육. 용역업체 정기 보안점검' },
              ]} />

              <ChecklistSection title="AI시스템 폐기" items={[
                { num: '⑮', text: 'AI시스템 구성요소 삭제 방안 마련', desc: '모델·학습데이터·벡터DB·로그 등 전체 완전 삭제 절차 수립' },
              ]} />
            </Card>

            <Card title="보안컨설팅 안내" icon="📞">
              <div style={{ padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' }}>
                <p style={{ color: '#93c5fd', fontWeight: 'bold', marginBottom: '8px' }}>AI 정보화사업 관련 보안대책 수립 등 상담이 필요한 경우:</p>
                <p style={{ color: '#d1d5db', margin: '4px 0' }}>이메일: aisecurity@nis.go.kr</p>
                <p style={{ color: '#d1d5db', margin: '4px 0' }}>전화: 02-2125-4140</p>
              </div>
            </Card>
          </div>
        )}

        {/* 위반유형별 법규 매핑 탭 */}
        {activeTab === 'mapping' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card title="검증 위반유형별 법규·위협·체크리스트 매핑" icon="🔗">
              <p style={{ color: '#94a3b8', marginBottom: '16px', lineHeight: 1.7 }}>
                이 시스템이 탐지하는 7가지 위반유형이 어떤 법규와 보안위협에 해당하는지, 어떤 체크리스트 항목을 준수해야 하는지 매핑한 정보입니다.
              </p>
              {violationLawMapping.map((v, i) => (
                <div key={i} style={{
                  marginBottom: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setExpandedViolation(expandedViolation === i ? null : i)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: expandedViolation === i ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                      border: 'none',
                      color: '#e5e7eb',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                    }}
                  >
                    <span>{i + 1}. {v.type}</span>
                    <span style={{ fontSize: '1.2rem' }}>{expandedViolation === i ? '▲' : '▼'}</span>
                  </button>
                  {expandedViolation === i && (
                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                      <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '0.9rem' }}>{v.description}</p>

                      <MappingSection title="관련 법규·가이드라인" color="#3b82f6" items={v.laws} />
                      <MappingSection title="해당 보안위협 (AI보안 가이드북)" color="#f59e0b" items={v.securityThreats} />
                      <MappingSection title="보안성검토 체크리스트 항목" color="#22c55e" items={v.checklistItems} />
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---- 재사용 컴포넌트 ---- */

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '24px',
    }}>
      <h2 style={{ color: '#e5e7eb', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
        {icon} {title}
      </h2>
      {children}
    </div>
  )
}

function LawCard({ num, title, color, items }: { num: string; title: string; color: string; items: string[] }) {
  return (
    <div style={{ padding: '16px', background: `${color}15`, borderLeft: `4px solid ${color}`, borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ background: color, color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{num}</span>
        <span style={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.9rem' }}>{title}</span>
      </div>
      <ul style={{ color: '#9ca3af', paddingLeft: '36px', fontSize: '0.85rem', lineHeight: 1.8, margin: 0 }}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  )
}

function GradeCard({ grade, color, desc, rule }: { grade: string; color: string; desc: string; rule: string }) {
  return (
    <div style={{ padding: '16px', background: `${color}15`, border: `2px solid ${color}`, borderRadius: '8px' }}>
      <div style={{ fontWeight: 'bold', color, fontSize: '1.1rem', marginBottom: '4px' }}>{grade}</div>
      <div style={{ color: '#d1d5db', fontSize: '0.85rem', marginBottom: '8px' }}>{desc}</div>
      <div style={{ color: '#9ca3af', fontSize: '0.8rem', lineHeight: 1.6 }}>{rule}</div>
    </div>
  )
}

function StepCard({ step, title, color, children }: { step: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px', padding: '16px', background: `${color}10`, borderLeft: `4px solid ${color}`, borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ background: color, color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>{step}</span>
        <span style={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '1.05rem' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function ChecklistSection({ title, items }: { title: string; items: { num: string; text: string; desc: string }[] }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ color: '#93c5fd', fontWeight: 'bold', fontSize: '1rem', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid rgba(147,197,253,0.2)' }}>
        {title}
      </h3>
      {items.map((item, i) => (
        <div key={i} style={{ padding: '10px 14px', marginBottom: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
          <div style={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '2px' }}>
            {item.num} {item.text}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{item.desc}</div>
        </div>
      ))}
    </div>
  )
}

function MappingSection({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ color, fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '6px' }}>{title}</div>
      <ul style={{ color: '#d1d5db', paddingLeft: '18px', fontSize: '0.83rem', lineHeight: 1.8, margin: 0 }}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  )
}
