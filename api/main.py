"""
FastAPI 백엔드 서버
Railway에서 실행되며 Python 검증 엔진 제공
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

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
        return ValidateResponse(success=True, result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/validate-image")
async def validate_image():
    """이미지 검증 (추후 구현)"""
    return {
        "success": False,
        "message": "Image validation not yet implemented on Railway"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
