"""
KEPCO 프롬프트 보안 검증 FastAPI 서버
Railway에서 실행되며 Python 검증 엔진 제공

Features:
- Singleton 패턴으로 검증 엔진 초기화 (메모리 효율)
- OCR 추상화 레이어 (Tesseract → PaddleOCR 교체 용이)
- Lifespan을 통한 리소스 관리
"""
from contextlib import asynccontextmanager
from typing import Optional
import sys
import os
import base64
from io import BytesIO
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Python 폴더를 sys.path에 추가
python_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'python'))
sys.path.insert(0, python_dir)

from prompt_security_validator import KEPCOPromptSecurityValidator
from llm_corrector import PowerIndustryOCRCorrector


# ============================================================
# Pydantic Models
# ============================================================

class ValidateRequest(BaseModel):
    """텍스트 검증 요청"""
    prompt: str = Field(..., min_length=1, description="검증할 프롬프트")


class ImageValidateRequest(BaseModel):
    """이미지 검증 요청 (Base64)"""
    image_base64: str = Field(..., description="Base64 인코딩된 이미지")


class OCRCorrectRequest(BaseModel):
    """OCR 텍스트 교정 요청"""
    ocr_text: str = Field(..., min_length=1, description="교정할 OCR 추출 텍스트")
    model_name: Optional[str] = Field(None, description="사용할 LLM 모델 (기본: qwen2.5-7b)")


class ViolationItem(BaseModel):
    """위반사항"""
    type: str
    description: str
    matched_text: str
    position: list
    severity: int


class ValidateResponse(BaseModel):
    """검증 응답"""
    success: bool
    result: dict


class HealthResponse(BaseModel):
    """헬스체크 응답"""
    status: str
    validator_loaded: bool
    ocr_engine: str
    ocr_available: bool


# ============================================================
# Application State (Singleton)
# ============================================================

class AppState:
    """애플리케이션 상태 (Singleton 패턴)"""
    validator: Optional[KEPCOPromptSecurityValidator] = None
    ocr_engine = None  # OCREngine 인스턴스
    ocr_engine_name: str = "none"
    ocr_available: bool = False
    llm_corrector: Optional[PowerIndustryOCRCorrector] = None
    llm_available: bool = False


app_state = AppState()


# ============================================================
# OCR Engine Setup
# ============================================================

def _find_tesseract_path() -> Optional[str]:
    """Tesseract 경로 탐색 (Windows)"""
    if sys.platform == 'win32':
        possible_paths = [
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            r'C:\Tesseract-OCR\tesseract.exe',
        ]
        for path in possible_paths:
            if os.path.exists(path):
                return path
    return None


def _init_ocr_engine():
    """OCR 엔진 초기화 (우선순위: RapidOCR → Tesseract)"""
    # 1. RapidOCR 시도 (PaddleOCR 기반, 한국어 인식률 우수)
    try:
        from ocr_engine import RapidOCR
        rapid = RapidOCR()
        if rapid.is_available():
            app_state.ocr_engine = rapid
            app_state.ocr_engine_name = "rapidocr"
            app_state.ocr_available = True
            print("✅ OCR Engine: RapidOCR (PaddleOCR) loaded")
            return
    except ImportError:
        pass
    except Exception as e:
        print(f"⚠️ RapidOCR init failed: {e}")

    # 2. Tesseract 시도
    try:
        from ocr_engine import TesseractOCR
        tesseract_path = _find_tesseract_path()
        tesseract = TesseractOCR(tesseract_path)
        if tesseract.is_available():
            app_state.ocr_engine = tesseract
            app_state.ocr_engine_name = "tesseract"
            app_state.ocr_available = True
            print("✅ OCR Engine: Tesseract loaded")
            return
    except ImportError:
        pass
    except Exception as e:
        print(f"⚠️ Tesseract init failed: {e}")

    # 3. Fallback: pytesseract 직접 사용 (기존 방식)
    try:
        import pytesseract
        from PIL import Image
        app_state.ocr_engine_name = "pytesseract-legacy"
        app_state.ocr_available = True
        print("✅ OCR Engine: pytesseract (legacy mode)")
    except Exception as e:
        print(f"⚠️ No OCR engine available: {e}")
        app_state.ocr_available = False


def _init_llm_corrector():
    """LLM Corrector 초기화 (HF_API_KEY 환경변수 필요)"""
    hf_api_key = os.getenv("HF_API_KEY")
    if not hf_api_key:
        print("ℹ️ HF_API_KEY not set - LLM text correction disabled")
        app_state.llm_available = False
        return

    try:
        app_state.llm_corrector = PowerIndustryOCRCorrector()
        app_state.llm_available = True
        print("✅ LLM Corrector: Hugging Face API loaded")
    except Exception as e:
        print(f"⚠️ LLM Corrector init failed: {e}")
        app_state.llm_available = False


# ============================================================
# Lifespan Management
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 리소스 관리"""
    # Startup
    print("🚀 Initializing KEPCO Security Validator...")

    # 검증 엔진 초기화 (Singleton)
    try:
        app_state.validator = KEPCOPromptSecurityValidator()
        print("✅ Validator loaded successfully")
    except Exception as e:
        print(f"❌ Validator load failed: {e}")
        app_state.validator = None

    # OCR 엔진 초기화
    _init_ocr_engine()

    # LLM Corrector 초기화 (HF_API_KEY가 있는 경우만)
    _init_llm_corrector()

    yield

    # Shutdown
    print("👋 Shutting down KEPCO Security Validator...")


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="KEPCO Prompt Security Validator API",
    description="한국전력공사 생성형AI 프롬프트 보안 검증 시스템",
    version="2.0.0",
    lifespan=lifespan
)

# CORS 설정 (Vercel에서 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API Endpoints
# ============================================================

@app.get("/")
async def root():
    """루트 엔드포인트 - 서비스 정보"""
    return {
        "service": "KEPCO Prompt Security Validator",
        "version": "2.1.0",
        "status": "running",
        "validator_loaded": app_state.validator is not None,
        "ocr_engine": app_state.ocr_engine_name,
        "ocr_available": app_state.ocr_available,
        "llm_corrector_available": app_state.llm_available,
        "endpoints": ["/validate", "/validate-image", "/correct-ocr", "/health"]
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    """헬스체크 엔드포인트"""
    return HealthResponse(
        status="healthy",
        validator_loaded=app_state.validator is not None,
        ocr_engine=app_state.ocr_engine_name,
        ocr_available=app_state.ocr_available
    )


@app.options("/validate")
async def validate_options():
    """CORS preflight 요청 처리"""
    return {}


@app.post("/validate", response_model=ValidateResponse)
async def validate_prompt(request: ValidateRequest):
    """
    텍스트 프롬프트 보안 검증

    - 개인정보, 기밀정보, 시스템정보 등 탐지
    - 위험도 점수 및 보안 등급 반환
    - 마스킹 처리된 프롬프트 제공
    """
    if not app_state.validator:
        raise HTTPException(
            status_code=503,
            detail="Validator not available. Check deployment logs."
        )

    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="프롬프트가 비어있습니다")

    try:
        result = app_state.validator.validate(request.prompt)

        result_dict = {
            "is_safe": result.is_safe,
            "security_level": result.security_level.value,
            "risk_score": result.risk_score,
            "violations": [
                {
                    "type": v.type.value,
                    "description": v.description,
                    "matched_text": v.matched_text,
                    "position": list(v.position),
                    "severity": v.severity
                }
                for v in result.violations
            ],
            "sanitized_prompt": result.sanitized_prompt,
            "original_prompt": result.original_prompt,
            "timestamp": result.timestamp,
            "recommendation": result.recommendation
        }

        return ValidateResponse(success=True, result=result_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/validate-image")
async def validate_image(request: ImageValidateRequest):
    """
    이미지 OCR + 보안 검증

    - 이미지에서 텍스트 추출 (OCR)
    - 추출된 텍스트에 대한 보안 검증 수행
    """
    if not app_state.validator:
        raise HTTPException(
            status_code=503,
            detail="Validator not available. Check deployment logs."
        )

    # OCR 미사용 시 안내 메시지 반환
    if not app_state.ocr_available:
        return {
            "success": True,
            "is_safe": True,
            "security_level": "안전",
            "risk_score": 0,
            "violations": [],
            "sanitized_prompt": "",
            "original_prompt": "",
            "timestamp": datetime.now().isoformat(),
            "recommendation": "OCR 엔진이 설치되지 않았습니다. Tesseract 또는 RapidOCR 설치 후 사용 가능합니다.",
            "extracted_text": ""
        }

    try:
        # Base64 디코딩
        image_data = base64.b64decode(request.image_base64)

        # OCR 실행
        extracted_text = ""

        if app_state.ocr_engine and hasattr(app_state.ocr_engine, 'extract_text'):
            # 새로운 OCR 추상화 레이어 사용
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
                tmp.write(image_data)
                tmp_path = tmp.name

            try:
                extracted_text, confidence, _, _ = app_state.ocr_engine.extract_text(tmp_path)
            finally:
                os.unlink(tmp_path)
        else:
            # Legacy: pytesseract 직접 사용
            import pytesseract
            from PIL import Image

            image = Image.open(BytesIO(image_data))

            try:
                extracted_text = pytesseract.image_to_string(image, lang='kor+eng')
            except Exception:
                extracted_text = pytesseract.image_to_string(image, lang='eng')

        # 텍스트가 없으면 안전 반환
        if not extracted_text.strip():
            return {
                "success": True,
                "is_safe": True,
                "security_level": "안전",
                "risk_score": 0,
                "violations": [],
                "sanitized_prompt": "",
                "original_prompt": "",
                "timestamp": datetime.now().isoformat(),
                "recommendation": "이미지에서 텍스트를 추출할 수 없습니다.",
                "extracted_text": "",
                "llm_correction": None
            }

        # LLM 텍스트 교정 (활성화된 경우)
        llm_correction_result = None
        text_for_validation = extracted_text

        if app_state.llm_available and app_state.llm_corrector:
            try:
                llm_result = app_state.llm_corrector.correct_text(extracted_text)
                if llm_result.get("success"):
                    llm_correction_result = {
                        "used": True,
                        "model": app_state.llm_corrector.model_id,
                        "original_ocr_text": extracted_text,
                        "corrected_text": llm_result.get("corrected_text", extracted_text),
                        "corrections": llm_result.get("corrections", []),
                        "confidence": llm_result.get("confidence", 0.0),
                        "extracted_fields": llm_result.get("extracted_fields", {})
                    }
                    # 교정된 텍스트로 검증 수행
                    text_for_validation = llm_result.get("corrected_text", extracted_text)
                else:
                    llm_correction_result = {
                        "used": False,
                        "error": llm_result.get("error", "교정 실패"),
                        "model": app_state.llm_corrector.model_id
                    }
            except Exception as e:
                llm_correction_result = {
                    "used": False,
                    "error": str(e),
                    "model": app_state.llm_corrector.model_id if app_state.llm_corrector else "unknown"
                }
        else:
            llm_correction_result = {
                "used": False,
                "reason": "LLM Corrector not available (HF_API_KEY not set)"
            }

        # 보안 검증 (교정된 텍스트 또는 원본 OCR 텍스트 사용)
        result = app_state.validator.validate(text_for_validation)

        return {
            "success": True,
            "is_safe": result.is_safe,
            "security_level": result.security_level.value,
            "risk_score": result.risk_score,
            "violations": [
                {
                    "type": v.type.value,
                    "description": v.description,
                    "matched_text": v.matched_text,
                    "position": list(v.position),
                    "severity": v.severity
                }
                for v in result.violations
            ],
            "sanitized_prompt": result.sanitized_prompt,
            "original_prompt": result.original_prompt,
            "timestamp": result.timestamp,
            "recommendation": result.recommendation,
            "extracted_text": extracted_text,
            "llm_correction": llm_correction_result
        }

    except Exception as e:
        import traceback
        error_detail = f"이미지 처리 오류: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=f"이미지 처리 오류: {str(e)}")


@app.post("/correct-ocr")
async def correct_ocr_text(request: OCRCorrectRequest):
    """
    OCR 텍스트 교정 (Hugging Face LLM 사용)

    - 전력산업 도메인 특화 교정
    - 팩스 노이즈로 인한 오타 수정
    - 전기사용신청서 필드 자동 추출
    """
    # LLM 사용 불가 시 안내
    if not app_state.llm_available or not app_state.llm_corrector:
        raise HTTPException(
            status_code=503,
            detail="LLM Corrector not available. Set HF_API_KEY environment variable."
        )

    if not request.ocr_text.strip():
        raise HTTPException(status_code=400, detail="OCR 텍스트가 비어있습니다")

    try:
        # 모델 지정 시 새 인스턴스 생성
        if request.model_name:
            corrector = PowerIndustryOCRCorrector(request.model_name)
        else:
            corrector = app_state.llm_corrector

        result = corrector.correct_text(request.ocr_text)

        return {
            "success": result.get("success", False),
            "corrected_text": result.get("corrected_text", ""),
            "corrections": result.get("corrections", []),
            "confidence": result.get("confidence", 0.0),
            "extracted_fields": result.get("extracted_fields", {}),
            "original_text": request.ocr_text,
            "model_used": corrector.model_id,
            "error": result.get("error")
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        print(f"LLM 교정 오류: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"텍스트 교정 오류: {str(e)}")


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
