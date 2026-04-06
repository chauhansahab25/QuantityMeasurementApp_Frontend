const API_BASE = 'http://localhost:5212/api/v1';

const api = {
  // ── Auth ──────────────────────────────────────────────
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(firstName, lastName, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  // ── Google Auth ───────────────────────────────────────
  async getGoogleLoginUrl() {
    const res = await fetch(`${API_BASE}/auth/google/login`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get Google login URL');
    return data;
  },

  async handleGoogleCallback(code) {
    const res = await fetch(`${API_BASE}/auth/google/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google authentication failed');
    return data;
  },

  // ── Quantity ──────────────────────────────────────────
  _headers() {
    const token = localStorage.getItem('token');
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },

  async compare(firstValue, firstUnit, secondValue, secondUnit, measurementType) {
    const res = await fetch(`${API_BASE}/quantitymeasurement/compare`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({ firstValue, firstUnit, secondValue, secondUnit, operation: 'COMPARE', measurementType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errorMessage || 'Compare failed');
    return data;
  },

  async convert(firstValue, firstUnit, measurementType, targetUnit) {
    const res = await fetch(`${API_BASE}/quantitymeasurement/convert?targetUnit=${encodeURIComponent(targetUnit)}`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({ firstValue, firstUnit, secondValue: 0, secondUnit: targetUnit, operation: 'CONVERT', measurementType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errorMessage || 'Convert failed');
    return data;
  },

  async add(firstValue, firstUnit, secondValue, secondUnit, measurementType) {
    const res = await fetch(`${API_BASE}/quantitymeasurement/add`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({ firstValue, firstUnit, secondValue, secondUnit, operation: 'ADD', measurementType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errorMessage || 'Add failed');
    return data;
  },

  async subtract(firstValue, firstUnit, secondValue, secondUnit, measurementType) {
    const res = await fetch(`${API_BASE}/quantitymeasurement/subtract`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({ firstValue, firstUnit, secondValue, secondUnit, operation: 'SUBTRACT', measurementType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errorMessage || 'Subtract failed');
    return data;
  },

  async divide(firstValue, firstUnit, secondValue, secondUnit, measurementType) {
    const res = await fetch(`${API_BASE}/quantitymeasurement/divide`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({ firstValue, firstUnit, secondValue, secondUnit, operation: 'DIVIDE', measurementType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errorMessage || 'Divide failed');
    return data;
  },

  async getHistory(operation = '', measurementType = '', page = 1, pageSize = 20) {
    const params = new URLSearchParams({ page, pageSize });
    if (operation) params.append('operation', operation);
    if (measurementType) params.append('measurementType', measurementType);
    const res = await fetch(`${API_BASE}/quantitymeasurement/history?${params}`, {
      headers: this._headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
    return data;
  },

  async clearHistory() {
    const res = await fetch(`${API_BASE}/quantitymeasurement/history`, {
      method: 'DELETE',
      headers: this._headers()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear history');
    return data;
  }
};
