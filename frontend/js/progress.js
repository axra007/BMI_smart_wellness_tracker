/**
 * BMI+ — Comprehensive Progress Analytics & Charts Controller
 */

let currentTimeframe = 'week';
let chartWater = null;
let chartSleep = null;
let chartActivity = null;
let chartBmi = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  // Timeframe switch buttons (Today / Week / Month)
  document.querySelectorAll('.timeframe-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.timeframe-btn').forEach((b) => b.classList.remove('active', 'btn-primary'));
      document.querySelectorAll('.timeframe-btn').forEach((b) => b.classList.add('btn-secondary'));

      btn.classList.remove('btn-secondary');
      btn.classList.add('active', 'btn-primary');

      currentTimeframe = btn.getAttribute('data-timeframe');
      await loadProgressData(currentTimeframe);
    });
  });

  await loadProgressData(currentTimeframe);
});

async function loadProgressData(timeframe) {
  try {
    const res = await API.get(`/progress?timeframe=${timeframe}`);
    if (!res.success) return;

    // 1. Summary Cards
    const summary = res.summary || {};
    const waterPctEl = document.getElementById('prog-water-pct');
    const sleepPctEl = document.getElementById('prog-sleep-pct');
    const actPctEl = document.getElementById('prog-act-pct');
    const goalsPctEl = document.getElementById('prog-goals-pct');

    if (waterPctEl) waterPctEl.textContent = `${summary.waterPercentage || 0}%`;
    if (sleepPctEl) sleepPctEl.textContent = `${summary.sleepPercentage || 0}%`;
    if (actPctEl) actPctEl.textContent = `${summary.activityPercentage || 0}%`;
    if (goalsPctEl) goalsPctEl.textContent = `${summary.goalsPercentage || 0}%`;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';

    // 2. Water Chart
    renderWaterProgressChart(res.waterByDay, textColor, gridColor);

    // 3. Sleep Chart
    renderSleepProgressChart(res.sleepByDay, textColor, gridColor);

    // 4. Activity Chart
    renderActivityProgressChart(res.activityByDay, textColor, gridColor);

    // 5. BMI Trend Chart
    renderBMIProgressChart(res.bmiTrend, textColor, gridColor);
  } catch (err) {
    console.error('Error loading progress analytics:', err);
    showToast('Failed to load progress analytics.', 'error');
  }
}

function renderWaterProgressChart(data, textColor, gridColor) {
  const canvas = document.getElementById('prog-chart-water');
  if (!canvas || !data) return;

  if (chartWater) chartWater.destroy();

  chartWater = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Water Intake (L)',
          data: data.map((d) => d.liters),
          backgroundColor: '#38bdf8',
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor }, suggestedMax: 3 },
      },
    },
  });
}

function renderSleepProgressChart(data, textColor, gridColor) {
  const canvas = document.getElementById('prog-chart-sleep');
  if (!canvas || !data) return;

  if (chartSleep) chartSleep.destroy();

  chartSleep = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Sleep (Hours)',
          data: data.map((d) => d.hours),
          backgroundColor: '#8b5cf6',
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor }, suggestedMax: 10 },
      },
    },
  });
}

function renderActivityProgressChart(data, textColor, gridColor) {
  const canvas = document.getElementById('prog-chart-activity');
  if (!canvas || !data) return;

  if (chartActivity) chartActivity.destroy();

  chartActivity = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: 'Activity (Mins)',
          data: data.map((d) => d.minutes),
          backgroundColor: '#f59e0b',
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor }, suggestedMax: 60 },
      },
    },
  });
}

function renderBMIProgressChart(data, textColor, gridColor) {
  const canvas = document.getElementById('prog-chart-bmi');
  if (!canvas || !data) return;

  if (chartBmi) chartBmi.destroy();

  chartBmi = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: 'BMI Trend',
          data: data.map((d) => d.bmi),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          tension: 0.35,
          fill: true,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor }, suggestedMin: 18, suggestedMax: 30 },
      },
    },
  });
}

