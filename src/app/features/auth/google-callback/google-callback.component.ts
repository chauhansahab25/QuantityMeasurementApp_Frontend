import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-google-callback',
  templateUrl: './google-callback.component.html',
  styleUrls: ['./google-callback.component.scss'],
})
export class GoogleCallbackComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  errorMessage = '';
  userName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const code  = this.route.snapshot.queryParamMap.get('code');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      this.status = 'error';
      this.errorMessage = `Authentication failed: ${error}`;
      return;
    }

    if (!code) {
      this.status = 'error';
      this.errorMessage = 'No authorization code received from Google.';
      return;
    }

    this.auth.handleGoogleCallback(code).subscribe({
      next: (res) => {
        this.userName = `${res.user.firstName} ${res.user.lastName}`;
        this.status = 'success';
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        this.status = 'error';
        this.errorMessage = err.error?.error || err.message || 'Authentication failed';
      },
    });
  }
}
