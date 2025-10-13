@echo off
echo ============================================
echo   Restarting API Server with Fixes
echo ============================================
echo.

REM Kill any existing Python processes running api_server.py
echo Stopping existing API server...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq API Server*" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting API server with enhanced logging...
echo.
cd backend\python
python api_server.py

pause
