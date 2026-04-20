import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.storedUser());
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private storedUser(): User | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }

  get token(): string | null { return localStorage.getItem('token'); }
  get isAuthenticated(): boolean { return !!this.token && localStorage.getItem('mode') === 'authenticated'; }
  get isGuest(): boolean { return localStorage.getItem('mode') === 'guest'; }
  get currentUser(): User | null { return this.userSubject.value; }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  register(firstName: string, lastName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`,
      { firstName, lastName, email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  getGoogleLoginUrl(): Observable<{ loginUrl: string }> {
    return this.http.get<{ loginUrl: string }>(`${environment.apiUrl}/auth/google/login`);
  }

  handleGoogleCallback(code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google/callback`, { code })
      .pipe(tap(res => this.saveSession(res)));
  }

  continueAsGuest(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('mode', 'guest');
    this.userSubject.next(null);
    this.router.navigate(['/dashboard']);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('mode', 'authenticated');
    this.userSubject.next(res.user);
  }

  logout(): void {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
