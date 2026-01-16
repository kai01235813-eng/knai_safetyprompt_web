"""
FastAPI 백엔드 서버
Railway에서 실행되며 Python 검증 엔진 제공
"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import base64
from io import BytesIO
from datetime import datetime

# Python 폴더를 sys.path에 추가
python_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'python'))
sys.path.insert(0, python_dir)

try:
    from prompt_security_validator import KEPCOPromptSecurityValidator
    validator = KEPCOPromptSecurityValidator()
    VALIDATOR_AVAILABLE = True
except Exception as e:
    print(f"Warning: Could not load validator: {e}")
    VALIDATOR_AVAILABLE = False
    validator = None

# OCR 라이브러리 초기화
try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except Exception as e:
    print(f"Warning: Could not load OCR libraries: {e}")
    OCR_AVAILABLE = False

app = FastAPI(title="KEPCO Prompt Security API")

# CORS 설정 (Vercel에서 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ValidateRequest(BaseModel):
    prompt: str


class ValidateResponse(BaseModel):
    success: bool
    result: dict


class ImageValidateRequest(BaseModel):
    image_base64: str


@app.get("/")
async def root():
    return {
        "service": "KEPCO Prompt Security Validator",
        "status": "running",
        "validator_loaded": VALIDATOR_AVAILABLE,
        "python_path": sys.path[:3],
        "endpoints": ["/validate", "/health"]
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.options("/validate")
async def validate_options():
    """CORS preflight 요청 처리"""
    return {}


@app.post("/validate", response_model=ValidateResponse)
async def validate_prompt(request: ValidateRequest):
    """프롬프트 보안 검증"""
    if not VALIDATOR_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Validator not available. Check deployment logs."
        )

    try:
        result = validator.validate(request.prompt)

        # ValidationResult를 JSON 직렬화 가능한 dict로 변환
        result_dict = {
            "is_safe": result.is_safe,
            "security_level": result.security_level.value,  # Enum을 문자열로
            "risk_score": result.risk_score,
            "violations": [
                {
                    "type": v.type.value,  # Enum을 문자열로
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
    """이미지 OCR + 보안 검증"""
    if not OCR_AVAILABLE:
        return {
            "success": True,
            "is_safe": True,
            "security_level": "안전",
            "risk_score": 0,
            "violations": [],
            "sanitized_prompt": "",
            "original_prompt": "",
            "timestamp": datetime.now().isoformat(),
            "recommendation": "OCR 라이브러리가 설치되지 않았습니다. Tesseract 설치 후 사용 가능합니다."
        }

    if not VALIDATOR_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Validator not available. Check deployment logs."
        )

    try:
        # Base64 디코딩
        image_data = base64.b64decode(request.image_base64)
        image = Image.open(BytesIO(image_data))

        # OCR 실행 (한글 + 영어)
        extracted_text = pytesseract.image_to_string(image, lang='kor+eng')

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
                "recommendation": "이미지에서 텍스트를 추출할 수 없습니다."
            }

        # 추출된 텍스트를 검증 엔진에 전달
        result = validator.validate(extracted_text)

        # ValidationResult를 JSON 직렬화 가능한 dict로 변환
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
            "recommendation": result.recommendation,
            "extracted_text": extracted_text  # OCR로 추출한 원본 텍스트 포함
        }

        return {"success": True, **result_dict}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 처리 오류: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
