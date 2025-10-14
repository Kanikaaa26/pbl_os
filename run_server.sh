#!/bin/bash

echo "Starting Parallel Task Scheduler..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if C++ executable exists
if [ ! -f "backend/cpp/bin/scheduler" ]; then
    echo "Error: C++ scheduler not built. Please run build.sh first."
    exit 1
fi

# Install Python dependencies if needed
echo "Checking Python dependencies..."
cd backend/python
pip3 install -q -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Warning: Some dependencies may not have installed correctly"
fi

echo ""
echo "Starting Flask API Server..."
echo "Server will be available at http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 api_server.py

cd ../..
