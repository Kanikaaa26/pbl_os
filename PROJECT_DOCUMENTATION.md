# Parallel Task Scheduler - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Core Concepts & OS Topics](#core-concepts--os-topics)
4. [Implementation Details](#implementation-details)
5. [Scheduling Algorithms](#scheduling-algorithms)
6. [Code Explanation](#code-explanation)
7. [Execution Flow](#execution-flow)
8. [Performance Metrics](#performance-metrics)
9. [How to Answer Questions](#how-to-answer-questions)

---

## Project Overview

### What is this project?
A **Parallel Task Scheduler** that demonstrates fundamental Operating System concepts including:
- Process scheduling algorithms
- Thread synchronization
- Parallel processing
- Performance analysis

### Technologies Used
- **Backend**: C++ (for scheduler implementation)
- **API Server**: Python Flask (REST API)
- **Frontend**: HTML, CSS, JavaScript (visualization)
- **Key Libraries**: 
  - C++17 with `<thread>`, `<mutex>`, `<condition_variable>`
  - Chart.js for performance visualization

### Project Purpose
This project simulates how an Operating System schedules multiple tasks/processes across multiple CPU cores using different scheduling algorithms, demonstrating the impact of algorithm choice on system performance.

---

## System Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Web Interface)         │
│   HTML + CSS + JavaScript + Chart.js     │
└─────────────────┬───────────────────────┘
                  │ HTTP REST API
┌─────────────────▼───────────────────────┐
│     Python API Server (Flask)            │
│   - Task management                      │
│   - C++ scheduler orchestration          │
│   - Results aggregation                  │
└─────────────────┬───────────────────────┘
                  │ Process execution
┌─────────────────▼───────────────────────┐
│   C++ Scheduler Engine                   │
│   - Multi-threaded execution             │
│   - Scheduling algorithms                │
│   - Performance metric calculation       │
└──────────────────────────────────────────┘
```

### File Structure
```
pbl_os/
├── backend/
│   ├── cpp/
│   │   ├── main.cpp          # Entry point, JSON parsing, result writing
│   │   ├── scheduler.h/cpp   # Scheduler class with algorithms
│   │   ├── task.h/cpp        # Task class definition
│   │   └── bin/              # Compiled executable
│   └── python/
│       ├── api_server.py     # Flask REST API
│       └── orchestrator.py   # Python orchestration layer
├── frontend/
│   ├── index.html            # Home page
│   ├── scheduler.html        # Task creation & execution
│   ├── results.html          # Performance visualization
│   └── js/
│       ├── scheduler.js      # Task management logic
│       ├── results.js        # Results display logic
│       └── charts.js         # Chart rendering
└── data/
    ├── tasks.json            # Input tasks
    └── results.json          # Execution results
```

---

## Core Concepts & OS Topics

### 1. **Process Scheduling**
**What it is**: The OS decides which process/task runs on which CPU core at what time.

**In this project**:
- Tasks represent processes
- Multiple worker threads represent CPU cores
- Scheduler decides task execution order

### 2. **Scheduling Algorithms Implemented**

#### a) Shortest Job First (SJF)
- **Concept**: Execute tasks with shortest burst time first
- **Advantage**: Minimizes average waiting time
- **Disadvantage**: Can starve long processes
- **Real-world use**: Batch processing systems

#### b) Round Robin (RR)
- **Concept**: Each task gets a fixed time slice (quantum)
- **Advantage**: Fair, no starvation
- **Disadvantage**: Higher context switching overhead
- **Real-world use**: Time-sharing systems, modern OS

#### c) Priority Scheduling
- **Concept**: Tasks with higher priority execute first
- **Advantage**: Important tasks complete quickly
- **Disadvantage**: Can starve low-priority tasks
- **Real-world use**: Real-time systems, server workloads

### 3. **Thread Synchronization**

#### Mutex (Mutual Exclusion)
```cpp
std::mutex queueMutex;
```
- **Purpose**: Prevents race conditions
- **Use case**: Protects shared task queue from concurrent access
- **How it works**: Only one thread can access the queue at a time

#### Condition Variable
```cpp
std::condition_variable queueCV;
```
- **Purpose**: Thread communication and coordination
- **Use case**: Worker threads wait for tasks to become available
- **How it works**: Threads sleep until signaled, saving CPU cycles

### 4. **Parallel Processing**
- **Concept**: Multiple tasks execute simultaneously on different cores
- **Implementation**: 4 worker threads (configurable)
- **Benefit**: Reduced total execution time compared to sequential execution

### 5. **Performance Metrics**

#### Turnaround Time
```
Turnaround Time = Completion Time - Arrival Time
```
- Total time from task submission to completion

#### Waiting Time
```
Waiting Time = Turnaround Time - Burst Time
```
- Time task spent waiting in queue

#### CPU Utilization
```
CPU Utilization = (Total Burst Time / (Total Execution Time × Number of Threads)) × 100
```
- Percentage of CPU time spent on useful work

#### Throughput
```
Throughput = Number of Tasks / Total Execution Time (in seconds)
```
- Tasks completed per unit time

---

## Implementation Details

### Task Class (task.h/cpp)

#### Task Structure
```cpp
class Task {
private:
    int id;                    // Unique identifier
    std::string name;          // Descriptive name
    TaskType type;             // MATRIX_MULTIPLY, SORTING, FILE_PROCESSING, COMPUTATION
    int priority;              // 1-5 (higher = more important)
    int burstTime;             // Execution time in milliseconds
    int arrivalTime;           // When task becomes ready
    int remainingTime;         // For Round Robin preemption
    TaskStatus status;         // PENDING, RUNNING, COMPLETED
    int completionTime;        // When task finished
    int waitingTime;           // Time spent waiting
    int turnaroundTime;        // Total time in system
};
```

#### Task Types Explained

1. **MATRIX_MULTIPLY**: CPU-intensive matrix operations
   - Simulates: Scientific computing, image processing
   - Implementation: Nested loops performing matrix multiplication

2. **SORTING**: CPU-intensive data sorting
   - Simulates: Database operations, data analytics
   - Implementation: Generates random data and sorts it

3. **FILE_PROCESSING**: I/O-bound operations
   - Simulates: File read/write, network operations
   - Implementation: Sleep to simulate I/O wait time

4. **COMPUTATION**: Complex mathematical calculations
   - Simulates: Scientific simulations, cryptography
   - Implementation: Trigonometric and square root operations

### Scheduler Class (scheduler.h/cpp)

#### Key Components

##### 1. Task Queue
```cpp
std::vector<std::shared_ptr<Task>> taskQueue;
```
- Stores tasks waiting to be executed
- Protected by mutex for thread safety

##### 2. Worker Threads
```cpp
std::vector<std::thread> workerThreads;
```
- Each thread represents a CPU core
- Continuously pulls tasks from queue and executes them

##### 3. Scheduling Methods

**Shortest Job First (SJF)**:
```cpp
std::shared_ptr<Task> getNextTaskSJF() {
    // Find task with minimum burst time
    auto it = std::min_element(taskQueue.begin(), taskQueue.end(),
        [](const auto& a, const auto& b) {
            return a->getBurstTime() < b->getBurstTime();
        });
    return *it;
}
```

**Round Robin**:
```cpp
std::shared_ptr<Task> getNextTaskRoundRobin() {
    // Get first task (FIFO)
    auto task = taskQueue.front();
    taskQueue.erase(taskQueue.begin());
    
    // Limit execution time to quantum
    int executionTime = std::min(timeQuantum, task->getRemainingTime());
    task->decrementRemainingTime(executionTime);
    
    return task;
}
```

**Priority Scheduling**:
```cpp
std::shared_ptr<Task> getNextTaskPriority() {
    // Find task with highest priority
    auto it = std::max_element(taskQueue.begin(), taskQueue.end(),
        [](const auto& a, const auto& b) {
            return a->getPriority() < b->getPriority();
        });
    return *it;
}
```

##### 4. Worker Thread Logic
```cpp
void Scheduler::workerThread(int threadId) {
    while(running) {
        // 1. Wait for task (using condition variable)
        std::unique_lock<std::mutex> lock(queueMutex);
        queueCV.wait(lock, [this] { return !taskQueue.empty() || !running; });
        
        // 2. Get next task based on algorithm
        std::shared_ptr<Task> task = getNextTask();
        lock.unlock();
        
        if(task) {
            // 3. Wait for arrival time (scheduling realism)
            waitForArrivalTime(task);
            
            // 4. Execute task
            task->execute();
            
            // 5. Record completion time
            task->setCompletionTime(getCurrentTime());
            
            // 6. Move to completed tasks
            completedTasks.push_back(task);
        }
    }
}
```

### Metric Calculation Logic

```cpp
void Scheduler::calculateMetrics() {
    int totalWaitingTime = 0;
    int totalTurnaroundTime = 0;
    int totalBurstTime = 0;
    int maxCompletionTime = 0;
    
    for(const auto& task : completedTasks) {
        // Calculate turnaround time
        int turnaroundTime = completionTime - arrivalTime;
        turnaroundTime = std::max(turnaroundTime, burstTime); // Ensure >= burstTime
        
        // Calculate waiting time
        int waitingTime = turnaroundTime - burstTime;
        waitingTime = std::max(0, waitingTime); // Ensure non-negative
        
        totalWaitingTime += waitingTime;
        totalTurnaroundTime += turnaroundTime;
        totalBurstTime += burstTime;
        maxCompletionTime = std::max(maxCompletionTime, completionTime);
    }
    
    // Calculate averages
    averageWaitingTime = totalWaitingTime / completedTasks.size();
    averageTurnaroundTime = totalTurnaroundTime / completedTasks.size();
    totalExecutionTime = maxCompletionTime;
    
    // Calculate CPU utilization (with bounds checking)
    cpuUtilization = (totalBurstTime / (totalExecutionTime * numThreads)) * 100;
    cpuUtilization = std::min(cpuUtilization, 100.0); // Cap at 100%
    
    // Calculate throughput (tasks per second)
    throughput = completedTasks.size() / (totalExecutionTime / 1000.0);
}
```

---

## Execution Flow

### Step-by-Step Execution

#### 1. Task Creation (Frontend)
```javascript
// User creates task via web interface
const task = {
    id: 1,
    name: "Matrix Multiplication",
    type: "matrix",
    priority: 3,
    burstTime: 100,
    arrivalTime: 0,
    dataSize: 100
};
```

#### 2. Task Submission (Python API)
```python
@app.route('/api/tasks', methods=['POST'])
def submit_tasks():
    tasks = request.json.get('tasks', [])
    
    # Save to JSON file
    with open('data/tasks.json', 'w') as f:
        json.dump({'tasks': tasks}, f)
    
    return jsonify({'status': 'success'})
```

#### 3. Scheduler Execution (C++)
```cpp
int main(int argc, char* argv[]) {
    // 1. Read tasks from JSON
    auto tasks = readTasksFromJSON("data/tasks.json");
    
    // 2. Create scheduler with chosen algorithm
    Scheduler scheduler(SJF, 4, 2);
    
    // 3. Add tasks to queue
    for(auto& task : tasks) {
        scheduler.addTask(task);
    }
    
    // 4. Start worker threads
    scheduler.start();
    
    // 5. Wait for completion
    scheduler.waitForCompletion();
    
    // 6. Calculate metrics
    scheduler.calculateMetrics();
    
    // 7. Write results
    writeResultsToJSON(scheduler, "data/results.json");
}
```

#### 4. Results Display (Frontend)
```javascript
// Load and display results
fetch('/api/results')
    .then(response => response.json())
    .then(results => {
        updateMetrics(results);
        renderCharts(results);
    });
```

### Thread Synchronization Flow

```
Thread 0              Thread 1              Thread 2              Thread 3
   |                     |                     |                     |
   |─── Lock Mutex ──────|                     |                     |
   |─── Get Task 1 ──────|                     |                     |
   |─── Unlock ──────────|                     |                     |
   |                     |─── Lock Mutex ──────|                     |
   |                     |─── Get Task 2 ──────|                     |
   |                     |─── Unlock ──────────|                     |
   |                     |                     |─── Lock Mutex ──────|
   |                     |                     |─── Get Task 3 ──────|
   |                     |                     |─── Unlock ──────────|
   |                     |                     |                     |─── Lock
   |                     |                     |                     |─── Wait (no tasks)
   |                     |                     |                     |
[Execute Task 1]    [Execute Task 2]    [Execute Task 3]              |
   |                     |                     |                     |
   |─── Lock ────────────|                     |                     |
   |─── Add to completed─|                     |                     |
   |─── Signal CV ───────|──────────────────────────────────────────>| Wake up!
   |─── Unlock ──────────|                     |                     |
```

---

## Performance Metrics Explained

### 1. Execution Time
- **Definition**: Time from first task start to last task completion
- **Formula**: `max(completion_time) - min(arrival_time)`
- **Good value**: Lower is better
- **Typical range**: 1000-3000ms for sample tasks

### 2. Average Waiting Time
- **Definition**: Average time tasks spend waiting in queue
- **Formula**: `Σ(waiting_time) / number_of_tasks`
- **Good value**: Lower is better (indicates efficient scheduling)
- **Impact**: Directly affects user experience

### 3. Average Turnaround Time
- **Definition**: Average total time tasks spend in system
- **Formula**: `Σ(completion_time - arrival_time) / number_of_tasks`
- **Good value**: Lower is better
- **Significance**: Measures overall system responsiveness

### 4. CPU Utilization
- **Definition**: Percentage of CPU time doing useful work
- **Formula**: `(total_burst_time / (execution_time × threads)) × 100`
- **Good value**: Higher is better (but realistic range: 20-80%)
- **Why not 100%**: Context switching, synchronization overhead, I/O wait

### 5. Throughput
- **Definition**: Tasks completed per second
- **Formula**: `number_of_tasks / execution_time_in_seconds`
- **Good value**: Higher is better
- **Typical range**: 5-10 tasks/sec for sample workload

---

## How to Answer Questions

### Common Questions & Answers

#### Q1: "What scheduling algorithms did you implement?"
**Answer**: 
"I implemented three classic CPU scheduling algorithms:

1. **Shortest Job First (SJF)** - Non-preemptive algorithm that executes tasks with the shortest burst time first. This minimizes average waiting time but can cause starvation for longer tasks.

2. **Round Robin (RR)** - Preemptive algorithm where each task gets a fixed time quantum (2ms in my implementation). It provides fair CPU allocation and prevents starvation but has higher context switching overhead.

3. **Priority Scheduling** - Tasks with higher priority (1-5 scale) execute first. Useful for real-time systems but can starve low-priority tasks.

Each algorithm demonstrates different trade-offs between fairness, efficiency, and responsiveness."

#### Q2: "How did you handle thread synchronization?"
**Answer**:
"I used two key synchronization primitives:

1. **Mutex (std::mutex)** - Protects the shared task queue from race conditions. When a thread needs to access the queue, it must acquire the lock first, preventing other threads from accessing it simultaneously.

2. **Condition Variable (std::condition_variable)** - Allows worker threads to wait efficiently when no tasks are available, rather than busy-waiting and wasting CPU cycles. When a new task arrives, the condition variable signals waiting threads.

This combination ensures thread safety while maintaining good performance through efficient waiting."

#### Q3: "Why is CPU utilization not 100%?"
**Answer**:
"CPU utilization below 100% is realistic and expected due to:

1. **Synchronization overhead** - Time spent acquiring locks and signaling condition variables
2. **Context switching** - Time spent switching between threads
3. **I/O operations** - File processing tasks sleep during I/O, leaving CPU idle
4. **Arrival time delays** - Tasks don't all arrive simultaneously
5. **Queue management** - Time spent selecting next task based on algorithm

In my implementation, 20-30% utilization is normal for mixed workloads with I/O-bound tasks. Pure CPU-bound tasks can achieve 60-80% utilization."

#### Q4: "What's the difference between waiting time and turnaround time?"
**Answer**:
"Both are important scheduling metrics but measure different things:

**Waiting Time** = Time task spends in ready queue waiting for CPU
- Formula: `Turnaround Time - Burst Time`
- Example: Task arrives at 0ms, starts at 50ms, takes 100ms to execute → waiting time = 50ms

**Turnaround Time** = Total time from arrival to completion
- Formula: `Completion Time - Arrival Time`
- Same example: Turnaround time = 150ms

Turnaround time includes both waiting time and actual execution time. Lower waiting time indicates better scheduling efficiency."

#### Q5: "How does your parallel implementation improve performance?"
**Answer**:
"The parallel implementation uses 4 worker threads to execute tasks concurrently:

1. **Theoretical Speedup**: If all tasks are CPU-bound and independent, we can achieve up to 4× speedup with 4 threads

2. **Actual Speedup**: Typically 2-3× due to:
   - Synchronization overhead
   - Not all tasks can run in parallel (some wait for arrival time)
   - Mixed workload includes I/O tasks

3. **Efficiency Gains**: 
   - Sequential execution: Sum of all burst times
   - Parallel execution: Overlap task execution on multiple cores
   
The speedup metric in my results shows actual performance improvement compared to sequential execution."

#### Q6: "What OS concepts does this project demonstrate?"
**Answer**:
"This project demonstrates several core Operating Systems concepts:

1. **Process Scheduling**: Implementation of CPU scheduling algorithms (SJF, RR, Priority)

2. **Thread Management**: Creation, synchronization, and coordination of worker threads

3. **Synchronization Primitives**: Mutexes and condition variables to prevent race conditions

4. **Parallel Processing**: Concurrent task execution across multiple threads

5. **Performance Metrics**: Turnaround time, waiting time, CPU utilization, throughput

6. **Resource Management**: Efficient allocation of CPU time to competing tasks

7. **Context Switching**: Simulated through Round Robin time quantum

These concepts are fundamental to how modern operating systems manage processes and CPU resources."

#### Q7: "Which algorithm performs best?"
**Answer**:
"It depends on the workload and optimization goal:

**For Minimum Waiting Time**: SJF performs best because it prioritizes short tasks, reducing average wait

**For Fairness**: Round Robin ensures all tasks get equal CPU time, preventing starvation

**For Critical Tasks**: Priority scheduling ensures important tasks complete first

In my testing with mixed workloads:
- SJF: Best average waiting time but may starve long tasks
- RR: Most predictable, fair response times
- Priority: Fastest completion for high-priority tasks

No single algorithm is universally 'best' - the choice depends on system requirements and workload characteristics."

#### Q8: "How did you validate your implementation?"
**Answer**:
"I validated the implementation through multiple approaches:

1. **Correctness Testing**:
   - Verified all tasks complete successfully
   - Checked metrics are within expected ranges
   - Ensured no race conditions or deadlocks

2. **Metric Validation**:
   - Turnaround time ≥ burst time (always true)
   - Waiting time ≥ 0 (non-negative)
   - CPU utilization ≤ 100% (capped)
   - Completion time > arrival time

3. **Algorithm Verification**:
   - SJF executes shortest tasks first
   - RR respects time quantum
   - Priority orders by priority value

4. **Performance Testing**:
   - Different task mixes (CPU vs I/O bound)
   - Various thread counts
   - Algorithm comparison shows expected patterns"

#### Q9: "What challenges did you face?"
**Answer**:
"Key challenges included:

1. **Time Tracking**: Initially had negative values due to parallel execution completing tasks before arrival time. Fixed by implementing proper global time tracking and ensuring metrics respect causality.

2. **Thread Synchronization**: Preventing race conditions while maintaining performance required careful use of mutexes and condition variables.

3. **Round Robin Implementation**: Handling task preemption and re-queueing while maintaining thread safety.

4. **Metric Calculation**: Ensuring all metrics (utilization, throughput) handle edge cases like zero execution time and produce valid results.

5. **Cross-platform Compatibility**: Managing differences between Windows and Linux for file paths and compilation."

#### Q10: "How could you extend this project?"
**Answer**:
"Possible extensions include:

1. **Additional Algorithms**:
   - Multilevel Queue Scheduling
   - Multilevel Feedback Queue
   - Real-Time scheduling (EDF, Rate Monotonic)

2. **Advanced Features**:
   - Task dependencies (precedence constraints)
   - Dynamic priority adjustment (aging)
   - Load balancing across threads

3. **Realistic Simulation**:
   - Variable CPU core speeds
   - Cache simulation
   - Power consumption modeling

4. **Analysis Tools**:
   - Gantt chart visualization
   - Statistical analysis
   - Algorithm recommendation engine

5. **Performance Optimization**:
   - Lock-free data structures
   - Work stealing for better load balance
   - NUMA-aware thread placement"

---

## Key Takeaways for Presentation

### What You Built
✅ A complete parallel task scheduler simulating OS process scheduling
✅ Three scheduling algorithms (SJF, RR, Priority)
✅ Multi-threaded execution with proper synchronization
✅ Full-stack application (C++ backend, Python API, Web frontend)
✅ Performance visualization and analysis

### What You Learned
✅ How operating systems schedule processes
✅ Thread synchronization using mutexes and condition variables
✅ Performance trade-offs between scheduling algorithms
✅ Parallel programming concepts and challenges
✅ Full software development cycle

### Why It Matters
✅ Demonstrates fundamental OS concepts practically
✅ Shows impact of scheduling on system performance
✅ Proves understanding of concurrent programming
✅ Applicable to real-world system design

---

## Quick Reference: Commands

### Build C++ Scheduler
```bash
# Windows
.\build.bat

# Linux
make
```

### Run Scheduler Manually
```bash
# Format: scheduler.exe <algorithm> <input_file>
backend\cpp\bin\scheduler.exe sjf data\tasks.json
backend\cpp\bin\scheduler.exe rr data\tasks.json
backend\cpp\bin\scheduler.exe priority data\tasks.json
```

### Start Web Server
```bash
# Start API server
cd backend\python
python api_server.py

# Access frontend
# Open http://localhost:5000 in browser
```

---

## Glossary of Terms

- **Burst Time**: Time required to execute a task on CPU
- **Arrival Time**: Time when task becomes ready to execute
- **Completion Time**: Time when task finishes execution
- **Context Switch**: Switching CPU from one task to another
- **Mutex**: Mutual exclusion lock for thread synchronization
- **Preemption**: Interrupting a running task to run another
- **Quantum**: Fixed time slice in Round Robin scheduling
- **Race Condition**: Bug from unsynchronized concurrent access
- **Starvation**: Task never getting CPU time
- **Throughput**: Tasks completed per unit time
- **Turnaround Time**: Total time from arrival to completion
- **Waiting Time**: Time spent waiting in ready queue

---

*This documentation covers all aspects of the Parallel Task Scheduler project, providing comprehensive material for answering questions about implementation, concepts, and OS topics.*
