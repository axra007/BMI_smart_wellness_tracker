/**
 * BMI+ — Navigation & Layout Controller
 */

function initNavigation() {
  const sidebar = document.querySelector('.app-sidebar');
  const menuToggleBtn = document.querySelector('.mobile-menu-toggle');
  let backdrop = document.querySelector('.sidebar-backdrop');

  if (!backdrop && sidebar) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      if (backdrop) backdrop.classList.toggle('active');
    });
  }

  if (backdrop && sidebar) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }

  // Highlight current active link in sidebar
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-nav .nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Bind logout buttons
  document.querySelectorAll('.btn-logout-action').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out of BMI+?')) {
        API.logout();
      }
    });
  });

  // Populate user mini info if in authenticated area
  updateTopNavUserData();
}

function updateTopNavUserData() {
  const user = API.getUser();
  if (!user) return;

  // Sidebar mini badge
  const nameEl = document.querySelector('.user-mini-name');
  const avatarEl = document.querySelector('.user-avatar-circle');
  const xpEl = document.querySelector('.user-mini-xp');
  const topStreakEl = document.querySelector('#topbar-streak-val');
  const topXpEl = document.querySelector('#topbar-xp-val');

  if (nameEl && user.name) nameEl.textContent = user.name;
  if (avatarEl && user.name) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  if (xpEl && user.xp !== undefined) xpEl.textContent = `${user.xp.toLocaleString()} XP`;
  if (topStreakEl && user.streak !== undefined) topStreakEl.textContent = `${user.streak} Day Streak`;
  if (topXpEl && user.xp !== undefined) topXpEl.textContent = `${user.xp.toLocaleString()} XP`;
}

document.addEventListener('DOMContentLoaded', initNavigation);

