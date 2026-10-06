/**
 * BMI+ — Physical Activity Tracker Controller
 */

let activityChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  const form = document.getElementById('activity-log-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const activityType = document.getElementById('act-type').value;
      const durationMinutes = Number(document.getElementById('act-duration').value);
      const steps = Number(document.getElementById('act-steps').value) || 0;
      const caloriesBurned = Number(document.getElementById('act-calories').value) || 0;
      const notes = document.getElementById('act-notes').value.trim();

      if (!activityType || !durationMinutes || durationMinutes <= 0) {
        showToast('Please enter an activity type and valid duration in minutes.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging Workout...';

        const res = await API.post('/activity', {
          activityType,
          durationMinutes,
          steps,
          caloriesBurned,
          notes,
        });

        if (res.success) {
          if (res.newBadges && res.newBadges.length > 0) {
            showCelebrationModal({
              title: '🏃 Active Mover!',
              message: 'You logged an energizing workout session!',
              xp: res.xpGained,
              icon: '🔥',
              badges: res.newBadges,
            });
          } else {
            showToast(`Activity logged: ${durationMinutes} mins (+${res.xpGained} XP)`, 'success');
          }

          form.reset();
          await loadActivityData();
        }
      } catch (err) {
        showToast(err.message || 'Error recording activity.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log Physical Activity';
      }
    });
  }

  await loadActivityData();
});

async function loadActivityData() {
  try {
    const res = await API.get('/activity');
    if (!res.success) return;

    // 1. Update stats cards
    const totalMinsEl = document.getElementById('act-today-mins');
    const goalMinsEl = document.getElementById('act-goal-mins');
    const progressFill = document.getElementById('act-progress-fill');
    const totalStepsEl = document.getElementById('act-today-steps');
    const totalCaloriesEl = document.getElementById('act-today-calories');

    if (totalMinsEl) totalMinsEl.textContent = `${res.todayTotalMinutes} min`;
    if (goalMinsEl) goalMinsEl.textContent = `Goal: ${res.goalMins} min (${res.percentage}%)`;
    if (progressFill) progressFill.style.width = `${Math.min(100, res.percentage)}%`;
    if (totalStepsEl) totalStepsEl.textContent = res.todayTotalSteps.toLocaleString();
    if (totalCaloriesEl) totalCaloriesEl.textContent = `${res.todayCalories} kcal`;

    // 2. Render logs
    renderTodayActivityLogs(res.todayLogs);

    // 3. Render weekly Chart.js bar chart
    renderActivityChart(res.weeklyData, res.goalMins);
  } catch (err) {
    console.error('Error loading activity data:', err);
  }
}

function renderTodayActivityLogs(logs) {
  const container = document.getElementById('today-activity-logs');
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align: center; padding: 1.5rem;">No workouts recorded yet today. Log your first exercise session above!</p>';
    return;
  }

  container.innerHTML = logs
    .map(
      (log) => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.35rem;">🏃</span>
        <div>
          <div style="font-weight: 700; color: var(--text-main);">${log.activityType}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${log.steps > 0 ? `${log.steps.toLocaleString()} steps • ` : ''}${log.caloriesBurned} kcal ${log.notes ? `• "${log.notes}"` : ''}</div>
        </div>
      </div>
      <span class="badge badge-success">${log.durationMinutes} mins</span>
    </div>
  `
    )
    .join('');
}

function renderActivityChart(weeklyData, goalMins) {
  const canvas = document.getElementById('activity-weekly-chart');
  if (!canvas || !weeklyData) return;

  const labels = weeklyData.map((d) => d.dayName);
  const values = weeklyData.map((d) => d.durationMinutes);

  if (activityChartInstance) {
    activityChartInstance.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  activityChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Activity (Minutes)',
          data: values,
          backgroundColor: '#f59e0b',
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
            label: (ctx) => ` Duration: ${ctx.parsed.y} mins (Goal: ${goalMins}m)`,
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
          suggestedMax: Math.max(goalMins + 15, 45),
        },
      },
    },
  });
}

