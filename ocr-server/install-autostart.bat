@echo off
echo ========================================
echo   KNAI OCR Server - 자동시작 등록
echo ========================================
schtasks /create /tn "KNAI_OCR_Server" /tr "%~dp0start.bat" /sc onlogon /rl highest /f
if %errorlevel% equ 0 (
    echo.
    echo [성공] Windows 로그인 시 OCR 서버가 자동으로 시작됩니다.
) else (
    echo.
    echo [실패] 관리자 권한으로 다시 실행해주세요.
    echo   이 파일 우클릭 - "관리자 권한으로 실행"
)
echo.
pause
