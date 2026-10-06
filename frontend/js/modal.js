/**
 * BMI+ — Reusable Notification & Celebratory Modal System
 */

// Initialize toast container if not already present
function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Shows an attractive Toast notification
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 * @param {number} duration 
 */
function showToast(message, type = 'info', duration = 3500) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✅',
    error: '⚠️',
    info: '💡',
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '💡'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 250);
    }
  }, duration);
}

/**
 * Shows a celebratory Modal popup for Goal completions, XP rewards or Badge unlocks
 * @param {Object} options { title, message, xp, icon, badges, buttonText }
 */
function showCelebrationModal({
  title = '🎉 Goal Completed!',
  message = 'Great job staying on track with your daily wellness habits.',
  xp = 0,
  icon = '🎉',
  badges = [],
  buttonText = 'Nice!',
}) {
  let modalOverlay = document.getElementById('celebration-modal-overlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'celebration-modal-overlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  let badgesHtml = '';
  if (badges && badges.length > 0) {
    badgesHtml = `
      <div style="margin-bottom: 1.25rem; padding: 0.75rem; background: var(--bg-surface-secondary); border-radius: var(--radius-md);">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">New Badge Unlocked!</div>
        ${badges
          .map(
            (b) => `
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 700; color: var(--text-main);">
            <span style="font-size: 1.5rem;">${b.icon || '🏆'}</span>
            <span>${b.title}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-celebrate-icon">${icon}</div>
      <h3 class="modal-title">${title}</h3>
      <p class="modal-body">${message}</p>
      ${xp > 0 ? `<div class="modal-xp-pill">⭐ +${xp} XP</div>` : ''}
      ${badgesHtml}
      <div>
        <button id="modal-celebrate-close-btn" class="btn btn-primary w-full">${buttonText}</button>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');

  const closeBtn = document.getElementById('modal-celebrate-close-btn');
  closeBtn.focus();
  closeBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });
}

