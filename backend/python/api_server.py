from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import subprocess
import threading
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Get absolute paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DATA_DIR = os.path.join(BASE_DIR, 'data')
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
CPP_EXECUTABLE = os.path.join(BASE_DIR, 'backend', 'cpp', 'bin', 'scheduler.exe')

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# Global variables
task_queue = []
execution_status = {
    'running': False,
    'current_algorithm': None,
    'progress': 0,
    'tasks_completed': 0,
    'total_tasks': 0
}

@app.route('/')
def index():
    return jsonify({'status': 'Parallel Task Scheduler API Running'})

@app.route('/api/debug', methods=['GET'])
def debug_info():
    """Get debug information about the system"""
    return jsonify({
        'base_dir': BASE_DIR,
        'data_dir': DATA_DIR,
        'logs_dir': LOGS_DIR,
        'cpp_executable': CPP_EXECUTABLE,
        'cpp_exists': os.path.exists(CPP_EXECUTABLE),
        'tasks_file': os.path.join(DATA_DIR, 'tasks.json'),
        'tasks_exists': os.path.exists(os.path.join(DATA_DIR, 'tasks.json')),
        'results_file': os.path.join(DATA_DIR, 'results.json'),
        'results_exists': os.path.exists(os.path.join(DATA_DIR, 'results.json')),
        'log_file': os.path.join(LOGS_DIR, 'execution.log'),
        'log_exists': os.path.exists(os.path.join(LOGS_DIR, 'execution.log')),
        'working_directory': os.getcwd(),
        'execution_status': execution_status
    })

@app.route('/api/tasks', methods=['POST'])
def submit_tasks():
    """Submit tasks for scheduling"""
    try:
        data = request.json
        tasks = data.get('tasks', [])
        algorithm = data.get('algorithm', 'sjf')
        
        if not tasks:
            return jsonify({'error': 'No tasks provided'}), 400
        
        # Save tasks to file with absolute path
        task_file = os.path.join(DATA_DIR, 'tasks.json')
        
        with open(task_file, 'w') as f:
            json.dump({'tasks': tasks}, f, indent=2)
        
        print(f"Tasks saved to: {task_file}")
        
        # Update status
        execution_status['total_tasks'] = len(tasks)
        execution_status['tasks_completed'] = 0
        execution_status['progress'] = 0
        
        return jsonify({
            'status': 'success',
            'message': f'{len(tasks)} tasks submitted',
            'task_file': task_file
        })
        
    except Exception as e:
        print(f"Error in submit_tasks: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/execute', methods=['POST'])
def execute_scheduler():
    """Execute scheduler with specified algorithm"""
    try:
        data = request.json
        algorithm = data.get('algorithm', 'sjf')
        
        if execution_status['running']:
            return jsonify({'error': 'Scheduler already running'}), 400
        
        # Check if C++ executable exists
        if not os.path.exists(CPP_EXECUTABLE):
            return jsonify({'error': f'Scheduler executable not found: {CPP_EXECUTABLE}. Please run build.bat first.'}), 400
        
        # Check if tasks file exists
        task_file = os.path.join(DATA_DIR, 'tasks.json')
        if not os.path.exists(task_file):
            return jsonify({'error': 'No tasks file found. Please submit tasks first.'}), 400
        
        print(f"Starting scheduler: {CPP_EXECUTABLE} {algorithm} {task_file}")
        
        # Start execution in background thread
        thread = threading.Thread(target=run_scheduler, args=(algorithm, task_file))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'status': 'success',
            'message': f'Scheduler started with {algorithm.upper()} algorithm'
        })
        
    except Exception as e:
        print(f"Error in execute_scheduler: {str(e)}")
        return jsonify({'error': str(e)}), 500

def run_scheduler(algorithm, task_file):
    """Run C++ scheduler in background"""
    execution_status['running'] = True
    execution_status['current_algorithm'] = algorithm
    execution_status['progress'] = 0
    
    try:
        print(f"\n{'='*60}")
        print(f"Executing C++ Scheduler")
        print(f"Algorithm: {algorithm}")
        print(f"Task File: {task_file}")
        print(f"Executable: {CPP_EXECUTABLE}")
        print(f"{'='*60}\n")
        
        # Change to base directory for execution
        original_dir = os.getcwd()
        os.chdir(BASE_DIR)
        
        # Execute C++ scheduler
        result = subprocess.run(
            [CPP_EXECUTABLE, algorithm, task_file],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        # Change back to original directory
        os.chdir(original_dir)
        
        print(f"\nScheduler execution completed with return code: {result.returncode}")
        
        if result.returncode == 0:
            print("STDOUT:", result.stdout)
            execution_status['progress'] = 100
            execution_status['tasks_completed'] = execution_status['total_tasks']
            
            # Verify output files were created
            results_file = os.path.join(DATA_DIR, 'results.json')
            log_file = os.path.join(LOGS_DIR, 'execution.log')
            
            if os.path.exists(results_file):
                print(f"✓ Results file created: {results_file}")
            else:
                print(f"✗ Results file NOT found: {results_file}")
                
            if os.path.exists(log_file):
                print(f"✓ Log file created: {log_file}")
            else:
                print(f"✗ Log file NOT found: {log_file}")
        else:
            print(f"Scheduler error (return code {result.returncode}):")
            print("STDERR:", result.stderr)
            print("STDOUT:", result.stdout)
            
    except subprocess.TimeoutExpired:
        print("Error: Scheduler execution timeout")
    except Exception as e:
        print(f"Error running scheduler: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        execution_status['running'] = False
        print(f"Execution status: {execution_status}\n")

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current execution status"""
    return jsonify(execution_status)

@app.route('/api/results', methods=['GET'])
def get_results():
    """Get execution results"""
    try:
        results_file = os.path.join(DATA_DIR, 'results.json')
        
        print(f"Looking for results file: {results_file}")
        print(f"File exists: {os.path.exists(results_file)}")
        
        if not os.path.exists(results_file):
            return jsonify({'error': 'No results available'}), 404
        
        with open(results_file, 'r') as f:
            results = json.load(f)
        
        print(f"Results loaded successfully: {len(results.get('tasks', []))} tasks")
        return jsonify(results)
        
    except Exception as e:
        print(f"Error in get_results: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Get execution logs"""
    try:
        log_file = os.path.join(LOGS_DIR, 'execution.log')
        
        print(f"Looking for log file: {log_file}")
        print(f"File exists: {os.path.exists(log_file)}")
        
        if not os.path.exists(log_file):
            return jsonify({'logs': []})
        
        with open(log_file, 'r') as f:
            logs = f.readlines()
        
        print(f"Logs loaded: {len(logs)} lines")
        return jsonify({'logs': logs[-100:]})  # Return last 100 lines
        
    except Exception as e:
        print(f"Error in get_logs: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/benchmark', methods=['POST'])
def run_benchmark():
    """Run benchmark on all algorithms"""
    try:
        data = request.json
        tasks = data.get('tasks', [])
        
        if not tasks:
            return jsonify({'error': 'No tasks provided'}), 400
        
        results = {}
        algorithms = ['sjf', 'rr', 'priority']
        
        for algo in algorithms:
            # Create task file
            task_file = os.path.join(DATA_DIR, f'tasks_{algo}.json')
            with open(task_file, 'w') as f:
                json.dump({'tasks': tasks}, f, indent=2)
            
            # Execute scheduler
            print(f"\nBenchmarking {algo.upper()}...")
            result = subprocess.run(
                [CPP_EXECUTABLE, algo, task_file],
                capture_output=True,
                text=True,
                timeout=120,
                cwd=BASE_DIR
            )
            
            if result.returncode == 0:
                print(f"✓ {algo.upper()} completed successfully")
                # Read results
                results_file = os.path.join(DATA_DIR, 'results.json')
                if os.path.exists(results_file):
                    with open(results_file, 'r') as f:
                        algo_results = json.load(f)
                    results[algo] = algo_results
            else:
                print(f"✗ {algo.upper()} failed: {result.stderr}")
            
            time.sleep(0.5)
        
        return jsonify({
            'status': 'success',
            'results': results
        })
        
    except Exception as e:
        print(f"Error in run_benchmark: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/comparison/execute', methods=['POST'])
def execute_comparison():
    """Execute scheduler with specific thread count for comparison testing"""
    try:
        data = request.json
        algorithm = data.get('algorithm', 'sjf')
        thread_count = data.get('threadCount', 4)
        task_file_param = data.get('taskFile', '')
        
        # Use absolute path to tasks.json
        task_file = os.path.join(DATA_DIR, 'tasks.json')
        
        if execution_status['running']:
            return jsonify({'error': 'Scheduler already running'}), 400
        
        # Check if C++ executable exists
        if not os.path.exists(CPP_EXECUTABLE):
            return jsonify({'error': f'Scheduler executable not found: {CPP_EXECUTABLE}. Please run build.bat first.'}), 400
        
        # Check if tasks file exists
        if not os.path.exists(task_file):
            return jsonify({'error': f'No tasks file found at {task_file}. Please submit tasks first.'}), 400
        
        print(f"Starting comparison test: {CPP_EXECUTABLE} {algorithm} {task_file} {thread_count}")
        
        # Start execution in background thread with thread count parameter
        thread = threading.Thread(target=run_scheduler_with_threads, args=(algorithm, task_file, thread_count))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'status': 'success',
            'message': f'Comparison test started: {algorithm.upper()} with {thread_count} threads',
            'task_file': task_file
        })
        
    except Exception as e:
        print(f"Error in execute_comparison: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def run_scheduler_with_threads(algorithm, task_file, thread_count):
    """Run C++ scheduler with specific thread count"""
    execution_status['running'] = True
    execution_status['current_algorithm'] = algorithm
    execution_status['progress'] = 0
    
    try:
        print(f"\n{'='*60}")
        print(f"Executing C++ Scheduler for Comparison")
        print(f"Algorithm: {algorithm}")
        print(f"Thread Count: {thread_count}")
        print(f"Task File: {task_file}")
        print(f"Executable: {CPP_EXECUTABLE}")
        print(f"{'='*60}\n")
        
        # Change to base directory for execution
        original_dir = os.getcwd()
        os.chdir(BASE_DIR)
        
        # Execute C++ scheduler with thread count parameter
        result = subprocess.run(
            [CPP_EXECUTABLE, algorithm, task_file, str(thread_count)],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        # Change back to original directory
        os.chdir(original_dir)
        
        print(f"\nScheduler execution completed with return code: {result.returncode}")
        
        if result.returncode == 0:
            print("STDOUT:", result.stdout)
            execution_status['progress'] = 100
            execution_status['tasks_completed'] = execution_status['total_tasks']
            
            # Verify output files were created
            results_file = os.path.join(DATA_DIR, 'results.json')
            log_file = os.path.join(LOGS_DIR, 'execution.log')
            
            if os.path.exists(results_file):
                print(f"✓ Results file created: {results_file}")
            else:
                print(f"✗ Results file NOT found: {results_file}")
                
            if os.path.exists(log_file):
                print(f"✓ Log file created: {log_file}")
            else:
                print(f"✗ Log file NOT found: {log_file}")
        else:
            print(f"Scheduler error (return code {result.returncode}):")
            print("STDERR:", result.stderr)
            print("STDOUT:", result.stdout)
            
    except subprocess.TimeoutExpired:
        print("Error: Scheduler execution timeout")
    except Exception as e:
        print(f"Error running scheduler: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        # Ensure running status is always reset
        execution_status['running'] = False
        execution_status['current_algorithm'] = None
        print(f"Execution status reset: {execution_status}\n")

@app.route('/api/tasks/sample', methods=['GET'])
def get_sample_tasks():
    """Get sample task definitions"""
    sample_tasks = [
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
        },
        {
            "id": 3,
            "name": "File Processing",
            "type": "file",
            "priority": 1,
            "burstTime": 200,
            "arrivalTime": 20,
            "dataSize": 1000
        },
        {
            "id": 4,
            "name": "Scientific Computation",
            "type": "compute",
            "priority": 4,
            "burstTime": 120,
            "arrivalTime": 30,
            "dataSize": 200
        }
    ]
    
    return jsonify({'tasks': sample_tasks})

if __name__ == '__main__':
    print("\n" + "="*60)
    print("Starting Parallel Task Scheduler API Server...")
    print("="*60)
    print(f"Base Directory: {BASE_DIR}")
    print(f"Data Directory: {DATA_DIR}")
    print(f"Logs Directory: {LOGS_DIR}")
    print(f"C++ Executable: {CPP_EXECUTABLE}")
    print(f"Executable Exists: {os.path.exists(CPP_EXECUTABLE)}")
    print("="*60)
    print("Server running on http://localhost:5000")
    print("Debug info available at: http://localhost:5000/api/debug")
    print("="*60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
