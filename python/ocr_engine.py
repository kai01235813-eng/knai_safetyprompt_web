#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
OCR 엔진 추상화 레이어
Tesseract, PaddleOCR(RapidOCR) 등 OCR 엔진을 쉽게 교체할 수 있도록 인터페이스 제공

사용법:
    # Tesseract 사용
    ocr = TesseractOCR(tesseract_path)
    text, confidence, size, file_size = ocr.extract_text("image.png")

    # 나중에 PaddleOCR로 교체
    ocr = PaddleOCR()
    text, confidence, size, file_size = ocr.extract_text("image.png")
"""

import os
from abc import ABC, abstractmethod
from typing import Tuple, Optional
from PIL import Image


class OCREngine(ABC):
    """
    OCR 엔진 추상 인터페이스

    새로운 OCR 엔진을 추가하려면 이 클래스를 상속받아 구현:
    - TesseractOCR: 현재 사용 중
    - RapidOCR: PaddleOCR 기반 (향후 마이그레이션 예정)
    """

    @abstractmethod
    def extract_text(self, image_path: str) -> Tuple[str, float, Tuple[int, int], int]:
        """
        이미지에서 텍스트 추출

        Args:
            image_path: 이미지 파일 경로

        Returns:
            Tuple[str, float, Tuple[int, int], int]:
                - extracted_text: 추출된 텍스트
                - confidence: OCR 신뢰도 (0-100)
                - image_size: (width, height)
                - file_size: 파일 크기 (bytes)
        """
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """OCR 엔진 사용 가능 여부"""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """OCR 엔진 이름"""
        pass

    def _get_image_info(self, image_path: str) -> Tuple[Tuple[int, int], int]:
        """이미지 정보 추출 (공통)"""
        image = Image.open(image_path)
        image_size = image.size
        file_size = os.path.getsize(image_path)
        return image_size, file_size

    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """이미지 전처리 (공통)"""
        # RGB 변환
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # 해상도가 너무 낮으면 확대
        width, height = image.size
        if width < 1000 or height < 1000:
            scale = max(1000 / width, 1000 / height)
            new_size = (int(width * scale), int(height * scale))
            image = image.resize(new_size, Image.Resampling.LANCZOS)

        return image


class TesseractOCR(OCREngine):
    """
    Tesseract OCR 엔진

    Requirements:
        - pip install pytesseract pillow
        - Tesseract OCR 설치: https://github.com/UB-Mannheim/tesseract/wiki
    """

    def __init__(self, tesseract_path: Optional[str] = None):
        """
        Args:
            tesseract_path: Tesseract 실행 파일 경로 (Windows의 경우)
        """
        import pytesseract
        self._pytesseract = pytesseract

        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path

        # 초기화 시 사용 가능 여부 확인
        self._available = self._check_availability()

    def _check_availability(self) -> bool:
        """Tesseract 사용 가능 여부 확인"""
        try:
            self._pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    @property
    def name(self) -> str:
        return "tesseract"

    def is_available(self) -> bool:
        return self._available

    def extract_text(self, image_path: str) -> Tuple[str, float, Tuple[int, int], int]:
        if not self._available:
            raise RuntimeError("Tesseract OCR is not available")

        # 이미지 정보
        image_size, file_size = self._get_image_info(image_path)

        # 이미지 로드 및 전처리
        image = Image.open(image_path)
        image = self._preprocess_image(image)

        # OCR 실행 - 상세 데이터 포함
        ocr_data = self._pytesseract.image_to_data(
            image,
            lang='kor+eng',
            output_type=self._pytesseract.Output.DICT
        )

        # 텍스트 및 신뢰도 추출
        text_parts = []
        confidences = []

        for i, conf in enumerate(ocr_data['conf']):
            if conf > 0:  # 유효한 인식 결과만
                text = ocr_data['text'][i].strip()
                if text:
                    text_parts.append(text)
                    confidences.append(conf)

        # 전체 텍스트 조합
        extracted_text = ' '.join(text_parts)

        # 평균 신뢰도 계산
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        return extracted_text, avg_confidence, image_size, file_size


class RapidOCR(OCREngine):
    """
    RapidOCR 엔진 (PaddleOCR 기반)

    Requirements:
        - pip install rapidocr-onnxruntime pillow

    장점:
        - 한국어 인식률이 Tesseract보다 우수
        - GPU 없이도 빠른 속도
        - 메모리 효율적
    """

    def __init__(self):
        """RapidOCR 초기화"""
        self._engine = None
        self._available = self._check_availability()

    def _check_availability(self) -> bool:
        """RapidOCR 사용 가능 여부 확인"""
        try:
            from rapidocr_onnxruntime import RapidOCR as _RapidOCR
            self._engine = _RapidOCR()
            return True
        except ImportError:
            return False
        except Exception:
            return False

    @property
    def name(self) -> str:
        return "rapidocr"

    def is_available(self) -> bool:
        return self._available

    def extract_text(self, image_path: str) -> Tuple[str, float, Tuple[int, int], int]:
        if not self._available or not self._engine:
            raise RuntimeError("RapidOCR is not available. Install with: pip install rapidocr-onnxruntime")

        # 이미지 정보
        image_size, file_size = self._get_image_info(image_path)

        # 이미지 로드 및 전처리
        image = Image.open(image_path)
        image = self._preprocess_image(image)

        # OCR 실행
        result, _ = self._engine(image)

        if result is None:
            return "", 0.0, image_size, file_size

        # 텍스트 및 신뢰도 추출
        text_parts = []
        confidences = []

        for line in result:
            # line: [bbox, text, confidence]
            text = line[1]
            confidence = line[2] * 100  # 0-1 -> 0-100
            text_parts.append(text)
            confidences.append(confidence)

        extracted_text = ' '.join(text_parts)
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        return extracted_text, avg_confidence, image_size, file_size


def get_best_ocr_engine(tesseract_path: Optional[str] = None) -> OCREngine:
    """
    사용 가능한 최적의 OCR 엔진 반환

    우선순위:
    1. RapidOCR (PaddleOCR 기반) - 한국어 인식률 우수
    2. Tesseract - 폭넓은 지원

    Args:
        tesseract_path: Tesseract 경로 (Windows)

    Returns:
        OCREngine: 사용 가능한 OCR 엔진
    """
    # RapidOCR 먼저 시도
    rapid = RapidOCR()
    if rapid.is_available():
        return rapid

    # Tesseract 시도
    tesseract = TesseractOCR(tesseract_path)
    if tesseract.is_available():
        return tesseract

    raise RuntimeError(
        "No OCR engine available. Install one of:\n"
        "  - RapidOCR: pip install rapidocr-onnxruntime\n"
        "  - Tesseract: https://github.com/UB-Mannheim/tesseract/wiki"
    )
