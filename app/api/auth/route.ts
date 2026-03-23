import { NextRequest, NextResponse } from 'next/server'
import { validateMemberCode, getProfileByNickname } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { nickname, memberCode } = await request.json()

    if (!nickname || !memberCode) {
      return NextResponse.json({ error: '닉네임과 멤버코드를 입력해주세요' }, { status: 400 })
    }

    // 멤버코드 검증
    const codeResult = await validateMemberCode(memberCode)
    if (!codeResult.valid) {
      return NextResponse.json({ error: '유효하지 않은 멤버코드입니다' }, { status: 401 })
    }

    // 프로필 조회
    const profile = await getProfileByNickname(nickname)

    return NextResponse.json({
      success: true,
      user: {
        nickname,
        role: codeResult.role,
        isAdmin: codeResult.isAdmin,
        profile: profile || null,
      },
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: '인증 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
