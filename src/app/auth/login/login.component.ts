import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-wrapper">
        <div class="auth-left">
          <div class="auth-brand">
            <div class="auth-icon">📏</div>
            <h1>Quantity<br/>Measurement</h1>
            <p>Convert, compare and calculate across Length, Volume, Weight & Temperature with precision.</p>
          </div>
          <div class="auth-features">
            <div class="auth-feature">
              <span class="feature-icon">📐</span>
              <span>Length 📏 Feet, Inches, Yards, Centimeters</span>
            </div>
            <div class="auth-feature">
              <span class="feature-icon">🥤</span>
              <span>Volume 🥤 Litre, Millilitre, Gallon</span>
            </div>
            <div class="auth-feature">
              <span class="feature-icon">⚖️</span>
              <span>Weight ⚖️ Kilogram, Gram, Pound</span>
            </div>
            <div class="auth-feature">
              <span class="feature-icon">🌡️</span>
              <span>Temperature 🌡️ Celsius, Fahrenheit</span>
            </div>
          </div>
        </div>

        <div class="auth-right">
          <div class="auth-card">
            <div class="auth-header">
              <h2>Welcome Back</h2>
              <p>Please sign in to your account</p>
            </div>
            
            <div *ngIf="error" class="alert-error">{{ error }}</div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <div class="input-wrapper">
                  <span class="input-icon">@</span>
                  <input type="email" class="glass-input" formControlName="email" placeholder="name@example.com">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input type="password" class="glass-input" formControlName="password" placeholder="••••••••">
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-full" [disabled]="loginForm.invalid || isLoading">
                <span class="spinner" [class.show]="isLoading"></span>
                {{ isLoading ? 'Signing In...' : 'Sign In' }}
              </button>
            </form>
            
            <div class="auth-divider">
              <span>or</span>
            </div>
            
            <button class="btn btn-google btn-full">
              <svg class="google-icon" width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <p class="auth-switch">Don't have an account? <a routerLink="/register">Create one</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: var(--bg-gradient);
    }
    .auth-wrapper {
      display: flex;
      min-height: 100vh;
    }
    .auth-left {
      flex: 1;
      background: linear-gradient(145deg, #1a1a3e 0%, #0f0f1a 60%, #1a0a2e 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 50px;
      position: relative;
      overflow: hidden;
    }
    .auth-left::before {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%);
      top: -100px;
      left: -100px;
      border-radius: 50%;
    }
    .auth-left::after {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%);
      bottom: -50px;
      right: -50px;
      border-radius: 50%;
    }
    .auth-brand {
      margin-bottom: 48px;
      position: relative;
      z-index: 1;
    }
    .auth-icon {
      font-size: 52px;
      margin-bottom: 16px;
      display: block;
    }
    .auth-brand h1 {
      font-size: 42px;
      font-weight: 800;
      line-height: 1.15;
      background: linear-gradient(135deg, #fff 0%, #a89cff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
    }
    .auth-brand p {
      color: var(--text-muted);
      font-size: 16px;
      line-height: 1.6;
      max-width: 340px;
    }
    .auth-features {
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
      z-index: 1;
    }
    .auth-feature {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
      font-size: 14px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      transition: all 0.2s;
    }
    .auth-feature:hover {
      background: rgba(108,99,255,0.1);
      border-color: rgba(108,99,255,0.3);
      color: var(--text);
    }
    .auth-feature .feature-icon { font-size: 18px; }
    .auth-right {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 32px;
      background: var(--bg);
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      background: rgba(26, 26, 46, 0.9);
      border: 1px solid rgba(108, 99, 255, 0.2);
      border-radius: 24px;
      padding: 40px;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-header h2 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 6px;
      background: linear-gradient(135deg, #6c63ff, #a8a4ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .auth-header p {
      color: var(--text-muted);
      font-size: 14px;
    }
    .input-wrapper {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      opacity: 0.6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: var(--text-muted);
    }
    .input-wrapper .glass-input {
      padding-left: 48px;
    }
    .auth-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
      font-size: 12px;
      margin: 20px 0;
    }
    .auth-divider::before,
    .auth-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--glass-border);
    }
    .auth-switch {
      text-align: center;
      margin-top: 20px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .auth-switch a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    .auth-switch a:hover { text-decoration: underline; }
    .btn-full {
      width: 100%;
    }
    .btn-google {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      background: #ffffff;
      color: #3c4043;
      border: 1px solid #dadce0;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      width: 100%;
    }
    .btn-google:hover {
      background: #f8f9fa;
      border-color: #dadce0;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .google-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .spinner.show {
      opacity: 1;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
      .auth-wrapper { flex-direction: column; }
      .auth-left { 
        padding: 40px 24px; 
        order: 2;
      }
      .auth-left .auth-features { display: none; }
      .auth-right { 
        width: 100%; 
        padding: 32px 20px;
        order: 1;
      }
      .auth-brand h1 { font-size: 32px; }
      .auth-card { padding: 30px 20px; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.testApiConnectivity();
  }

  testApiConnectivity(): void {
    console.log('Testing API connectivity...');
    // Test if the backend API is reachable
    fetch(`${environment.apiUrl}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    }).then(response => {
      console.log('API connectivity test response:', response.status, response.statusText);
      if (response.status === 0) {
        console.error('Backend server is not running or not accessible');
      }
    }).catch(error => {
      console.error('API connectivity test failed:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Backend server appears to be down or CORS issues');
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.isLoading = true;
    this.error = '';

    const loginData = this.loginForm.value;
    console.log('Login form data:', loginData);

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;
        
        // Extract detailed error information
        let errorMessage = 'Login failed. Please try again.';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.error) {
            errorMessage = err.error.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error = errorMessage;
        console.log('Login error message:', this.error);
      }
    });
  }
}
