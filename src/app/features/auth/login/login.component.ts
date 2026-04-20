import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  screen: 'choice' | 'login' | 'register' = 'choice';

  loginForm: FormGroup;
  registerForm: FormGroup;

  loginLoading = false;
  registerLoading = false;
  googleLoading = false;

  loginError = '';
  registerError = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    // Redirect if already authenticated
    if (this.auth.isAuthenticated || this.auth.isGuest) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      confirm:   ['', Validators.required],
    });
  }

  continueAsGuest(): void {
    this.auth.continueAsGuest();
  }

  onLogin(): void {
    this.loginError = '';
    if (this.loginForm.invalid) return;
    this.loginLoading = true;
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loginError = err.error?.error || err.message || 'Login failed';
        this.loginLoading = false;
      },
    });
  }

  onRegister(): void {
    this.registerError = '';
    const { firstName, lastName, email, password, confirm } = this.registerForm.value;
    if (password !== confirm) { this.registerError = 'Passwords do not match'; return; }
    if (this.registerForm.invalid) return;
    this.registerLoading = true;
    this.auth.register(firstName, lastName, email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.registerError = err.error?.error || err.message || 'Registration failed';
        this.registerLoading = false;
      },
    });
  }

  loginWithGoogle(): void {
    this.googleLoading = true;
    this.auth.getGoogleLoginUrl().subscribe({
      next: (res) => { window.location.href = res.loginUrl; },
      error: (err) => {
        this.loginError = err.error?.error || 'Failed to get Google login URL';
        this.googleLoading = false;
      },
    });
  }
}
