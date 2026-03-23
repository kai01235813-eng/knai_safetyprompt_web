/**
 * knai-zone 사용자 인증 연동
 * 동일한 Supabase 인스턴스의 profiles 테이블 공유
 */

import { supabase } from './supabase'

export interface UserProfile {
  id: string
  nickname: string
  character_id: number
  level: number
  exp: number
  total_exp: number
  badges: number
  is_admin: boolean
  role: 'admin' | 'team' | 'staff' | 'guest'
  profile_image?: string
}

// SHA-256 해시 (knai-zone과 동일한 방식)
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// 폴백 해시 맵 (knai-zone과 동일)
const FALLBACK_CODES: Record<string, { role: UserProfile['role']; isAdmin: boolean }> = {
  'd8ed6dce12debd773d0002946d364dfef16488283681a6666fb9585cfc7f7223': { role: 'staff', isAdmin: false },
  '432506aac5311cf811d137ba74ab73aa021081210e516ae0a20d54dba2037216': { role: 'team', isAdmin: false },
  '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0': { role: 'guest', isAdmin: false },
  'a98259fec378da0a51efcc0087ba53ba709f23f6500ed4ecf02ef7fe5accab67': { role: 'admin', isAdmin: true },
}

/** 멤버코드 검증 */
export async function validateMemberCode(code: string): Promise<{ valid: boolean; role: UserProfile['role']; isAdmin: boolean }> {
  const hash = await sha256(code)
  try {
    const { data, error } = await supabase.rpc('validate_member_code', { p_code_hash: hash })
    if (!error && data && data.valid) {
      return { valid: true, role: data.role || 'guest', isAdmin: data.is_admin || false }
    }
  } catch { /* DB 미구성 시 폴백 */ }

  if (hash in FALLBACK_CODES) {
    const fb = FALLBACK_CODES[hash]
    return { valid: true, role: fb.role, isAdmin: fb.isAdmin }
  }
  return { valid: false, role: 'guest', isAdmin: false }
}

/** 닉네임으로 프로필 조회 */
export async function getProfileByNickname(nickname: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, character_id, level, exp, total_exp, badges, is_admin, role, profile_image')
    .eq('nickname', nickname)
    .single()

  if (error || !data) return null
  return data as UserProfile
}

/** 전체 프로필 조회 (관리자용) */
export async function getAllProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, character_id, level, exp, total_exp, badges, is_admin, role, profile_image')
    .order('total_exp', { ascending: false })

  if (error) return []
  return (data || []) as UserProfile[]
}
