# Compiler
CXX = g++
CXXFLAGS = -std=c++17 -pthread -Wall -O2

# Directories
SRC_DIR = .
BUILD_DIR = build
BIN_DIR = bin

# Source files
SOURCES = main.cpp task.cpp scheduler.cpp
OBJECTS = $(SOURCES:%.cpp=$(BUILD_DIR)/%.o)
TARGET = $(BIN_DIR)/scheduler

# Default target
all: directories $(TARGET)

# Create directories
directories:
	@if not exist "$(BUILD_DIR)" mkdir $(BUILD_DIR)
	@if not exist "$(BIN_DIR)" mkdir $(BIN_DIR)

# Link
$(TARGET): $(OBJECTS)
	$(CXX) $(CXXFLAGS) -o $@ $^

# Compile
$(BUILD_DIR)/%.o: $(SRC_DIR)/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Clean
clean:
	@if exist "$(BUILD_DIR)" rmdir /s /q $(BUILD_DIR)
	@if exist "$(BIN_DIR)" rmdir /s /q $(BIN_DIR)

# Run examples
run-sjf:
	$(TARGET) sjf ../../../data/tasks.json

run-rr:
	$(TARGET) rr ../../../data/tasks.json

run-priority:
	$(TARGET) priority ../../../data/tasks.json

.PHONY: all directories clean run-sjf run-rr run-priority
