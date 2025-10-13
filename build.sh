#!/bin/bash

echo "Building Parallel Task Scheduler C++ Backend..."
echo ""

cd backend/cpp

echo "Checking for build directories..."
mkdir -p build
mkdir -p bin

echo "Compiling source files..."
g++ -std=c++17 -pthread -Wall -O2 -c main.cpp -o build/main.o
if [ $? -ne 0 ]; then
    echo "Error compiling main.cpp"
    exit 1
fi

g++ -std=c++17 -pthread -Wall -O2 -c task.cpp -o build/task.o
if [ $? -ne 0 ]; then
    echo "Error compiling task.cpp"
    exit 1
fi

g++ -std=c++17 -pthread -Wall -O2 -c scheduler.cpp -o build/scheduler.o
if [ $? -ne 0 ]; then
    echo "Error compiling scheduler.cpp"
    exit 1
fi

echo "Linking executable..."
g++ -std=c++17 -pthread -o bin/scheduler build/main.o build/task.o build/scheduler.o
if [ $? -ne 0 ]; then
    echo "Error linking executable"
    exit 1
fi

echo ""
echo "Build successful!"
echo "Executable created at: backend/cpp/bin/scheduler"
echo ""

cd ../..
