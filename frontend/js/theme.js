/**
 * BMI+ — Theme Switcher (Light & Dark Mode)
 */

const THEME_KEY = 'bmi_plus_theme';

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);

  // Bind all theme toggle buttons on the page
  document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
    updateButtonIcon(btn, savedTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
    updateButtonIcon(btn, theme);
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

function updateButtonIcon(btn, theme) {
  btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
}

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', initTheme);

