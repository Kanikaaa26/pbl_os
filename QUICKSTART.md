# Parallel Task Scheduler - Quick Start Guide

## 🚀 Quick Start (Windows)

### Step 1: Build the Project
```cmd
build.bat
```

for powershell copy above command and ask chatgpt to give it for powershell

### setep2: Install Python dependencies
```
pip install flask flask-cors matplotlib pandas
```

### Step 3: Start the API Server
```cmd
run_server.bat
```

### Step 4: Open the Web Interface
Open `frontend\index.html` in your browser

Or start a local web server:
```cmd
cd frontend
python -m http.server 8000
```
Then open: http://localhost:8000

## 🚀 Quick Start (Linux/Mac)

### Step 1: Make scripts executable
```bash
chmod +x build.sh run_server.sh
```

### Step 2: Build the Project
```bash
./build.sh
```

### Step 3: Start the API Server
```bash
./run_server.sh
```

### Step 4: Open the Web Interface
Open `frontend/index.html` in your browser

Or start a local web server:
```bash
cd frontend
python3 -m http.server 8000
```
Then open: http://localhost:8000

## 📝 Using the Application

1. **Load Sample Tasks**: Click "Load Sample Tasks" to populate with demo tasks
2. **Select Algorithm**: Choose SJF, Round Robin, or Priority
3. **Start Execution**: Click "Start Scheduler"
4. **Monitor Progress**: Watch real-time execution in the dashboard
5. **View Results**: Switch to "Performance" tab for detailed analytics
6. **Run Benchmark**: Compare all algorithms with one click

### 🆕 Using the Thread Scaling Comparison Feature

1. **Navigate to Comparison Page**: Click "Comparison" in the navigation menu
2. **Configure Test Parameters**:
   - Set minimum threads (e.g., 1)
   - Set maximum threads (e.g., 8)
   - Set thread step (e.g., 1 to test every increment)
   - Choose number of tasks (e.g., 20)
3. **Select Algorithms**: Check which algorithms to compare (SJF, RR, Priority)
4. **Run Test**: Click "Run Thread Scaling Test"
5. **Analyze Results**:
   - View 6 interactive charts showing performance trends
   - See how execution time decreases with more threads
   - Compare speedup and efficiency across algorithms
   - Export results to CSV or JSON

**Quick Demo**: Click "Use Sample Data" to instantly see pre-generated results demonstrating how threads affect performance!

## 🔧 Manual Testing (Command Line)

### Test SJF Algorithm
```bash
cd backend/cpp/bin
./scheduler sjf ../../../data/sample_tasks.json
```

### Test Round Robin
```bash
./scheduler rr ../../../data/sample_tasks.json
```

### Test Priority Scheduling
```bash
./scheduler priority ../../../data/sample_tasks.json
```

### Run Python Benchmarking
```bash
cd backend/python
python orchestrator.py
```

## 📊 Expected Results

After execution, you'll find:
- `data/results.json` - Execution results
- `logs/execution.log` - Detailed execution logs
- `data/performance_report.html` - Performance report (from Python benchmark)
- `data/performance_charts.png` - Visual charts (from Python benchmark)

## ⚙️ Configuration

### Adjust Worker Threads
Edit in `backend/cpp/scheduler.h` or use the web interface

### Modify Time Quantum (Round Robin)
Edit in `backend/cpp/scheduler.h` or use the web interface

### Change Task Parameters
Edit tasks in the web interface or modify `data/sample_tasks.json`

## 🐛 Common Issues

**Issue**: `scheduler.exe not found`
**Solution**: Run `build.bat` first

**Issue**: Python module not found
**Solution**: `pip install -r backend/python/requirements.txt`

**Issue**: Cannot connect to API
**Solution**: Ensure Flask server is running on port 5000

**Issue**: CORS errors in browser
**Solution**: Use a local web server (python -m http.server) instead of opening HTML directly

## 📈 Performance Tips

1. Start with 8 sample tasks to see clear differences
2. Use the benchmark feature to compare all algorithms
3. Increase data size for longer-running tasks
4. Monitor CPU utilization in the Performance tab
5. Check execution logs for detailed thread activity

## 🎓 Learning Path

1. **Start Simple**: Run with sample tasks and one algorithm
2. **Compare**: Use benchmark to see algorithm differences
3. **Experiment**: Create custom tasks with different parameters
4. **Analyze**: Study the performance metrics and charts
5. **Optimize**: Try different thread counts and time quantums
6. **Deep Dive**: Explore the C++ code to understand implementation

## 📞 Need Help?

1. Check `README.md` for detailed documentation
2. Review code comments in source files
3. Examine execution logs in `logs/` directory
4. Test individual components separately

---

**Happy Scheduling! 🎉**
