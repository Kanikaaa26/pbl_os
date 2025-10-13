# Parallel Task Scheduler - Operating Systems Project

![Project Banner](https://img.shields.io/badge/OS-Project-blue)
![C++](https://img.shields.io/badge/C++-17-00599C?logo=cplusplus)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)

## 📋 Project Abstract

The **Parallel Task Scheduler** is an innovative system designed to enhance task execution efficiency using multithreading and scheduling algorithms. It simulates core Operating System (OS) functionalities such as process scheduling, synchronization, and performance management, enabling users to understand how real-world schedulers manage workloads.

Unlike traditional sequential systems that execute one task at a time, this scheduler runs multiple tasks concurrently using worker threads, ensuring better CPU utilization and reduced execution time.

### Key Features
- **Multiple Scheduling Algorithms**: SJF (Shortest Job First), Round Robin, Priority Scheduling
- **Parallel Execution**: Multi-threaded task execution with worker threads
- **Real-time Monitoring**: Live execution tracking and progress visualization
- **Performance Analytics**: Comprehensive metrics including execution time, speedup, throughput, CPU utilization
- **Modern Multi-Page Web Interface**: Responsive UI with dedicated pages for home, scheduler, and results
- **Interactive Animations**: Smooth transitions and engaging visual effects
- **Benchmarking Suite**: Compare performance across different scheduling algorithms

## 🏗️ Architecture

### Frontend
- **HTML5/CSS3**: Responsive multi-page user interface
- **JavaScript (ES6+)**: Dynamic interactions and real-time updates
- **Chart.js**: Performance visualization and analytics
- **Modern Design**: Gradient backgrounds, animations, and smooth transitions

### Backend
- **C++17**: High-performance parallel execution engine
  - Task execution (Matrix operations, Sorting, File processing, Computations)
  - Scheduling algorithms implementation
  - Thread management and synchronization

- **Python 3.8+**: Orchestration and API layer
  - Task orchestration and benchmarking
  - REST API server (Flask)
  - Performance report generation

## 📁 Project Structure

```
pbl_os/
├── frontend/
│   ├── index.html              # Home page with project description and animations
│   ├── scheduler.html          # Task management and algorithm selection
│   ├── results.html            # Performance analysis, logs, and comparisons
│   ├── css/
│   │   └── styles.css          # Modern styling with animations and responsive design
│   └── js/
│       ├── home.js             # Home page animations and interactions
│       ├── scheduler.js        # Task management and execution logic
│       ├── results.js          # Results display and analysis
│       └── charts.js           # Chart.js visualizations
│
├── backend/
│   ├── cpp/                    # C++ scheduling engine
│   │   ├── task.h/cpp          # Task class definition
│   │   ├── scheduler.h/cpp     # Scheduler implementation
│   │   ├── main.cpp            # Entry point
│   │   └── Makefile            # Build configuration
│   │
│   └── python/                 # Python orchestration
│       ├── orchestrator.py     # Task orchestration & benchmarking
│       ├── api_server.py       # REST API server
│       └── requirements.txt    # Python dependencies
│
├── data/                       # Task data and results
├── logs/                       # Execution logs
└── README.md                   # This file
```

## 🚀 Setup and Installation

### Prerequisites

#### Windows
- **C++ Compiler**: MinGW-w64 with g++ (C++17 support)
- **Python**: 3.8 or higher
- **Libraries**:
  - pthread (usually included with MinGW)

#### Linux/Mac
- **C++ Compiler**: g++ with C++17 support
- **Python**: 3.8 or higher
- **Build Tools**: make

### Installation Steps

#### 1. Install C++ Compiler

**Windows:**
```bash
# Install MinGW-w64
# Download from: https://www.mingw-w64.org/
# OR use MSYS2: https://www.msys2.org/

# Make sure g++ is in your PATH
where g++
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install g++ make
```

**Mac:**
```bash
brew install gcc
```

#### 2. Install Python Dependencies

```bash
cd backend/python
pip install -r requirements.txt
```

#### 3. Build C++ Scheduler

```bash
cd backend/cpp
make
```

This will create the executable at `backend/cpp/bin/scheduler.exe` (Windows) or `backend/cpp/bin/scheduler` (Linux/Mac).

## 💻 Usage

### Method 1: Using the Web Interface (Recommended)

1. **Start the Python API Server:**
```bash
cd backend/python
python api_server.py
```
The server will start on `http://localhost:5000`

2. **Open the Web Interface:**
```bash
# Open frontend/index.html in your web browser
# Or use a simple HTTP server:
cd frontend
python -m http.server 8000
# Then navigate to http://localhost:8000
```

3. **Using the Interface:**
   - **Home Page**: Learn about the project and click "Try Scheduler"
   - **Scheduler Page**: Add tasks manually or load samples, select algorithm, run execution
   - **Results Page**: View performance metrics, logs, and algorithm comparisons
   - Monitor real-time progress and view comprehensive analytics
   - Use "Run Benchmark" to compare all algorithms side-by-side

### Method 2: Command Line Interface

1. **Create a task file** (`data/tasks.json`):
```json
{
  "tasks": [
    {
      "id": 1,
      "name": "Matrix Multiplication",
      "type": "matrix",
      "priority": 3,
      "burstTime": 100,
      "arrivalTime": 0,
      "dataSize": 100
    },
    {
      "id": 2,
      "name": "Quick Sort",
      "type": "sort",
      "priority": 2,
      "burstTime": 150,
      "arrivalTime": 10,
      "dataSize": 50
    }
  ]
}
```

2. **Run the C++ scheduler directly:**
```bash
cd backend/cpp/bin
./scheduler sjf ../../data/tasks.json
```

Replace `sjf` with `rr` (Round Robin) or `priority` as needed.

3. **Run Python benchmarking:**
```bash
cd backend/python
python orchestrator.py
```

## 🎨 Frontend Features

### Home Page (`index.html`)
- **Project Description**: Comprehensive overview of the scheduling system
- **Interactive Animations**: CPU core pulsing, scroll-triggered animations
- **Modern Design**: Gradient backgrounds, smooth transitions
- **Call-to-Action**: Direct navigation to scheduler interface

### Scheduler Page (`scheduler.html`)
- **Task Management**: Add, edit, delete tasks with validation
- **Algorithm Selection**: Visual cards for different scheduling algorithms
- **Real-time Execution**: Progress bars and status updates
- **Results Navigation**: Seamless transition to results page

### Results Page (`results.html`)
- **Tabbed Interface**: Performance, Logs, and Comparison views
- **Interactive Charts**: Multiple visualization types using Chart.js
- **Detailed Metrics**: Comprehensive performance analysis
- **Log Filtering**: Search and filter execution logs
- **Benchmark Comparison**: Side-by-side algorithm analysis

## 📊 Scheduling Algorithms

### 1. Shortest Job First (SJF)
- Non-preemptive algorithm
- Selects tasks with shortest burst time
- Minimizes average waiting time
- Optimal for batch processing

### 2. Round Robin (RR)
- Preemptive algorithm
- Each task gets equal time quantum
- Fair distribution of CPU time
- Good for time-sharing systems

### 3. Priority Scheduling
- Tasks scheduled based on priority (1-5)
- Higher priority tasks execute first
- Useful for real-time systems
- May cause starvation of low-priority tasks

## 📈 Performance Metrics

The system tracks and displays the following metrics:

- **Total Execution Time**: Overall time to complete all tasks
- **Average Waiting Time**: Mean time tasks spend waiting in queue
- **Average Turnaround Time**: Mean time from arrival to completion
- **CPU Utilization**: Percentage of time CPU is actively processing
- **Throughput**: Number of tasks completed per unit time
- **Speedup**: Performance gain compared to sequential execution

## 🔧 Task Types

1. **Matrix Multiplication**: CPU-intensive matrix operations
2. **Sorting**: Large dataset sorting algorithms
3. **File Processing**: I/O-bound file operations
4. **Computation**: Complex mathematical calculations

## 🎯 Features Demonstrated

### Operating System Concepts
- ✅ Process Scheduling (SJF, RR, Priority)
- ✅ Multithreading and Parallelism
- ✅ Thread Synchronization (Mutex, Condition Variables)
- ✅ Resource Management
- ✅ Performance Monitoring
- ✅ Task Queue Management

### Software Engineering
- ✅ Client-Server Architecture
- ✅ RESTful API Design
- ✅ Real-time Data Visualization
- ✅ Modular Code Structure
- ✅ Cross-platform Compatibility
- ✅ Modern Web Development

## 📝 API Endpoints

The Python Flask server provides the following REST API:

- `POST /api/tasks` - Submit tasks for scheduling
- `POST /api/execute` - Execute scheduler with selected algorithm
- `GET /api/status` - Get current execution status
- `GET /api/results` - Retrieve execution results
- `GET /api/logs` - Fetch execution logs
- `POST /api/benchmark` - Run benchmark on all algorithms
- `GET /api/tasks/sample` - Get sample task definitions

## 🐛 Troubleshooting

### C++ Compilation Errors
- Ensure C++17 support: `g++ --version` (should be 7.0 or higher)
- Verify pthread library availability
- On Windows, ensure MinGW bin directory is in PATH

### Python Import Errors
```bash
pip install --upgrade -r backend/python/requirements.txt
```

### API Connection Issues
- Ensure Flask server is running on port 5000
- Check CORS settings if accessing from different domain
- Verify firewall settings

### Build Issues on Windows
```bash
# Make sure MinGW is in PATH
where g++

# Ensure g++ version supports C++17
g++ --version

# If using MSYS2, install development tools:
pacman -S mingw-w64-x86_64-gcc
```

## 📚 Learning Outcomes

This project demonstrates:
1. **Process Scheduling**: Implementation of classic CPU scheduling algorithms
2. **Concurrency**: Multi-threaded programming with synchronization
3. **Performance Analysis**: Measuring and optimizing system performance
4. **Full-Stack Development**: Integration of C++, Python, and Web technologies
5. **Modern Web Design**: Responsive design, animations, and user experience
6. **System Design**: Building scalable, modular software systems

## 🎓 Educational Value

Perfect for:
- Operating Systems coursework
- Parallel programming studies
- System performance analysis
- Algorithm comparison and benchmarking
- Full-stack development practice
- Modern web development techniques

## 👥 Contributing

Contributions are welcome! Areas for enhancement:
- Additional scheduling algorithms (FCFS, MLFQ, etc.)
- More task types and simulations
- Enhanced visualization options
- Mobile-responsive improvements
- Real-time collaborative features
- Advanced animation effects

## 📄 License

This project is created for educational purposes as part of an Operating Systems course.

## 🙏 Acknowledgments

- Operating Systems course materials
- Modern Operating Systems by Andrew S. Tanenbaum
- Chart.js for visualization library
- Flask framework for Python API
- Font Awesome for icons
- Google Fonts for typography

## 📞 Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review code comments and documentation
3. Examine execution logs in `logs/` directory

## 🔄 Version History

- **v2.0.0** - Complete frontend redesign with multi-page architecture
  - Modern home page with animations and project description
  - Dedicated scheduler page with improved task management
  - Enhanced results page with tabbed interface and advanced charts
  - Responsive design with smooth animations and transitions
- **v1.0.0** - Initial release with SJF, RR, and Priority scheduling
- Full web interface with real-time monitoring
- Comprehensive benchmarking and analytics

---

**Built with ❤️ for Operating Systems Education**

*Demonstrating Parallel Processing, Task Scheduling, and Modern Web Development*

## 🚀 Setup and Installation

### Prerequisites

#### Windows
- **C++ Compiler**: MinGW-w64 with g++ (C++17 support)
- **Python**: 3.8 or higher
- **Libraries**: 
  - pthread (usually included with MinGW)

#### Linux/Mac
- **C++ Compiler**: g++ with C++17 support
- **Python**: 3.8 or higher
- **Build Tools**: make

### Installation Steps

#### 1. Install C++ Compiler

**Windows:**
```bash
# Install MinGW-w64
# Download from: https://www.mingw-w64.org/
# OR use MSYS2: https://www.msys2.org/

# Make sure g++ is in your PATH
where g++
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install g++ make
```

**Mac:**
```bash
brew install gcc
```

#### 2. Install Python Dependencies

```bash
cd backend/python
pip install -r requirements.txt
```

#### 3. Build C++ Scheduler

```bash
cd backend/cpp
make
```

This will create the executable at `backend/cpp/bin/scheduler.exe` (Windows) or `backend/cpp/bin/scheduler` (Linux/Mac).

## 💻 Usage

### Method 1: Using the Web Interface (Recommended)

1. **Start the Python API Server:**
```bash
cd backend/python
python api_server.py
```
The server will start on `http://localhost:5000`

2. **Open the Web Interface:**
```bash
# Open frontend/index.html in your web browser
# Or use a simple HTTP server:
cd frontend
python -m http.server 8000
# Then navigate to http://localhost:8000
```

3. **Using the Interface:**
   - Add tasks manually or load sample tasks
   - Select a scheduling algorithm (SJF, Round Robin, or Priority)
   - Click "Start Scheduler" to begin execution
   - Monitor real-time progress and view results
   - Use "Run Benchmark" to compare all algorithms

### Method 2: Command Line Interface

1. **Create a task file** (`data/tasks.json`):
```json
{
  "tasks": [
    {
      "id": 1,
      "name": "Matrix Multiplication",
      "type": "matrix",
      "priority": 3,
      "burstTime": 100,
      "arrivalTime": 0,
      "dataSize": 100
    },
    {
      "id": 2,
      "name": "Quick Sort",
      "type": "sort",
      "priority": 2,
      "burstTime": 150,
      "arrivalTime": 10,
      "dataSize": 50
    }
  ]
}
```

2. **Run the C++ scheduler directly:**
```bash
cd backend/cpp/bin
./scheduler sjf ../../data/tasks.json
```

Replace `sjf` with `rr` (Round Robin) or `priority` as needed.

3. **Run Python benchmarking:**
```bash
cd backend/python
python orchestrator.py
```

## 📊 Scheduling Algorithms

### 1. Shortest Job First (SJF)
- Non-preemptive algorithm
- Selects tasks with shortest burst time
- Minimizes average waiting time
- Optimal for batch processing

### 2. Round Robin (RR)
- Preemptive algorithm
- Each task gets equal time quantum
- Fair distribution of CPU time
- Good for time-sharing systems

### 3. Priority Scheduling
- Tasks scheduled based on priority (1-5)
- Higher priority tasks execute first
- Useful for real-time systems
- May cause starvation of low-priority tasks

## 📈 Performance Metrics

The system tracks and displays the following metrics:

- **Total Execution Time**: Overall time to complete all tasks
- **Average Waiting Time**: Mean time tasks spend waiting in queue
- **Average Turnaround Time**: Mean time from arrival to completion
- **CPU Utilization**: Percentage of time CPU is actively processing
- **Throughput**: Number of tasks completed per unit time
- **Speedup**: Performance gain compared to sequential execution

## 🔧 Task Types

1. **Matrix Multiplication**: CPU-intensive matrix operations
2. **Sorting**: Large dataset sorting algorithms
3. **File Processing**: I/O-bound file operations
4. **Computation**: Complex mathematical calculations

## 🎯 Features Demonstrated

### Operating System Concepts
- ✅ Process Scheduling (SJF, RR, Priority)
- ✅ Multithreading and Parallelism
- ✅ Thread Synchronization (Mutex, Condition Variables)
- ✅ Resource Management
- ✅ Performance Monitoring
- ✅ Task Queue Management

### Software Engineering
- ✅ Client-Server Architecture
- ✅ RESTful API Design
- ✅ Real-time Data Visualization
- ✅ Modular Code Structure
- ✅ Cross-platform Compatibility

## 📝 API Endpoints

The Python Flask server provides the following REST API:

- `POST /api/tasks` - Submit tasks for scheduling
- `POST /api/execute` - Execute scheduler with selected algorithm
- `GET /api/status` - Get current execution status
- `GET /api/results` - Retrieve execution results
- `GET /api/logs` - Fetch execution logs
- `POST /api/benchmark` - Run benchmark on all algorithms
- `GET /api/tasks/sample` - Get sample task definitions

## 🐛 Troubleshooting

### C++ Compilation Errors
- Ensure C++17 support: `g++ --version` (should be 7.0 or higher)
- Verify pthread library availability
- On Windows, ensure MinGW bin directory is in PATH

### Python Import Errors
```bash
pip install --upgrade -r backend/python/requirements.txt
```

### API Connection Issues
- Ensure Flask server is running on port 5000
- Check CORS settings if accessing from different domain
- Verify firewall settings

### Build Issues on Windows
```bash
# Make sure MinGW is in PATH
where g++

# Ensure g++ version supports C++17
g++ --version

# If using MSYS2, install development tools:
pacman -S mingw-w64-x86_64-gcc
```

## 📚 Learning Outcomes

This project demonstrates:
1. **Process Scheduling**: Implementation of classic CPU scheduling algorithms
2. **Concurrency**: Multi-threaded programming with synchronization
3. **Performance Analysis**: Measuring and optimizing system performance
4. **Full-Stack Development**: Integration of C++, Python, and Web technologies
5. **System Design**: Building scalable, modular software systems

## 🎓 Educational Value

Perfect for:
- Operating Systems coursework
- Parallel programming studies
- System performance analysis
- Algorithm comparison and benchmarking
- Full-stack development practice

## 👥 Contributing

Contributions are welcome! Areas for enhancement:
- Additional scheduling algorithms (FCFS, MLFQ, etc.)
- More task types and simulations
- Enhanced visualization options
- Mobile-responsive improvements
- Real-time collaborative features

## 📄 License

This project is created for educational purposes as part of an Operating Systems course.

## 🙏 Acknowledgments

- Operating Systems course materials
- Modern Operating Systems by Andrew S. Tanenbaum
- Chart.js for visualization library
- Flask framework for Python API

## 📞 Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review code comments and documentation
3. Examine execution logs in `logs/` directory

## 🔄 Version History

- **v1.0.0** - Initial release with SJF, RR, and Priority scheduling
- Full web interface with real-time monitoring
- Comprehensive benchmarking and analytics

---

**Built with ❤️ **

*Demonstrating Parallel Processing, Task Scheduling, and System Performance Optimization*
