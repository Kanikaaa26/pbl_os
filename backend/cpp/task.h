#ifndef TASK_H
#define TASK_H

#include <string>
#include <chrono>

enum TaskType {
    MATRIX_MULTIPLY,
    SORTING,
    FILE_PROCESSING,
    COMPUTATION
};

enum TaskStatus {
    PENDING,
    RUNNING,
    COMPLETED,
    FAILED
};

class Task {
private:
    int id;
    std::string name;
    TaskType type;
    int priority;
    int burstTime;
    int arrivalTime;
    int remainingTime;
    TaskStatus status;
    int dataSize;
    std::chrono::time_point<std::chrono::high_resolution_clock> startTime;
    std::chrono::time_point<std::chrono::high_resolution_clock> endTime;
    int completionTime;
    int waitingTime;
    int turnaroundTime;

public:
    Task(int id, std::string name, TaskType type, int priority, int burstTime, int arrivalTime, int dataSize = 1000);
    
    // Getters
    int getId() const { return id; }
    std::string getName() const { return name; }
    TaskType getType() const { return type; }
    int getPriority() const { return priority; }
    int getBurstTime() const { return burstTime; }
    int getArrivalTime() const { return arrivalTime; }
    int getRemainingTime() const { return remainingTime; }
    TaskStatus getStatus() const { return status; }
    int getDataSize() const { return dataSize; }
    int getCompletionTime() const { return completionTime; }
    int getWaitingTime() const { return waitingTime; }
    int getTurnaroundTime() const { return turnaroundTime; }
    
    // Setters
    void setStatus(TaskStatus s) { status = s; }
    void setRemainingTime(int time) { remainingTime = time; }
    void setCompletionTime(int time) { completionTime = time; }
    void setWaitingTime(int time) { waitingTime = time; }
    void setTurnaroundTime(int time) { turnaroundTime = time; }
    void decrementRemainingTime(int time) { remainingTime -= time; }
    
    // Task execution
    void execute();
    void startExecution();
    void finishExecution();
    
    // Utility
    std::string getTypeString() const;
    std::string getStatusString() const;
};

#endif
