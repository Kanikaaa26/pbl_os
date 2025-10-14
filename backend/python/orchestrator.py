import json
import subprocess
import time
import os
from datetime import datetime
from typing import List, Dict, Any
import threading
import matplotlib.pyplot as plt
import pandas as pd

class TaskOrchestrator:
    """
    Python orchestrator for managing C++ scheduler execution,
    benchmarking, and generating performance reports
    """
    
    def __init__(self, cpp_executable: str = "../cpp/bin/scheduler.exe"):
        self.cpp_executable = cpp_executable
        self.results = {}
        self.execution_logs = []
        
    def create_task_file(self, tasks: List[Dict[str, Any]], filename: str = "../../data/tasks.json"):
        """Create JSON file with task definitions"""
        task_data = {"tasks": tasks}
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, 'w') as f:
            json.dump(task_data, f, indent=2)
        
        print(f"Task file created: {filename}")
        return filename
    
    def execute_scheduler(self, algorithm: str, input_file: str) -> Dict[str, Any]:
        """Execute C++ scheduler with specified algorithm"""
        print(f"\n{'='*60}")
        print(f"Executing {algorithm.upper()} Algorithm")
        print(f"{'='*60}")
        
        start_time = time.time()
        
        try:
            # Run C++ scheduler
            result = subprocess.run(
                [self.cpp_executable, algorithm, input_file],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            execution_time = time.time() - start_time
            
            if result.returncode == 0:
                print(result.stdout)
                
                # Read results
                results_file = "../../data/results.json"
                if os.path.exists(results_file):
                    with open(results_file, 'r') as f:
                        results = json.load(f)
                    
                    results['algorithm'] = algorithm
                    results['executionTime'] = execution_time
                    
                    self.results[algorithm] = results
                    return results
            else:
                print(f"Error executing scheduler: {result.stderr}")
                return None
                
        except subprocess.TimeoutExpired:
            print(f"Execution timeout for {algorithm}")
            return None
        except Exception as e:
            print(f"Error: {str(e)}")
            return None
    
    def benchmark_algorithms(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Benchmark all scheduling algorithms"""
        print("\n" + "="*60)
        print("BENCHMARKING ALL ALGORITHMS")
        print("="*60)
        
        algorithms = ['sjf', 'rr', 'priority']
        benchmark_results = {}
        
        for algo in algorithms:
            # Create fresh task file for each algorithm
            task_file = self.create_task_file(tasks, f"../../data/tasks_{algo}.json")
            
            # Execute algorithm
            result = self.execute_scheduler(algo, task_file)
            
            if result:
                benchmark_results[algo] = result
            
            # Small delay between executions
            time.sleep(1)
        
        # Generate comparison report
        self.generate_comparison_report(benchmark_results)
        
        return benchmark_results
    
    def generate_comparison_report(self, results: Dict[str, Any]):
        """Generate comparative analysis report"""
        print("\n" + "="*60)
        print("COMPARATIVE PERFORMANCE ANALYSIS")
        print("="*60)
        
        if not results:
            print("No results to compare")
            return
        
        # Create comparison table
        comparison_data = []
        
        for algo, data in results.items():
            comparison_data.append({
                'Algorithm': algo.upper(),
                'Total Execution Time (ms)': f"{data.get('totalExecutionTime', 0):.2f}",
                'Avg Waiting Time (ms)': f"{data.get('averageWaitingTime', 0):.2f}",
                'Avg Turnaround Time (ms)': f"{data.get('averageTurnaroundTime', 0):.2f}",
                'CPU Utilization (%)': f"{data.get('cpuUtilization', 0):.2f}",
                'Throughput (tasks/sec)': f"{data.get('throughput', 0):.2f}"
            })
        
        df = pd.DataFrame(comparison_data)
        print("\n" + df.to_string(index=False))
        
        # Save to CSV
        os.makedirs("../../data", exist_ok=True)
        df.to_csv("../../data/comparison_report.csv", index=False)
        print("\nComparison report saved to: data/comparison_report.csv")
    
    def generate_visualizations(self, results: Dict[str, Any]):
        """Generate performance visualization charts"""
        if not results:
            print("No results to visualize")
            return
        
        algorithms = list(results.keys())
        
        # Prepare data
        exec_times = [results[algo].get('totalExecutionTime', 0) for algo in algorithms]
        wait_times = [results[algo].get('averageWaitingTime', 0) for algo in algorithms]
        cpu_util = [results[algo].get('cpuUtilization', 0) for algo in algorithms]
        throughput = [results[algo].get('throughput', 0) for algo in algorithms]
        
        # Create figure with subplots
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle('Parallel Task Scheduler Performance Comparison', fontsize=16, fontweight='bold')
        
        # Execution Time
        axes[0, 0].bar(algorithms, exec_times, color=['#3498db', '#e74c3c', '#2ecc71'])
        axes[0, 0].set_title('Total Execution Time')
        axes[0, 0].set_ylabel('Time (ms)')
        axes[0, 0].set_xlabel('Algorithm')
        
        # Average Waiting Time
        axes[0, 1].bar(algorithms, wait_times, color=['#9b59b6', '#f39c12', '#1abc9c'])
        axes[0, 1].set_title('Average Waiting Time')
        axes[0, 1].set_ylabel('Time (ms)')
        axes[0, 1].set_xlabel('Algorithm')
        
        # CPU Utilization
        axes[1, 0].bar(algorithms, cpu_util, color=['#34495e', '#e67e22', '#16a085'])
        axes[1, 0].set_title('CPU Utilization')
        axes[1, 0].set_ylabel('Utilization (%)')
        axes[1, 0].set_xlabel('Algorithm')
        axes[1, 0].set_ylim([0, 100])
        
        # Throughput
        axes[1, 1].bar(algorithms, throughput, color=['#c0392b', '#27ae60', '#2980b9'])
        axes[1, 1].set_title('Throughput')
        axes[1, 1].set_ylabel('Tasks/Second')
        axes[1, 1].set_xlabel('Algorithm')
        
        plt.tight_layout()
        
        # Save figure
        os.makedirs("../../data", exist_ok=True)
        plt.savefig("../../data/performance_charts.png", dpi=300, bbox_inches='tight')
        print("\nPerformance charts saved to: data/performance_charts.png")
        
        plt.close()
    
    def generate_detailed_report(self, results: Dict[str, Any]):
        """Generate detailed HTML report"""
        html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Scheduler Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        h1 { color: #2c3e50; text-align: center; }
        .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #3498db; color: white; }
        tr:hover { background-color: #f5f5f5; }
        .metric { display: inline-block; margin: 10px 20px; padding: 15px; background: #ecf0f1; border-radius: 5px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2980b9; }
        .metric-label { font-size: 12px; color: #7f8c8d; }
    </style>
</head>
<body>
    <h1>Parallel Task Scheduler - Performance Report</h1>
    <p style="text-align: center; color: #7f8c8d;">Generated on: {timestamp}</p>
"""
        
        for algo, data in results.items():
            html_content += f"""
    <div class="section">
        <h2>{algo.upper()} Algorithm</h2>
        <div>
            <div class="metric">
                <div class="metric-value">{data.get('totalExecutionTime', 0):.2f} ms</div>
                <div class="metric-label">Total Execution Time</div>
            </div>
            <div class="metric">
                <div class="metric-value">{data.get('averageWaitingTime', 0):.2f} ms</div>
                <div class="metric-label">Avg Waiting Time</div>
            </div>
            <div class="metric">
                <div class="metric-value">{data.get('cpuUtilization', 0):.2f}%</div>
                <div class="metric-label">CPU Utilization</div>
            </div>
            <div class="metric">
                <div class="metric-value">{data.get('throughput', 0):.2f}</div>
                <div class="metric-label">Throughput (tasks/sec)</div>
            </div>
        </div>
        
        <h3>Task Details</h3>
        <table>
            <tr>
                <th>Task ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Burst Time</th>
                <th>Waiting Time</th>
                <th>Turnaround Time</th>
            </tr>
"""
            for task in data.get('tasks', []):
                html_content += f"""
            <tr>
                <td>{task.get('id', '')}</td>
                <td>{task.get('name', '')}</td>
                <td>{task.get('type', '')}</td>
                <td>{task.get('burstTime', 0)} ms</td>
                <td>{task.get('waitingTime', 0)} ms</td>
                <td>{task.get('turnaroundTime', 0)} ms</td>
            </tr>
"""
            html_content += """
        </table>
    </div>
"""
        
        html_content += """
</body>
</html>
"""
        
        # Save HTML report
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        html_content = html_content.format(timestamp=timestamp)
        
        os.makedirs("../../data", exist_ok=True)
        with open("../../data/performance_report.html", 'w') as f:
            f.write(html_content)
        
        print("\nDetailed HTML report saved to: data/performance_report.html")

def main():
    """Main execution function"""
    orchestrator = TaskOrchestrator()
    
    # Sample tasks
    tasks = [
        {"id": 1, "name": "Matrix Multiplication", "type": "matrix", "priority": 3, "burstTime": 100, "arrivalTime": 0, "dataSize": 100},
        {"id": 2, "name": "Quick Sort", "type": "sort", "priority": 2, "burstTime": 150, "arrivalTime": 10, "dataSize": 50},
        {"id": 3, "name": "File Processing", "type": "file", "priority": 1, "burstTime": 200, "arrivalTime": 20, "dataSize": 1000},
        {"id": 4, "name": "Scientific Computation", "type": "compute", "priority": 4, "burstTime": 120, "arrivalTime": 30, "dataSize": 200},
        {"id": 5, "name": "Data Sorting", "type": "sort", "priority": 2, "burstTime": 80, "arrivalTime": 40, "dataSize": 30},
        {"id": 6, "name": "Matrix Operations", "type": "matrix", "priority": 3, "burstTime": 90, "arrivalTime": 50, "dataSize": 80},
        {"id": 7, "name": "Log Processing", "type": "file", "priority": 1, "burstTime": 110, "arrivalTime": 60, "dataSize": 500},
        {"id": 8, "name": "Complex Calculation", "type": "compute", "priority": 5, "burstTime": 140, "arrivalTime": 70, "dataSize": 150}
    ]
    
    # Benchmark all algorithms
    results = orchestrator.benchmark_algorithms(tasks)
    
    # Generate visualizations
    orchestrator.generate_visualizations(results)
    
    # Generate detailed report
    orchestrator.generate_detailed_report(results)
    
    print("\n" + "="*60)
    print("BENCHMARKING COMPLETE")
    print("="*60)
    print("\nAll reports and visualizations have been generated!")

if __name__ == "__main__":
    main()
