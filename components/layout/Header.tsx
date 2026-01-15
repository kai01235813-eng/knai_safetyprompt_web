import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                KEPCO 프롬프트 보안 검증
              </h1>
              <p className="text-xs text-gray-500">한국전력공사</p>
            </div>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              검증하기
            </Link>
            <Link
              href="/admin"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              관리자
            </Link>
            <Link
              href="/docs"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              사용 가이드
            </Link>
          </nav>

          {/* 버전 정보 */}
          <div className="text-sm text-gray-500">
            v2.1.0
          </div>
        </div>
      </div>
    </header>
  )
}
