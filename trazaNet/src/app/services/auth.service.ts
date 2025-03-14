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
  private readonly API_URL = 'http://localhost:3001/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkInitialAuthState());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    if (!this.isLoggedIn()) {
      this.router.navigate(['']);
    }
  }

  private checkInitialAuthState(): boolean {
    try {
      return !!localStorage.getItem('token');
    } catch {
      return false;
    }
  }

  async register(userData: UserData): Promise<void> {
    try {
      const response = await this.http.post<AuthResponse>(`${this.API_URL}/register`, userData).toPromise();
      if (response) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
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

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      console.warn('No se pudo limpiar el estado de la sesión');
    }
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
} 