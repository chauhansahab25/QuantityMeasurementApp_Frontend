import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegisterUserRequest, LoginRequest, AuthResponse, UserInfo } from '../models/dto.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUserValue(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  register(data: RegisterUserRequest): Observable<AuthResponse> {
    console.log('Register API call:', `${this.apiUrl}/register`, data);
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        console.log('Register response:', response);
        this.handleAuthResponse(response);
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    console.log('Login API call:', `${this.apiUrl}/login`, data);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        console.log('Login response:', response);
        this.handleAuthResponse(response);
      })
    );
  }

  logout(): Observable<any> {
    // Clear session immediately
    this.clearSession();
    
    // Try to call backend logout, but don't fail if it doesn't work
    console.log('Logout API call:', `${this.apiUrl}/logout`);
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  private handleAuthResponse(response: AuthResponse) {
    console.log('Handling auth response:', response);
    if (response && response.token) {
      console.log('Storing auth data');
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    } else {
      console.error('Invalid auth response:', response);
    }
  }

  private clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  // Local logout that doesn't require API call
  localLogout() {
    this.clearSession();
  }
}
