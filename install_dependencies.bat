@echo off
echo Installing Python Dependencies for Parallel Task Scheduler...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo Installing required packages...
echo This may take a few minutes...
echo.

cd backend\python

echo Installing Flask...
pip install flask

echo Installing Flask-CORS...
pip install flask-cors

echo Installing Matplotlib...
pip install matplotlib

echo Installing Pandas...
pip install pandas

echo Installing NumPy...
pip install numpy

cd ..\..

echo.
echo ===================================
echo All dependencies installed successfully!
echo ===================================
echo.
echo You can now run the server using: run_server.bat
echo.
pause
