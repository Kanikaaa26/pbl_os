#include "scheduler.h"
#include <iostream>
#include <algorithm>
#include <fstream>
#include <iomanip>
#include <chrono>

Scheduler::Scheduler(SchedulingAlgorithm algo, int threads, int quantum)
    : algorithm(algo), numThreads(threads), timeQuantum(quantum), 
      running(false), currentTime(0), totalExecutionTime(0), 
      averageWaitingTime(0), averageTurnaroundTime(0), 
      cpuUtilization(0), throughput(0) {}

Scheduler::~Scheduler() {
    stop();
}

void Scheduler::addTask(std::shared_ptr<Task> task) {
    std::lock_guard<std::mutex> lock(queueMutex);
    taskQueue.push_back(task);
    queueCV.notify_one();
}

void Scheduler::start() {
    running = true;
    globalStartTime = std::chrono::high_resolution_clock::now();
    for(int i = 0; i < numThreads; i++) {
        workerThreads.emplace_back(&Scheduler::workerThread, this, i);
    }
}

void Scheduler::stop() {
    running = false;
    queueCV.notify_all();
    for(auto& thread : workerThreads) {
        if(thread.joinable()) {
            thread.join();
        }
    }
}

void Scheduler::waitForCompletion() {
    while(true) {
        std::unique_lock<std::mutex> lock(queueMutex);
        if(taskQueue.empty()) {
            break;
        }
        lock.unlock();
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

void Scheduler::workerThread(int threadId) {
    while(running) {
        std::shared_ptr<Task> task = nullptr;
        
        {
            std::unique_lock<std::mutex> lock(queueMutex);
            queueCV.wait(lock, [this] { return !taskQueue.empty() || !running; });
            
            if(!running && taskQueue.empty()) {
                return;
            }
            
            // Get next task based on scheduling algorithm
            switch(algorithm) {
                case SJF:
                    task = getNextTaskSJF();
                    break;
                case ROUND_ROBIN:
                    task = getNextTaskRoundRobin();
                    break;
                case PRIORITY:
                    task = getNextTaskPriority();
                    break;
            }
        }
        
        if(task) {
            // Wait for arrival time
            auto now = std::chrono::high_resolution_clock::now();
            int elapsedTime = std::chrono::duration_cast<std::chrono::milliseconds>(now - globalStartTime).count();
            int arrivalTime = task->getArrivalTime();
            
            if(elapsedTime < arrivalTime) {
                std::this_thread::sleep_for(std::chrono::milliseconds(arrivalTime - elapsedTime));
            }
            
            // Execute task
            task->startExecution();
            logTaskExecution(task, threadId);
            
            // Simulate task execution
            task->execute();
            
            task->finishExecution();
            
            // Calculate completion time from global start
            now = std::chrono::high_resolution_clock::now();
            int completionTime = std::chrono::duration_cast<std::chrono::milliseconds>(now - globalStartTime).count();
            task->setCompletionTime(completionTime);
            
            // For Round Robin, if task not complete, re-queue it
            if(algorithm == ROUND_ROBIN && task->getRemainingTime() > 0) {
                std::lock_guard<std::mutex> lock(queueMutex);
                taskQueue.push_back(task);
            } else {
                std::lock_guard<std::mutex> lock(queueMutex);
                task->setStatus(COMPLETED);
                completedTasks.push_back(task);
            }
        }
    }
}

std::shared_ptr<Task> Scheduler::getNextTaskSJF() {
    if(taskQueue.empty()) return nullptr;
    
    auto it = std::min_element(taskQueue.begin(), taskQueue.end(),
        [](const std::shared_ptr<Task>& a, const std::shared_ptr<Task>& b) {
            return a->getBurstTime() < b->getBurstTime();
        });
    
    std::shared_ptr<Task> task = *it;
    taskQueue.erase(it);
    return task;
}

std::shared_ptr<Task> Scheduler::getNextTaskRoundRobin() {
    if(taskQueue.empty()) return nullptr;
    
    std::shared_ptr<Task> task = taskQueue.front();
    taskQueue.erase(taskQueue.begin());
    
    // Reduce remaining time by time quantum
    int executionTime = std::min(timeQuantum, task->getRemainingTime());
    task->decrementRemainingTime(executionTime);
    
    return task;
}

std::shared_ptr<Task> Scheduler::getNextTaskPriority() {
    if(taskQueue.empty()) return nullptr;
    
    auto it = std::max_element(taskQueue.begin(), taskQueue.end(),
        [](const std::shared_ptr<Task>& a, const std::shared_ptr<Task>& b) {
            return a->getPriority() < b->getPriority();
        });
    
    std::shared_ptr<Task> task = *it;
    taskQueue.erase(it);
    return task;
}

void Scheduler::logTaskExecution(const std::shared_ptr<Task>& task, int threadId) {
    std::ofstream logFile("logs/execution.log", std::ios::app);
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    
    logFile << "[" << std::put_time(std::localtime(&time), "%Y-%m-%d %H:%M:%S") << "] "
            << "Thread " << threadId << " executing Task " << task->getId() 
            << " (" << task->getName() << ") - Type: " << task->getTypeString()
            << ", Priority: " << task->getPriority() 
            << ", Burst Time: " << task->getBurstTime() << "ms\n";
    logFile.close();
}

void Scheduler::calculateMetrics() {
    if(completedTasks.empty()) return;
    
    int totalWaitingTime = 0;
    int totalTurnaroundTime = 0;
    int maxCompletionTime = 0;
    int totalBurstTime = 0;
    
    // Calculate actual execution time from tasks
    for(const auto& task : completedTasks) {
        int completionTime = task->getCompletionTime();
        int arrivalTime = task->getArrivalTime();
        int burstTime = task->getBurstTime();
        
        // Turnaround time = completion time - arrival time (must be >= burst time)
        int turnaroundTime = completionTime - arrivalTime;
        // Ensure turnaround time is at least the burst time
        turnaroundTime = std::max(turnaroundTime, burstTime);
        
        // Waiting time = turnaround time - burst time (should be >= 0)
        int waitingTime = turnaroundTime - burstTime;
        // Ensure non-negative
        waitingTime = std::max(0, waitingTime);
        
        task->setTurnaroundTime(turnaroundTime);
        task->setWaitingTime(waitingTime);
        
        totalWaitingTime += waitingTime;
        totalTurnaroundTime += turnaroundTime;
        totalBurstTime += burstTime;
        maxCompletionTime = std::max(maxCompletionTime, completionTime);
    }
    
    averageWaitingTime = static_cast<double>(totalWaitingTime) / completedTasks.size();
    averageTurnaroundTime = static_cast<double>(totalTurnaroundTime) / completedTasks.size();
    totalExecutionTime = maxCompletionTime;
    
    // Calculate CPU utilization and throughput
    // Prevent division by zero
    if(totalExecutionTime > 0) {
        // CPU utilization = (total work done) / (available CPU time)
        cpuUtilization = (static_cast<double>(totalBurstTime) / (totalExecutionTime * numThreads)) * 100;
        // Cap at 100%
        cpuUtilization = std::min(cpuUtilization, 100.0);
        // Throughput in tasks per second (convert ms to seconds)
        throughput = static_cast<double>(completedTasks.size()) / (totalExecutionTime / 1000.0);
    } else {
        cpuUtilization = 0.0;
        throughput = 0.0;
    }
}

void Scheduler::printMetrics() const {
    std::cout << "\n========== Performance Metrics ==========\n";
    std::cout << "Total Execution Time: " << totalExecutionTime << " ms\n";
    std::cout << "Average Waiting Time: " << averageWaitingTime << " ms\n";
    std::cout << "Average Turnaround Time: " << averageTurnaroundTime << " ms\n";
    std::cout << "CPU Utilization: " << cpuUtilization << "%\n";
    std::cout << "Throughput: " << throughput << " tasks/sec\n";
    std::cout << "Total Tasks Completed: " << completedTasks.size() << "\n";
    std::cout << "========================================\n";
}
