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
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkInitialAuthState());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Solo redirigir si no estamos ya en la página de login
    if (!this.isLoggedIn() && !window.location.pathname.includes('login')) {
      this.router.navigate(['']);
    }
  }

  private checkInitialAuthState(): boolean {
    try {
      const token = localStorage.getItem('token');
      return !!token && token !== 'undefined' && token !== 'null';
    } catch {
      return false;
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error en la autenticación';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Error de conexión
      errorMessage = 'No se puede conectar con el servidor. Por favor, verifica tu conexión a internet o que el servidor esté corriendo.';
    } else {
      // Error del servidor
      errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
    }
    
    console.error('Error de autenticación:', error);
    return throwError(() => new Error(errorMessage));
  }

  async register(userData: UserData): Promise<void> {
    try {
      const response = await this.http.post<AuthResponse>(
        `${this.API_URL}/register`, 
        userData
      ).pipe(
        catchError(error => this.handleError(error))
      ).toPromise();

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

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(error => this.handleError(error))
      );
  }

  logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('No se pudo limpiar el estado de la sesión:', error);
    }
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  }

  getCurrentUser(): any {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      return null;
    }
  }
} 