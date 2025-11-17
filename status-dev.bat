@echo off
chcp 65001 >nul
echo ========================================
echo   헬게이터 개발 서버 상태 확인
echo   HELLGATER Development Server Status
echo ========================================
echo.

echo [컨테이너 상태]
docker-compose ps

echo.
echo ========================================
echo.
echo [서비스 접속 주소]
echo   - 프론트엔드: http://localhost:3000
echo   - 백엔드 API: http://localhost:4000
echo   - PostgreSQL: localhost:5432
echo.
echo [데이터베이스 접속 정보]
echo   - Database: hellgater
echo   - User: hellgater
echo   - Password: hellgater123
echo.
echo ========================================
echo.

REM 서버 응답 확인
echo [백엔드 서버 응답 확인]
curl -s http://localhost:4000/health >nul 2>&1
if errorlevel 1 (
    echo   상태: ❌ 응답 없음
) else (
    echo   상태: ✅ 정상 응답
)

echo.
echo [프론트엔드 서버 응답 확인]
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo   상태: ❌ 응답 없음
) else (
    echo   상태: ✅ 정상 응답
)

echo.
echo ========================================
echo.
pause
