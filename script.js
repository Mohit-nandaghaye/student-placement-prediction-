// Navigation Logic
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    document.getElementById(tabId).classList.add('active-tab');
    
    // Find matching navbar link
    const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(a => a.getAttribute('href') === `#${tabId}`);
    if (activeLink) activeLink.classList.add('active');
}

// Nav link clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const tabId = this.getAttribute('href').substring(1);
        switchTab(tabId);
    });
});

// Chart.js Readiness Chart Reference
let readinessChartInstance = null;

// Form Submission & Inference Logic
document.getElementById('placementForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // 1. Gather Inputs
    const data = {
        cgpa: parseFloat(document.getElementById('cgpa').value),
        tenth: parseFloat(document.getElementById('tenth').value),
        twelfth: parseFloat(document.getElementById('twelfth').value),
        backlogs: parseInt(document.getElementById('backlogs').value),
        technical: parseInt(document.getElementById('technical').value),
        communication: parseInt(document.getElementById('communication').value),
        aptitude: parseInt(document.getElementById('aptitude').value),
        attendance: parseFloat(document.getElementById('attendance').value),
        internships: parseInt(document.getElementById('internships').value),
        projects: parseInt(document.getElementById('projects').value),
        certifications: parseInt(document.getElementById('certifications').value)
    };

    // 2. Logistic Regression / ML Decision Score Simulation
    let logitScore = (
        (data.cgpa / 10.0) * 3.0 +
        (data.technical / 10.0) * 2.5 +
        (data.aptitude / 10.0) * 2.0 +
        (data.communication / 10.0) * 2.0 +
        (data.internships * 0.8) +
        (data.projects * 0.5) -
        (data.backlogs * 1.5) - 4.5
    );

    // Sigmoid Function for Probability
    let probability = 1 / (1 + Math.exp(-logitScore));
    let probabilityPct = (probability * 100).toFixed(1);

    let status = probability >= 0.5 ? "Likely to be Placed" : "Not Placed / Needs Improvement";
    
    // 3. Category Readiness Scores Calculation
    let categoryScores = {
        'Academics': Math.min(100, Math.round((data.cgpa / 10) * 80 + (10 - data.backlogs) * 2)),
        'Technical Skills': data.technical * 10,
        'Communication': data.communication * 10,
        'Aptitude': data.aptitude * 10,
        'Experience': Math.min(100, (data.internships * 30 + data.projects * 20 + data.certifications * 10))
    };

    let overallScore = Math.round(Object.values(categoryScores).reduce((a, b) => a + b) / 5);
    let readinessLevel = overallScore >= 75 ? "High" : overallScore >= 55 ? "Moderate" : "Low";

    // 4. Update UI - Result Box
    document.getElementById('resultBox').classList.remove('hidden');
    document.getElementById('predictionOutcome').innerText = status;
    document.getElementById('predictionOutcome').style.color = probability >= 0.5 ? '#16a34a' : '#dc2626';
    document.getElementById('predictionProb').innerText = `${probabilityPct}%`;
    document.getElementById('overallReadiness').innerText = `${readinessLevel} (${overallScore}%)`;

    // 5. Update UI - Career Readiness Tab
    updateReadinessSection(categoryScores, readinessLevel);
});

function updateReadinessSection(scores, readinessLevel) {
    const strengthsList = document.getElementById('strengthsList');
    const weaknessList = document.getElementById('weaknessList');
    const recsGrid = document.getElementById('recommendationsList');

    strengthsList.innerHTML = '';
    weaknessList.innerHTML = '';
    recsGrid.innerHTML = '';

    const defaultRecs = {
        'Academics': 'Maintain CGPA above 8.0 and clear any remaining active backlogs.',
        'Technical Skills': 'Focus on Data Structures, Algorithms, and practical code projects.',
        'Communication': 'Engage in group discussions, public speaking, and mock HR interviews.',
        'Aptitude': 'Practice quantitative, logical reasoning, and time management tests.',
        'Experience': 'Complete at least 1-2 core industry internships and build personal projects.'
    };

    for (let [category, score] of Object.entries(scores)) {
        if (score >= 70) {
            strengthsList.innerHTML += `<li><strong>${category}</strong> (${score}%)</li>`;
        } else {
            weaknessList.innerHTML += `<li><strong>${category}</strong> (${score}%)</li>`;
        }

        recsGrid.innerHTML += `
            <div class="rec-card">
                <h4>${category} Score: ${score}%</h4>
                <p>${defaultRecs[category]}</p>
            </div>
        `;
    }

    if (strengthsList.innerHTML === '') strengthsList.innerHTML = '<li>No major strengths detected. Focus on upskilling.</li>';
    if (weaknessList.innerHTML === '') weaknessList.innerHTML = '<li>No major critical weaknesses! Maintain current performance.</li>';

    // 6. Render Chart.js Chart
    renderChart(scores);
}

function renderChart(scores) {
    const ctx = document.getElementById('readinessChart').getContext('2d');

    if (readinessChartInstance) {
        readinessChartInstance.destroy();
    }

    readinessChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(scores),
            datasets: [{
                label: 'Readiness Score (%)',
                data: Object.values(scores),
                backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}