@echo off
chcp 65001 >nul
echo ========================================
echo   헬게이터 개발 서버 재시작
echo   HELLGATER Development Server Restart
echo ========================================
echo.

echo [1/2] 컨테이너 재시작 중...
docker-compose restart

if errorlevel 1 (
    echo.
    echo [오류] 재시작 실패!
    echo.
    pause
    exit /b 1
)

echo.
echo [2/2] 서비스 시작 대기 중 (5초)...
timeout /t 5 /nobreak >nul

echo.
echo 컨테이너 상태:
docker-compose ps

echo.
echo ========================================
echo   재시작 완료!
echo ========================================
echo.
echo 프론트엔드: http://localhost:3000
echo 백엔드 API: http://localhost:4000
echo.
pause
