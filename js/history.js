const BASE = 'http://localhost:5212/api/v1';

let currentPage = 1;
let currentOperation = '';
let currentType = '';
let totalPages = 1;

const OP_ICONS   = { CONVERT:'🔄', COMPARE:'⚖️', ADD:'➕', SUBTRACT:'➖', DIVIDE:'➗' };
const TYPE_ICONS = { LengthUnit:'📏', VolumeUnit:'🧪', WeightUnit:'⚖️', TemperatureUnit:'🌡️', Measurement:'📐' };

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString();
}

function getResultUnit(r) {
  if (r.operation === 'CONVERT') return r.secondUnit;
  if (r.operation === 'ADD' || r.operation === 'SUBTRACT') return r.firstUnit;
  return '';
}

function renderTable(records) {
  const tbody = document.getElementById('history-tbody');
  if (!records || !records.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No records found</td></tr>`;
    return;
  }
  tbody.innerHTML = records.map(r => `
    <tr class="${r.isError ? 'row-error' : ''}">
      <td>${r.id}</td>
      <td><span class="badge badge-op">${OP_ICONS[r.operation] || ''} ${r.operation}</span></td>
      <td><span class="badge badge-type">${TYPE_ICONS[r.measurementType] || ''} ${r.measurementType}</span></td>
      <td class="input-cell">${r.firstValue} <em>${r.firstUnit}</em>${r.secondValue ? ` &amp; ${r.secondValue} <em>${r.secondUnit}</em>` : ''}</td>
      <td class="${r.isError ? 'text-error' : 'text-result'}">${r.isError ? (r.errorMessage || 'Error') : (r.resultString || `${r.result} ${getResultUnit(r)}`.trim())}</td>
      <td>${formatDate(r.createdAt)}</td>
      <td>${r.isError ? '<span class="status-error">❌</span>' : '<span class="status-ok">✅</span>'}</td>
    </tr>
  `).join('');
}

function renderPagination() {
  const el = document.getElementById('pagination');
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  let html = `<button onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>← Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button onclick="goPage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>Next →</button>`;
  el.innerHTML = html;
}

async function loadHistory() {
  const tbody   = document.getElementById('history-tbody');
  const errorEl = document.getElementById('history-error');

  tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Loading…</td></tr>`;
  errorEl.style.display = 'none';
  errorEl.textContent = '';

  let url = `${BASE}/quantitymeasurement/history?page=${currentPage}&pageSize=15`;
  if (currentOperation) url += `&operation=${currentOperation}`;
  if (currentType)      url += `&measurementType=${currentType}`;

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res  = await fetch(url, { headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    totalPages = data.totalPages || 1;
    document.getElementById('total-count').textContent =
      `${data.total} record${data.total !== 1 ? 's' : ''}`;

    renderTable(data.data);
    renderPagination();

  } catch (err) {
    errorEl.textContent = 'Failed to load history: ' + err.message;
    errorEl.style.display = 'block';
    tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Failed to load history</td></tr>`;
  }
}

function goPage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  loadHistory();
}

function applyFilters() {
  currentOperation = document.getElementById('filter-op').value;
  currentType      = document.getElementById('filter-type').value;
  currentPage = 1;
  loadHistory();
}

function resetFilters() {
  document.getElementById('filter-op').value   = '';
  document.getElementById('filter-type').value = '';
  currentOperation = '';
  currentType      = '';
  currentPage = 1;
  loadHistory();
}

async function clearHistory() {
  if (!confirm('Clear ALL history? This cannot be undone.')) return;
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    await fetch(`${BASE}/quantitymeasurement/history`, { method: 'DELETE', headers });
    loadHistory();
  } catch (err) {
    alert('Failed to clear: ' + err.message);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const mode = localStorage.getItem('mode');

  if (mode === 'guest' || !mode) {
    document.getElementById('guest-notice').style.display = 'flex';
    document.getElementById('history-main').style.display = 'none';
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('user-info').textContent =
    `👤 ${user.firstName || ''} ${user.lastName || ''}`.trim();

  loadHistory();
});
