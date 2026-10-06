/**
 * BMI+ — Authentication (Login & Register)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if already authenticated
  if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html')) {
    API.redirectIfAuthenticated();
  }

  // Password visibility toggles
  document.querySelectorAll('.btn-toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });

  // Handle Registration Form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('auth-alert');
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;

      // Validation
      if (!name || !email || !password) {
        showFormAlert(alertBox, 'Please fill in all required fields.', 'error');
        return;
      }

      if (password.length < 6) {
        showFormAlert(alertBox, 'Password must be at least 6 characters.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showFormAlert(alertBox, 'Passwords do not match.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        const res = await API.post('/auth/register', {
          name,
          email,
          password,
          confirmPassword,
        });

        if (res.success) {
          API.setToken(res.token);
          API.setUser(res.user);
          showToast('Account created successfully!', 'success');
          // Forward to profile personalization setup
          window.location.href = 'profile-setup.html';
        }
      } catch (err) {
        showFormAlert(alertBox, err.message || 'Registration failed. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }

  // Handle Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('auth-alert');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        showFormAlert(alertBox, 'Please enter both email and password.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const res = await API.post('/auth/login', { email, password });

        if (res.success) {
          API.setToken(res.token);
          API.setUser(res.user);
          showToast('Welcome back!', 'success');

          if (!res.user.profile || !res.user.profile.isProfileComplete) {
            window.location.href = 'profile-setup.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }
      } catch (err) {
        showFormAlert(alertBox, err.message || 'Login failed. Please check credentials.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    });
  }
});

function showFormAlert(el, message, type) {
  if (!el) return;
  el.className = `form-alert form-alert-${type} show`;
  el.textContent = message;
}

