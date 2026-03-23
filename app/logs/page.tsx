'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface LogEntry {
  id: string
  created_at: string
  nickname: string | null
  input_type: string
  prompt_hash: string
  prompt_length: number
  security_level: string
  risk_score: number
  is_safe: boolean
  violation_count: number
  violation_types: string[]
  violation_details: Array<{ type: string; description: string; severity: number }>
  regulation_refs: Array<{ law: string; article: string; source: string }>
  response_time_ms: number | null
  original_prompt: string | null
  sanitized_prompt: string | null
  recommendation: string | null
}

interface DashboardStats {
  period_days: number
  summary: {
    total_requests: number
    safe_count: number
    warning_count: number
    danger_count: number
    blocked_count: number
    avg_risk_score: number
    max_risk_score: number
    avg_response_ms: number
  }
  daily_trend: Array<{
    date: string
    total_requests: number
    safe_count: number
    warning_count: number
    danger_count: number
    blocked_count: number
    avg_risk_score: number
  }>
}

type TabId = 'dashboard' | 'logs'

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsPage, setLogsPage] = useState(0)
  const [levelFilter, setLevelFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const PAGE_SIZE = 20

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/logs?view=dashboard&days=30')
      if (!res.ok) throw new Error('통계 조회 실패')
      setStats(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLogs = useCallback(async (page: number, level: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/logs?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}&level=${level}`)
      if (!res.ok) throw new Error('로그 조회 실패')
      const data = await res.json()
      setLogs(data.logs || [])
      setLogsTotal(data.total || 0)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats()
    else fetchLogs(logsPage, levelFilter)
  }, [activeTab, logsPage, levelFilter, fetchStats, fetchLogs])

  const levelColors: Record<string, { bg: string; text: string; dot: string }> = {
    '안전': { bg: '#dcfce7', text: '#14532d', dot: '#22c55e' },
    '경고': { bg: '#fef3c7', text: '#78350f', dot: '#f59e0b' },
    '위험': { bg: '#fed7aa', text: '#7c2d12', dot: '#f97316' },
    '차단': { bg: '#fee2e2', text: '#7f1d1d', dot: '#ef4444' },
  }

  const totalPages = Math.ceil(logsTotal / PAGE_SIZE)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>
            검증 이력 대시보드
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
            보안성검토 체크리스트 ⑥ AI시스템 로깅·모니터링
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/" style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
            검증 시스템
          </Link>
          <Link href="/regulations" style={{ background: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
            법규 안내
          </Link>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: '4px', padding: '12px 24px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        {([['dashboard', '📊 통계 대시보드'], ['logs', '📋 검증 이력']] as [TabId, string][]).map(([id, label]) => (
          <button key={id} onClick={() => { setActiveTab(id); setLogsPage(0) }} style={{
            padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
            background: activeTab === id ? '#1e293b' : '#f1f5f9',
            color: activeTab === id ? 'white' : '#64748b',
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

        {error && (
          <div style={{ padding: '12px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>로딩 중...</div>
        )}

        {/* 대시보드 탭 */}
        {activeTab === 'dashboard' && stats && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 요약 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <StatCard label="총 검증 요청" value={stats.summary.total_requests ?? 0} color="#3b82f6" />
              <StatCard label="안전" value={stats.summary.safe_count ?? 0} color="#22c55e" />
              <StatCard label="경고" value={stats.summary.warning_count ?? 0} color="#f59e0b" />
              <StatCard label="위험" value={stats.summary.danger_count ?? 0} color="#f97316" />
              <StatCard label="차단" value={stats.summary.blocked_count ?? 0} color="#ef4444" />
              <StatCard label="평균 위험점수" value={stats.summary.avg_risk_score ?? 0} color="#8b5cf6" suffix="/100" />
            </div>

            {/* 등급 비율 바 */}
            {(stats.summary.total_requests ?? 0) > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>보안 등급 분포</h3>
                <div style={{ display: 'flex', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
                  {(['안전', '경고', '위험', '차단'] as const).map(level => {
                    const countKey = { '안전': 'safe_count', '경고': 'warning_count', '위험': 'danger_count', '차단': 'blocked_count' }[level] as keyof typeof stats.summary
                    const count = (stats.summary[countKey] as number) ?? 0
                    const pct = (count / stats.summary.total_requests) * 100
                    if (pct === 0) return null
                    return (
                      <div key={level} title={`${level}: ${count}건 (${pct.toFixed(1)}%)`} style={{
                        width: `${pct}%`,
                        background: levelColors[level]?.dot || '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 'bold', minWidth: pct > 5 ? 'auto' : '0',
                      }}>
                        {pct > 8 ? `${level} ${pct.toFixed(0)}%` : ''}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 일별 추이 */}
            {stats.daily_trend.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>일별 검증 추이 (최근 30일)</h3>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '120px', overflowX: 'auto' }}>
                  {stats.daily_trend.map((d, i) => {
                    const maxReqs = Math.max(...stats.daily_trend.map(x => x.total_requests), 1)
                    const h = Math.max((d.total_requests / maxReqs) * 100, 4)
                    return (
                      <div key={i} title={`${d.date}: ${d.total_requests}건`} style={{
                        flex: '1 0 12px', maxWidth: '24px',
                        height: `${h}%`, background: '#3b82f6', borderRadius: '3px 3px 0 0',
                        cursor: 'pointer', transition: 'opacity 0.2s',
                      }} />
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: '#94a3b8' }}>
                  <span>{stats.daily_trend[0]?.date}</span>
                  <span>{stats.daily_trend[stats.daily_trend.length - 1]?.date}</span>
                </div>
              </div>
            )}

            {/* 데이터 없음 */}
            {(stats.summary.total_requests ?? 0) === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</div>
                <h3 style={{ color: '#64748b', marginBottom: '8px' }}>아직 검증 이력이 없습니다</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>프롬프트 검증을 수행하면 이력이 자동으로 기록됩니다.</p>
                <Link href="/" style={{ display: 'inline-block', marginTop: '16px', background: '#3b82f6', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                  검증 시작하기
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 로그 목록 탭 */}
        {activeTab === 'logs' && !loading && (
          <div>
            {/* 필터 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>등급 필터:</span>
              {['all', '안전', '경고', '위험', '차단'].map(level => (
                <button key={level} onClick={() => { setLevelFilter(level); setLogsPage(0) }} style={{
                  padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                  background: levelFilter === level ? '#1e293b' : '#f1f5f9',
                  color: levelFilter === level ? 'white' : '#64748b',
                }}>
                  {level === 'all' ? '전체' : level}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '0.8rem' }}>
                총 {logsTotal}건
              </span>
            </div>

            {/* 테이블 */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      {['ID', '시각', '사용자', '유형', '등급', '위험점수', '위반', '위반유형', '길이', '응답(ms)'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#475569', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr><td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>검증 이력이 없습니다</td></tr>
                    ) : logs.map(log => {
                      const lc = levelColors[log.security_level] || { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' }
                      const isExpanded = expandedLog === log.id
                      return (
                        <tr key={log.id} onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                          style={{ borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9', cursor: 'pointer', background: isExpanded ? '#f8fafc' : 'transparent' }}
                          onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = '#fafbfc' }}
                          onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            #{log.id.slice(0, 8)}
                          </td>
                          <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                            {formatTime(log.created_at)}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontWeight: '600', color: '#1e40af' }}>
                              {log.nickname || '비로그인'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                              {log.input_type === 'image' ? '🖼 이미지' : '📝 텍스트'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: lc.bg, color: lc.text, padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: lc.dot, marginRight: '4px' }} />
                              {log.security_level}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>
                            <span style={{ color: log.risk_score >= 60 ? '#ef4444' : log.risk_score >= 40 ? '#f97316' : log.risk_score >= 15 ? '#f59e0b' : '#22c55e' }}>
                              {log.risk_score}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: log.violation_count > 0 ? '#ef4444' : '#94a3b8', fontWeight: log.violation_count > 0 ? 'bold' : 'normal' }}>
                            {log.violation_count}건
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.78rem' }}>
                            {(log.violation_types || []).length > 0
                              ? log.violation_types.join(', ')
                              : '-'
                            }
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{log.prompt_length}</td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{log.response_time_ms ?? '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* 확장된 로그 상세 */}
                {expandedLog && logs.filter(l => l.id === expandedLog).map(log => (
                  <div key={`detail-${log.id}`} style={{
                    padding: '16px 24px', background: '#f8fafc', borderTop: '1px dashed #e2e8f0', borderBottom: '1px solid #e2e8f0',
                  }}>
                    {/* 입력/출력 전문 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '6px', fontSize: '0.85rem' }}>입력 원문 (사용자 입력)</h4>
                        <div style={{
                          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px',
                          fontSize: '0.82rem', color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                          maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace',
                        }}>
                          {log.original_prompt || '(이전 로그: 원문 미저장)'}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 'bold', color: '#16a34a', marginBottom: '6px', fontSize: '0.85rem' }}>출력값 (필터링 결과)</h4>
                        <div style={{
                          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px',
                          fontSize: '0.82rem', color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                          maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace',
                        }}>
                          {log.sanitized_prompt || '(이전 로그: 출력 미저장)'}
                        </div>
                      </div>
                    </div>

                    {/* 기본 정보 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                      <InfoRow label="전체 ID" value={log.id} mono />
                      <InfoRow label="시각" value={formatTimeFull(log.created_at)} />
                      <InfoRow label="사용자" value={log.nickname || '비로그인'} />
                      <InfoRow label="보안 등급" value={`${log.security_level} (위험점수: ${log.risk_score})`} />
                      <InfoRow label="프롬프트 길이" value={`${log.prompt_length}자`} />
                      <InfoRow label="응답 시간" value={log.response_time_ms ? `${log.response_time_ms}ms` : '-'} />
                    </div>

                    {/* 위반 탐지 상세 (검증과정 분석 스타일) */}
                    {(log.violation_details || []).length > 0 ? (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', fontSize: '0.85rem' }}>
                          탐지된 위반사항 ({log.violation_count}건) - 위험점수 {log.risk_score}/100
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {log.violation_details.map((v, i) => {
                            const typeRegMap: Record<string, string[]> = {
                              '개인정보': ['개인정보보호법', 'T07', '⑦'],
                              '기밀정보': ['국가정보보안', 'N2SF', 'T05', '③'],
                              '기술정보': ['T01', 'T13', '⑩'],
                              '시스템정보': ['T06', 'T10', '⑧', '⑨'],
                              '조직정보': ['개인정보보호법', '개인정보 처리'],
                              '위치정보': ['M07', '③ 보안등급'],
                              '재무정보': ['제34조', '비공개', '④'],
                            }
                            const keywords = typeRegMap[v.type] || []
                            const matchedRefs = (log.regulation_refs || []).filter((r: any) =>
                              keywords.some((kw: string) => r.law?.includes(kw) || r.article?.includes(kw))
                            )
                            const srcColor: Record<string, string> = { privacy: '#3b82f6', security: '#f59e0b', checklist: '#22c55e' }
                            const srcLabel: Record<string, string> = { privacy: '개인정보보호', security: 'AI보안', checklist: '체크리스트' }

                            return (
                              <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                                      {v.type}
                                    </span>
                                    <span style={{ fontSize: '0.82rem', color: '#475569' }}>{v.description}</span>
                                  </div>
                                  <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>심각도 {v.severity}/10</span>
                                </div>
                                {matchedRefs.length > 0 && (
                                  <div style={{ padding: '6px 12px', background: '#eff6ff', borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                      {matchedRefs.slice(0, 3).map((r: any, ri: number) => (
                                        <span key={ri} style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                          <span style={{ background: srcColor[r.source] || '#94a3b8', color: 'white', padding: '1px 5px', borderRadius: '3px', fontSize: '0.63rem', fontWeight: 'bold' }}>
                                            {srcLabel[r.source] || r.source}
                                          </span>
                                          <span style={{ color: '#1e40af', fontWeight: '600' }}>{r.law}</span>
                                          <span style={{ color: '#64748b' }}>{r.article}</span>
                                          {ri < matchedRefs.slice(0, 3).length - 1 && <span style={{ color: '#cbd5e1' }}>│</span>}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center', color: '#16a34a', fontWeight: 'bold', marginBottom: '16px' }}>
                        위반사항 없음 - 안전한 프롬프트
                      </div>
                    )}

                    {/* 권장사항 */}
                    {log.recommendation && (
                      <div style={{ padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.82rem', color: '#92400e' }}>
                        <strong>권장사항:</strong> <span style={{ whiteSpace: 'pre-line' }}>{log.recommendation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', padding: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <button onClick={() => setLogsPage(Math.max(0, logsPage - 1))} disabled={logsPage === 0}
                    style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: logsPage === 0 ? 'default' : 'pointer', color: logsPage === 0 ? '#cbd5e1' : '#475569' }}>
                    이전
                  </button>
                  <span style={{ padding: '6px 12px', color: '#475569', fontSize: '0.85rem' }}>
                    {logsPage + 1} / {totalPages}
                  </span>
                  <button onClick={() => setLogsPage(Math.min(totalPages - 1, logsPage + 1))} disabled={logsPage >= totalPages - 1}
                    style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: logsPage >= totalPages - 1 ? 'default' : 'pointer', color: logsPage >= totalPages - 1 ? '#cbd5e1' : '#475569' }}>
                    다음
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color, suffix = '' }: { label: string; value: number; color: string; suffix?: string }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${color}` }}>
      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color }}>{value}{suffix}</div>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ color: '#94a3b8', minWidth: '90px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#1e293b', fontWeight: '500', fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? '0.78rem' : 'inherit', wordBreak: 'break-all' }}>
        {value}
      </span>
    </div>
  )
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ts || '-'
    const mm = (d.getMonth() + 1).toString().padStart(2, '0')
    const dd = d.getDate().toString().padStart(2, '0')
    const hh = d.getHours().toString().padStart(2, '0')
    const mi = d.getMinutes().toString().padStart(2, '0')
    return `${mm}/${dd} ${hh}:${mi}`
  } catch {
    return ts || '-'
  }
}

function formatTimeFull(ts: string): string {
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ts || '-'
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
  } catch {
    return ts || '-'
  }
}
