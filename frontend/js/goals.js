/**
 * BMI+ — Goals & Daily Checklist Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  const newGoalForm = document.getElementById('new-goal-form');
  if (newGoalForm) {
    newGoalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('goal-title');
      const categorySelect = document.getElementById('goal-category');
      const xpInput = document.getElementById('goal-xp');

      const title = titleInput.value.trim();
      const category = categorySelect.value;
      const xpReward = Number(xpInput.value) || 20;

      if (!title) {
        showToast('Please enter a goal title.', 'error');
        return;
      }

      try {
        const res = await API.post('/goals', { title, category, xpReward });
        if (res.success) {
          showToast('New goal added!', 'success');
          titleInput.value = '';
          await loadGoals();
        }
      } catch (err) {
        showToast(err.message || 'Error creating goal.', 'error');
      }
    });
  }

  await loadGoals();
});

async function loadGoals() {
  try {
    const res = await API.get('/goals');
    if (!res.success) return;

    // Update stats
    const countEl = document.getElementById('goals-count-text');
    const percentEl = document.getElementById('goals-percent-text');
    const fillEl = document.getElementById('goals-progress-fill');

    if (countEl) countEl.textContent = `${res.completedCount} / ${res.total} Complete`;
    if (percentEl) percentEl.textContent = `${res.percentage}%`;
    if (fillEl) fillEl.style.width = `${res.percentage}%`;

    renderGoalsList(res.goals);
  } catch (err) {
    console.error('Error loading goals:', err);
  }
}

function renderGoalsList(goals) {
  const container = document.getElementById('goals-items-container');
  if (!container) return;

  if (!goals || goals.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align: center; padding: 2rem;">No goals found for today. Add a new goal using the form on the right!</p>';
    return;
  }

  container.innerHTML = goals
    .map((goal) => {
      return `
      <div class="checklist-item ${goal.completed ? 'done' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem;">
        <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
          <input type="checkbox" style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--primary);" 
            ${goal.completed ? 'checked' : ''} onchange="toggleGoalItem('${goal._id}')" />
          <div>
            <div class="checklist-text">${goal.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: capitalize;">${goal.category} goal ${goal.isDailyDefault ? '• Daily Default' : ''}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="badge badge-purple">+${goal.xpReward || 20} XP</span>
          ${!goal.isDailyDefault ? `<button class="btn btn-sm btn-danger" onclick="deleteGoalItem('${goal._id}')" title="Delete Goal">🗑️</button>` : ''}
        </div>
      </div>
    `;
    })
    .join('');
}

async function toggleGoalItem(goalId) {
  try {
    const res = await API.put(`/goals/${goalId}`);
    if (res.success) {
      if (res.xpGained > 0) {
        showCelebrationModal({
          title: '🎉 Goal Completed!',
          message: res.message,
          xp: res.xpGained,
          icon: '🎯',
          badges: res.newBadges || [],
        });
      } else {
        showToast(res.message, 'info');
      }
      await loadGoals();
      if (typeof updateTopNavUserData === 'function') {
        const user = API.getUser();
        if (user && res.totalXp) user.xp = res.totalXp;
        if (user && res.streak) user.streak = res.streak;
        API.setUser(user);
        updateTopNavUserData();
      }
    }
  } catch (err) {
    showToast(err.message || 'Error updating goal.', 'error');
  }
}

async function deleteGoalItem(goalId) {
  if (!confirm('Are you sure you want to remove this goal?')) return;
  try {
    const res = await API.delete(`/goals/${goalId}`);
    if (res.success) {
      showToast('Goal deleted.', 'info');
      await loadGoals();
    }
  } catch (err) {
    showToast(err.message || 'Error deleting goal.', 'error');
  }
}

