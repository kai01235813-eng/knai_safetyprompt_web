import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '프롬프트 마스킹',
  description: '민감정보를 자동으로 감지하고 마스킹합니다',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
