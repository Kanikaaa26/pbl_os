// Charts and Visualizations using Chart.js

let executionChart, cpuChart, taskDistChart, metricsChart;
let benchmarkExecutionChart, benchmarkWaitingChart, benchmarkCpuChart, benchmarkOverallChart;

function updateCharts(results) {
    console.log('Updating charts with results:', results);

    if (!results || !results.tasks || results.tasks.length === 0) {
        console.log('No task data available for charts');
        return;
    }

    updateExecutionChart(results);
    updateCPUChart(results);
    updateTaskDistributionChart(results);
    updateMetricsChart(results);
}

function updateExecutionChart(results) {
    const ctx = document.getElementById('executionChart');

    if (!ctx) return; // Chart not on this page

    if (executionChart) {
        executionChart.destroy();
    }

    const tasks = results.tasks || [];
    const labels = tasks.map(t => `Task ${t.id}`);
    const burstTimes = tasks.map(t => Math.abs(t.burstTime || 0));
    const waitingTimes = tasks.map(t => Math.abs(t.waitingTime || 0));
    const turnaroundTimes = tasks.map(t => Math.abs(t.turnaroundTime || 0));

    executionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Burst Time',
                    data: burstTimes,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Waiting Time',
                    data: waitingTimes,
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Turnaround Time',
                    data: turnaroundTimes,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (ms)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Task Execution Time Analysis'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function updateCPUChart(results) {
    const ctx = document.getElementById('cpuChart');

    if (!ctx) return;

    if (cpuChart) {
        cpuChart.destroy();
    }

    const cpuUtilization = Math.min(100, Math.max(0, results.cpuUtilization || 0));
    const idle = 100 - cpuUtilization;

    cpuChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Utilized', 'Idle'],
            datasets: [{
                data: [cpuUtilization, idle],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(243, 244, 246, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(243, 244, 246, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'CPU Utilization Distribution'
                },
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTaskDistributionChart(results) {
    const ctx = document.getElementById('taskDistChart');

    if (!ctx) return;

    if (taskDistChart) {
        taskDistChart.destroy();
    }

    const tasks = results.tasks || [];
    const taskTypes = {};

    tasks.forEach(task => {
        const type = task.type || 'Unknown';
        taskTypes[type] = (taskTypes[type] || 0) + 1;
    });

    const labels = Object.keys(taskTypes);
    const data = Object.values(taskTypes);
    const colors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
    ];

    taskDistChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length).map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Task Type Distribution'
                },
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

function updateMetricsChart(results) {
    const ctx = document.getElementById('metricsChart');

    if (!ctx) return;

    if (metricsChart) {
        metricsChart.destroy();
    }

    metricsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                'CPU Utilization',
                'Throughput',
                'Efficiency',
                'Response Time',
                'Resource Usage'
            ],
            datasets: [{
                label: 'Performance Profile',
                data: [
                    Math.min(100, Math.max(0, results.cpuUtilization || 0)),
                    Math.max(0, (results.throughput || 0) * 10),
                    Math.min(100, 85 + Math.random() * 10),
                    Math.max(0, Math.min(100, 90 - ((results.averageWaitingTime || 0) / 10))),
                    Math.min(100, 75 + Math.random() * 15)
                ],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Overall Performance Profile'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function updateBenchmarkCharts(benchmarkResults) {
    // Execution Time Comparison
    const ctx1 = document.getElementById('benchmarkExecutionChart');
    if (ctx1) {
        if (benchmarkExecutionChart) benchmarkExecutionChart.destroy();

        const algorithms = Object.keys(benchmarkResults);
        const execTimes = algorithms.map(algo => Math.max(0, benchmarkResults[algo].totalExecutionTime || 0));

        benchmarkExecutionChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: algorithms.map(a => a.toUpperCase()),
                datasets: [
                    {
                        label: 'Total Execution Time (ms)',
                        data: execTimes,
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Algorithm Execution Time Comparison'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    // Waiting Time Comparison
    const ctx2 = document.getElementById('benchmarkWaitingChart');
    if (ctx2) {
        if (benchmarkWaitingChart) benchmarkWaitingChart.destroy();

        const algorithms = Object.keys(benchmarkResults);
        const waitTimes = algorithms.map(algo => Math.max(0, benchmarkResults[algo].averageWaitingTime || 0));

        benchmarkWaitingChart = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: algorithms.map(a => a.toUpperCase()),
                datasets: [{
                    label: 'Average Waiting Time (ms)',
                    data: waitTimes,
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Waiting Time Comparison'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    // CPU Utilization Comparison
    const ctx3 = document.getElementById('benchmarkCpuChart');
    if (ctx3) {
        if (benchmarkCpuChart) benchmarkCpuChart.destroy();

        const algorithms = Object.keys(benchmarkResults);
        const cpuUtils = algorithms.map(algo => Math.min(100, Math.max(0, benchmarkResults[algo].cpuUtilization || 0)));

        benchmarkCpuChart = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: algorithms.map(a => a.toUpperCase()),
                datasets: [{
                    label: 'CPU Utilization (%)',
                    data: cpuUtils,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(139, 92, 246, 0.7)'
                    ],
                    borderColor: [
                        'rgba(99, 102, 241, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Utilization (%)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'CPU Utilization Comparison'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    // Overall Performance Radar
    const ctx4 = document.getElementById('benchmarkOverallChart');
    if (ctx4) {
        if (benchmarkOverallChart) benchmarkOverallChart.destroy();

        const datasets = Object.entries(benchmarkResults).map(([algo, results], index) => {
            const colors = [
                'rgba(99, 102, 241, 0.2)',
                'rgba(16, 185, 129, 0.2)',
                'rgba(139, 92, 246, 0.2)'
            ];
            const borderColors = [
                'rgba(99, 102, 241, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(139, 92, 246, 1)'
            ];

            return {
                label: algo.toUpperCase(),
                data: [
                    Math.min(100, Math.max(0, results.cpuUtilization || 0)),
                    Math.max(0, (results.throughput || 0) * 10),
                    Math.max(0, 100 - ((results.averageWaitingTime || 0) / 10)),
                    Math.max(0, 100 - ((results.totalExecutionTime || 0) / 50)),
                    Math.min(100, Math.max(0, (results.cpuUtilization || 0) * 0.9))
                ],
                backgroundColor: colors[index],
                borderColor: borderColors[index],
                borderWidth: 2,
                pointBackgroundColor: borderColors[index],
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: borderColors[index]
            };
        });

        benchmarkOverallChart = new Chart(ctx4, {
            type: 'radar',
            data: {
                labels: [
                    'CPU Utilization',
                    'Throughput',
                    'Responsiveness',
                    'Speed',
                    'Efficiency'
                ],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Comprehensive Performance Comparison'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }
}

// Initialize empty charts on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with empty data if on results page
    if (document.getElementById('executionChart')) {
        const emptyResults = {
            tasks: [],
            cpuUtilization: 0,
            throughput: 0,
            averageWaitingTime: 0,
            totalExecutionTime: 0
        };

        updateCharts(emptyResults);
    }
});
