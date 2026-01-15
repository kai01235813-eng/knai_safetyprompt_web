'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FilteredPromptProps {
  sanitizedPrompt: string
}

export function FilteredPrompt({ sanitizedPrompt }: FilteredPromptProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sanitizedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      alert('복사에 실패했습니다')
    }
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🛡️</span>
          보안 필터 적용된 프롬프트
        </CardTitle>
        <CardDescription className="text-blue-700">
          민감정보가 *** 로 마스킹 처리되었습니다. 이 프롬프트를 복사하여 안전하게 사용하세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 필터링된 텍스트 */}
        <div className="relative">
          <div className="p-4 bg-white rounded-lg border border-blue-300 font-mono text-sm whitespace-pre-wrap min-h-[150px] max-h-[400px] overflow-y-auto">
            {sanitizedPrompt}
          </div>
          {sanitizedPrompt.includes('***') && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚠️ 마스킹 적용됨
              </span>
            </div>
          )}
        </div>

        {/* 복사 버튼 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {sanitizedPrompt.length} 글자
            {sanitizedPrompt.includes('***') && (
              <span className="ml-2 text-blue-600">
                • 민감정보가 제거되었습니다
              </span>
            )}
          </div>
          <Button
            onClick={handleCopy}
            className={`min-w-[140px] transition-all ${
              copied
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {copied ? (
              <>
                <span className="mr-2">✓</span>
                복사 완료!
              </>
            ) : (
              <>
                <span className="mr-2">📋</span>
                프롬프트 복사
              </>
            )}
          </Button>
        </div>

        {/* 사용 안내 */}
        <div className="p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 사용 방법:</strong> 위의 "프롬프트 복사" 버튼을 클릭한 후,
            ChatGPT, Claude 등 생성형AI 서비스에 붙여넣기(Ctrl+V)하여 사용하세요.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
