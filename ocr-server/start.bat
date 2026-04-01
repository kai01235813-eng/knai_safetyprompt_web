@echo off
chcp 65001 >nul
title KNAI OCR Server
cd /d "%~dp0"
echo ========================================
echo   KNAI OCR Server (PaddleOCR)
echo   Port: 8100
echo   종료: 이 창을 닫으세요
echo ========================================
set CURL_CA_BUNDLE=
set REQUESTS_CA_BUNDLE=
set NODE_TLS_REJECT_UNAUTHORIZED=0
set PYTHONIOENCODING=utf-8
python server.py
pause
