/**
 * BMI+ — User Profile View & Edit Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  const form = document.getElementById('profile-edit-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('prof-name').value.trim();
      const age = Number(document.getElementById('prof-age').value);
      const height = Number(document.getElementById('prof-height').value);
      const weight = Number(document.getElementById('prof-weight').value);
      const activityLevel = document.getElementById('prof-activity-level').value;
      const waterGoal = Number(document.getElementById('prof-water-goal').value);
      const sleepGoal = Number(document.getElementById('prof-sleep-goal').value);
      const activityGoal = Number(document.getElementById('prof-activity-goal').value);

      if (!name) {
        showToast('Name is required.', 'error');
        return;
      }

      if (height < 30 || height > 280) {
        showToast('Height must be between 30 and 280 cm.', 'error');
        return;
      }

      if (weight < 10 || weight > 500) {
        showToast('Weight must be between 10 and 500 kg.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Changes...';

        const res = await API.put('/profile', {
          name,
          age,
          height,
          weight,
          activityLevel,
          waterGoal,
          sleepGoal,
          activityGoal,
        });

        if (res.success) {
          API.setUser(res.user);
          showToast('Profile updated successfully!', 'success');
          if (typeof updateTopNavUserData === 'function') {
            updateTopNavUserData();
          }
          await loadProfile();
        }
      } catch (err) {
        showToast(err.message || 'Error updating profile.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Profile Changes';
      }
    });
  }

  await loadProfile();
});

async function loadProfile() {
  try {
    const res = await API.get('/profile');
    if (!res.success) return;

    const u = res.user;
    const p = u.profile || {};

    // Header badge
    const headerName = document.getElementById('prof-header-name');
    const headerEmail = document.getElementById('prof-header-email');
    const headerAvatar = document.getElementById('prof-header-avatar');
    const headerBmi = document.getElementById('prof-header-bmi');

    if (headerName) headerName.textContent = u.name;
    if (headerEmail) headerEmail.textContent = u.email;
    if (headerAvatar) headerAvatar.textContent = u.name.charAt(0).toUpperCase();
    if (headerBmi) {
      headerBmi.textContent = u.latestBMI ? `BMI: ${u.latestBMI} (${u.bmiCategory || 'Calculated'})` : 'BMI: Not calculated yet';
    }

    // Prepopulate form fields
    if (document.getElementById('prof-name')) document.getElementById('prof-name').value = u.name || '';
    if (document.getElementById('prof-email')) document.getElementById('prof-email').value = u.email || '';
    if (document.getElementById('prof-age')) document.getElementById('prof-age').value = p.age || '';
    if (document.getElementById('prof-height')) document.getElementById('prof-height').value = p.height || '';
    if (document.getElementById('prof-weight')) document.getElementById('prof-weight').value = p.weight || '';
    if (document.getElementById('prof-activity-level')) document.getElementById('prof-activity-level').value = p.activityLevel || 'Moderate';
    if (document.getElementById('prof-water-goal')) document.getElementById('prof-water-goal').value = p.waterGoal || 2.0;
    if (document.getElementById('prof-sleep-goal')) document.getElementById('prof-sleep-goal').value = p.sleepGoal || 8.0;
    if (document.getElementById('prof-activity-goal')) document.getElementById('prof-activity-goal').value = p.activityGoal || 30;
  } catch (err) {
    console.error('Error loading profile:', err);
    showToast('Failed to load profile.', 'error');
  }
}

