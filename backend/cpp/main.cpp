#include "task.h"
#include "scheduler.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <regex>
#include <cmath>
#include <chrono>
#include <thread>

// Simple JSON parser functions
std::string trim(const std::string& str) {
    size_t first = str.find_first_not_of(" \t\n\r\"");
    if (first == std::string::npos) return "";
    size_t last = str.find_last_not_of(" \t\n\r\"");
    return str.substr(first, (last - first + 1));
}

std::string getJsonValue(const std::string& json, const std::string& key) {
    std::string pattern = "\"" + key + "\"\\s*:\\s*([^,}\\]]+)";
    std::regex reg(pattern);
    std::smatch match;
    if (std::regex_search(json, match, reg)) {
        return trim(match[1].str());
    }
    return "";
}

std::string getJsonStringValue(const std::string& json, const std::string& key) {
    std::string pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
    std::regex reg(pattern);
    std::smatch match;
    if (std::regex_search(json, match, reg)) {
        return match[1].str();
    }
    return "";
}

// Function to read tasks from JSON
std::vector<std::shared_ptr<Task>> readTasksFromJSON(const std::string& filename) {
    std::vector<std::shared_ptr<Task>> tasks;
    std::ifstream file(filename);
    
    if(!file.is_open()) {
        std::cerr << "Error opening file: " << filename << std::endl;
        return tasks;
    }
    
    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string content = buffer.str();
    file.close();
    
    // Find tasks array
    size_t tasksStart = content.find("\"tasks\"");
    if (tasksStart == std::string::npos) {
        std::cerr << "No 'tasks' array found in JSON" << std::endl;
        return tasks;
    }
    
    size_t arrayStart = content.find("[", tasksStart);
    size_t arrayEnd = content.find("]", arrayStart);
    
    if (arrayStart == std::string::npos || arrayEnd == std::string::npos) {
        std::cerr << "Invalid tasks array format" << std::endl;
        return tasks;
    }
    
    std::string tasksContent = content.substr(arrayStart + 1, arrayEnd - arrayStart - 1);
    
    // Parse individual tasks
    size_t pos = 0;
    while ((pos = tasksContent.find("{", pos)) != std::string::npos) {
        size_t endPos = tasksContent.find("}", pos);
        if (endPos == std::string::npos) break;
        
        std::string taskJson = tasksContent.substr(pos, endPos - pos + 1);
        
        try {
            int id = std::stoi(getJsonValue(taskJson, "id"));
            std::string name = getJsonStringValue(taskJson, "name");
            std::string typeStr = getJsonStringValue(taskJson, "type");
            int priority = std::stoi(getJsonValue(taskJson, "priority"));
            int burstTime = std::stoi(getJsonValue(taskJson, "burstTime"));
            int arrivalTime = std::stoi(getJsonValue(taskJson, "arrivalTime"));
            
            std::string dataSizeStr = getJsonValue(taskJson, "dataSize");
            int dataSize = dataSizeStr.empty() ? 1000 : std::stoi(dataSizeStr);
            
            TaskType type;
            if(typeStr == "matrix") type = MATRIX_MULTIPLY;
            else if(typeStr == "sort") type = SORTING;
            else if(typeStr == "file") type = FILE_PROCESSING;
            else type = COMPUTATION;
            
            tasks.push_back(std::make_shared<Task>(id, name, type, priority, burstTime, arrivalTime, dataSize));
        } catch (const std::exception& e) {
            std::cerr << "Error parsing task: " << e.what() << std::endl;
        }
        
        pos = endPos + 1;
    }
    
    return tasks;
}

// Function to write results to JSON
void writeResultsToJSON(const Scheduler& scheduler, const std::string& filename) {
    std::ofstream outFile(filename);
    
    if (!outFile.is_open()) {
        std::cerr << "Error opening output file: " << filename << std::endl;
        return;
    }
    
    // Get metrics and handle inf/nan values
    double totalTime = scheduler.getTotalExecutionTime();
    double avgWait = scheduler.getAverageWaitingTime();
    double avgTurnaround = scheduler.getAverageTurnaroundTime();
    double cpuUtil = scheduler.getCPUUtilization();
    double throughput = scheduler.getThroughput();
    
    // Replace inf/nan with valid values
    if (std::isinf(cpuUtil) || std::isnan(cpuUtil)) cpuUtil = 0.0;
    if (std::isinf(throughput) || std::isnan(throughput)) throughput = 0.0;
    if (std::isinf(totalTime) || std::isnan(totalTime)) totalTime = 0.0;
    if (std::isinf(avgWait) || std::isnan(avgWait)) avgWait = 0.0;
    if (std::isinf(avgTurnaround) || std::isnan(avgTurnaround)) avgTurnaround = 0.0;
    
    outFile << "{\n";
    outFile << "  \"totalExecutionTime\": " << totalTime << ",\n";
    outFile << "  \"averageWaitingTime\": " << avgWait << ",\n";
    outFile << "  \"averageTurnaroundTime\": " << avgTurnaround << ",\n";
    outFile << "  \"cpuUtilization\": " << cpuUtil << ",\n";
    outFile << "  \"throughput\": " << throughput << ",\n";
    outFile << "  \"tasks\": [\n";
    
    const auto& completedTasks = scheduler.getCompletedTasks();
    for(size_t i = 0; i < completedTasks.size(); i++) {
        const auto& task = completedTasks[i];
        outFile << "    {\n";
        outFile << "      \"id\": " << task->getId() << ",\n";
        outFile << "      \"name\": \"" << task->getName() << "\",\n";
        outFile << "      \"type\": \"" << task->getTypeString() << "\",\n";
        outFile << "      \"status\": \"" << task->getStatusString() << "\",\n";
        outFile << "      \"burstTime\": " << task->getBurstTime() << ",\n";
        outFile << "      \"waitingTime\": " << task->getWaitingTime() << ",\n";
        outFile << "      \"turnaroundTime\": " << task->getTurnaroundTime() << ",\n";
        outFile << "      \"completionTime\": " << task->getCompletionTime() << "\n";
        outFile << "    }";
        if (i < completedTasks.size() - 1) outFile << ",";
        outFile << "\n";
    }
    
    outFile << "  ]\n";
    outFile << "}\n";
    
    outFile.close();
}

int main(int argc, char* argv[]) {
    if(argc < 3) {
        std::cout << "Usage: " << argv[0] << " <algorithm> <input_file>\n";
        std::cout << "Algorithms: sjf, rr, priority\n";
        return 1;
    }
    
    std::string algoStr = argv[1];
    std::string inputFile = argv[2];
    
    // Get output directory from input file path
    std::string outputDir = "data";
    std::string logsDir = "logs";
    
    // If input file contains path, extract directory
    size_t lastSlash = inputFile.find_last_of("/\\");
    if (lastSlash != std::string::npos) {
        outputDir = inputFile.substr(0, lastSlash);
        logsDir = outputDir.substr(0, outputDir.find_last_of("/\\")) + "/logs";
    }
    
    std::string outputFile = outputDir + "/results.json";
    
    std::cout << "============================================================\n";
    std::cout << "PARALLEL TASK SCHEDULER\n";
    std::cout << "============================================================\n";
    std::cout << "Algorithm: " << algoStr << "\n";
    std::cout << "Input File: " << inputFile << "\n";
    std::cout << "Output File: " << outputFile << "\n";
    std::cout << "Logs Directory: " << logsDir << "\n";
    std::cout << "============================================================\n\n";
    
    SchedulingAlgorithm algo;
    if(algoStr == "sjf") algo = SJF;
    else if(algoStr == "rr") algo = ROUND_ROBIN;
    else if(algoStr == "priority") algo = PRIORITY;
    else {
        std::cerr << "Invalid algorithm: " << algoStr << std::endl;
        return 1;
    }
    
    // Read tasks
    auto tasks = readTasksFromJSON(inputFile);
    if(tasks.empty()) {
        std::cerr << "No tasks to schedule\n";
        return 1;
    }
    
    std::cout << "Tasks loaded: " << tasks.size() << "\n\n";
    
    // Create scheduler
    Scheduler scheduler(algo, 4, 2);
    
    // Add tasks
    for(auto& task : tasks) {
        scheduler.addTask(task);
    }
    
    // Start execution
    std::cout << "Starting execution...\n";
    auto startTime = std::chrono::high_resolution_clock::now();
    scheduler.start();
    scheduler.waitForCompletion();
    
    // Small delay to ensure all tasks complete
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    scheduler.stop();
    
    auto endTime = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count();
    
    std::cout << "\nAll tasks completed in " << duration << " ms\n";
    
    // Calculate and print metrics
    scheduler.calculateMetrics();
    scheduler.printMetrics();
    
    // Write results
    std::cout << "\nWriting results to: " << outputFile << "\n";
    writeResultsToJSON(scheduler, outputFile);
    
    // Verify file was written
    std::ifstream checkFile(outputFile);
    if (checkFile.good()) {
        std::cout << "✓ Results file created successfully\n";
        checkFile.close();
    } else {
        std::cerr << "✗ ERROR: Failed to create results file!\n";
        return 1;
    }
    
    std::cout << "\n============================================================\n";
    std::cout << "EXECUTION COMPLETED SUCCESSFULLY\n";
    std::cout << "============================================================\n";
    
    return 0;
}
