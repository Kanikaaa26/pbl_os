@echo off
echo Building Parallel Task Scheduler C++ Backend...
echo.

cd backend\cpp

echo Checking for build directories...
if not exist "build" mkdir build
if not exist "bin" mkdir bin

echo Compiling source files...
g++ -std=c++17 -pthread -Wall -O2 -c main.cpp -o build/main.o
if errorlevel 1 (
    echo Error compiling main.cpp
    pause
    exit /b 1
)

g++ -std=c++17 -pthread -Wall -O2 -c task.cpp -o build/task.o
if errorlevel 1 (
    echo Error compiling task.cpp
    pause
    exit /b 1
)

g++ -std=c++17 -pthread -Wall -O2 -c scheduler.cpp -o build/scheduler.o
if errorlevel 1 (
    echo Error compiling scheduler.cpp
    pause
    exit /b 1
)

echo Linking executable...
g++ -std=c++17 -pthread -o bin/scheduler.exe build/main.o build/task.o build/scheduler.o
if errorlevel 1 (
    echo Error linking executable
    pause
    exit /b 1
)

echo.
echo Build successful!
echo Executable created at: backend\cpp\bin\scheduler.exe
echo.

cd ..\..
pause
