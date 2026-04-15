// ── Unit definitions ──────────────────────────────────────────────────────────
const UNITS = {
  LengthUnit:      ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  VolumeUnit:      ['LITRE', 'MILLILITRE', 'GALLON'],
  WeightUnit:      ['KILOGRAM', 'GRAM', 'POUND'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT']
};

const TYPE_LABELS = {
  LengthUnit: 'Length',
  VolumeUnit: 'Volume',
  WeightUnit: 'Weight',
  TemperatureUnit: 'Temperature'
};

const TYPE_ICONS = {
  LengthUnit: '📏',
  VolumeUnit: '🧪',
  WeightUnit: '⚖️',
  TemperatureUnit: '🌡️'
};

// ── State ─────────────────────────────────────────────────────────────────────
let currentType = 'LengthUnit';
let currentOp = 'convert';
let isGuest = false;

// ── Helpers ───────────────────────────────────────────────────────────────────
function populateSelect(id, units) {
  const sel = document.getElementById(id);
  sel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
}

function showResult(text, isError = false) {
  const box = document.getElementById('result-box');
  const val = document.getElementById('result-value');
  box.className = `result-box show${isError ? ' error-result' : ''}`;
  val.textContent = text;
}

function hideResult() {
  document.getElementById('result-box').className = 'result-box';
}

function setLoading(loading) {
  const btn = document.getElementById('calc-btn');
  const sp = document.getElementById('calc-spinner');
  btn.disabled = loading;
  sp.className = loading ? 'spinner show' : 'spinner';
}

// ── UI builders ───────────────────────────────────────────────────────────────
function buildTypeSelector() {
  const container = document.getElementById('type-selector');
  container.innerHTML = Object.keys(UNITS).map(type => `
    <button class="type-btn ${type === currentType ? 'active' : ''}" onclick="selectType('${type}')">
      <span>${TYPE_ICONS[type]}</span>
      <span>${TYPE_LABELS[type]}</span>
    </button>
  `).join('');
}

function buildOpSelector() {
  const ops = [
    { id: 'convert',  label: 'Convert',  icon: '🔄' },
    { id: 'compare',  label: 'Compare',  icon: '⚖️' },
    { id: 'add',      label: 'Add',      icon: '➕' },
    { id: 'subtract', label: 'Subtract', icon: '➖' },
    { id: 'divide',   label: 'Divide',   icon: '➗' }
  ];
  const container = document.getElementById('op-selector');
  container.innerHTML = ops.map(op => `
    <button class="op-btn ${op.id === currentOp ? 'active' : ''}" onclick="selectOp('${op.id}')">
      ${op.icon} ${op.label}
    </button>
  `).join('');
}

function buildForm() {
  const units = UNITS[currentType];
  const isSingle = currentOp === 'convert';
  const form = document.getElementById('calc-form-body');

  const secondInputs = isSingle ? '' : `
    <div class="form-row">
      <div class="form-group">
        <label>Second Value</label>
        <input type="number" id="second-value" step="any" placeholder="0" required />
      </div>
      <div class="form-group">
        <label>Second Unit</label>
        <select id="second-unit"></select>
      </div>
    </div>
  `;

  const targetRow = isSingle ? `
    <div class="form-group">
      <label>Convert To</label>
      <select id="target-unit"></select>
    </div>
  ` : '';

  form.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>First Value</label>
        <input type="number" id="first-value" step="any" placeholder="0" required />
      </div>
      <div class="form-group">
        <label>First Unit</label>
        <select id="first-unit"></select>
      </div>
    </div>
    ${secondInputs}
    ${targetRow}
  `;

  populateSelect('first-unit', units);
  if (!isSingle) populateSelect('second-unit', units);
  if (isSingle) populateSelect('target-unit', units);

  hideResult();
}

// ── Selection handlers ────────────────────────────────────────────────────────
function selectType(type) {
  currentType = type;
  buildTypeSelector();
  buildForm();
}

function selectOp(op) {
  currentOp = op;
  buildOpSelector();
  buildForm();
}

// ── Calculate ─────────────────────────────────────────────────────────────────
async function calculate(e) {
  e.preventDefault();
  hideResult();

  const firstValue = parseFloat(document.getElementById('first-value').value);
  const firstUnit = document.getElementById('first-unit').value;

  if (isNaN(firstValue)) {
    showResult('Please enter a valid first value', true);
    return;
  }

  // Guest mode: local calculation
  if (isGuest) {
    const result = localCalculate(firstValue, firstUnit);
    if (result !== null) showResult(result);
    return;
  }

  setLoading(true);
  try {
    let data;
    if (currentOp === 'convert') {
      const targetUnit = document.getElementById('target-unit').value;
      data = await api.convert(firstValue, firstUnit, currentType, targetUnit);
    } else {
      const secondValue = parseFloat(document.getElementById('second-value').value);
      const secondUnit = document.getElementById('second-unit').value;
      if (isNaN(secondValue)) { showResult('Please enter a valid second value', true); return; }
      data = await api[currentOp](firstValue, firstUnit, secondValue, secondUnit, currentType);
    }

    if (data.isError) showResult(data.errorMessage, true);
    else showResult(data.resultString || String(data.result));
  } catch (err) {
    showResult(err.message, true);
  } finally {
    setLoading(false);
  }
}

// ── Guest local calculations ──────────────────────────────────────────────────
function toBase(value, unit, type) {
  const factors = {
    LengthUnit:      { FEET: 0.3048, INCHES: 0.0254, YARDS: 0.9144, CENTIMETERS: 0.01 },
    VolumeUnit:      { LITRE: 1, MILLILITRE: 0.001, GALLON: 3.78541 },
    WeightUnit:      { KILOGRAM: 1, GRAM: 0.001, POUND: 0.453592 },
    TemperatureUnit: null
  };
  if (type === 'TemperatureUnit') {
    return unit === 'CELSIUS' ? value : (value - 32) * 5 / 9;
  }
  return value * factors[type][unit];
}

function fromBase(value, unit, type) {
  const factors = {
    LengthUnit:      { FEET: 0.3048, INCHES: 0.0254, YARDS: 0.9144, CENTIMETERS: 0.01 },
    VolumeUnit:      { LITRE: 1, MILLILITRE: 0.001, GALLON: 3.78541 },
    WeightUnit:      { KILOGRAM: 1, GRAM: 0.001, POUND: 0.453592 },
    TemperatureUnit: null
  };
  if (type === 'TemperatureUnit') {
    return unit === 'CELSIUS' ? value : value * 9 / 5 + 32;
  }
  return value / factors[type][unit];
}

function localCalculate(firstValue, firstUnit) {
  const type = currentType;

  if (currentOp === 'convert') {
    const targetUnit = document.getElementById('target-unit').value;
    const base = toBase(firstValue, firstUnit, type);
    const result = fromBase(base, targetUnit, type);
    return `${firstValue} ${firstUnit} = ${+result.toFixed(6)} ${targetUnit}`;
  }

  const secondValue = parseFloat(document.getElementById('second-value').value);
  const secondUnit = document.getElementById('second-unit').value;
  if (isNaN(secondValue)) { showResult('Please enter a valid second value', true); return null; }

  const base1 = toBase(firstValue, firstUnit, type);
  const base2 = toBase(secondValue, secondUnit, type);

  if (currentOp === 'compare') {
    return Math.abs(base1 - base2) < 1e-9 ? 'Equal ✅' : 'Not Equal ❌';
  }
  if (currentOp === 'add') {
    const sum = fromBase(base1 + base2, firstUnit, type);
    return `${firstValue} ${firstUnit} + ${secondValue} ${secondUnit} = ${+sum.toFixed(6)} ${firstUnit}`;
  }
  if (currentOp === 'subtract') {
    const diff = fromBase(base1 - base2, firstUnit, type);
    return `${firstValue} ${firstUnit} - ${secondValue} ${secondUnit} = ${+diff.toFixed(6)} ${firstUnit}`;
  }
  if (currentOp === 'divide') {
    if (base2 === 0) { showResult('Cannot divide by zero', true); return null; }
    const quot = base1 / base2;
    return `${firstValue} ${firstUnit} ÷ ${secondValue} ${secondUnit} = ${+quot.toFixed(6)}`;
  }
  return null;
}

// ── Logout ────────────────────────────────────────────────────────────────────
function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const mode = localStorage.getItem('mode');
  if (!mode) { window.location.href = 'index.html'; return; }

  isGuest = mode === 'guest';

  // User info in header
  const userInfoEl = document.getElementById('user-info');
  if (isGuest) {
    userInfoEl.textContent = '👤 Guest';
    document.getElementById('guest-banner').style.display = 'flex';
  } else {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    
    // Show profile picture if available
    if (user.profilePictureUrl) {
      userInfoEl.innerHTML = `
        <img src="${user.profilePictureUrl}" alt="Profile" class="user-avatar" />
        <span class="user-name">${displayName}</span>
        ${user.googleId ? '<span class="auth-badge">G</span>' : ''}
      `;
    } else {
      userInfoEl.innerHTML = `
        <span>👤 ${displayName}</span>
        ${user.googleId ? '<span class="auth-badge">G</span>' : ''}
      `;
    }
  }

  buildTypeSelector();
  buildOpSelector();
  buildForm();

  document.getElementById('calc-form').addEventListener('submit', calculate);
});
