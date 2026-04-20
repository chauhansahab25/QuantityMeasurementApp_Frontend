import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() showHistory = true;
  @Input() showDashboard = false;

  userLabel = '';
  userAvatar = '';
  isGoogle = false;

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    try {
      const mode = localStorage.getItem('mode');
      if (mode === 'guest') {
        this.userLabel = '👤 Guest';
        return;
      }
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      if (u) {
        this.userLabel = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        this.userAvatar = u.profilePictureUrl || '';
        this.isGoogle = !!u.googleId;
      }
    } catch { /* noop */ }
  }

  logout(): void { this.auth.logout(); }
}
