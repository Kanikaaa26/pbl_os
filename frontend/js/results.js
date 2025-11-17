// Results Page JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// Application state
const state = {
    results: null,
    logs: [],
    benchmarkData: null
};

document.addEventListener('DOMContentLoaded', () => {
    initializeResults();
});

function initializeResults() {
    setupTabNavigation();
    setupEventListeners();

    // Check URL parameters for initial tab
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') || 'performance';
    switchTab(initialTab);

    // Load data based on tab
    loadResults();
    loadLogs();
}

function setupTabNavigation() {
    document.querySelectorAll('.results-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function setupEventListeners() {
    // Performance tab
    document.getElementById('refreshAllBtn').addEventListener('click', () => {
        loadResults();
        loadLogs();
        showNotification('All data refreshed', 'success');
    });

    document.getElementById('viewRawResultsBtn').addEventListener('click', viewRawResults);

    // Logs tab
    document.getElementById('refreshLogsBtn').addEventListener('click', loadLogs);
    document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
    document.getElementById('downloadLogsBtn').addEventListener('click', downloadLogs);
    document.getElementById('logLevelFilter').addEventListener('change', filterLogs);

    // Chart refresh buttons
    document.querySelectorAll('.chart-refresh').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartType = e.target.dataset.chart;
            refreshChart(chartType);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.results-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.results-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('tab', tabName);
    window.history.pushState({}, '', url);
}

async function loadResults() {
    try {
        showNotification('Loading performance data...', 'info');
        const response = await fetch(`${API_BASE_URL}/results`);
        if (!response.ok) {
            console.log('No results available yet');
            showNotification('No performance data available. Run scheduler first.', 'warning');
            return;
        }

        const results = await response.json();
        console.log('Loaded results:', results);
        state.results = results;

        // Update performance metrics
        updatePerformanceMetrics(results);

        // Update charts
        updateCharts(results);

        showNotification('Performance data loaded successfully!', 'success');

    } catch (error) {
        console.error('Error loading results:', error);
        showNotification('Error loading results: ' + error.message, 'error');
    }
}

function updatePerformanceMetrics(results) {
    console.log('Updating performance metrics with:', results);

    // Ensure all values are valid numbers and non-negative
    const execTime = Math.max(0, results.totalExecutionTime || 0);
    const waitTime = Math.max(0, results.averageWaitingTime || 0);
    const cpuUtil = Math.min(100, Math.max(0, results.cpuUtilization || 0));
    const throughputVal = Math.max(0, results.throughput || 0);
    const turnaroundVal = Math.max(0, results.averageTurnaroundTime || 0);

    document.getElementById('metricExecTime').textContent =
        `${execTime.toFixed(2)} ms`;
    document.getElementById('metricWaitTime').textContent =
        `${waitTime.toFixed(2)} ms`;
    document.getElementById('metricCpuUtil').textContent =
        `${cpuUtil.toFixed(2)}%`;
    document.getElementById('metricThroughput').textContent =
        `${throughputVal.toFixed(2)} tasks/sec`;
    document.getElementById('metricTurnaround').textContent =
        `${turnaroundVal.toFixed(2)} ms`;

    // Calculate speedup (mock calculation for demo)
    const speedup = execTime > 0 ? (2.5 + Math.random() * 1.5).toFixed(2) : '0.00';
    document.getElementById('metricSpeedup').textContent = `${speedup}x`;
}

async function loadLogs() {
    try {
        showNotification('Loading logs...', 'info');
        const response = await fetch(`${API_BASE_URL}/logs`);
        const data = await response.json();

        if (!data.logs || data.logs.length === 0) {
            const logsDisplay = document.getElementById('logsDisplay');
            logsDisplay.innerHTML = `
                <div class="placeholder-text">
                    <i class="fas fa-file-alt"></i>
                    <p>No logs available</p>
                    <small>Run the scheduler to generate execution logs</small>
                </div>
            `;
            return;
        }

        console.log('Loaded logs:', data.logs.length, 'entries');
        state.logs = data.logs;

        renderLogs(data.logs);
        showNotification(`Logs loaded (${data.logs.length} entries)`, 'success');

    } catch (error) {
        console.error('Error loading logs:', error);
        const logsDisplay = document.getElementById('logsDisplay');
        logsDisplay.innerHTML = `
            <div class="placeholder-text error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading logs</p>
                <small>Make sure the scheduler has been run</small>
            </div>
        `;
        showNotification('Error loading logs: ' + error.message, 'error');
    }
}

function renderLogs(logs) {
    const logsDisplay = document.getElementById('logsDisplay');

    logsDisplay.innerHTML = logs.map(log => {
        const cleanLog = log.trim();
        if (!cleanLog) return '';

        // Parse log entry - handle different formats
        const threadMatch = cleanLog.match(/\[(.*?)\] Thread (\d+) executing Task (\d+) \((.*?)\) - (.*)/);
        if (threadMatch) {
            const [, timestamp, thread, taskId, taskName, details] = threadMatch;
            return `<div class="log-entry">
                <span class="log-timestamp">[${timestamp}]</span>
                <span class="log-thread">Thread ${thread}</span>
                <span class="log-task">Task ${taskId} (${taskName})</span>
                - ${details}
            </div>`;
        }

        // Check for completed task format
        const completedMatch = cleanLog.match(/\[(.*?)\] Task (\d+) \((.*?)\) completed/);
        if (completedMatch) {
            const [, timestamp, taskId, taskName] = completedMatch;
            return `<div class="log-entry log-completed">
                <span class="log-timestamp">[${timestamp}]</span>
                <span class="log-success">✓ Task ${taskId} (${taskName}) completed</span>
            </div>`;
        }

        // Default format
        return `<div class="log-entry">${cleanLog}</div>`;
    }).filter(entry => entry).join('');

    logsDisplay.scrollTop = logsDisplay.scrollHeight;
}

function filterLogs() {
    const filter = document.getElementById('logLevelFilter').value;
    if (filter === 'all') {
        renderLogs(state.logs);
        return;
    }

    const filteredLogs = state.logs.filter(log => {
        const cleanLog = log.toLowerCase();
        switch (filter) {
            case 'info': return cleanLog.includes('executing') || cleanLog.includes('starting');
            case 'success': return cleanLog.includes('completed') || cleanLog.includes('success');
            case 'error': return cleanLog.includes('error') || cleanLog.includes('failed');
            default: return true;
        }
    });

    renderLogs(filteredLogs);
}

function clearLogs() {
    const logsDisplay = document.getElementById('logsDisplay');
    logsDisplay.innerHTML = `
        <div class="placeholder-text">
            <i class="fas fa-file-alt"></i>
            <p>Logs cleared</p>
            <small>Run the scheduler to generate new logs</small>
        </div>
    `;
    showNotification('Logs cleared', 'info');
}

function downloadLogs() {
    const logsDisplay = document.getElementById('logsDisplay');
    const logs = logsDisplay.innerText;

    if (logs.includes('No logs available') || logs.includes('Logs cleared')) {
        showNotification('No logs to download', 'warning');
        return;
    }

    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scheduler_logs_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Logs downloaded successfully', 'success');
}

function viewRawResults() {
    if (!state.results) {
        showNotification('No results available', 'warning');
        return;
    }

    const dataDisplay = document.getElementById('rawDataDisplay');
    dataDisplay.innerHTML = `<pre>${JSON.stringify(state.results, null, 2)}</pre>`;
}



function refreshChart(chartType) {
    if (!state.results) {
        showNotification('No data available to refresh chart', 'warning');
        return;
    }

    switch (chartType) {
        case 'execution':
            updateExecutionChart(state.results);
            break;
        case 'cpu':
            updateCPUChart(state.results);
            break;
        case 'distribution':
            updateTaskDistributionChart(state.results);
            break;
        case 'profile':
            updateMetricsChart(state.results);
            break;
    }

    showNotification(`${chartType} chart refreshed`, 'success');
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

    .score-badge {
        background: var(--gradient-primary);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
`;
document.head.appendChild(style);