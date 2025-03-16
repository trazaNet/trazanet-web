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
  private apiUrl = environment.production ? '/api' : 'http://localhost:3001/api';
  private tokenKey = 'token';
  private userKey = 'user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.checkAuthStatus();
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

  async register(userData: UserData): Promise<void> {
    try {
      const response = await this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
        .pipe(
          catchError(this.handleError)
        )
        .toPromise();

      if (response?.token && response?.user) {
        this.setAuthData(response);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('Error en el registro:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 400) {
          throw new Error(error.error?.message || 'Error en los datos proporcionados');
        } else if (error.status === 409) {
          throw new Error('El usuario ya existe');
        } else if (error.status === 0) {
          throw new Error('No se pudo conectar con el servidor');
        }
      }
      throw new Error('Error en el registro. Por favor, intente nuevamente');
    }
  }

  async login(credentials: { email: string; password: string }): Promise<void> {
    try {
      const response = await this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
        .pipe(
          catchError(this.handleError)
        )
        .toPromise();

      if (response?.token && response?.user) {
        this.setAuthData(response);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('Error en el login:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          throw new Error('Credenciales inválidas');
        } else if (error.status === 0) {
          throw new Error('No se pudo conectar con el servidor');
        }
      }
      throw new Error('Error en el inicio de sesión. Por favor, intente nuevamente');
    }
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

  async googleSignIn(): Promise<void> {
    // Implementar cuando se tenga la autenticación con Google
    throw new Error('La autenticación con Google estará disponible próximamente');
  }

  private checkAuthStatus() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    localStorage.setItem('isAuthenticated', 'true');
    this.isAuthenticatedSubject.next(true);
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