/**
 * BMI+ — Dedicated BMI Calculator & Trend Tracker
 * Full CRUD: Create, Read, Update, Delete
 */

let bmiChartInstance = null;

// Edit-mode state
let editingRecordId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.requireAuth()) return;

  const bmiForm        = document.getElementById('bmi-calc-form');
  const heightInput    = document.getElementById('bmi-height');
  const weightInput    = document.getElementById('bmi-weight');
  const notesInput     = document.getElementById('bmi-notes');
  const submitBtn      = document.getElementById('bmi-submit-btn');
  const cancelEditBtn  = document.getElementById('bmi-cancel-edit-btn');

  // Prepopulate from user profile if available
  const user = API.getUser();
  if (user && user.profile) {
    if (user.profile.height) heightInput.value = user.profile.height;
    if (user.profile.weight) weightInput.value = user.profile.weight;
  }

  // ── Cancel edit ──────────────────────────────────────────────
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetToCreateMode);
  }

  // ── Form submit: Create OR Update ────────────────────────────
  if (bmiForm) {
    bmiForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const height = Number(heightInput.value);
      const weight = Number(weightInput.value);
      const notes  = notesInput.value.trim();

      if (!height || height < 30 || height > 280) {
        showToast('Please enter a valid height between 30 and 280 cm.', 'error');
        return;
      }
      if (!weight || weight < 10 || weight > 500) {
        showToast('Please enter a valid weight between 10 and 500 kg.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = editingRecordId ? 'Updating...' : 'Calculating & Saving...';

        let res;

        if (editingRecordId) {
          // ── UPDATE ────────────────────────────────────────────
          res = await API.put(`/bmi/${editingRecordId}`, { height, weight, notes });

          if (res.success) {
            showToast(`BMI Record updated: ${res.record.bmi} (${res.record.category})`, 'success');
            resetToCreateMode();
            await loadBMIHistory();
          }
        } else {
          // ── CREATE ────────────────────────────────────────────
          res = await API.post('/bmi', { height, weight, notes });

          if (res.success) {
            updateBMIDisplay(res.record);

            if (res.newBadges && res.newBadges.length > 0) {
              showCelebrationModal({
                title: '🏆 Achievement Unlocked!',
                message: 'You unlocked a new badge for logging your BMI!',
                xp: res.xpGained,
                icon: '🧮',
                badges: res.newBadges,
              });
            } else {
              showToast(`BMI Calculated: ${res.record.bmi} (${res.record.category}) +10 XP!`, 'success');
            }

            await loadBMIHistory();
          }
        }
      } catch (err) {
        showToast(err.message || 'Error saving BMI record.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingRecordId ? 'Update BMI Record' : 'Calculate & Log BMI';
      }
    });
  }

  // Load latest and history on page load
  await loadBMIHistory();
});

// ── Edit Mode helpers ──────────────────────────────────────────

function enterEditMode(id, height, weight, notes) {
  editingRecordId = id;

  document.getElementById('bmi-height').value = height;
  document.getElementById('bmi-weight').value = weight;
  document.getElementById('bmi-notes').value  = notes || '';

  const submitBtn     = document.getElementById('bmi-submit-btn');
  const cancelEditBtn = document.getElementById('bmi-cancel-edit-btn');

  if (submitBtn)     { submitBtn.textContent = 'Update BMI Record'; }
  if (cancelEditBtn) { cancelEditBtn.style.display = 'inline-flex'; }

  // Scroll to form
  document.getElementById('bmi-calc-form').scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast('Editing record — modify values and click Update.', 'info');
}

function resetToCreateMode() {
  editingRecordId = null;

  document.getElementById('bmi-height').value = '';
  document.getElementById('bmi-weight').value = '';
  document.getElementById('bmi-notes').value  = '';

  // Restore from profile if available
  const user = API.getUser();
  if (user && user.profile) {
    if (user.profile.height) document.getElementById('bmi-height').value = user.profile.height;
    if (user.profile.weight) document.getElementById('bmi-weight').value = user.profile.weight;
  }

  const submitBtn     = document.getElementById('bmi-submit-btn');
  const cancelEditBtn = document.getElementById('bmi-cancel-edit-btn');

  if (submitBtn)     { submitBtn.textContent = 'Calculate & Log BMI'; }
  if (cancelEditBtn) { cancelEditBtn.style.display = 'none'; }
}

// ── Delete ─────────────────────────────────────────────────────

async function deleteBMIRecord(id) {
  if (!confirm('Delete this BMI record? This cannot be undone.')) return;

  try {
    const res = await API.delete(`/bmi/${id}`);
    if (res.success) {
      showToast('BMI record deleted.', 'success');
      await loadBMIHistory();
    }
  } catch (err) {
    showToast(err.message || 'Error deleting record.', 'error');
  }
}

// ── Display helpers ────────────────────────────────────────────

function updateBMIDisplay(record) {
  const resultCard   = document.getElementById('bmi-result-card');
  const valueEl      = document.getElementById('bmi-display-value');
  const categoryBadge = document.getElementById('bmi-display-category');
  const feedbackEl   = document.getElementById('bmi-display-feedback');

  if (!resultCard || !record) return;

  resultCard.style.display = 'block';
  valueEl.textContent = record.bmi;
  categoryBadge.textContent = record.category;
  categoryBadge.className = `badge badge-${getBadgeClass(record.category)}`;

  // Highlight gauge segment
  document.querySelectorAll('.bmi-seg').forEach((seg) => {
    seg.style.opacity = '0.35';
  });
  const activeSeg = document.querySelector(`.seg-${record.category.toLowerCase()}`);
  if (activeSeg) activeSeg.style.opacity = '1';

  // Healthy weight range suggestion (BMI 18.5 - 24.9)
  const heightM = record.height / 100;
  const minHealthyWeight = (18.5 * (heightM * heightM)).toFixed(1);
  const maxHealthyWeight = (24.9 * (heightM * heightM)).toFixed(1);

  feedbackEl.innerHTML = `
    Ideal healthy weight range for height <strong>${record.height} cm</strong> is 
    <strong>${minHealthyWeight} kg – ${maxHealthyWeight} kg</strong>.
  `;
}

function getBadgeClass(cat) {
  switch (cat) {
    case 'Healthy':     return 'success';
    case 'Underweight': return 'info';
    case 'Overweight':  return 'warning';
    case 'Obese':       return 'danger';
    default:            return 'info';
  }
}

async function loadBMIHistory() {
  try {
    const res = await API.get('/bmi/history');
    if (!res.success) return;

    const history = res.history || [];
    if (history.length > 0) {
      updateBMIDisplay(history[0]);
      renderBMIHistoryTable(history);
      renderBMIChart(history);
    } else {
      renderBMIEmptyState();
    }
  } catch (err) {
    console.error('Error loading BMI history:', err);
  }
}

function renderBMIHistoryTable(history) {
  const tbody = document.getElementById('bmi-history-tbody');
  if (!tbody) return;

  tbody.innerHTML = history
    .map(
      (item) => `
    <tr>
      <td>${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td><strong>${item.bmi}</strong></td>
      <td><span class="badge badge-${getBadgeClass(item.category)}">${item.category}</span></td>
      <td>${item.weight} kg</td>
      <td>${item.height} cm</td>
      <td>${item.notes || '—'}</td>
      <td>
        <div style="display:flex; gap:0.4rem; flex-wrap:nowrap;">
          <button
            class="btn btn-sm btn-outline edit-bmi-record"
            type="button"
            data-id="${item._id}"
            data-height="${item.height}"
            data-weight="${item.weight}"
            data-notes="${(item.notes || '').replace(/"/g, '&quot;')}"
            title="Edit this record">
            ✏️ Edit
          </button>
          <button
            class="btn btn-sm btn-danger delete-bmi-record"
            type="button"
            data-id="${item._id}"
            title="Delete this record">
            🗑 Delete
          </button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  tbody.querySelectorAll('.edit-bmi-record').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      const height = Number(button.dataset.height);
      const weight = Number(button.dataset.weight);
      const notes = button.dataset.notes || '';
      enterEditMode(id, height, weight, notes);
    });
  });

  tbody.querySelectorAll('.delete-bmi-record').forEach((button) => {
    button.addEventListener('click', () => {
      deleteBMIRecord(button.dataset.id);
    });
  });
}

function renderBMIChart(history) {
  const canvas = document.getElementById('bmi-trend-chart');
  if (!canvas) return;

  // Sort chronological for chart (oldest to newest)
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sorted.map((d) =>
    new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const bmiValues = sorted.map((d) => d.bmi);

  if (bmiChartInstance) {
    bmiChartInstance.destroy();
  }

  const isDark    = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  bmiChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'BMI Trend',
          data: bmiValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#10b981',
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` BMI: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid:  { color: gridColor },
        },
        y: {
          ticks: { color: textColor },
          grid:  { color: gridColor },
          suggestedMin: 15,
          suggestedMax: 35,
        },
      },
    },
  });
}

function renderBMIEmptyState() {
  const tableContainer = document.getElementById('bmi-history-container');
  if (tableContainer) {
    tableContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🧮</div>
        <div class="empty-state-title">No BMI records yet</div>
        <p class="empty-state-desc">Enter your height and weight above to calculate your first BMI record!</p>
      </div>
    `;
  }
}
