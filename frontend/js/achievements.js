/**
 * BMI+ — Achievements & Badges Gallery Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  await loadAchievements();
});

async function loadAchievements() {
  try {
    const res = await API.get('/achievements');
    if (!res.success) return;

    // 1. Overall stats
    const xpEl = document.getElementById('achieve-xp-val');
    const streakEl = document.getElementById('achieve-streak-val');
    const countEl = document.getElementById('achieve-count-val');
    const fillEl = document.getElementById('achieve-progress-fill');
    const rateEl = document.getElementById('achieve-rate-val');

    if (xpEl) xpEl.textContent = `${res.userXp.toLocaleString()} XP`;
    if (streakEl) streakEl.textContent = `${res.userStreak} Days`;
    if (countEl) countEl.textContent = `${res.unlockedCount} / ${res.totalCount}`;
    if (rateEl) rateEl.textContent = `${res.completionRate}% Unlocked`;
    if (fillEl) fillEl.style.width = `${res.completionRate}%`;

    // 2. Render badges grid
    renderBadgesGrid(res.badges);
  } catch (err) {
    console.error('Error loading achievements:', err);
    showToast('Failed to load achievements.', 'error');
  }
}

function renderBadgesGrid(badges) {
  const container = document.getElementById('badges-grid-container');
  if (!container || !badges) return;

  container.innerHTML = badges
    .map((badge) => {
      const unlockedDate = badge.unlockedAt
        ? new Date(badge.unlockedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : null;

      return `
      <div class="badge-item-card ${badge.isUnlocked ? '' : 'locked'}">
        <div class="badge-item-icon">${badge.icon}</div>
        <div class="badge-item-title">${badge.title}</div>
        <p class="badge-item-desc">${badge.description}</p>
        <div class="badge-status-pill">
          ${
            badge.isUnlocked
              ? `<span class="badge badge-success">✓ Unlocked on ${unlockedDate}</span>`
              : `<span class="badge badge-secondary" style="background: var(--bg-surface-secondary); color: var(--text-muted);">🔒 Locked</span>`
          }
        </div>
      </div>
    `;
    })
    .join('');
}

