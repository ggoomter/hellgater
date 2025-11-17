@echo off
chcp 65001 >nul
echo ========================================
echo   헬게이터 개발 서버 중지
echo   HELLGATER Development Server Stop
echo ========================================
echo.

docker-compose down

if errorlevel 1 (
    echo.
    echo [오류] 서버 중지 실패!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   서버 중지 완료!
echo ========================================
echo.
pause
