import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'token';
  private userKey = 'user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.checkAuthStatus();
    console.log('API URL:', this.apiUrl);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  register(userData: Omit<User, 'id' | 'role'>): Observable<AuthResponse> {
    console.log('Intentando registrar usuario:', userData);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap((response: AuthResponse) => {
          console.log('Respuesta del registro:', response);
          if (response.token) {
            this.setAuthData(response);
            this.router.navigate(['/login']);
          }
        }),
        catchError(this.handleError)
      );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    console.log('Intentando iniciar sesión:', credentials);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          console.log('Respuesta del login:', response);
          if (response.token) {
            this.setAuthData(response);
            this.router.navigate(['/inicio']);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('isAuthenticated');
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    return !!token && isAuthenticated;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.is_admin === true;
  }

  googleSignIn(): Observable<AuthResponse> {
    // Por ahora, devolvemos un Observable que emite un error
    return throwError(() => new Error('La autenticación con Google estará disponible próximamente'));
  }

  private checkAuthStatus() {
    const token = this.getToken();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const user = this.getCurrentUser();
    
    if (token && isAuthenticated && user) {
      this.isAuthenticatedSubject.next(true);
      this.userSubject.next(user);
    } else {
      this.logout();
    }
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    localStorage.setItem('isAuthenticated', 'true');
    this.isAuthenticatedSubject.next(true);
    this.userSubject.next(response.user);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error en el inicio de sesión';
    if (error.status === 401) {
      errorMessage = 'Usuario o contraseña incorrectos';
    } else if (error.status === 404) {
      errorMessage = 'Usuario no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }

  private checkToken() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
          this.userSubject.next(decodedToken);
        } else {
          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    }
  }
} 