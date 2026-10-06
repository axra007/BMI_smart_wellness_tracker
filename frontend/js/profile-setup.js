/**
 * BMI+ — Profile Personalization Setup
 */

document.addEventListener('DOMContentLoaded', async () => {
  API.requireAuth();

  const setupForm = document.getElementById('profile-setup-form');
  const alertBox = document.getElementById('setup-alert');

  // Pre-fill existing if any
  try {
    const res = await API.get('/profile');
    if (res.success && res.user && res.user.profile) {
      const p = res.user.profile;
      if (p.age) document.getElementById('setup-age').value = p.age;
      if (p.height) document.getElementById('setup-height').value = p.height;
      if (p.weight) document.getElementById('setup-weight').value = p.weight;
      if (p.activityLevel) {
        const radio = document.querySelector(`input[name="activityLevel"][value="${p.activityLevel}"]`);
        if (radio) radio.checked = true;
      }
    }
  } catch (e) {
    console.warn('Could not load profile preview', e);
  }

  if (setupForm) {
    setupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = setupForm.querySelector('button[type="submit"]');

      const age = document.getElementById('setup-age').value;
      const height = document.getElementById('setup-height').value;
      const weight = document.getElementById('setup-weight').value;
      const activityLevelRadio = document.querySelector('input[name="activityLevel"]:checked');
      const activityLevel = activityLevelRadio ? activityLevelRadio.value : 'Moderate';

      // Validate
      if (!age || Number(age) < 1 || Number(age) > 120) {
        showFormAlert(alertBox, 'Please enter a valid age between 1 and 120.', 'error');
        return;
      }

      if (!height || Number(height) < 30 || Number(height) > 280) {
        showFormAlert(alertBox, 'Please enter a valid height in cm (30 - 280 cm).', 'error');
        return;
      }

      if (!weight || Number(weight) < 10 || Number(weight) > 500) {
        showFormAlert(alertBox, 'Please enter a valid weight in kg (10 - 500 kg).', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Profile...';

        const res = await API.put('/profile', {
          age: Number(age),
          height: Number(height),
          weight: Number(weight),
          activityLevel,
        });

        if (res.success) {
          API.setUser(res.user);
          showToast('Profile personalized! +30 XP gained 🎉', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        }
      } catch (err) {
        showFormAlert(alertBox, err.message || 'Failed to save profile.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue to Dashboard →';
      }
    });
  }
});

function showFormAlert(el, message, type) {
  if (!el) return;
  el.className = `form-alert form-alert-${type} show`;
  el.textContent = message;
}

