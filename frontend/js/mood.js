/**
 * BMI+ — Mood Check-in & Emotional Wellbeing Tracker
 */

let selectedMood = 'Good';

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  // Mood choice cards selector
  const moodCards = document.querySelectorAll('.mood-choice-card');
  moodCards.forEach((card) => {
    card.addEventListener('click', () => {
      moodCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedMood = card.getAttribute('data-mood');
    });
  });

  const form = document.getElementById('mood-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const note = document.getElementById('mood-note').value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Mood...';

        const res = await API.post('/mood', { mood: selectedMood, note });

        if (res.success) {
          if (res.newBadges && res.newBadges.length > 0) {
            showCelebrationModal({
              title: '😊 Mindful Soul!',
              message: 'Thank you for taking a moment to reflect on how you feel.',
              xp: res.xpGained,
              icon: '🌸',
              badges: res.newBadges,
            });
          } else {
            showToast(`Mood logged: ${res.record.emoji} ${res.record.mood} (+${res.xpGained} XP)`, 'success');
          }

          document.getElementById('mood-note').value = '';
          await loadMoodData();
        }
      } catch (err) {
        showToast(err.message || 'Error recording mood.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Daily Mood Check-in';
      }
    });
  }

  await loadMoodData();
});

async function loadMoodData() {
  try {
    const res = await API.get('/mood');
    if (!res.success) return;

    // 1. Today's Mood banner
    const todayCard = document.getElementById('today-mood-card');
    const todayEmoji = document.getElementById('today-mood-emoji');
    const todayText = document.getElementById('today-mood-text');
    const todayNote = document.getElementById('today-mood-note');

    if (res.todayMood) {
      if (todayCard) todayCard.style.display = 'block';
      if (todayEmoji) todayEmoji.textContent = res.todayMood.emoji;
      if (todayText) todayText.textContent = `Today's Mood: ${res.todayMood.mood}`;
      if (todayNote) {
        todayNote.textContent = res.todayMood.note ? `"${res.todayMood.note}"` : 'No note added.';
      }

      // Pre-select today's logged mood card
      document.querySelectorAll('.mood-choice-card').forEach((c) => {
        if (c.getAttribute('data-mood') === res.todayMood.mood) {
          c.classList.add('selected');
          selectedMood = res.todayMood.mood;
        } else {
          c.classList.remove('selected');
        }
      });
    }

    // 2. Render Recent Moods Timeline
    renderMoodTimeline(res.recentMoods);
  } catch (err) {
    console.error('Error loading mood data:', err);
  }
}

function renderMoodTimeline(moods) {
  const container = document.getElementById('mood-timeline-container');
  if (!container) return;

  if (!moods || moods.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align: center; padding: 1.5rem;">No mood check-ins logged yet. Select an emoji above to log your first check-in!</p>';
    return;
  }

  container.innerHTML = moods
    .map((m) => {
      const dateStr = new Date(m.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return `
      <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border-color);">
        <span style="font-size: 2.2rem; line-height: 1;">${m.emoji}</span>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: var(--text-main); font-size: 1rem;">${m.mood}</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${dateStr}</span>
          </div>
          ${m.note ? `<p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">"${m.note}"</p>` : ''}
        </div>
      </div>
    `;
    })
    .join('');
}

