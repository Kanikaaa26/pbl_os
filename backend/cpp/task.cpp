#include "task.h"
#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <thread>
#include <random>

Task::Task(int id, std::string name, TaskType type, int priority, int burstTime, int arrivalTime, int dataSize)
    : id(id), name(name), type(type), priority(priority), burstTime(burstTime), 
      arrivalTime(arrivalTime), remainingTime(burstTime), status(PENDING), 
      dataSize(dataSize), completionTime(0), waitingTime(0), turnaroundTime(0) {}

void Task::startExecution() {
    status = RUNNING;
    startTime = std::chrono::high_resolution_clock::now();
}

void Task::finishExecution() {
    status = COMPLETED;
    endTime = std::chrono::high_resolution_clock::now();
}

void Task::execute() {
    switch(type) {
        case MATRIX_MULTIPLY: {
            // Matrix multiplication simulation
            std::vector<std::vector<int>> matrixA(dataSize, std::vector<int>(dataSize, 1));
            std::vector<std::vector<int>> matrixB(dataSize, std::vector<int>(dataSize, 2));
            std::vector<std::vector<int>> result(dataSize, std::vector<int>(dataSize, 0));
            
            for(int i = 0; i < dataSize; i++) {
                for(int j = 0; j < dataSize; j++) {
                    for(int k = 0; k < dataSize; k++) {
                        result[i][j] += matrixA[i][k] * matrixB[k][j];
                    }
                }
            }
            break;
        }
        case SORTING: {
            // Sorting simulation with large dataset
            std::vector<int> data(dataSize * 1000);
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_int_distribution<> dis(1, 10000);
            
            for(int i = 0; i < dataSize * 1000; i++) {
                data[i] = dis(gen);
            }
            std::sort(data.begin(), data.end());
            break;
        }
        case FILE_PROCESSING: {
            // File processing simulation (I/O bound)
            std::this_thread::sleep_for(std::chrono::milliseconds(burstTime * 10));
            break;
        }
        case COMPUTATION: {
            // Heavy computation simulation
            double result = 0;
            for(int i = 0; i < dataSize * 10000; i++) {
                result += std::sqrt(i) * std::sin(i) * std::cos(i);
            }
            break;
        }
    }
}

std::string Task::getTypeString() const {
    switch(type) {
        case MATRIX_MULTIPLY: return "Matrix Multiply";
        case SORTING: return "Sorting";
        case FILE_PROCESSING: return "File Processing";
        case COMPUTATION: return "Computation";
        default: return "Unknown";
    }
}

std::string Task::getStatusString() const {
    switch(status) {
        case PENDING: return "Pending";
        case RUNNING: return "Running";
        case COMPLETED: return "Completed";
        case FAILED: return "Failed";
        default: return "Unknown";
    }
}
