/**
 * Supabase 기반 감사 로그 시스템
 * SQLite audit_logger.py → Supabase PostgreSQL 포팅
 */

import { supabase } from './supabase'
import type { ValidationResult } from './validator'

function hashPrompt(prompt: string): string {
  // 간단한 해시 (브라우저/서버 양쪽 호환)
  let hash = 0
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

export async function logValidation(
  prompt: string,
  result: ValidationResult,
  options: {
    profileId?: string
    nickname?: string
    inputType?: 'text' | 'image'
    responseTimeMs?: number
  } = {}
) {
  const promptHash = hashPrompt(prompt)

  try {
    await supabase.from('validation_logs').insert({
      profile_id: options.profileId || null,
      nickname: options.nickname || null,
      input_type: options.inputType || 'text',
      prompt_hash: promptHash,
      prompt_length: prompt.length,
      security_level: result.security_level,
      risk_score: result.risk_score,
      is_safe: result.is_safe,
      violation_count: result.violations.length,
      violation_types: [...new Set(result.violations.map(v => v.type))],
      violation_details: result.violations.map(v => ({
        type: v.type,
        description: v.description,
        severity: v.severity,
      })),
      regulation_refs: result.regulation_refs.map(r => ({
        law: r.law,
        article: r.article,
        source: r.source,
      })),
      response_time_ms: options.responseTimeMs || null,
      original_prompt: prompt,
      sanitized_prompt: result.sanitized_prompt || null,
      recommendation: result.recommendation || null,
    })

    // 일별 통계 업데이트
    await updateDailyStats(result)
  } catch (err) {
    console.error('Audit log write failed:', err)
  }
}

async function updateDailyStats(result: ValidationResult) {
  const today = new Date().toISOString().slice(0, 10)
  const level = result.security_level

  const { data: existing } = await supabase
    .from('validation_daily_stats')
    .select('*')
    .eq('date', today)
    .single()

  if (existing) {
    const total = existing.total_requests + 1
    const newAvg = (existing.avg_risk_score * existing.total_requests + result.risk_score) / total
    await supabase.from('validation_daily_stats').update({
      total_requests: total,
      safe_count: existing.safe_count + (level === '안전' ? 1 : 0),
      warning_count: existing.warning_count + (level === '경고' ? 1 : 0),
      danger_count: existing.danger_count + (level === '위험' ? 1 : 0),
      blocked_count: existing.blocked_count + (level === '차단' ? 1 : 0),
      avg_risk_score: Math.round(newAvg * 10) / 10,
    }).eq('date', today)
  } else {
    await supabase.from('validation_daily_stats').insert({
      date: today,
      total_requests: 1,
      safe_count: level === '안전' ? 1 : 0,
      warning_count: level === '경고' ? 1 : 0,
      danger_count: level === '위험' ? 1 : 0,
      blocked_count: level === '차단' ? 1 : 0,
      avg_risk_score: result.risk_score,
    })
  }
}

export async function getRecentLogs(
  limit = 50,
  offset = 0,
  levelFilter?: string,
  nickname?: string
) {
  let query = supabase
    .from('validation_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (levelFilter && levelFilter !== 'all') {
    query = query.eq('security_level', levelFilter)
  }
  if (nickname) {
    query = query.eq('nickname', nickname)
  }

  const { data, count, error } = await query
  if (error) throw error

  return { total: count || 0, limit, offset, logs: data || [] }
}

export async function getLogDetail(logId: string) {
  const { data, error } = await supabase
    .from('validation_logs')
    .select('*')
    .eq('id', logId)
    .single()

  if (error) throw error
  return data
}

export async function getDashboardStats(days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString()

  // 전체 요약
  const { data: logs } = await supabase
    .from('validation_logs')
    .select('security_level, risk_score, response_time_ms')
    .gte('created_at', since)

  const allLogs = logs || []
  const summary = {
    total_requests: allLogs.length,
    safe_count: allLogs.filter(l => l.security_level === '안전').length,
    warning_count: allLogs.filter(l => l.security_level === '경고').length,
    danger_count: allLogs.filter(l => l.security_level === '위험').length,
    blocked_count: allLogs.filter(l => l.security_level === '차단').length,
    avg_risk_score: allLogs.length > 0
      ? Math.round(allLogs.reduce((s, l) => s + l.risk_score, 0) / allLogs.length * 10) / 10
      : 0,
    max_risk_score: allLogs.length > 0 ? Math.max(...allLogs.map(l => l.risk_score)) : 0,
    avg_response_ms: allLogs.length > 0
      ? Math.round(allLogs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / allLogs.length)
      : 0,
  }

  // 일별 추이
  const sinceDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  const { data: daily } = await supabase
    .from('validation_daily_stats')
    .select('*')
    .gte('date', sinceDate)
    .order('date', { ascending: true })

  return {
    period_days: days,
    summary,
    daily_trend: daily || [],
  }
}

export async function getUserValidationStats(nickname: string) {
  const { data, error } = await supabase
    .from('validation_logs')
    .select('security_level, risk_score, created_at')
    .eq('nickname', nickname)
    .order('created_at', { ascending: false })

  if (error) throw error
  const logs = data || []

  return {
    total: logs.length,
    safe: logs.filter(l => l.security_level === '안전').length,
    warning: logs.filter(l => l.security_level === '경고').length,
    danger: logs.filter(l => l.security_level === '위험').length,
    blocked: logs.filter(l => l.security_level === '차단').length,
    recent: logs.slice(0, 10),
  }
}
