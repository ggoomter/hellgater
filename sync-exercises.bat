@echo off
chcp 65001 >nul
echo ========================================
echo   운동 데이터 동기화
echo   Exercise Data Sync
echo ========================================
echo.

echo [1/2] 마크다운 파일 복사 중...
copy /Y "docs\exercises\*.md" "client\src\data\exercises\"

if errorlevel 1 (
    echo.
    echo [오류] 파일 복사 실패!
    echo.
    pause
    exit /b 1
)

echo.
echo [2/2] TypeScript 파일로 변환 중...
node convert-md-to-ts.js

if errorlevel 1 (
    echo.
    echo [오류] 변환 실패!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   동기화 완료!
echo   docs/exercises/*.md → client/src/data/exercises/*.ts
echo ========================================
echo.
echo 변경사항이 화면에 자동으로 반영됩니다.
echo Docker가 실행 중이면 HMR로 자동 리로드됩니다.
echo.
pause
