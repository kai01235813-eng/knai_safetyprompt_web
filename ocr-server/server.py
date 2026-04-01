"""
사내 OCR 서버 - PaddleOCR 기반 (RapidOCR ONNX Runtime)
safetyprompt 이미지 검증용 (사내망 전용, 외부 전송 없음)
"""

# 사내망 SSL 검사 우회 (모델 최초 다운로드 시 필요)
import ssl
import os
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["REQUESTS_CA_BUNDLE"] = ""
ssl._create_default_https_context = ssl._create_unverified_context

import io
import logging
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
from rapidocr_onnxruntime import RapidOCR

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ocr-server")

app = FastAPI(title="KNAI OCR Server", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://10.193.5.142:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

# 서버 시작 시 모델 로드 (최초 1회만, 이후 메모리에 유지)
logger.info("PaddleOCR(RapidOCR) 모델 로딩 중...")
ocr_engine = RapidOCR()
logger.info("PaddleOCR(RapidOCR) 모델 로딩 완료")


@app.get("/health")
def health():
    return {"status": "ok", "engine": "paddleocr", "languages": ["ko", "en"]}


@app.post("/ocr")
async def ocr(image: UploadFile = File(...)):
    try:
        contents = await image.read()

        if len(contents) > 10 * 1024 * 1024:
            return JSONResponse(
                status_code=400,
                content={"error": "파일 크기는 10MB 이하여야 합니다."},
            )

        img = Image.open(io.BytesIO(contents))

        # RGBA -> RGB 변환 (PNG 투명 배경 처리)
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # 이미지 전처리: 작은 이미지 업스케일 (인식률 향상)
        width, height = img.size
        if width < 1000 or height < 1000:
            scale = max(1000 / width, 1000 / height)
            img = img.resize(
                (int(width * scale), int(height * scale)),
                Image.LANCZOS,
            )

        # OCR 수행 (PaddleOCR via RapidOCR)
        img_array = np.array(img)
        results, _ = ocr_engine(img_array)

        # 결과 정리
        lines = []
        full_text_parts = []
        if results:
            for bbox, text, confidence in results:
                lines.append(
                    {"text": text, "confidence": round(float(confidence), 3)}
                )
                full_text_parts.append(text)

        full_text = " ".join(full_text_parts)

        logger.info(
            f"OCR 완료: {len(lines)}개 텍스트 블록, {len(full_text)}자 추출"
        )

        return {
            "success": True,
            "engine": "paddleocr",
            "extracted_text": full_text,
            "lines": lines,
            "total_blocks": len(lines),
            "total_chars": len(full_text),
        }

    except Exception as e:
        logger.error(f"OCR 오류: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"OCR 처리 중 오류: {str(e)}"},
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8100, log_level="info")
