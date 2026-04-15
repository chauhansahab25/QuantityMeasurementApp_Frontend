// ── Helpers ──────────────────────────────────────────────────────────────────
function showAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
}

function hideAlert(id) {
  document.getElementById(id).className = 'alert';
}

function setLoading(btnId, spinnerId, loading) {
  const btn = document.getElementById(btnId);
  const sp = document.getElementById(spinnerId);
  btn.disabled = loading;
  sp.className = loading ? 'spinner show' : 'spinner';
}

// ── Mode switching ────────────────────────────────────────────────────────────
function showLoginForm() {
  document.getElementById('choice-screen').style.display = 'none';
  document.getElementById('login-form-section').style.display = 'block';
  document.getElementById('register-form-section').style.display = 'none';
}

function showRegisterForm() {
  document.getElementById('login-form-section').style.display = 'none';
  document.getElementById('register-form-section').style.display = 'block';
}

function showChoiceScreen() {
  document.getElementById('choice-screen').style.display = 'flex';
  document.getElementById('login-form-section').style.display = 'none';
  document.getElementById('register-form-section').style.display = 'none';
}

// ── Guest ─────────────────────────────────────────────────────────────────────
function continueAsGuest() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.setItem('mode', 'guest');
  window.location.href = 'dashboard.html';
}

// ── Google Auth ───────────────────────────────────────────────────────────────
async function loginWithGoogle() {
  try {
    setLoading('login-btn', 'login-spinner', true);
    const data = await api.getGoogleLoginUrl();
    // Store the current page to return after OAuth
    sessionStorage.setItem('google_auth_redirect', window.location.href);
    // Redirect to Google OAuth
    window.location.href = data.loginUrl;
  } catch (err) {
    showAlert('login-alert', err.message);
    setLoading('login-btn', 'login-spinner', false);
  }
}

// Handle Google OAuth callback
async function handleGoogleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    showAlert('login-alert', `Google authentication failed: ${error}`);
    return;
  }

  if (code) {
    try {
      setLoading('login-btn', 'login-spinner', true);
      const data = await api.handleGoogleCallback(code);
      
      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('mode', 'authenticated');
      
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    } catch (err) {
      showAlert('login-alert', err.message);
      setLoading('login-btn', 'login-spinner', false);
    }
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  hideAlert('login-alert');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  setLoading('login-btn', 'login-spinner', true);
  try {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('mode', 'authenticated');
    window.location.href = 'dashboard.html';
  } catch (err) {
    showAlert('login-alert', err.message);
  } finally {
    setLoading('login-btn', 'login-spinner', false);
  }
}

// ── Register ──────────────────────────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  hideAlert('register-alert');
  const firstName = document.getElementById('reg-firstname').value.trim();
  const lastName = document.getElementById('reg-lastname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  if (password !== confirm) {
    showAlert('register-alert', 'Passwords do not match');
    return;
  }
  if (password.length < 6) {
    showAlert('register-alert', 'Password must be at least 6 characters');
    return;
  }

  setLoading('register-btn', 'register-spinner', true);
  try {
    const data = await api.register(firstName, lastName, email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('mode', 'authenticated');
    window.location.href = 'dashboard.html';
  } catch (err) {
    showAlert('register-alert', err.message);
  } finally {
    setLoading('register-btn', 'register-spinner', false);
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Check for Google OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code') || urlParams.has('error')) {
    handleGoogleCallback();
    return;
  }

  // Check if already authenticated
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
    return;
  }
  
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
});
