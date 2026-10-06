/**
 * BMI+ — Dashboard Main Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    const res = await API.get('/dashboard');
    if (!res.success) return;

    const data = res;
    API.setUser(data.user);
    if (typeof updateTopNavUserData === 'function') {
      updateTopNavUserData();
    }

    // 1. Greeting
    const greetingEl = document.getElementById('dash-greeting');
    if (greetingEl) greetingEl.textContent = data.greeting || 'Welcome to BMI+ 👋';

    // 2. Motivational note
    const noteEl = document.getElementById('dash-today-note');
    if (noteEl && data.todayNote) noteEl.textContent = data.todayNote;

    // 3. BMI Summary Card
    const bmiValEl = document.getElementById('dash-bmi-val');
    const bmiCatEl = document.getElementById('dash-bmi-cat');
    const bmiSubEl = document.getElementById('dash-bmi-sub');

    if (data.bmi) {
      bmiValEl.textContent = data.bmi.value;
      bmiCatEl.textContent = data.bmi.category;
      bmiCatEl.className = `badge badge-${getCategoryBadgeClass(data.bmi.category)}`;
      bmiSubEl.textContent = `Weight: ${data.bmi.weight} kg | Height: ${data.bmi.height} cm`;
    } else {
      bmiValEl.textContent = '--';
      bmiCatEl.textContent = 'Not calculated';
      bmiCatEl.className = 'badge badge-info';
      bmiSubEl.innerHTML = '<a href="bmi.html" class="btn btn-sm btn-outline">Calculate BMI →</a>';
    }

    // 4. Water Summary Card
    const waterValEl = document.getElementById('dash-water-val');
    const waterGoalEl = document.getElementById('dash-water-goal');
    const waterProgressFill = document.getElementById('dash-water-fill');
    const waterPercentEl = document.getElementById('dash-water-percent');

    if (data.hydration) {
      waterValEl.textContent = `${data.hydration.todayL} L`;
      waterGoalEl.textContent = `of ${data.hydration.goalL} L`;
      const p = data.hydration.percentage || 0;
      waterProgressFill.style.width = `${p}%`;
      waterPercentEl.textContent = `${p}% of daily goal`;
    }

    // 5. Sleep Summary Card
    const sleepValEl = document.getElementById('dash-sleep-val');
    const sleepSubEl = document.getElementById('dash-sleep-sub');

    if (data.sleep && data.sleep.record) {
      sleepValEl.textContent = data.sleep.formattedDuration;
      sleepSubEl.textContent = `Quality: ${data.sleep.quality || 'Good'} • ${data.sleep.record.bedtime} to ${data.sleep.record.wakeTime}`;
    } else {
      sleepValEl.textContent = '--';
      sleepSubEl.innerHTML = '<a href="sleep.html" class="btn btn-sm btn-outline">Log Sleep →</a>';
    }

    // 6. Activity Summary Card
    const actValEl = document.getElementById('dash-activity-val');
    const actGoalEl = document.getElementById('dash-activity-goal');
    const actProgressFill = document.getElementById('dash-activity-fill');
    const actPercentEl = document.getElementById('dash-activity-percent');

    if (data.activity) {
      actValEl.textContent = `${data.activity.todayMinutes} min`;
      actGoalEl.textContent = `Goal: ${data.activity.goalMinutes} min`;
      const p = data.activity.percentage || 0;
      actProgressFill.style.width = `${p}%`;
      actPercentEl.textContent = `${data.activity.steps.toLocaleString()} steps • ${data.activity.calories} kcal`;
    }

    // 7. Mood Widget
    const moodDisplayEl = document.getElementById('dash-mood-display');
    if (moodDisplayEl) {
      if (data.mood) {
        moodDisplayEl.innerHTML = `
          <div style="font-size: 2.25rem; margin-bottom: 0.25rem;">${data.mood.emoji}</div>
          <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">Feeling ${data.mood.mood}</div>
          ${data.mood.note ? `<div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; font-style: italic;">"${data.mood.note}"</div>` : ''}
        `;
      } else {
        moodDisplayEl.innerHTML = `
          <p style="margin-bottom: 0.75rem;">How are you feeling today?</p>
          <a href="mood.html" class="btn btn-sm btn-primary">Daily Mood Check-in 😊</a>
        `;
      }
    }

    // 8. 4-Pillar Core Checklist
    renderCoreChecklist(data.checklist);

    // 9. Goals list
    renderDashboardGoals(data.goals ? data.goals.list : []);
  } catch (err) {
    console.error('Failed to load dashboard:', err);
    showToast('Could not load all dashboard data.', 'error');
  }
}

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Healthy': return 'success';
    case 'Underweight': return 'info';
    case 'Overweight': return 'warning';
    case 'Obese': return 'danger';
    default: return 'info';
  }
}

function renderCoreChecklist(checklist) {
  const container = document.getElementById('dash-core-checklist');
  if (!container || !checklist) return;

  const items = [
    { label: 'Drink water target', done: checklist.water, link: 'hydration.html', icon: '💧' },
    { label: '30 min physical activity', done: checklist.activity, link: 'activity.html', icon: '🏃' },
    { label: 'Log restful sleep', done: checklist.sleep, link: 'sleep.html', icon: '😴' },
    { label: 'Mood reflection check-in', done: checklist.mood, link: 'mood.html', icon: '😊' },
  ];

  container.innerHTML = items
    .map(
      (item) => `
    <div class="checklist-item ${item.done ? 'done' : ''}">
      <span class="checklist-check">${item.done ? '✅' : '⚪'}</span>
      <span class="checklist-text">${item.icon} ${item.label}</span>
      ${!item.done ? `<a href="${item.link}" class="btn btn-sm btn-outline">Log</a>` : '<span class="badge badge-success">Done</span>'}
    </div>
  `
    )
    .join('');
}

function renderDashboardGoals(goals) {
  const container = document.getElementById('dash-goals-list');
  const progressText = document.getElementById('dash-goals-progress-text');
  const progressBar = document.getElementById('dash-goals-progress-bar');
  if (!container) return;

  if (!goals || goals.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align: center; padding: 1rem;">No goals scheduled for today.</p>';
    if (progressText) progressText.textContent = '0 / 0 Complete';
    if (progressBar) progressBar.style.width = '0%';
    return;
  }

  const completed = goals.filter((g) => g.completed).length;
  const total = goals.length;
  const pct = Math.round((completed / total) * 100);

  if (progressText) progressText.textContent = `${completed} / ${total} Complete (${pct}%)`;
  if (progressBar) progressBar.style.width = `${pct}%`;

  container.innerHTML = goals
    .map(
      (goal) => `
    <div class="checklist-item ${goal.completed ? 'done' : ''}" data-goal-id="${goal._id}">
      <input type="checkbox" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);" 
        ${goal.completed ? 'checked' : ''} onchange="toggleDashboardGoal('${goal._id}')" />
      <span class="checklist-text">${goal.title}</span>
      <span class="badge badge-purple">+${goal.xpReward || 20} XP</span>
    </div>
  `
    )
    .join('');
}

async function toggleDashboardGoal(goalId) {
  try {
    const res = await API.put(`/goals/${goalId}`);
    if (res.success) {
      if (res.xpGained > 0) {
        showCelebrationModal({
          title: '🎉 Goal Completed!',
          message: res.message,
          xp: res.xpGained,
          icon: '🏆',
          badges: res.newBadges || [],
        });
      } else {
        showToast(res.message, 'info');
      }
      await loadDashboardData();
    }
  } catch (err) {
    showToast(err.message || 'Failed to update goal', 'error');
  }
}

