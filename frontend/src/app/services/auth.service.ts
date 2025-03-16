import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface UserData {
  dicose: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: number;
    dicose: string;
    email: string;
    phone: string;
  };
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/api';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getCurrentUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          localStorage.setItem('isAuthenticated', 'true');
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('isAuthenticated');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  async register(userData: UserData): Promise<void> {
    try {
      const response = await this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData).toPromise();
      if (response) {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        localStorage.setItem('isAuthenticated', 'true');
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  }

  async googleSignIn(): Promise<void> {
    // Implementar cuando se tenga la autenticación con Google
    throw new Error('La autenticación con Google estará disponible próximamente');
  }
} 