import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="app-container">
      <nav class="glass-navbar">
        <div class="nav-brand">
          <span class="icon">📏</span>
          <span class="title">QuantityMeasurement</span>
        </div>
        <div class="nav-links">
          <a routerLink="/dashboard" *ngIf="isLoggedIn" routerLinkActive="active">Dashboard</a>
          <span *ngIf="isLoggedIn && userName" class="user-name">{{ userName }}</span>
          <button *ngIf="isLoggedIn" (click)="logout()" class="glass-button-sm">Logout</button>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .glass-navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--glass-border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--text-primary);
    }
    .glass-button-sm {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.4rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .glass-button-sm:hover {
      background: rgba(239, 68, 68, 0.4);
      color: #fff;
    }
    .user-name {
      color: var(--accent-color);
      font-weight: 600;
      padding: 0.4rem 1rem;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 20px;
      font-size: 0.875rem;
    }
    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
  `]
})
export class LayoutComponent {
  isLoggedIn = false;
  userName = '';

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoggedIn = this.authService.isLoggedIn();
      this.userName = this.getUserName();
    });
  }

  getUserName(): string {
    const user = this.authService.currentUserValue;
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return '';
  }

  logout() {
    // Clear local session immediately
    this.authService.localLogout();
    
    // Update UI state immediately
    this.isLoggedIn = false;
    this.userName = '';
    
    // Navigate to home page
    this.router.navigate(['/']);
    
    // Try to call backend logout in background (optional)
    this.authService.logout().subscribe({
      error: () => {
        // Ignore backend logout errors
        console.log('Backend logout failed, but local logout was successful');
      }
    });
  }
}
