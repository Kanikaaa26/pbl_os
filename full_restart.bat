@echo off
echo ============================================
echo   Full System Restart
echo ============================================
echo.

echo [1/3] Rebuilding C++ Scheduler...
call build.bat
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [2/3] Killing old API server...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Starting API server...
start "API Server" cmd /k "cd backend\python && python api_server.py"

timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   System Ready!
echo ============================================
echo.
echo Next steps:
echo   1. Open: test_frontend.html
echo   2. Click "Submit Tasks"
echo   3. Click "Execute SJF"
echo   4. Click "Fetch Results" - should work now!
echo   5. Open: frontend\index.html
echo.
echo API Server: http://localhost:5000
echo Debug Info: http://localhost:5000/api/debug
echo.
pause
