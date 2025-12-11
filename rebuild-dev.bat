@echo off
chcp 65001 >nul
echo ========================================
echo   헬게이터 개발 서버 재빌드
echo   HELLGATER Development Server Rebuild
echo ========================================
echo.
echo 경고: 모든 컨테이너를 중지하고 재빌드합니다.
echo 데이터베이스 데이터는 유지됩니다.
echo.
echo 계속하시겠습니까? (Y/N)
choice /c YN /n /m ""

if errorlevel 2 (
    echo.
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [1/4] 기존 컨테이너 중지 및 제거...
docker-compose down

echo.
echo [2/4] Docker 이미지 재빌드...
docker-compose build --no-cache

echo.
echo [3/4] 새 컨테이너 시작...
docker-compose up -d

echo.
echo [4/4] 서비스 시작 대기 중 (10초)...
timeout /t 10 /nobreak >nul

echo.
echo 컨테이너 상태:
docker-compose ps

echo.
echo ========================================
echo   재빌드 완료!
echo ========================================
echo.
echo 프론트엔드: http://localhost:3000
echo 백엔드 API: http://localhost:4000
echo.
pause
