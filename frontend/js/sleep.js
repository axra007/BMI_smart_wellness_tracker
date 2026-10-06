/**
 * BMI+ — Sleep Tracker Controller
 */

let sleepChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  const sleepForm = document.getElementById('sleep-log-form');
  const bedtimeInput = document.getElementById('sleep-bedtime');
  const wakeTimeInput = document.getElementById('sleep-waketime');
  const durationPreview = document.getElementById('sleep-duration-preview');

  // Auto-update duration preview when inputs change
  function updateDurationPreview() {
    const bedtime = bedtimeInput.value;
    const wakeTime = wakeTimeInput.value;
    if (bedtime && wakeTime) {
      const [bH, bM] = bedtime.split(':').map(Number);
      const [wH, wM] = wakeTime.split(':').map(Number);
      let bTotal = bH * 60 + bM;
      let wTotal = wH * 60 + wM;
      if (wTotal < bTotal) wTotal += 24 * 60;
      const diff = wTotal - bTotal;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      durationPreview.textContent = `Calculated Duration: ${hours}h ${mins}m`;
    }
  }

  if (bedtimeInput && wakeTimeInput) {
    bedtimeInput.addEventListener('change', updateDurationPreview);
    wakeTimeInput.addEventListener('change', updateDurationPreview);
  }

  if (sleepForm) {
    sleepForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bedtime = bedtimeInput.value;
      const wakeTime = wakeTimeInput.value;
      const quality = document.getElementById('sleep-quality').value;
      const notes = document.getElementById('sleep-notes').value.trim();

      if (!bedtime || !wakeTime) {
        showToast('Please select both bedtime and wake-up time.', 'error');
        return;
      }

      const submitBtn = sleepForm.querySelector('button[type="submit"]');
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging Sleep...';

        const res = await API.post('/sleep', { bedtime, wakeTime, quality, notes });

        if (res.success) {
          if (res.newBadges && res.newBadges.length > 0) {
            showCelebrationModal({
              title: '😴 Sleep Champion!',
              message: 'You logged a healthy, restful sleep!',
              xp: res.xpGained,
              icon: '🌙',
              badges: res.newBadges,
            });
          } else {
            showToast(`Sleep logged: ${res.record.durationHours} hrs (+${res.xpGained} XP)`, 'success');
          }
          await loadSleepData();
        }
      } catch (err) {
        showToast(err.message || 'Error recording sleep.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log Sleep Record';
      }
    });
  }

  await loadSleepData();
});

async function loadSleepData() {
  try {
    const res = await API.get('/sleep');
    if (!res.success) return;

    // 1. Last night card
    const lastNightEl = document.getElementById('sleep-last-night-val');
    const lastNightSub = document.getElementById('sleep-last-night-sub');

    if (res.latestSleep) {
      const h = Math.floor(res.latestSleep.durationHours);
      const m = Math.round((res.latestSleep.durationHours % 1) * 60);
      if (lastNightEl) lastNightEl.textContent = `${h}h ${m}m`;
      if (lastNightSub) {
        lastNightSub.textContent = `Bedtime: ${res.latestSleep.bedtime} • Wake: ${res.latestSleep.wakeTime} • Quality: ${res.latestSleep.quality}`;
      }
    } else {
      if (lastNightEl) lastNightEl.textContent = '--';
      if (lastNightSub) lastNightSub.textContent = 'No sleep logged yet.';
    }

    // 2. Feedback banner
    const feedbackEl = document.getElementById('sleep-feedback-text');
    if (feedbackEl && res.feedback) {
      feedbackEl.textContent = res.feedback;
    }

    // 3. Weekly Chart
    renderSleepChart(res.weeklyData);
  } catch (err) {
    console.error('Error loading sleep data:', err);
  }
}

function renderSleepChart(weeklyData) {
  const canvas = document.getElementById('sleep-weekly-chart');
  if (!canvas || !weeklyData) return;

  const labels = weeklyData.map((d) => d.dayName);
  const values = weeklyData.map((d) => d.duration);

  if (sleepChartInstance) {
    sleepChartInstance.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  sleepChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Sleep (Hours)',
          data: values,
          backgroundColor: '#8b5cf6',
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Duration: ${ctx.parsed.y} hrs`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { display: false },
        },
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor },
          suggestedMax: 10,
        },
      },
    },
  });
}

