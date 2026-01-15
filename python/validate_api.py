#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
KEPCO 프롬프트 보안 검증 API
stdin으로 JSON 입력을 받아 검증하고 stdout으로 JSON 결과를 반환
"""

import sys
import json
import os
import io

# Windows에서 UTF-8 강제 설정
if sys.platform == 'win32':
    # stdin/stdout을 UTF-8로 재설정
    sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True, write_through=True)
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', line_buffering=True, write_through=True)

# 기존 검증 엔진 임포트 (상대 경로)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from prompt_security_validator import KEPCOPromptSecurityValidator


def main():
    try:
        # stdin에서 JSON 입력 읽기
        input_data = sys.stdin.read()
        
        # JSON 파싱
        data = json.loads(input_data)

        prompt = data.get('prompt', '')

        if not prompt:
            result = {
                'error': '프롬프트가 비어있습니다',
                'success': False
            }
            print(json.dumps(result, ensure_ascii=False), flush=True)
            sys.exit(1)

        # 검증 엔진 초기화
        validator = KEPCOPromptSecurityValidator()

        # 검증 실행
        validation_result = validator.validate(prompt)

        # 결과를 JSON으로 변환
        result = {
            'success': True,
            'is_safe': validation_result.is_safe,
            'security_level': validation_result.security_level.value,
            'risk_score': validation_result.risk_score,
            'violations': [
                {
                    'type': v.type.value,
                    'description': v.description,
                    'matched_text': v.matched_text,
                    'position': list(v.position),
                    'severity': v.severity
                }
                for v in validation_result.violations
            ],
            'sanitized_prompt': validation_result.sanitized_prompt,
            'original_prompt': validation_result.original_prompt,
            'recommendation': validation_result.recommendation,
            'timestamp': validation_result.timestamp
        }

        # stdout으로 JSON 출력 (ensure_ascii=False로 한글 유지)
        print(json.dumps(result, ensure_ascii=False), flush=True)
        sys.exit(0)

    except json.JSONDecodeError as e:
        error_result = {
            'error': f'JSON 파싱 오류: {str(e)}',
            'success': False
        }
        print(json.dumps(error_result, ensure_ascii=False), flush=True)
        sys.exit(1)

    except Exception as e:
        error_result = {
            'error': f'검증 오류: {str(e)}',
            'success': False
        }
        print(json.dumps(error_result, ensure_ascii=False), flush=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
