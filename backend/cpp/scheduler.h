#ifndef SCHEDULER_H
#define SCHEDULER_H

#include "task.h"
#include <vector>
#include <queue>
#include <memory>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <functional>
#include <chrono>

enum SchedulingAlgorithm {
    SJF,           // Shortest Job First
    ROUND_ROBIN,   // Round Robin
    PRIORITY       // Priority Scheduling
};

class Scheduler {
private:
    std::vector<std::shared_ptr<Task>> taskQueue;
    std::vector<std::shared_ptr<Task>> completedTasks;
    std::vector<std::thread> workerThreads;
    
    std::mutex queueMutex;
    std::condition_variable queueCV;
    
    SchedulingAlgorithm algorithm;
    int timeQuantum;  // For Round Robin
    int numThreads;
    bool running;
    
    int currentTime;
    
    // Performance metrics
    double totalExecutionTime;
    double averageWaitingTime;
    double averageTurnaroundTime;
    double cpuUtilization;
    double throughput;
    
    // Worker thread function
    void workerThread(int threadId);
    
    // Scheduling algorithms
    std::shared_ptr<Task> getNextTaskSJF();
    std::shared_ptr<Task> getNextTaskRoundRobin();
    std::shared_ptr<Task> getNextTaskPriority();
    
    // Logging
    void logTaskExecution(const std::shared_ptr<Task>& task, int threadId);

public:
    Scheduler(SchedulingAlgorithm algo, int threads = 4, int quantum = 2);
    ~Scheduler();
    
    void addTask(std::shared_ptr<Task> task);
    void start();
    void stop();
    void waitForCompletion();
    
    // Getters
    std::vector<std::shared_ptr<Task>> getCompletedTasks() const { return completedTasks; }
    double getTotalExecutionTime() const { return totalExecutionTime; }
    double getAverageWaitingTime() const { return averageWaitingTime; }
    double getAverageTurnaroundTime() const { return averageTurnaroundTime; }
    double getCPUUtilization() const { return cpuUtilization; }
    double getThroughput() const { return throughput; }
    
    // Calculate metrics
    void calculateMetrics();
    void printMetrics() const;
};

#endif
