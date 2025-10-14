// Scheduler Page JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// Application state
const state = {
    tasks: [],
    currentAlgorithm: 'sjf',
    isRunning: false,
    nextTaskId: 1
};

document.addEventListener('DOMContentLoaded', () => {
    initializeScheduler();
});

function initializeScheduler() {
    setupEventListeners();
    setupAlgorithmSelection();
    renderTaskTable();

    // Load sample tasks if URL has parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('sample') === 'true') {
        loadSampleTasks();
    }
}

function setupEventListeners() {
    // Task management
    document.getElementById('addTaskBtn').addEventListener('click', showTaskForm);
    document.getElementById('cancelTaskBtn').addEventListener('click', hideTaskForm);
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    document.getElementById('loadSampleBtn').addEventListener('click', loadSampleTasks);
    document.getElementById('clearTasksBtn').addEventListener('click', clearAllTasks);

    // Scheduler controls
    document.getElementById('startBtn').addEventListener('click', startScheduler);
    document.getElementById('stopBtn').addEventListener('click', stopScheduler);
    document.getElementById('benchmarkBtn').addEventListener('click', runBenchmark);

    // Algorithm selection
    document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.currentAlgorithm = e.target.value;
            updateAlgorithmUI(e.target.value);
        });
    });
}

function setupAlgorithmSelection() {
    document.querySelectorAll('.algorithm-option').forEach(option => {
        option.addEventListener('click', () => {
            const algorithm = option.dataset.algorithm;
            document.getElementById(algorithm).checked = true;
            state.currentAlgorithm = algorithm;
            updateAlgorithmUI(algorithm);
        });
    });

    // Set initial algorithm
    updateAlgorithmUI(state.currentAlgorithm);
}

function updateAlgorithmUI(algorithm) {
    // Update visual selection
    document.querySelectorAll('.algorithm-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-algorithm="${algorithm}"]`).classList.add('selected');

    // Show/hide quantum input for RR
    const quantumGroup = document.getElementById('quantumGroup');
    quantumGroup.style.display = algorithm === 'rr' ? 'block' : 'none';
}

function showTaskForm() {
    document.getElementById('taskFormContainer').style.display = 'block';
    document.getElementById('taskForm').reset();
    document.getElementById('taskName').focus();
}

function hideTaskForm() {
    document.getElementById('taskFormContainer').style.display = 'none';
}

function handleTaskSubmit(e) {
    e.preventDefault();

    const task = {
        id: state.nextTaskId++,
        name: document.getElementById('taskName').value.trim(),
        type: document.getElementById('taskType').value,
        priority: parseInt(document.getElementById('taskPriority').value),
        burstTime: parseInt(document.getElementById('taskBurstTime').value),
        arrivalTime: parseInt(document.getElementById('taskArrivalTime').value),
        dataSize: parseInt(document.getElementById('taskDataSize').value),
        status: 'pending'
    };

    state.tasks.push(task);
    renderTaskTable();
    hideTaskForm();

    showNotification('Task added successfully!', 'success');
}

function renderTaskTable() {
    const tbody = document.getElementById('taskTableBody');

    if (state.tasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No tasks added yet</p>
                    <small>Click "Add Task" to create your first task</small>
                </td>
            </tr>
        `;
        document.getElementById('taskCount').textContent = '0';
        return;
    }

    tbody.innerHTML = state.tasks.map(task => `
        <tr>
            <td>${task.id}</td>
            <td>${task.name}</td>
            <td>${getTaskTypeLabel(task.type)}</td>
            <td>${task.priority}</td>
            <td>${task.burstTime} ms</td>
            <td>${task.arrivalTime} ms</td>
            <td class="task-actions">
                <button class="icon-btn edit" onclick="editTask(${task.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn delete" onclick="deleteTask(${task.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    document.getElementById('taskCount').textContent = state.tasks.length;
}

function getTaskTypeLabel(type) {
    const labels = {
        'matrix': 'Matrix Multiply',
        'sort': 'Sorting',
        'file': 'File Processing',
        'compute': 'Computation'
    };
    return labels[type] || type;
}

function editTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    // Populate form
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskType').value = task.type;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskBurstTime').value = task.burstTime;
    document.getElementById('taskArrivalTime').value = task.arrivalTime;
    document.getElementById('taskDataSize').value = task.dataSize;

    // Remove task and show form
    deleteTask(id);
    showTaskForm();
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    renderTaskTable();
    showNotification('Task deleted', 'info');
}

function clearAllTasks() {
    if (state.tasks.length === 0) {
        showNotification('No tasks to clear', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear all tasks?')) {
        state.tasks = [];
        state.nextTaskId = 1;
        renderTaskTable();
        showNotification('All tasks cleared', 'info');
    }
}

async function loadSampleTasks() {
    const sampleTasks = [
        {
            id: state.nextTaskId++,
            name: "Matrix Multiplication 100x100",
            type: "matrix",
            priority: 3,
            burstTime: 100,
            arrivalTime: 0,
            dataSize: 100,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Matrix Operations 80x80",
            type: "matrix",
            priority: 3,
            burstTime: 90,
            arrivalTime: 5,
            dataSize: 80,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Matrix Addition 120x120",
            type: "matrix",
            priority: 2,
            burstTime: 70,
            arrivalTime: 15,
            dataSize: 120,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Matrix Transpose 90x90",
            type: "matrix",
            priority: 1,
            burstTime: 50,
            arrivalTime: 25,
            dataSize: 90,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Matrix Inversion 60x60",
            type: "matrix",
            priority: 4,
            burstTime: 180,
            arrivalTime: 35,
            dataSize: 60,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Quick Sort 50K elements",
            type: "sort",
            priority: 2,
            burstTime: 150,
            arrivalTime: 10,
            dataSize: 50,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Data Sorting 30K items",
            type: "sort",
            priority: 2,
            burstTime: 80,
            arrivalTime: 40,
            dataSize: 30,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Merge Sort 75K elements",
            type: "sort",
            priority: 3,
            burstTime: 120,
            arrivalTime: 55,
            dataSize: 75,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Bubble Sort 20K elements",
            type: "sort",
            priority: 1,
            burstTime: 200,
            arrivalTime: 70,
            dataSize: 20,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Log File Processing",
            type: "file",
            priority: 1,
            burstTime: 200,
            arrivalTime: 20,
            dataSize: 1000,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Server Log Processing",
            type: "file",
            priority: 1,
            burstTime: 110,
            arrivalTime: 60,
            dataSize: 500,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Config File Parsing",
            type: "file",
            priority: 2,
            burstTime: 90,
            arrivalTime: 80,
            dataSize: 200,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Complex Calculation - FFT",
            type: "compute",
            priority: 5,
            burstTime: 140,
            arrivalTime: 30,
            dataSize: 150,
            status: 'pending'
        },
        {
            id: state.nextTaskId++,
            name: "Scientific Computation - PDE",
            type: "compute",
            priority: 4,
            burstTime: 160,
            arrivalTime: 45,
            dataSize: 300,
            status: 'pending'
        }
    ];

    state.tasks = [...state.tasks, ...sampleTasks];
    renderTaskTable();
    showNotification('Sample tasks loaded successfully!', 'success');
}

async function startScheduler() {
    if (state.tasks.length === 0) {
        showNotification('Please add tasks before starting the scheduler', 'warning');
        return;
    }

    const algorithm = state.currentAlgorithm;
    const numThreads = parseInt(document.getElementById('numThreads').value);
    const timeQuantum = algorithm === 'rr' ? parseInt(document.getElementById('timeQuantum').value) : null;

    try {
        // Submit tasks
        const submitResponse = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tasks: state.tasks, algorithm, numThreads, timeQuantum })
        });

        if (!submitResponse.ok) throw new Error('Failed to submit tasks');

        // Execute scheduler
        const executeResponse = await fetch(`${API_BASE_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ algorithm, task_file: '../../data/tasks.json', numThreads, timeQuantum })
        });

        if (!executeResponse.ok) throw new Error('Failed to start scheduler');

        state.isRunning = true;
        updateUIState(true);

        showExecutionMonitor(`Starting ${algorithm.toUpperCase()} scheduler with ${state.tasks.length} tasks...`);
        document.getElementById('progressContainer').style.display = 'block';

        // Start monitoring progress
        monitorProgress();

        showNotification('Scheduler started successfully!', 'success');

    } catch (error) {
        console.error('Error starting scheduler:', error);
        showNotification('Error starting scheduler: ' + error.message, 'error');
    }
}

function stopScheduler() {
    state.isRunning = false;
    updateUIState(false);
    showExecutionMonitor('Scheduler stopped by user');
    showNotification('Scheduler stopped', 'info');
}

async function monitorProgress() {
    if (!state.isRunning) return;

    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        const status = await response.json();

        if (status.running) {
            const progress = status.progress || 0;
            updateProgressBar(progress);

            // Continue monitoring
            setTimeout(monitorProgress, 500);
        } else {
            // Execution completed
            updateProgressBar(100);
            state.isRunning = false;
            updateUIState(false);

            showExecutionMonitor('Scheduler execution completed!');

            // Show results section
            document.getElementById('resultsSection').style.display = 'block';

            showNotification('Execution completed successfully!', 'success');
        }

    } catch (error) {
        console.error('Error monitoring progress:', error);
    }
}

function updateProgressBar(progress) {
    const progressFill = document.querySelector('.progress-fill');
    const progressValue = document.querySelector('.progress-value');

    progressFill.style.width = `${progress}%`;
    progressValue.textContent = `${progress}%`;
}

async function runBenchmark() {
    if (state.tasks.length === 0) {
        showNotification('Please add tasks before running benchmark', 'warning');
        return;
    }

    showNotification('Running benchmark on all algorithms...', 'info');
    showExecutionMonitor('Starting comprehensive benchmark...');

    try {
        const response = await fetch(`${API_BASE_URL}/benchmark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tasks: state.tasks })
        });

        if (!response.ok) throw new Error('Benchmark failed');

        const data = await response.json();

        showExecutionMonitor('Benchmark completed!');
        showExecutionMonitor(`Results: SJF, Round Robin, and Priority algorithms compared`);

        showNotification('Benchmark completed successfully!', 'success');

        // Redirect to results page with benchmark data
        window.location.href = 'results.html?tab=comparison';

    } catch (error) {
        console.error('Error running benchmark:', error);
        showNotification('Error running benchmark: ' + error.message, 'error');
    }
}

function updateUIState(running) {
    document.getElementById('startBtn').disabled = running;
    document.getElementById('stopBtn').disabled = !running;
    document.getElementById('benchmarkBtn').disabled = running;

    // Disable form inputs when running
    document.querySelectorAll('input, select, button').forEach(el => {
        if (!el.closest('.execution-controls')) {
            el.disabled = running;
        }
    });
}

function showExecutionMonitor(message) {
    const statusDiv = document.querySelector('.execution-status span');
    const timestamp = new Date().toLocaleTimeString();
    statusDiv.textContent = `[${timestamp}] ${message}`;
}

// Utility functions
let activeNotifications = [];

function showNotification(message, type = 'info') {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };

    const notification = document.createElement('div');
    const notificationId = Date.now() + Math.random();

    notification.id = `notification-${notificationId}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        max-width: 400px;
    `;
    notification.textContent = message;

    // Shift all existing notifications down
    shiftNotificationsDown();

    // Add new notification at the top
    activeNotifications.unshift(notificationId);

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
            // Remove from active notifications and shift remaining ones up
            const index = activeNotifications.indexOf(notificationId);
            if (index > -1) {
                activeNotifications.splice(index, 1);
                shiftNotificationsUp();
            }
        }, 300);
    }, 3000);
}

function shiftNotificationsDown() {
    activeNotifications.forEach((id, index) => {
        const notification = document.getElementById(`notification-${id}`);
        if (notification) {
            notification.style.top = `${80 + ((index + 1) * 70)}px`;
        }
    });
}

function shiftNotificationsUp() {
    activeNotifications.forEach((id, index) => {
        const notification = document.getElementById(`notification-${id}`);
        if (notification) {
            notification.style.top = `${80 + (index * 70)}px`;
        }
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }

    .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        padding: 5px;
        border-radius: 4px;
        transition: all 0.3s ease;
        color: var(--text-light);
    }

    .icon-btn:hover {
        background: rgba(0, 0, 0, 0.1);
        transform: scale(1.1);
    }

    .icon-btn.delete:hover {
        color: var(--danger-color);
    }

    .icon-btn.edit:hover {
        color: var(--primary-color);
    }
`;
document.head.appendChild(style);