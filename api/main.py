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
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python'))

from prompt_security_validator import KEPCOPromptSecurityValidator

app = FastAPI(title="KEPCO Prompt Security API")

# CORS 설정 (Vercel에서 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 Vercel 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 검증기 인스턴스
validator = KEPCOPromptSecurityValidator()


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
        "endpoints": ["/validate", "/health"]
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/validate", response_model=ValidateResponse)
async def validate_prompt(request: ValidateRequest):
    """프롬프트 보안 검증"""
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
