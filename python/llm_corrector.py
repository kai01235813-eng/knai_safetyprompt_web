#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
전력산업 OCR 텍스트 교정 모듈
Hugging Face Inference API를 사용하여 OCR 오타를 교정

Requirements:
    - pip install requests
    - 환경변수: HF_API_KEY (Hugging Face API 토큰)

사용법:
    corrector = PowerIndustryOCRCorrector()
    result = corrector.correct_text(ocr_raw_text)
"""

import os
import json
import re
from typing import Optional, Dict, Any
import requests


# ============================================================
# 전력산업 도메인 특화 System Prompt
# ============================================================

POWER_INDUSTRY_SYSTEM_PROMPT = """당신은 한국 전력산업 문서 전문가입니다. 전기사용신청서, 전력수급계약서 등의 OCR 추출 텍스트에서 발생한 오타를 교정합니다.

## 핵심 전력산업 용어 (반드시 정확히 교정)

### 신청서 기본 항목
- 신청일자 (오타: 신정일자, 싱청일자, 신청일짜)
- 접수번호 (오타: 접수빈호, 접수번흐, 점수번호)
- 신청인 (오타: 싱청인, 신정인)
- 성명/상호 (오타: 상흐, 싱명)
- 사업자등록번호 (오타: 사업지등록번호, 사업자등록빈호)
- 주민등록번호 (오타: 주민등록빈호)
- 전화번호 (오타: 전화빈호, 전화번흐)

### 계약 관련
- 계약전력 (오타: 게약전력, 계약진력, 게약진력)
- 계약종별 (오타: 게약종별, 계약종볕)
- 사용용도 (오타: 사용용드, 시용용도)
- 공급방식 (오타: 공급방싱, 곻급방식)
- 수급지점 (오타: 수급지짐, 수급짓점, 숫급지점)

### 전압/전력 관련
- 수전전압 (오타: 수전진압, 숫전전압)
- 수전용량 (오타: 수전용령, 숫전용량)
- 저압 (오타: 저앞)
- 고압 (오타: 곻압)
- 특고압 (오타: 특곻압)
- 단상 (오타: 단싱)
- 3상 (오타: 3싱)

### 설비 관련
- 변압기 (오타: 변압끼, 빈압기)
- 차단기 (오타: 차단끼)
- 계량기 (오타: 게량기, 게량끼)
- 배전반 (오타: 배전빈)
- 수전설비 (오타: 수전실비, 숫전설비)

### 단위
- kW (킬로와트)
- kVA (킬로볼트암페어)
- kWh (킬로와트시)
- V (볼트)
- A (암페어)

### 기관/회사
- 한국전력공사 (오타: 한국진력공사)
- 한전 (오타: 한진)
- 수용가 (오타: 수용까)
- 전기안전공사

### 기타 중요 용어
- 역률 (오타: 역륨)
- 부하 (오타: 부하)
- 전력량 (오타: 진력량)
- 기본요금 (오타: 끼본요금)
- 사용요금 (오타: 사용요끔)
- 전기요금 (오타: 진기요금, 전끼요금)

## 교정 규칙

1. **문맥 기반 교정**: 전력산업 문서 맥락에서 의미가 통하도록 교정
2. **숫자 보존**: 계량값, 금액, 날짜의 숫자는 변경하지 않음
3. **형식 유지**: 날짜(YYYY-MM-DD, YYYY.MM.DD), 금액(원), 전력(kW) 형식 유지
4. **불확실한 경우**: 원문 유지 (과도한 추측 금지)

## 출력 형식

반드시 아래 JSON 형식으로만 응답하세요. 다른 설명 없이 JSON만 출력합니다:

```json
{
  "corrected_text": "교정된 전체 텍스트",
  "corrections": [
    {
      "original": "원본 단어/구문",
      "corrected": "교정된 단어/구문",
      "type": "spelling|domain_term|format"
    }
  ],
  "confidence": 0.0~1.0,
  "extracted_fields": {
    "신청일자": "추출된 값 또는 null",
    "접수번호": "추출된 값 또는 null",
    "신청인": "추출된 값 또는 null",
    "계약전력": "추출된 값 또는 null",
    "공급방식": "추출된 값 또는 null",
    "수급지점": "추출된 값 또는 null",
    "수전전압": "추출된 값 또는 null",
    "사업자등록번호": "추출된 값 또는 null",
    "전화번호": "추출된 값 또는 null",
    "주소": "추출된 값 또는 null"
  }
}
```"""


# ============================================================
# LLM Corrector Class
# ============================================================

class PowerIndustryOCRCorrector:
    """
    전력산업 OCR 텍스트 교정기
    Hugging Face Inference API 사용
    """

    # 지원 모델 목록 (무료 Inference API 사용 가능)
    SUPPORTED_MODELS = {
        "llama3-8b": "meta-llama/Meta-Llama-3-8B-Instruct",
        "llama3-70b": "meta-llama/Meta-Llama-3-70B-Instruct",
        "qwen2.5-72b": "Qwen/Qwen2.5-72B-Instruct",
        "qwen2.5-7b": "Qwen/Qwen2.5-7B-Instruct",
        "mistral-7b": "mistralai/Mistral-7B-Instruct-v0.3",
    }

    # 기본 모델 (가벼움 + 성능 균형)
    DEFAULT_MODEL = "qwen2.5-7b"

    def __init__(self, model_name: Optional[str] = None):
        """
        초기화

        Args:
            model_name: 사용할 모델 (기본값: qwen2.5-7b)
        """
        self.api_key = os.getenv("HF_API_KEY")
        if not self.api_key:
            raise ValueError(
                "HF_API_KEY 환경변수가 설정되지 않았습니다. "
                ".env 파일에 HF_API_KEY=your_token 형식으로 추가하세요."
            )

        # 모델 설정
        model_key = model_name or self.DEFAULT_MODEL
        if model_key in self.SUPPORTED_MODELS:
            self.model_id = self.SUPPORTED_MODELS[model_key]
        else:
            # 사용자 지정 모델 ID 직접 사용
            self.model_id = model_key

        self.api_url = f"https://api-inference.huggingface.co/models/{self.model_id}"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def correct_text(
        self,
        ocr_text: str,
        max_tokens: int = 2048,
        temperature: float = 0.1,
        timeout: int = 60
    ) -> Dict[str, Any]:
        """
        OCR 텍스트 교정

        Args:
            ocr_text: OCR로 추출한 원본 텍스트
            max_tokens: 최대 생성 토큰 수
            temperature: 생성 다양성 (낮을수록 결정적)
            timeout: API 요청 타임아웃 (초)

        Returns:
            Dict containing:
                - success: bool
                - corrected_text: 교정된 텍스트
                - corrections: 교정 목록
                - confidence: 신뢰도
                - extracted_fields: 추출된 필드
                - raw_response: LLM 원본 응답 (디버깅용)
                - error: 오류 메시지 (실패 시)
        """
        if not ocr_text or not ocr_text.strip():
            return {
                "success": False,
                "error": "입력 텍스트가 비어있습니다.",
                "corrected_text": "",
                "corrections": [],
                "confidence": 0.0,
                "extracted_fields": {}
            }

        # 사용자 프롬프트 구성
        user_prompt = f"""다음은 전기사용신청서를 OCR로 추출한 텍스트입니다. 팩스 노이즈로 인해 오타가 있을 수 있습니다.
전력산업 용어에 맞게 오타를 교정하고, JSON 형식으로 응답하세요.

--- OCR 추출 텍스트 ---
{ocr_text}
--- 끝 ---

위 텍스트를 교정하고 JSON으로 응답하세요."""

        # Hugging Face API 요청 페이로드
        payload = {
            "inputs": self._format_chat_prompt(user_prompt),
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": temperature,
                "return_full_text": False,
                "do_sample": temperature > 0,
            }
        }

        try:
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=timeout
            )

            # API 오류 처리
            if response.status_code == 401:
                return {
                    "success": False,
                    "error": "HF_API_KEY가 유효하지 않습니다.",
                    "corrected_text": ocr_text,
                    "corrections": [],
                    "confidence": 0.0,
                    "extracted_fields": {}
                }
            elif response.status_code == 503:
                return {
                    "success": False,
                    "error": "모델이 로딩 중입니다. 잠시 후 다시 시도하세요.",
                    "corrected_text": ocr_text,
                    "corrections": [],
                    "confidence": 0.0,
                    "extracted_fields": {}
                }
            elif response.status_code != 200:
                return {
                    "success": False,
                    "error": f"API 오류 ({response.status_code}): {response.text}",
                    "corrected_text": ocr_text,
                    "corrections": [],
                    "confidence": 0.0,
                    "extracted_fields": {}
                }

            # 응답 파싱
            result = response.json()
            raw_response = ""

            if isinstance(result, list) and len(result) > 0:
                raw_response = result[0].get("generated_text", "")
            elif isinstance(result, dict):
                raw_response = result.get("generated_text", "")

            # JSON 추출 및 파싱
            parsed = self._parse_json_response(raw_response)
            parsed["raw_response"] = raw_response
            parsed["success"] = True

            # 교정 실패 시 원본 반환
            if not parsed.get("corrected_text"):
                parsed["corrected_text"] = ocr_text

            return parsed

        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": f"API 요청 타임아웃 ({timeout}초)",
                "corrected_text": ocr_text,
                "corrections": [],
                "confidence": 0.0,
                "extracted_fields": {}
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"네트워크 오류: {str(e)}",
                "corrected_text": ocr_text,
                "corrections": [],
                "confidence": 0.0,
                "extracted_fields": {}
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"예상치 못한 오류: {str(e)}",
                "corrected_text": ocr_text,
                "corrections": [],
                "confidence": 0.0,
                "extracted_fields": {}
            }

    def _format_chat_prompt(self, user_message: str) -> str:
        """
        모델에 맞는 Chat 형식으로 프롬프트 구성

        Llama 3, Qwen 2.5 모두 호환되는 형식 사용
        """
        # ChatML 형식 (Qwen, Llama 3 호환)
        return f"""<|im_start|>system
{POWER_INDUSTRY_SYSTEM_PROMPT}
<|im_end|>
<|im_start|>user
{user_message}
<|im_end|>
<|im_start|>assistant
"""

    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """
        LLM 응답에서 JSON 추출 및 파싱
        """
        default_result = {
            "corrected_text": "",
            "corrections": [],
            "confidence": 0.0,
            "extracted_fields": {}
        }

        if not response_text:
            return default_result

        # JSON 블록 추출 (```json ... ``` 또는 { ... })
        json_patterns = [
            r'```json\s*([\s\S]*?)\s*```',  # ```json ... ```
            r'```\s*([\s\S]*?)\s*```',       # ``` ... ```
            r'(\{[\s\S]*\})',                # { ... }
        ]

        json_str = None
        for pattern in json_patterns:
            match = re.search(pattern, response_text)
            if match:
                json_str = match.group(1).strip()
                break

        if not json_str:
            # JSON을 찾지 못한 경우 전체 텍스트를 corrected_text로 사용
            return {
                "corrected_text": response_text.strip(),
                "corrections": [],
                "confidence": 0.5,
                "extracted_fields": {}
            }

        try:
            parsed = json.loads(json_str)
            return {
                "corrected_text": parsed.get("corrected_text", ""),
                "corrections": parsed.get("corrections", []),
                "confidence": float(parsed.get("confidence", 0.0)),
                "extracted_fields": parsed.get("extracted_fields", {})
            }
        except json.JSONDecodeError:
            # JSON 파싱 실패 시
            return {
                "corrected_text": response_text.strip(),
                "corrections": [],
                "confidence": 0.3,
                "extracted_fields": {}
            }


# ============================================================
# 간편 함수
# ============================================================

def correct_ocr_text(
    ocr_text: str,
    model_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    OCR 텍스트 교정 간편 함수

    Args:
        ocr_text: OCR 추출 텍스트
        model_name: 모델 이름 (기본: qwen2.5-7b)

    Returns:
        교정 결과 딕셔너리
    """
    corrector = PowerIndustryOCRCorrector(model_name)
    return corrector.correct_text(ocr_text)


# ============================================================
# 테스트
# ============================================================

if __name__ == "__main__":
    # 테스트용 OCR 텍스트 (일부러 오타 포함)
    test_ocr_text = """
    전기사용싱청서

    신정일자: 2024.01.15
    접수빈호: 2024-00123

    싱청인 정보
    성명/상흐: 홍길동
    사업지등록번호: 123-45-67890
    전화빈호: 010-1234-5678

    게약 정보
    게약전력: 50kW
    곻급방식: 저앞 단싱 220V
    수급짓점: 서울시 강남구 테헤란로 123

    설비 현황
    빈압기: 75kVA
    차단끼: 100A
    게량끼 번호: M-2024-0001
    """

    print("=== 전력산업 OCR 텍스트 교정 테스트 ===\n")
    print("원본 텍스트:")
    print(test_ocr_text)
    print("\n" + "=" * 50 + "\n")

    try:
        result = correct_ocr_text(test_ocr_text)

        if result["success"]:
            print("교정된 텍스트:")
            print(result["corrected_text"])
            print(f"\n신뢰도: {result['confidence']}")
            print(f"\n교정 항목 수: {len(result['corrections'])}")

            if result["corrections"]:
                print("\n교정 내역:")
                for corr in result["corrections"]:
                    print(f"  - '{corr['original']}' → '{corr['corrected']}' ({corr['type']})")

            if result["extracted_fields"]:
                print("\n추출된 필드:")
                for key, value in result["extracted_fields"].items():
                    if value:
                        print(f"  - {key}: {value}")
        else:
            print(f"오류: {result['error']}")

    except ValueError as e:
        print(f"설정 오류: {e}")
