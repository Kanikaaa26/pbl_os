@echo off
echo Starting Parallel Task Scheduler...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if C++ executable exists
if not exist "backend\cpp\bin\scheduler.exe" (
    echo Error: C++ scheduler not built. Please run build.bat first.
    pause
    exit /b 1
)

REM Install Python dependencies if needed
echo Checking Python dependencies...
cd backend\python
REM Dependencies already installed via VS Code
REM Uncomment the line below if you need to reinstall:
REM pip install -q -r requirements.txt

echo.
echo Starting Flask API Server...
echo Server will be available at http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

python api_server.py

cd ..\..
