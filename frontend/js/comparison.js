// Algorithm Comparison JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// Application state
const state = {
    testResults: {},
    charts: {},
    isRunning: false
};

document.addEventListener('DOMContentLoaded', () => {
    initializeComparison();
});

function initializeComparison() {
    setupEventListeners();
    
    // Don't auto-load cached results - let user run fresh tests
    // Users can click "Use Sample Data" if they want to see demo results
    console.log('Comparison panel initialized. Ready for testing.');
}

function setupEventListeners() {
    document.getElementById('runComparisonBtn').addEventListener('click', runComparisonTest);
    document.getElementById('loadSampleBtn').addEventListener('click', loadSampleData);
    document.getElementById('exportCSVBtn')?.addEventListener('click', exportToCSV);
    document.getElementById('exportJSONBtn')?.addEventListener('click', exportToJSON);
}

async function runComparisonTest() {
    if (state.isRunning) {
        showNotification('Test already running', 'warning');
        return;
    }

    // Get configuration
    const minThreads = parseInt(document.getElementById('minThreads').value);
    const maxThreads = parseInt(document.getElementById('maxThreads').value);
    const threadStep = parseInt(document.getElementById('threadStep').value);
    const numTasks = parseInt(document.getElementById('numTasks').value);

    // Validate input
    if (minThreads > maxThreads) {
        showNotification('Minimum threads must be less than maximum threads', 'error');
        return;
    }

    if (minThreads < 1 || maxThreads > 16) {
        showNotification('Thread count must be between 1 and 16', 'error');
        return;
    }

    // Get selected algorithms
    const algorithms = [];
    if (document.getElementById('algoSJF').checked) algorithms.push('sjf');
    if (document.getElementById('algoRR').checked) algorithms.push('rr');
    if (document.getElementById('algoPriority').checked) algorithms.push('priority');

    if (algorithms.length === 0) {
        showNotification('Please select at least one algorithm', 'warning');
        return;
    }

    // Generate thread counts
    const threadCounts = [];
    for (let t = minThreads; t <= maxThreads; t += threadStep) {
        threadCounts.push(t);
    }

    console.log('Starting comparison test with config:', {
        minThreads, maxThreads, threadStep, numTasks,
        algorithms, threadCounts
    });

    state.isRunning = true;
    document.getElementById('runComparisonBtn').disabled = true;
    document.getElementById('testProgress').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';

    // Clear previous results
    state.testResults = {};
    localStorage.removeItem('comparisonResults');

    // Generate tasks
    const tasks = generateTestTasks(numTasks);
    console.log('Generated tasks:', tasks);

    // Run tests
    const totalTests = algorithms.length * threadCounts.length;
    let completedTests = 0;

    showNotification(`Starting comparison test with ${totalTests} configurations...`, 'info');

    try {
        for (const algorithm of algorithms) {
            state.testResults[algorithm] = [];

            for (const threadCount of threadCounts) {
                updateProgress(completedTests, totalTests, `Testing ${algorithm.toUpperCase()} with ${threadCount} thread(s)...`);

                try {
                    console.log(`\n=== Running ${algorithm} with ${threadCount} threads ===`);
                    const result = await runSingleTest(algorithm, threadCount, tasks);
                    console.log(`Result:`, result);
                    
                    state.testResults[algorithm].push({
                        threads: threadCount,
                        ...result
                    });
                } catch (error) {
                    console.error(`Error testing ${algorithm} with ${threadCount} threads:`, error);
                    showNotification(`Error in ${algorithm} test with ${threadCount} threads: ${error.message}`, 'error');
                    
                    // Add placeholder result to continue
                    state.testResults[algorithm].push({
                        threads: threadCount,
                        executionTime: 0,
                        cpuUtilization: 0,
                        throughput: 0,
                        averageWaitingTime: 0,
                        averageTurnaroundTime: 0
                    });
                }

                completedTests++;
                
                // No fixed delay - next test will wait dynamically via ensureNotRunning()
            }
        }

        updateProgress(totalTests, totalTests, 'Analysis complete!');

        // Calculate speedup and efficiency
        calculateMetrics();

        // Save results
        localStorage.setItem('comparisonResults', JSON.stringify(state.testResults));

        // Display results
        displayResults();

        showNotification('Thread scaling comparison completed successfully!', 'success');
        
    } catch (error) {
        console.error('Comparison test error:', error);
        showNotification('Comparison test failed: ' + error.message, 'error');
    } finally {
        state.isRunning = false;
        document.getElementById('runComparisonBtn').disabled = false;
        setTimeout(() => {
            document.getElementById('testProgress').style.display = 'none';
        }, 2000);
    }
}

async function runSingleTest(algorithm, threadCount, tasks) {
    try {
        console.log(`Running test: ${algorithm} with ${threadCount} threads and ${tasks.length} tasks`);
        
        // Wait for any previous execution to finish first
        await ensureNotRunning();
        
        // Submit tasks first
        const submitResponse = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tasks, algorithm })
        });

        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            console.error('Submit error:', errorText);
            throw new Error('Failed to submit tasks: ' + errorText);
        }

        const submitResult = await submitResponse.json();
        console.log('Tasks submitted:', submitResult);

        // Brief delay to ensure file is written
        await new Promise(resolve => setTimeout(resolve, 200));

        // Execute with specific thread count - use the path from submit response
        const taskFilePath = submitResult.task_file || '../../data/tasks.json';
        
        const executeResponse = await fetch(`${API_BASE_URL}/comparison/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                algorithm, 
                threadCount,
                taskFile: taskFilePath
            })
        });

        if (!executeResponse.ok) {
            const errorText = await executeResponse.text();
            console.error('Execute error:', errorText);
            throw new Error('Failed to execute test: ' + errorText);
        }

        const executeResult = await executeResponse.json();
        console.log('Execution started:', executeResult);

        // Wait for completion dynamically
        await waitForCompletion();

        const resultsResponse = await fetch(`${API_BASE_URL}/results`);
        if (!resultsResponse.ok) {
            const errorText = await resultsResponse.text();
            console.error('Results error:', errorText);
            throw new Error('Failed to get results: ' + errorText);
        }

        const results = await resultsResponse.json();
        console.log('Results received:', results);

        return {
            executionTime: results.totalExecutionTime || 0,
            cpuUtilization: results.cpuUtilization || 0,
            throughput: results.throughput || 0,
            averageWaitingTime: results.averageWaitingTime || 0,
            averageTurnaroundTime: results.averageTurnaroundTime || 0
        };

    } catch (error) {
        console.error('Test execution error:', error);
        throw error;
    }
}

async function ensureNotRunning() {
    // Poll until scheduler is not running
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds max
    
    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${API_BASE_URL}/status`);
            const status = await response.json();
            
            if (!status.running) {
                console.log('Scheduler ready for next test');
                return;
            }
            
            console.log(`Waiting for previous test to complete... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        } catch (error) {
            console.error('Error checking status:', error);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
    }
    
    console.warn('Timeout waiting for scheduler to be ready, proceeding anyway...');
}

async function waitForCompletion() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 120; // 60 seconds max
        let wasRunning = false;
        
        const checkStatus = async () => {
            try {
                attempts++;
                const response = await fetch(`${API_BASE_URL}/status`);
                const status = await response.json();

                if (status.running) {
                    wasRunning = true;
                    console.log(`Execution in progress... (${attempts}/${maxAttempts})`);
                } else if (wasRunning) {
                    // Was running but now stopped - execution complete
                    console.log('Execution completed!');
                    // Brief delay for file system sync
                    await new Promise(r => setTimeout(r, 300));
                    resolve();
                    return;
                } else if (attempts > 5) {
                    // If not running after 5 attempts (2.5 seconds), assume it completed quickly
                    console.log('Execution completed (fast)');
                    resolve();
                    return;
                }

                if (attempts >= maxAttempts) {
                    console.warn('Max attempts reached, assuming completion');
                    resolve();
                } else {
                    setTimeout(checkStatus, 500);
                }
            } catch (error) {
                console.error('Status check error:', error);
                if (attempts >= maxAttempts) {
                    resolve();
                } else {
                    setTimeout(checkStatus, 500);
                }
            }
        };
        checkStatus();
    });
}

function calculateMetrics() {
    // Calculate speedup and efficiency for each algorithm
    for (const algorithm in state.testResults) {
        const results = state.testResults[algorithm];
        
        if (results.length === 0) continue;

        // Baseline is single-threaded execution
        const baselineTime = results[0].executionTime;

        results.forEach(result => {
            // Speedup = T(1) / T(n)
            result.speedup = baselineTime > 0 ? baselineTime / result.executionTime : 1;
            
            // Efficiency = Speedup / Threads * 100%
            result.efficiency = result.threads > 0 ? (result.speedup / result.threads) * 100 : 0;
        });
    }
}

function generateTestTasks(count) {
    const tasks = [];
    const taskTypes = ['matrix', 'sort', 'file', 'compute'];
    const taskNames = {
        'matrix': ['Matrix Multiplication', 'Matrix Addition', 'Matrix Transpose', 'Matrix Inversion'],
        'sort': ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble Sort'],
        'file': ['Log Processing', 'Config Parsing', 'Data Import', 'File Conversion'],
        'compute': ['FFT Calculation', 'Monte Carlo Simulation', 'Prime Finding', 'Hash Computation']
    };

    for (let i = 1; i <= count; i++) {
        const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
        const nameOptions = taskNames[type];
        const name = nameOptions[Math.floor(Math.random() * nameOptions.length)] + ' ' + i;

        tasks.push({
            id: i,
            name: name,
            type: type,
            priority: Math.floor(Math.random() * 5) + 1,
            burstTime: Math.floor(Math.random() * 150) + 50,
            arrivalTime: Math.floor(Math.random() * 100),
            dataSize: Math.floor(Math.random() * 1000) + 100
        });
    }

    return tasks;
}

function displayResults() {
    document.getElementById('resultsSection').style.display = 'block';
    
    generateInsights();
    renderCharts();
    renderDataTable();
}

function generateInsights() {
    const insightsGrid = document.getElementById('insightsGrid');
    insightsGrid.innerHTML = '';

    if (Object.keys(state.testResults).length === 0) return;

    // Find best performing algorithm
    let bestAlgorithm = null;
    let bestTime = Infinity;
    let bestSpeedup = 0;
    let maxEfficiency = 0;

    for (const algorithm in state.testResults) {
        const results = state.testResults[algorithm];
        const lastResult = results[results.length - 1];
        
        if (lastResult.executionTime < bestTime) {
            bestTime = lastResult.executionTime;
            bestAlgorithm = algorithm.toUpperCase();
        }

        if (lastResult.speedup > bestSpeedup) {
            bestSpeedup = lastResult.speedup;
        }

        results.forEach(r => {
            if (r.efficiency > maxEfficiency) {
                maxEfficiency = r.efficiency;
            }
        });
    }

    // Calculate average improvement
    let totalImprovement = 0;
    let count = 0;
    for (const algorithm in state.testResults) {
        const results = state.testResults[algorithm];
        if (results.length >= 2) {
            const improvement = ((results[0].executionTime - results[results.length - 1].executionTime) / results[0].executionTime) * 100;
            totalImprovement += improvement;
            count++;
        }
    }
    const avgImprovement = count > 0 ? totalImprovement / count : 0;

    // Create insight cards
    const insights = [
        {
            title: 'Best Algorithm',
            value: bestAlgorithm || 'N/A',
            description: `Fastest execution at maximum threads`,
            color: 'green'
        },
        {
            title: 'Maximum Speedup',
            value: bestSpeedup.toFixed(2) + 'x',
            description: 'Best parallel acceleration achieved',
            color: 'blue'
        },
        {
            title: 'Peak Efficiency',
            value: maxEfficiency.toFixed(1) + '%',
            description: 'Best thread utilization achieved',
            color: 'orange'
        },
        {
            title: 'Avg Improvement',
            value: avgImprovement.toFixed(1) + '%',
            description: 'Average time reduction with more threads',
            color: ''
        }
    ];

    insights.forEach(insight => {
        const card = document.createElement('div');
        card.className = `insight-card ${insight.color}`;
        card.innerHTML = `
            <h4>${insight.title}</h4>
            <div class="value">${insight.value}</div>
            <div class="description">${insight.description}</div>
        `;
        insightsGrid.appendChild(card);
    });
}

function renderCharts() {
    // Destroy existing charts
    Object.values(state.charts).forEach(chart => chart.destroy());
    state.charts = {};

    const algorithms = Object.keys(state.testResults);
    if (algorithms.length === 0) return;

    const colors = {
        'sjf': '#3498db',
        'rr': '#e74c3c',
        'priority': '#2ecc71'
    };

    // Execution Time Chart
    state.charts.executionTime = createLineChart('executionTimeChart', {
        title: 'Execution Time vs Threads',
        datasets: algorithms.map(algo => ({
            label: algo.toUpperCase(),
            data: state.testResults[algo].map(r => ({ x: r.threads, y: r.executionTime })),
            borderColor: colors[algo],
            backgroundColor: colors[algo] + '33',
            tension: 0.3
        })),
        yAxisLabel: 'Time (ms)'
    });

    // Speedup Chart
    state.charts.speedup = createLineChart('speedupChart', {
        title: 'Speedup vs Threads',
        datasets: algorithms.map(algo => ({
            label: algo.toUpperCase(),
            data: state.testResults[algo].map(r => ({ x: r.threads, y: r.speedup })),
            borderColor: colors[algo],
            backgroundColor: colors[algo] + '33',
            tension: 0.3
        })),
        yAxisLabel: 'Speedup Factor',
        includeIdealLine: true
    });

    // Efficiency Chart
    state.charts.efficiency = createLineChart('efficiencyChart', {
        title: 'Thread Efficiency',
        datasets: algorithms.map(algo => ({
            label: algo.toUpperCase(),
            data: state.testResults[algo].map(r => ({ x: r.threads, y: r.efficiency })),
            borderColor: colors[algo],
            backgroundColor: colors[algo] + '33',
            tension: 0.3
        })),
        yAxisLabel: 'Efficiency (%)',
        maxY: 100
    });

    // CPU Utilization Chart
    state.charts.cpuUtilization = createLineChart('cpuUtilizationChart', {
        title: 'CPU Utilization',
        datasets: algorithms.map(algo => ({
            label: algo.toUpperCase(),
            data: state.testResults[algo].map(r => ({ x: r.threads, y: r.cpuUtilization })),
            borderColor: colors[algo],
            backgroundColor: colors[algo] + '33',
            tension: 0.3
        })),
        yAxisLabel: 'Utilization (%)',
        maxY: 100
    });

    // Throughput Chart
    state.charts.throughput = createLineChart('throughputChart', {
        title: 'Throughput',
        datasets: algorithms.map(algo => ({
            label: algo.toUpperCase(),
            data: state.testResults[algo].map(r => ({ x: r.threads, y: r.throughput })),
            borderColor: colors[algo],
            backgroundColor: colors[algo] + '33',
            tension: 0.3
        })),
        yAxisLabel: 'Tasks/Second'
    });

    // Waiting Time Chart
    state.charts.waitingTime = createLineChart('waitingTimeChart', {
        title: 'Average Waiting Time',
        datasets: algorithms.map(algo => ({
            label: algo.toUpperCase(),
            data: state.testResults[algo].map(r => ({ x: r.threads, y: r.averageWaitingTime })),
            borderColor: colors[algo],
            backgroundColor: colors[algo] + '33',
            tension: 0.3
        })),
        yAxisLabel: 'Time (ms)'
    });
}

function createLineChart(canvasId, options) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const datasets = [...options.datasets];
    
    // Add ideal speedup line if requested
    if (options.includeIdealLine) {
        const maxThreads = Math.max(...datasets[0].data.map(d => d.x));
        const idealData = [];
        for (let i = 1; i <= maxThreads; i++) {
            idealData.push({ x: i, y: i });
        }
        datasets.push({
            label: 'Ideal Linear Speedup',
            data: idealData,
            borderColor: '#95a5a6',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
        });
    }

    return new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Number of Threads'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: options.yAxisLabel
                    },
                    beginAtZero: true,
                    max: options.maxY
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function renderDataTable() {
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    for (const algorithm in state.testResults) {
        const results = state.testResults[algorithm];
        
        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${algorithm.toUpperCase()}</strong></td>
                <td>${result.threads}</td>
                <td>${result.executionTime.toFixed(2)}</td>
                <td>${result.speedup.toFixed(2)}x</td>
                <td>${result.efficiency.toFixed(1)}%</td>
                <td>${result.cpuUtilization.toFixed(1)}%</td>
                <td>${result.throughput.toFixed(2)}</td>
                <td>${result.averageWaitingTime.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

function updateProgress(completed, total, message) {
    const percent = Math.round((completed / total) * 100);
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressPercent').textContent = `${percent}%`;
    document.getElementById('progressText').textContent = message;
}

function loadSampleData() {
    console.log('Loading sample data...');
    
    // Clear any real test results
    localStorage.removeItem('comparisonResults');
    
    // Load pre-generated sample data
    state.testResults = {
        'sjf': [
            { threads: 1, executionTime: 2000, cpuUtilization: 85, throughput: 10, averageWaitingTime: 150, speedup: 1.0, efficiency: 100 },
            { threads: 2, executionTime: 1100, cpuUtilization: 92, throughput: 18, averageWaitingTime: 80, speedup: 1.82, efficiency: 91 },
            { threads: 4, executionTime: 600, cpuUtilization: 88, throughput: 33, averageWaitingTime: 45, speedup: 3.33, efficiency: 83 },
            { threads: 6, executionTime: 450, cpuUtilization: 78, throughput: 44, averageWaitingTime: 30, speedup: 4.44, efficiency: 74 },
            { threads: 8, executionTime: 380, cpuUtilization: 66, throughput: 53, averageWaitingTime: 25, speedup: 5.26, efficiency: 66 }
        ],
        'rr': [
            { threads: 1, executionTime: 2200, cpuUtilization: 82, throughput: 9, averageWaitingTime: 180, speedup: 1.0, efficiency: 100 },
            { threads: 2, executionTime: 1250, cpuUtilization: 88, throughput: 16, averageWaitingTime: 95, speedup: 1.76, efficiency: 88 },
            { threads: 4, executionTime: 700, cpuUtilization: 84, throughput: 29, averageWaitingTime: 55, speedup: 3.14, efficiency: 79 },
            { threads: 6, executionTime: 520, cpuUtilization: 71, throughput: 38, averageWaitingTime: 38, speedup: 4.23, efficiency: 71 },
            { threads: 8, executionTime: 450, cpuUtilization: 61, throughput: 44, averageWaitingTime: 32, speedup: 4.89, efficiency: 61 }
        ],
        'priority': [
            { threads: 1, executionTime: 1950, cpuUtilization: 87, throughput: 10, averageWaitingTime: 140, speedup: 1.0, efficiency: 100 },
            { threads: 2, executionTime: 1050, cpuUtilization: 93, throughput: 19, averageWaitingTime: 75, speedup: 1.86, efficiency: 93 },
            { threads: 4, executionTime: 580, cpuUtilization: 90, throughput: 34, averageWaitingTime: 42, speedup: 3.36, efficiency: 84 },
            { threads: 6, executionTime: 420, cpuUtilization: 77, throughput: 48, averageWaitingTime: 28, speedup: 4.64, efficiency: 77 },
            { threads: 8, executionTime: 350, cpuUtilization: 70, throughput: 57, averageWaitingTime: 22, speedup: 5.57, efficiency: 70 }
        ]
    };

    displayResults();
    showNotification('Sample data loaded! (This is pre-generated demo data, not from your configuration)', 'success');
}

function exportToCSV() {
    let csv = 'Algorithm,Threads,Execution Time (ms),Speedup,Efficiency (%),CPU Utilization (%),Throughput (tasks/s),Avg Waiting Time (ms)\n';

    for (const algorithm in state.testResults) {
        const results = state.testResults[algorithm];
        results.forEach(result => {
            csv += `${algorithm.toUpperCase()},${result.threads},${result.executionTime},${result.speedup.toFixed(2)},${result.efficiency.toFixed(1)},${result.cpuUtilization.toFixed(1)},${result.throughput.toFixed(2)},${result.averageWaitingTime.toFixed(2)}\n`;
        });
    }

    downloadFile(csv, 'comparison_results.csv', 'text/csv');
    showNotification('Results exported to CSV', 'success');
}

function exportToJSON() {
    const json = JSON.stringify(state.testResults, null, 2);
    downloadFile(json, 'comparison_results.json', 'application/json');
    showNotification('Results exported to JSON', 'success');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };

    const notification = document.createElement('div');
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

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
`;
document.head.appendChild(style);
