import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface UserData {
  dicose: string;
  email: string;
  phone: string;
  password: string;
  name?: string;
  lastName?: string;
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
  private apiUrl = environment.production 
    ? 'https://trazanet-production.up.railway.app/api'
    : environment.apiUrl;
  private tokenKey = 'token';
  private userKey = 'user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.checkAuthStatus();
    console.log('API URL:', this.apiUrl); // Para debugging
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

  register(userData: UserData): Observable<AuthResponse> {
    console.log('Intentando registrar usuario:', userData);
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap((response: AuthResponse) => {
          console.log('Respuesta del registro:', response);
          if (response.token) {
            this.setAuthData(response);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Error en el registro';
          if (error.status === 409) {
            errorMessage = 'El email ya está registrado';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos de registro inválidos';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    console.log('Intentando iniciar sesión:', credentials);
    console.log('URL de login:', `${this.apiUrl}/auth/login`); // Para debugging
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          console.log('Respuesta del login:', response);
          if (response.token) {
            this.setAuthData(response);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Error en el inicio de sesión';
          if (error.status === 401) {
            errorMessage = 'Usuario o contraseña incorrectos';
          } else if (error.status === 404) {
            errorMessage = 'Usuario no encontrado';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor';
          }
          return throwError(() => new Error(errorMessage));
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

  googleSignIn(): Observable<AuthResponse> {
    // Por ahora, devolvemos un Observable que emite un error
    return throwError(() => new Error('La autenticación con Google estará disponible próximamente'));
  }

  private checkAuthStatus() {
    const token = this.getToken();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    this.isAuthenticatedSubject.next(!!token && isAuthenticated);
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    localStorage.setItem('isAuthenticated', 'true');
    this.isAuthenticatedSubject.next(true);
    this.router.navigate(['/inicio']);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = error.error.message;
    } else {
      // Error del lado del servidor
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }
    return throwError(() => new Error(errorMessage));
  }
} 