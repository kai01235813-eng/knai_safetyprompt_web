'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface PromptInputProps {
  onValidate: (prompt: string, type?: 'text' | 'image') => void
  isValidating: boolean
  type?: 'text' | 'image'
}

export function PromptInput({ onValidate, isValidating, type = 'text' }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = () => {
    if (!prompt.trim()) {
      alert('프롬프트를 입력해주세요')
      return
    }

    onValidate(prompt, type)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="space-y-4">
      {/* 입력 영역 */}
      <div className="space-y-2">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          생성형AI에 전송할 프롬프트를 입력하세요
        </label>
        <Textarea
          id="prompt"
          placeholder="예: Python에서 리스트를 정렬하는 방법을 알려주세요..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[200px] font-mono text-sm"
          disabled={isValidating}
        />
        <p className="text-xs text-gray-500">
          💡 Ctrl+Enter를 눌러 빠르게 검증할 수 있습니다
        </p>
      </div>

      {/* 버튼 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {prompt.length > 0 && `${prompt.length} 글자`}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPrompt('')}
            disabled={isValidating || !prompt}
          >
            초기화
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isValidating || !prompt.trim()}
            className="min-w-[120px]"
          >
            {isValidating ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                검증 중...
              </>
            ) : (
              <>
                🔍 보안 검증
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 예시 프롬프트 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">📝 예시 프롬프트</p>
        <div className="space-y-2">
          <button
            onClick={() => setPrompt('Python에서 딕셔너리를 효율적으로 사용하는 방법을 알려주세요.')}
            className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-white p-2 rounded transition-colors"
          >
            ✅ 안전한 예시: "Python에서 딕셔너리를 효율적으로 사용하는 방법..."
          </button>
          <button
            onClick={() => setPrompt('제 주민번호는 990101-1234567이고 연락처는 010-1234-5678입니다.')}
            className="block w-full text-left text-sm text-red-600 hover:bg-white p-2 rounded transition-colors"
          >
            ⚠️ 위험한 예시: "제 주민번호는 990101-1234567이고..." (테스트용)
          </button>
        </div>
      </div>
    </div>
  )
}
