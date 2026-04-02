#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
OCR 엔진 추상화 레이어
RapidOCR(PaddleOCR) 기반 OCR 인터페이스 제공

사용법:
    ocr = RapidOCR()
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
    - RapidOCR: PaddleOCR 기반 (현재 사용 중)
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


class RapidOCR(OCREngine):
    """
    RapidOCR 엔진 (PaddleOCR 기반)

    Requirements:
        - pip install rapidocr-onnxruntime pillow

    장점:
        - 한국어 인식률 우수
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


def get_best_ocr_engine() -> OCREngine:
    """
    사용 가능한 OCR 엔진 반환 (RapidOCR)

    Returns:
        OCREngine: 사용 가능한 OCR 엔진
    """
    rapid = RapidOCR()
    if rapid.is_available():
        return rapid

    raise RuntimeError(
        "No OCR engine available. Install:\n"
        "  pip install rapidocr-onnxruntime"
    )
