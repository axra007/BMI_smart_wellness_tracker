/**
 * BMI+ — Hydration Tracker Controller
 */

let hydrationChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  // Bind Quick Water Add Buttons
  document.querySelectorAll('.btn-add-water').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const amount = Number(btn.getAttribute('data-amount'));
      await addWater(amount);
    });
  });

  // Custom amount form
  const customForm = document.getElementById('custom-water-form');
  if (customForm) {
    customForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('custom-water-amount');
      const amount = Number(input.value);
      if (!amount || amount <= 0) {
        showToast('Please enter a valid water volume in ml.', 'error');
        return;
      }
      await addWater(amount);
      input.value = '';
    });
  }

  await loadHydrationData();
});

async function addWater(amount) {
  try {
    const res = await API.post('/hydration', { amount });
    if (res.success) {
      if (res.newBadges && res.newBadges.length > 0) {
        showCelebrationModal({
          title: '💧 Hydration Hero!',
          message: 'You reached your daily hydration target!',
          xp: res.xpGained,
          icon: '💧',
          badges: res.newBadges,
        });
      } else if (res.percentage >= 100 && res.xpGained > 10) {
        showCelebrationModal({
          title: '🎉 Daily Water Goal Completed!',
          message: `Awesome! You have hit 100% of your daily hydration goal (${res.todayTotalL}L).`,
          xp: res.xpGained,
          icon: '💧',
        });
      } else {
        showToast(`+${amount} ml logged! (+${res.xpGained} XP)`, 'success');
      }

      await loadHydrationData();
    }
  } catch (err) {
    showToast(err.message || 'Failed to record water intake.', 'error');
  }
}

async function loadHydrationData() {
  try {
    const res = await API.get('/hydration');
    if (!res.success) return;

    // 1. Text & Percentage
    const totalEl = document.getElementById('hydration-total-val');
    const goalEl = document.getElementById('hydration-goal-val');
    const percentEl = document.getElementById('hydration-percent-val');
    const fillEl = document.getElementById('water-bottle-fill');

    if (totalEl) totalEl.textContent = `${res.todayTotalL} L`;
    if (goalEl) goalEl.textContent = `of ${res.goalL} L`;
    if (percentEl) percentEl.textContent = `${res.percentage}%`;
    if (fillEl) fillEl.style.height = `${Math.min(100, res.percentage)}%`;

    // 2. Render today's log items
    renderTodayWaterLogs(res.todayLogs);

    // 3. Render weekly Chart.js bar chart
    renderHydrationChart(res.weeklyData, res.goalL);
  } catch (err) {
    console.error('Error loading hydration data:', err);
  }
}

function renderTodayWaterLogs(logs) {
  const container = document.getElementById('today-water-logs');
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align: center; padding: 1.5rem;">No water logged yet today. Click a quick-add button above!</p>';
    return;
  }

  container.innerHTML = logs
    .map((log) => {
      const time = new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.25rem;">💧</span>
          <div>
            <div style="font-weight: 700; color: var(--text-main);">${log.amount} ml</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${time}</div>
          </div>
        </div>
        <span class="badge badge-info">+${log.amount} ml</span>
      </div>
    `;
    })
    .join('');
}

function renderHydrationChart(weeklyData, goalL) {
  const canvas = document.getElementById('hydration-weekly-chart');
  if (!canvas || !weeklyData) return;

  const labels = weeklyData.map((d) => d.dayName);
  const values = weeklyData.map((d) => d.amountL);

  if (hydrationChartInstance) {
    hydrationChartInstance.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  hydrationChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Water Intake (Liters)',
          data: values,
          backgroundColor: '#38bdf8',
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
            label: (ctx) => ` Intake: ${ctx.parsed.y} L (Goal: ${goalL} L)`,
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
          suggestedMax: Math.max(goalL + 0.5, 2.5),
        },
      },
    },
  });
}

