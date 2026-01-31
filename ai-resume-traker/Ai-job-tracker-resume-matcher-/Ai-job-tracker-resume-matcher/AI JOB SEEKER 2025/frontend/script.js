const API_URL = "http://127.0.0.1:8000";

// --- Tab Switching ---
function switchTab(tabName) {
    // Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(tabName.replace('view', ''))) {
            // Simple heuristic to highlight the right button 
            // Better: use IDs or data attributes
        }
    });

    // Explicitly set active button based on index or heuristic
    const buttons = document.querySelectorAll('.nav-btn');
    if (tabName === 'tracker') {
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        buttons[1].classList.add('active');
        buttons[0].classList.remove('active');
    }

    // Views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${tabName}-view`).classList.add('active');
}

// --- Application Tracker Logic ---

// Load Jobs
async function loadJobs() {
    const tableBody = document.querySelector('#jobs-table tbody');
    try {
        const response = await fetch(`${API_URL}/applications/`);
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const jobs = await response.json();

        tableBody.innerHTML = ''; // Clear loading/existing

        if (jobs.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="5" style="text-align:center; padding: 2rem;">
                        No applications yet. Add one above!
                    </td>
                </tr>`;
            return;
        }

        jobs.forEach(job => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${job.company}</strong></td>
                <td>${job.role}</td>
                <td><span class="status-badge status-${job.status}">${job.status}</span></td>
                <td>${job.date_applied || 'N/A'}</td>
                <td style="text-align: center;">
                    <button class="delete-btn" onclick="deleteJob(${job.id})" title="Delete">
                        &times;
                    </button>
                </td>
            `;
            tableBody.prepend(row); // Add new ones at top
        });

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="color: #ef4444; text-align:center;">
                    Error connecting to backend at ${API_URL}.<br>
                    Make sure main.py is running!
                </td>
            </tr>`;
    }
}

// Add Job
document.getElementById('add-job-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const company = document.getElementById('company').value;
    const role = document.getElementById('role').value;
    const status = document.getElementById('status').value;
    const date_applied = document.getElementById('date_applied').value || new Date().toISOString().split('T')[0];
    const notes = document.getElementById('notes').value;

    const data = { company, role, status, date_applied, notes };

    try {
        const response = await fetch(`${API_URL}/applications/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // Reset form and reload list
            document.getElementById('add-job-form').reset();
            // Set default date back to today if needed/custom logic
            loadJobs();
        } else {
            alert('Error adding application');
        }
    } catch (err) {
        console.error(err);
        alert('Failed to connect to server.');
    }
});

// Delete Job
async function deleteJob(id) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
        await fetch(`${API_URL}/applications/${id}`, { method: 'DELETE' });
        loadJobs();
    } catch (err) {
        console.error(err);
        alert('Error deleting job');
    }
}

// --- Resume Matcher Logic ---

async function analyzeMatch() {
    const resumeText = document.getElementById('resume-text').value;
    const jdText = document.getElementById('jd-text').value;

    if (!resumeText || !jdText) {
        alert("Please paste both your Resume and the Job Description.");
        return;
    }

    const analyzeBtn = document.querySelector('.large-btn');
    const originalText = analyzeBtn.innerText;
    analyzeBtn.innerText = "Analyzing...";
    analyzeBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/analyze/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText, jd_text: jdText })
        });

        const data = await response.json();
        renderResults(data);

        // Switch visible sections
        document.getElementById('placeholder-result').style.display = 'none';
        document.getElementById('result-card').style.display = 'block';

    } catch (err) {
        console.error(err);
        alert("Error analyzing match. Ensure server is running.");
    } finally {
        analyzeBtn.innerText = originalText;
        analyzeBtn.disabled = false;
    }
}

function renderResults(data) {
    // 1. Score
    const score = Math.round(data.score); // ensure int
    const scoreEl = document.getElementById('match-score');
    const ring = document.getElementById('score-ring');

    // Animate number
    let current = 0;
    const timer = setInterval(() => {
        if (current >= score) clearInterval(timer);
        else {
            current++;
            scoreEl.innerText = current;
        }
    }, 10);

    // Animate Ring
    // Circumference = 2 * PI * 70 ~= 440
    const circumference = 440;
    const offset = circumference - (score / 100) * circumference;
    ring.style.strokeDashoffset = offset;

    // Colorize ring based on score
    if (score >= 80) ring.style.stroke = '#10b981'; // green
    else if (score >= 50) ring.style.stroke = '#f59e0b'; // orange
    else ring.style.stroke = '#ef4444'; // red

    // 2. Missing Keywords
    const missingDiv = document.getElementById('missing-keywords');
    missingDiv.innerHTML = '';
    if (data.missing_keywords.length === 0) {
        missingDiv.innerHTML = '<span class="chip matched">No missing keywords! 🎉</span>';
    } else {
        data.missing_keywords.forEach(word => {
            const chip = document.createElement('span');
            chip.className = 'chip missing';
            chip.innerText = word;
            missingDiv.appendChild(chip);
        });
    }

    // 3. Matched Keywords (Optional, logic added for completeness)
    const matchedDiv = document.getElementById('matched-keywords');
    matchedDiv.innerHTML = '';
    if (data.matched_keywords && data.matched_keywords.length > 0) {
        data.matched_keywords.forEach(word => {
            const chip = document.createElement('span');
            chip.className = 'chip matched';
            chip.innerText = word;
            matchedDiv.appendChild(chip);
        });
    } else {
        matchedDiv.innerHTML = '<span class="chip missing">No matches found.</span>';
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', loadJobs);
