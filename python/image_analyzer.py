"""
이미지 OCR 분석 및 보안 검증 모듈
이미지 내 텍스트를 추출하여 민감정보 탐지
"""

import os
from typing import Optional, Tuple
from dataclasses import dataclass
from PIL import Image
from ocr_engine import RapidOCR
from prompt_security_validator import KEPCOPromptSecurityValidator, ValidationResult


@dataclass
class ImageAnalysisResult:
    """이미지 분석 결과"""
    image_path: str
    extracted_text: str
    validation_result: ValidationResult
    image_size: Tuple[int, int]
    file_size: int
    ocr_confidence: float


class ImageSecurityAnalyzer:
    """이미지 보안 분석기"""

    def __init__(self):
        """초기화"""
        # OCR 엔진 초기화 (RapidOCR)
        self.ocr_engine = RapidOCR()
        if not self.ocr_engine.is_available():
            raise RuntimeError("RapidOCR를 사용할 수 없습니다. pip install rapidocr-onnxruntime")

        # 프롬프트 검증기 초기화
        self.validator = KEPCOPromptSecurityValidator()

        # 지원 이미지 형식
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif'}

    def is_supported_format(self, file_path: str) -> bool:
        """지원되는 이미지 형식인지 확인"""
        ext = os.path.splitext(file_path)[1].lower()
        return ext in self.supported_formats

    def extract_text_from_image(self, image_path: str) -> Tuple[str, float]:
        """
        이미지에서 텍스트 추출 (RapidOCR)

        Args:
            image_path: 이미지 파일 경로

        Returns:
            (추출된 텍스트, 신뢰도)
        """
        try:
            text, confidence, _, _ = self.ocr_engine.extract_text(image_path)
            return text, confidence
        except Exception as e:
            raise Exception(f"OCR 실패: {str(e)}")

    def analyze_image(self, image_path: str) -> ImageAnalysisResult:
        """
        이미지 보안 분석 실행

        Args:
            image_path: 이미지 파일 경로

        Returns:
            ImageAnalysisResult
        """
        # 파일 존재 확인
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {image_path}")

        # 지원 형식 확인
        if not self.is_supported_format(image_path):
            raise ValueError(f"지원되지 않는 이미지 형식입니다. 지원 형식: {self.supported_formats}")

        # 이미지 정보
        image = Image.open(image_path)
        image_size = image.size
        file_size = os.path.getsize(image_path)

        # OCR 텍스트 추출
        extracted_text, ocr_confidence = self.extract_text_from_image(image_path)

        # 보안 검증
        validation_result = self.validator.validate(extracted_text)

        return ImageAnalysisResult(
            image_path=image_path,
            extracted_text=extracted_text,
            validation_result=validation_result,
            image_size=image_size,
            file_size=file_size,
            ocr_confidence=ocr_confidence
        )


def main():
    """테스트 실행"""
    analyzer = ImageSecurityAnalyzer()

    print("=" * 80)
    print("이미지 보안 분석 테스트")
    print("=" * 80)

    # 테스트 이미지 경로 (실제 이미지 경로로 변경 필요)
    test_image = "test_image.png"

    if os.path.exists(test_image):
        try:
            result = analyzer.analyze_image(test_image)

            print(f"\n이미지 파일: {result.image_path}")
            print(f"이미지 크기: {result.image_size[0]} x {result.image_size[1]} pixels")
            print(f"파일 크기: {result.file_size / 1024:.2f} KB")
            print(f"OCR 신뢰도: {result.ocr_confidence:.1f}%")

            print(f"\n추출된 텍스트:")
            print("-" * 80)
            print(result.extracted_text)
            print("-" * 80)

            print(f"\n보안 검증 결과:")
            print(f"등급: {result.validation_result.security_level.value}")
            print(f"위험 점수: {result.validation_result.risk_score}/100")
            print(f"안전 여부: {'✅ 안전' if result.validation_result.is_safe else '❌ 위험'}")

            if result.validation_result.violations:
                print(f"\n위반사항 ({len(result.validation_result.violations)}건):")
                for i, v in enumerate(result.validation_result.violations, 1):
                    print(f"{i}. [{v.type.value}] {v.description}")

        except Exception as e:
            print(f"오류 발생: {e}")
    else:
        print(f"테스트 이미지가 없습니다: {test_image}")
        print("실제 이미지를 준비한 후 다시 시도하세요.")


if __name__ == "__main__":
    main()
