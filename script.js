// VoltGuard AI Dashboard State
let isFaultActive = false;
let currentChart, tempChart, faultChart;
const maxDataPoints = 15;

// Mock historical fault statistics
const faultStats = {
    earthLeakage: 3,
    shortCircuit: 1,
    overload: 4
};

// Initial logs to populate the table with realistic history
const initialLogs = [
    { time: "08:14:22", current: "0.14A", type: "NONE", relay: "ON", location: "Sector 4 - Substation A", statusClass: "green", actionText: "SYSTEM ACTIVE" },
    { time: "07:30:10", current: "1.89A", type: "SHORT CIRCUIT", relay: "OFF", location: "Sector 2 - Main Feed", statusClass: "red", actionText: "AUTO-CUTOFF" },
    { time: "07:30:15", current: "0.00A", type: "RESET", relay: "ON", location: "Sector 2 - Main Feed", statusClass: "green", actionText: "RECOVERY" },
    { time: "05:12:01", current: "0.15A", type: "NONE", relay: "ON", location: "Sector 4 - Substation A", statusClass: "green", actionText: "SYSTEM ACTIVE" }
];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Live Clock
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Initialize 3 Chart.js Charts
    initCharts();

    // Pre-populate event log table
    populateInitialLogs();

    // Start Telemetry simulation loop (every 1.5 seconds)
    setInterval(simulateTelemetry, 1500);

    // Setup Architecture connection flow animations
    animateArchitectureFlow();
});

// Update Header Live Clock
function updateDateTime() {
    const now = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    document.getElementById('current-date').textContent = now.toLocaleDateString(undefined, options);
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
}

// Chart Initializations (Current, Temperature, Fault Frequency)
function initCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.03)' },
                ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 } }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    // 1. Current vs Time Chart
    const ctxCurrent = document.getElementById('currentChart').getContext('2d');
    const gradCurrent = ctxCurrent.createLinearGradient(0, 0, 0, 260);
    gradCurrent.addColorStop(0, 'rgba(0, 210, 255, 0.35)');
    gradCurrent.addColorStop(1, 'rgba(0, 210, 255, 0)');

    currentChart = new Chart(ctxCurrent, {
        type: 'line',
        data: {
            labels: Array(maxDataPoints).fill(''),
            datasets: [{
                label: 'Current (Amps)',
                data: Array(maxDataPoints).fill(0.12),
                borderColor: '#00d2ff',
                backgroundColor: gradCurrent,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: chartOptions
    });

    // 2. Temperature vs Time Chart
    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    const gradTemp = ctxTemp.createLinearGradient(0, 0, 0, 260);
    gradTemp.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
    gradTemp.addColorStop(1, 'rgba(249, 115, 22, 0)');

    tempChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: Array(maxDataPoints).fill(''),
            datasets: [{
                label: 'Temperature (°C)',
                data: Array(maxDataPoints).fill(28.4),
                borderColor: '#f97316',
                backgroundColor: gradTemp,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    min: 20,
                    max: 55,
                    grid: { color: 'rgba(255, 255, 255, 0.03)' },
                    ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 } }
                }
            }
        }
    });

    // 3. Fault Frequency Bar Chart
    const ctxFault = document.getElementById('faultChart').getContext('2d');
    faultChart = new Chart(ctxFault, {
        type: 'bar',
        data: {
            labels: ['Earth Leakage', 'Short Circuit', 'Overload'],
            datasets: [{
                data: [faultStats.earthLeakage, faultStats.shortCircuit, faultStats.overload],
                backgroundColor: ['#ef4444', '#f97316', '#00d2ff'],
                borderColor: ['rgba(239, 68, 68, 0.5)', 'rgba(249, 115, 22, 0.5)', 'rgba(0, 210, 255, 0.5)'],
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: '#64748b' }
                },
                x: {
                    ticks: { color: '#64748b' }
                }
            }
        }
    });
}

// Chart tab switcher logic
window.switchTab = function(tabName) {
    // Deactivate all buttons & charts
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.chart-container').forEach(chart => chart.classList.remove('active'));

    // Activate selected button & chart
    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.textContent.toLowerCase().includes(tabName));
    if (activeBtn) activeBtn.classList.add('active');

    const activeContainer = document.getElementById(`chart-${tabName}-container`);
    if (activeContainer) activeContainer.classList.add('active');
};

// Simulation of telemetry
function simulateTelemetry() {
    if (isFaultActive) return;

    // 1. Simulate current reading
    const currentVal = (0.10 + Math.random() * 0.08).toFixed(2);
    document.getElementById('current-val').textContent = currentVal;
    
    // Scale fill percentage (0 to 1.5 Amps max nominal scale)
    const currentPct = (currentVal / 1.5) * 100;
    document.getElementById('current-fill').style.width = `${Math.min(currentPct, 100)}%`;

    // 2. Simulate temperature
    const tempVal = (28.0 + Math.random() * 1.5).toFixed(1);
    document.getElementById('temp-val').textContent = tempVal;
    // Scale temp fill percentage (0 to 100 max range scale)
    const tempPct = (tempVal / 80) * 100;
    document.getElementById('temp-fill').style.width = `${Math.min(tempPct, 100)}%`;

    // 3. Simulate voltage fluctuate
    const voltageVal = (229.2 + Math.random() * 2.8).toFixed(1);
    document.getElementById('voltage-meta').textContent = `${voltageVal} V RMS`;

    // Feed data to chart
    updateLineCharts(currentVal, tempVal);
}

// Updates rolling line charts
function updateLineCharts(current, temp) {
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Update current chart
    currentChart.data.labels.push(timeLabel);
    currentChart.data.labels.shift();
    currentChart.data.datasets[0].data.push(current);
    currentChart.data.datasets[0].data.shift();
    currentChart.update('none');

    // Update temp chart
    tempChart.data.labels.push(timeLabel);
    tempChart.data.labels.shift();
    tempChart.data.datasets[0].data.push(temp);
    tempChart.data.datasets[0].data.shift();
    tempChart.update('none');
}

// Initialize system flow connectors
function animateArchitectureFlow() {
    const connectors = [
        document.getElementById('conn-1'),
        document.getElementById('conn-2'),
        document.getElementById('conn-3'),
        document.getElementById('conn-4'),
        document.getElementById('conn-5')
    ];

    connectors.forEach((conn, index) => {
        setTimeout(() => {
            conn.classList.add('active');
        }, index * 300);
    });
}

// Populate pre-existing log records
function populateInitialLogs() {
    const tableBody = document.getElementById('log-body');
    tableBody.innerHTML = '';
    initialLogs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.time}</td>
            <td>${log.current}</td>
            <td>${log.type}</td>
            <td><span class="status-pill ${log.statusClass}">${log.relay}</span></td>
            <td>${log.location}</td>
        `;
        tableBody.appendChild(row);
    });
}

// ----------------------------------------------------
// FAULT STATE TRIGGER (SIMULATION MODULE)
// ----------------------------------------------------
window.triggerFaultState = function() {
    if (isFaultActive) return;

    isFaultActive = true;
    document.body.classList.add('fault-active');

    // Update system header badges
    const statusBadge = document.getElementById('system-status');
    statusBadge.className = 'status-badge danger';
    statusBadge.querySelector('.status-text').textContent = '⚠️ FAULT DETECTED';

    const connectivity = document.querySelector('.connectivity');
    connectivity.className = 'connectivity fault';
    document.getElementById('connectivity-text').textContent = 'FAULT RECOVERY';

    // Update Telemetry Panel metrics to show Fault state
    document.getElementById('current-val').textContent = '0.00';
    document.getElementById('current-fill').style.width = '0%';

    // Voltage Drop / State
    const voltageCard = document.getElementById('voltage-card');
    const voltageVal = document.getElementById('voltage-status');
    voltageVal.textContent = 'LINE CUTOFF';
    voltageVal.className = 'value danger-alert';
    document.getElementById('voltage-meta').textContent = '0.0 V RMS';

    // Fault Status
    const faultStatus = document.getElementById('fault-status');
    faultStatus.textContent = 'EARTH LEAKAGE';
    faultStatus.className = 'value danger-alert';
    document.getElementById('fault-meta').textContent = 'Leakage > 30mA Trip Limit';

    // Relay Status -> OFF
    const relayStatus = document.getElementById('relay-status');
    relayStatus.textContent = 'OFF';
    relayStatus.className = 'value danger-alert';
    const relayIndicator = document.getElementById('relay-indicator');
    relayIndicator.className = 'status-toggle-indicator inactive';

    // Temperature Status Spikes slightly
    document.getElementById('temp-val').textContent = '48.2';
    document.getElementById('temp-fill').style.width = '60%';

    // Buzzer Status -> ACTIVE
    const buzzerStatus = document.getElementById('buzzer-status');
    buzzerStatus.textContent = 'ACTIVE';
    buzzerStatus.className = 'value danger-alert';

    // Update Fault Detection Alert card
    const alertCard = document.getElementById('fault-alert-section');
    alertCard.className = 'card fault-alert-card danger';
    document.getElementById('alert-icon').className = 'fas fa-triangle-exclamation';
    document.getElementById('fault-title').textContent = '⚠️ FAULT DETECTED';
    document.getElementById('fault-msg').innerHTML = '<strong>Leakage Current Detected.</strong><br>Power Supply Automatically Isolated';

    // Update Isolation status text
    const isoStatus = document.getElementById('isolation-status');
    isoStatus.className = 'isolation-status isolated';
    document.getElementById('isolation-text').textContent = 'Power Supply Automatically Isolated';

    // Update Public Safety Panel
    const safetyPanel = document.getElementById('safety-panel');
    document.getElementById('safety-alert').innerHTML = `
        <div class="safety-status-indicator danger">
            <i class="fas fa-triangle-exclamation"></i>
            <span>DANGEROUS CONDITION ENCOUNTERED</span>
        </div>
        <p class="safety-message">Dangerous Electrical Condition Detected. Authorities Have Been Alerted.</p>
    `;

    // Map marker flashes red and moves to threat point
    const marker = document.getElementById('radar-marker');
    marker.style.top = '48%';
    marker.style.left = '52%';
    document.getElementById('overlay-coordinates').textContent = 'ALERT LAT: 12.9721 / LON: 77.5951';

    // Update Architecture flow steps status
    document.getElementById('flow-status').textContent = 'GRID ISOLATED';
    
    // Add fault log record
    addLogRecord(new Date().toLocaleTimeString(), "1.82A", "EARTH LEAKAGE", "AUTO-CUTOFF", "Sector 4 - Substation A");

    // Increment simulated statistics & refresh chart
    faultStats.earthLeakage += 1;
    faultChart.data.datasets[0].data = [faultStats.earthLeakage, faultStats.shortCircuit, faultStats.overload];
    faultChart.update();

    // Flash and trigger line charts to update to flatlines
    updateLineCharts(0, 48.2);
};

// ----------------------------------------------------
// RESET STATE (SIMULATION MODULE)
// ----------------------------------------------------
window.resetSystemState = function() {
    if (!isFaultActive) return;

    isFaultActive = false;
    document.body.classList.remove('fault-active');

    // Reset system header badges
    const statusBadge = document.getElementById('system-status');
    statusBadge.className = 'status-badge secure';
    statusBadge.querySelector('.status-text').textContent = 'SYSTEM SECURE';

    const connectivity = document.querySelector('.connectivity');
    connectivity.className = 'connectivity stable';
    document.getElementById('connectivity-text').textContent = 'CONNECTED';

    // Reset Telemetry Panel metrics
    document.getElementById('current-val').textContent = '0.12';
    document.getElementById('current-fill').style.width = '8%';

    // Voltage Restore
    const voltageVal = document.getElementById('voltage-status');
    voltageVal.textContent = 'NORMAL';
    voltageVal.className = 'value nominal';
    document.getElementById('voltage-meta').textContent = '230.4 V RMS';

    // Fault Status Restore
    const faultStatus = document.getElementById('fault-status');
    faultStatus.textContent = 'NOMINAL';
    faultStatus.className = 'value nominal';
    document.getElementById('fault-meta').textContent = 'No Leakage Detected';

    // Relay Status -> ON
    const relayStatus = document.getElementById('relay-status');
    relayStatus.textContent = 'ON';
    relayStatus.className = 'value active';
    const relayIndicator = document.getElementById('relay-indicator');
    relayIndicator.className = 'status-toggle-indicator active';

    // Temp Restore
    document.getElementById('temp-val').textContent = '28.4';
    document.getElementById('temp-fill').style.width = '28%';

    // Buzzer Status -> SILENT
    const buzzerStatus = document.getElementById('buzzer-status');
    buzzerStatus.textContent = 'SILENT';
    buzzerStatus.className = 'value silent';

    // Reset Fault Detection Alert card
    const alertCard = document.getElementById('fault-alert-section');
    alertCard.className = 'card fault-alert-card secure';
    document.getElementById('alert-icon').className = 'fas fa-shield-check';
    document.getElementById('fault-title').textContent = 'SYSTEM NOMINAL';
    document.getElementById('fault-msg').textContent = 'All parameters within safe operating thresholds. Ground protection active.';

    // Reset Isolation status text
    const isoStatus = document.getElementById('isolation-status');
    isoStatus.className = 'isolation-status active';
    document.getElementById('isolation-text').textContent = 'Grid Connection Active';

    // Reset Public Safety Panel
    document.getElementById('safety-alert').innerHTML = `
        <div class="safety-status-indicator">
            <i class="fas fa-circle-check"></i>
            <span>SYSTEM OPERATING SAFELY</span>
        </div>
        <p class="safety-message">Continuous earth leakage monitoring is active in this sector. Grid line safety is under nominal automated supervision.</p>
    `;

    // Map marker reset
    const marker = document.getElementById('radar-marker');
    marker.style.top = '40%';
    marker.style.left = '60%';
    document.getElementById('overlay-coordinates').textContent = 'LAT: 12.9716 / LON: 77.5946';

    // Reset Architecture flow status
    document.getElementById('flow-status').textContent = 'FLOW ACTIVE';

    // Add recover record to log
    addLogRecord(new Date().toLocaleTimeString(), "0.00A", "RESET", "RECOVERY", "Sector 4 - Substation A");
};

// Add record to event table
function addLogRecord(time, current, type, relayAction, location) {
    const tableBody = document.getElementById('log-body');
    const row = document.createElement('tr');
    
    let relayClass = "green";
    if (relayAction === "AUTO-CUTOFF") relayClass = "red";
    else if (relayAction === "RECOVERY") relayClass = "green";

    row.innerHTML = `
        <td>${time}</td>
        <td>${current}</td>
        <td>${type}</td>
        <td><span class="status-pill ${relayClass}">${relayAction}</span></td>
        <td>${location}</td>
    `;
    
    tableBody.prepend(row);

    // Keep log table to max 10 elements
    if (tableBody.children.length > 12) {
        tableBody.lastElementChild.remove();
    }
}

// Clear all records from log table
window.clearLogs = function() {
    const tableBody = document.getElementById('log-body');
    tableBody.innerHTML = `
        <tr class="empty-log-row">
            <td colspan="5" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 20px;">
                Logs cleared. Awaiting grid events...
            </td>
        </tr>
    `;
};
