#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
이미지 OCR + 보안 검증 API
커맨드라인 인자로 이미지 경로를 받아 분석하고 JSON 결과 반환
"""

import sys
import json
import os

# 상대 경로 설정
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from image_analyzer import ImageSecurityAnalyzer


def main():
    try:
        # 커맨드라인 인자 확인
        if len(sys.argv) < 2:
            result = {
                'error': '이미지 파일 경로가 필요합니다',
                'success': False
            }
            print(json.dumps(result, ensure_ascii=False))
            sys.exit(1)

        image_path = sys.argv[1]

        # 이미지 파일 존재 확인
        if not os.path.exists(image_path):
            result = {
                'error': f'이미지 파일을 찾을 수 없습니다: {image_path}',
                'success': False
            }
            print(json.dumps(result, ensure_ascii=False))
            sys.exit(1)

        # Tesseract 경로 설정 (Windows)
        tesseract_path = None
        if sys.platform == 'win32':
            # 일반적인 Tesseract 설치 경로들
            possible_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                r'C:\Tesseract-OCR\tesseract.exe',
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    tesseract_path = path
                    break

        # 분석기 초기화
        try:
            analyzer = ImageSecurityAnalyzer(tesseract_path)
        except Exception as e:
            result = {
                'error': f'OCR 엔진 초기화 실패: {str(e)}. Tesseract OCR이 설치되어 있는지 확인하세요.',
                'success': False,
                'note': 'Tesseract 다운로드: https://github.com/UB-Mannheim/tesseract/wiki'
            }
            print(json.dumps(result, ensure_ascii=False))
            sys.exit(1)

        # 이미지 분석 실행
        analysis_result = analyzer.analyze_image(image_path)

        # 검증 결과
        validation = analysis_result.validation_result

        # JSON 결과 생성
        result = {
            'success': True,
            'extracted_text': analysis_result.extracted_text,
            'ocr_confidence': round(analysis_result.ocr_confidence, 2),
            'image_size': {
                'width': analysis_result.image_size[0],
                'height': analysis_result.image_size[1]
            },
            'file_size': analysis_result.file_size,
            
            # 검증 결과
            'is_safe': validation.is_safe,
            'security_level': validation.security_level.value,
            'risk_score': validation.risk_score,
            'violations': [
                {
                    'type': v.type.value,
                    'description': v.description,
                    'matched_text': v.matched_text,
                    'position': list(v.position),
                    'severity': v.severity
                }
                for v in validation.violations
            ],
            'sanitized_prompt': validation.sanitized_prompt,
            'original_prompt': validation.original_prompt,
            'recommendation': validation.recommendation,
            'timestamp': validation.timestamp
        }

        # stdout으로 JSON 출력
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)

    except Exception as e:
        error_result = {
            'error': f'이미지 분석 오류: {str(e)}',
            'success': False
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    # Windows UTF-8 인코딩 설정
    if sys.platform == 'win32':
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
    
    main()
