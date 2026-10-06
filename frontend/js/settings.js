/**
 * BMI+ — Application Settings & Preferences Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  // 1. Theme radios
  const currentTheme = localStorage.getItem('bmi_plus_theme') || 'light';
  const themeRadio = document.querySelector(`input[name="theme-choice"][value="${currentTheme}"]`);
  if (themeRadio) themeRadio.checked = true;

  document.querySelectorAll('input[name="theme-choice"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      applyTheme(e.target.value);
      showToast(`Switched to ${e.target.value} mode!`, 'info');
    });
  });

  // 2. Reminders toggle
  const reminderCheckbox = document.getElementById('setting-reminders');
  const user = API.getUser();
  if (user && user.profile && reminderCheckbox) {
    reminderCheckbox.checked = user.profile.remindersEnabled !== false;
  }

  if (reminderCheckbox) {
    reminderCheckbox.addEventListener('change', async (e) => {
      try {
        const res = await API.put('/profile', { remindersEnabled: e.target.checked });
        if (res.success) {
          API.setUser(res.user);
          showToast(`Reminders ${e.target.checked ? 'enabled' : 'muted'}.`, 'success');
        }
      } catch (err) {
        showToast('Failed to update notification settings.', 'error');
      }
    });
  }

  // 3. Logout action
  const logoutBtn = document.getElementById('settings-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of BMI+?')) {
        API.logout();
      }
    });
  }
});

