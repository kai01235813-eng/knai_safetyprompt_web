'use client'

import { useState, useEffect } from 'react'

interface UserSession {
  nickname: string
  role: string
  isAdmin: boolean
  profileId?: string
}

interface UserWithStats {
  id: string
  nickname: string
  role: string
  level: number
  total_exp: number
  is_admin: boolean
  profile_image?: string
  validationStats: {
    total: number
    safe: number
    warning: number
    danger: number
    blocked: number
  }
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
  }>
}

interface LogEntry {
  id: string
  created_at: string
  nickname: string
  input_type: string
  security_level: string
  risk_score: number
  violation_count: number
  violation_types: string[]
  prompt_length: number
}

const STORAGE_KEY = 'safety_prompt_user'

const LEVEL_COLORS: Record<string, string> = {
  '\uC548\uC804': '#22c55e',
  '\uACBD\uACE0': '#f59e0b',
  '\uC704\uD5D8': '#f97316',
  '\uCC28\uB2E8': '#ef4444',
}

export default function AdminPage() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [tab, setTab] = useState<'dashboard' | 'users' | 'logs'>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsPage, setLogsPage] = useState(0)
  const [levelFilter, setLevelFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const u = JSON.parse(saved)
        if (u.isAdmin) {
          setUser(u)
        }
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user?.isAdmin) return
    if (tab === 'dashboard') loadDashboard()
    if (tab === 'users') loadUsers()
    if (tab === 'logs') loadLogs()
  }, [user, tab, logsPage, levelFilter, selectedUser])

  const loadDashboard = async () => {
    try {
      const res = await fetch('/api/admin?action=dashboard&days=30')
      const data = await res.json()
      setStats(data)
    } catch (err) { console.error(err) }
  }

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin?action=users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) { console.error(err) }
  }

  const loadLogs = async () => {
    try {
      let url = `/api/admin?limit=20&offset=${logsPage * 20}&level=${levelFilter}`
      if (selectedUser) url += `&action=user-logs&nickname=${encodeURIComponent(selectedUser)}`
      const res = await fetch(url)
      const data = await res.json()
      setLogs(data.logs || [])
      setLogsTotal(data.total || 0)
    } catch (err) { console.error(err) }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>

  if (!user?.isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{'\u{1F6AB}'}</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '0.5rem' }}>접근 권한이 없습니다</h1>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>관리자 계정으로 로그인해주세요</p>
          <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>{'\u2190'} 메인으로 돌아가기</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* 헤더 */}
      <header style={{ background: '#1e293b', color: 'white', padding: '1rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>{'\u{1F6E1}\uFE0F'} 보안검증 관리자 대시보드</h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>KNAI Safety Prompt Admin</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{user.nickname} (ADMIN)</span>
            <a href="/" style={{ padding: '0.4rem 0.8rem', background: '#475569', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem' }}>
              {'\u2190'} 메인
            </a>
          </div>
        </div>
      </header>

      {/* 탭 */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: '0' }}>
          {(['dashboard', 'users', 'logs'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelectedUser(null); setLogsPage(0) }} style={{
              padding: '1rem 1.5rem', background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#1e40af' : '#6b7280', border: 'none',
              borderBottom: tab === t ? '3px solid #3b82f6' : '3px solid transparent',
              fontWeight: tab === t ? 'bold' : 'normal', cursor: 'pointer', fontSize: '0.95rem',
            }}>
              {t === 'dashboard' ? '\u{1F4CA} 대시보드' : t === 'users' ? '\u{1F465} 사용자 관리' : '\u{1F4CB} 전체 로그'}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>

        {/* 대시보드 탭 */}
        {tab === 'dashboard' && stats && (
          <div>
            {/* 요약 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: '총 검증 요청', value: stats.summary.total_requests, color: '#3b82f6', bg: '#eff6ff' },
                { label: '안전', value: stats.summary.safe_count, color: '#22c55e', bg: '#f0fdf4' },
                { label: '경고', value: stats.summary.warning_count, color: '#f59e0b', bg: '#fffbeb' },
                { label: '위험', value: stats.summary.danger_count, color: '#f97316', bg: '#fff7ed' },
                { label: '차단', value: stats.summary.blocked_count, color: '#ef4444', bg: '#fef2f2' },
                { label: '평균 위험점수', value: stats.summary.avg_risk_score, color: '#8b5cf6', bg: '#f5f3ff' },
              ].map((card, i) => (
                <div key={i} style={{ background: card.bg, border: `1px solid ${card.color}20`, borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>{card.label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* 일별 추이 */}
            {stats.daily_trend.length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>{'\u{1F4C8}'} 일별 검증 추이 (최근 30일)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['날짜', '총 요청', '안전', '경고', '위험', '차단'].map(h => (
                          <th key={h} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.daily_trend.slice(-14).reverse().map((d, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.6rem', textAlign: 'center', color: '#374151' }}>{d.date}</td>
                          <td style={{ padding: '0.6rem', textAlign: 'center', fontWeight: 'bold' }}>{d.total_requests}</td>
                          <td style={{ padding: '0.6rem', textAlign: 'center', color: '#22c55e' }}>{d.safe_count}</td>
                          <td style={{ padding: '0.6rem', textAlign: 'center', color: '#f59e0b' }}>{d.warning_count}</td>
                          <td style={{ padding: '0.6rem', textAlign: 'center', color: '#f97316' }}>{d.danger_count}</td>
                          <td style={{ padding: '0.6rem', textAlign: 'center', color: '#ef4444' }}>{d.blocked_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 사용자 관리 탭 */}
        {tab === 'users' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {'\u{1F465}'} 등록 사용자 ({users.length}명)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['닉네임', '등급', '레벨', 'EXP', '총 검증', '안전', '경고', '위험', '차단', '상세'].map(h => (
                      <th key={h} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem', textAlign: 'center', fontWeight: 'bold', color: '#1e40af' }}>{u.nickname}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        <span style={{
                          background: u.is_admin ? '#ef4444' : u.role === 'team' ? '#3b82f6' : '#6b7280',
                          color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>Lv.{u.level}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', color: '#6b7280' }}>{u.total_exp}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', fontWeight: 'bold' }}>{u.validationStats?.total || 0}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', color: '#22c55e' }}>{u.validationStats?.safe || 0}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', color: '#f59e0b' }}>{u.validationStats?.warning || 0}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', color: '#f97316' }}>{u.validationStats?.danger || 0}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', color: '#ef4444' }}>{u.validationStats?.blocked || 0}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        <button
                          onClick={() => { setSelectedUser(u.nickname); setTab('logs'); setLogsPage(0) }}
                          style={{ padding: '4px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          로그 보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>등록된 사용자가 없습니다</div>
            )}
          </div>
        )}

        {/* 전체 로그 탭 */}
        {tab === 'logs' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                {'\u{1F4CB}'} {selectedUser ? `${selectedUser}의 검증 이력` : '전체 검증 로그'} ({logsTotal}건)
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {selectedUser && (
                  <button onClick={() => setSelectedUser(null)} style={{
                    padding: '4px 10px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                  }}>
                    {'\u2715'} 필터 해제
                  </button>
                )}
                <select
                  value={levelFilter}
                  onChange={e => { setLevelFilter(e.target.value); setLogsPage(0) }}
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="all">전체</option>
                  <option value="안전">안전</option>
                  <option value="경고">경고</option>
                  <option value="위험">위험</option>
                  <option value="차단">차단</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['시간', '사용자', '유형', '보안등급', '위험점수', '위반건수', '위반유형'].map(h => (
                      <th key={h} style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
                        {new Date(log.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', fontWeight: '500', color: '#1e40af' }}>{log.nickname || '-'}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>{log.input_type === 'image' ? '\u{1F5BC}\uFE0F' : '\u{1F4DD}'}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        <span style={{
                          background: LEVEL_COLORS[log.security_level] || '#6b7280',
                          color: 'white', padding: '3px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold',
                        }}>
                          {log.security_level}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', fontWeight: 'bold' }}>{log.risk_score}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>{log.violation_count}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
                        {Array.isArray(log.violation_types) ? log.violation_types.join(', ') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>검증 로그가 없습니다</div>
            )}

            {/* 페이지네이션 */}
            {logsTotal > 20 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setLogsPage(Math.max(0, logsPage - 1))}
                  disabled={logsPage === 0}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', cursor: logsPage === 0 ? 'not-allowed' : 'pointer', background: 'white', color: logsPage === 0 ? '#d1d5db' : '#374151' }}
                >
                  {'\u2190'} 이전
                </button>
                <span style={{ padding: '0.5rem 1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  {logsPage + 1} / {Math.ceil(logsTotal / 20)}
                </span>
                <button
                  onClick={() => setLogsPage(logsPage + 1)}
                  disabled={(logsPage + 1) * 20 >= logsTotal}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', cursor: (logsPage + 1) * 20 >= logsTotal ? 'not-allowed' : 'pointer', background: 'white', color: (logsPage + 1) * 20 >= logsTotal ? '#d1d5db' : '#374151' }}
                >
                  다음 {'\u2192'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
