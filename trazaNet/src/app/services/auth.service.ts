import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkInitialAuthState());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {
    // Verificar el estado de autenticación al iniciar
    if (!this.isLoggedIn()) {
      this.router.navigate(['']);
    }
  }

  private checkInitialAuthState(): boolean {
    try {
      return localStorage.getItem('isLoggedIn') === 'true';
    } catch {
      return false;
    }
  }

  login(username: string, password: string): boolean {
    if (username === this.CREDENTIALS.username && password === this.CREDENTIALS.password) {
      try {
        localStorage.setItem('isLoggedIn', 'true');
        this.isAuthenticatedSubject.next(true);
        return true;
      } catch {
        console.warn('No se pudo guardar el estado de la sesión');
        this.isAuthenticatedSubject.next(true);
        return true;
      }
    }
    return false;
  }

  logout() {
    try {
      localStorage.removeItem('isLoggedIn');
    } catch {
      console.warn('No se pudo limpiar el estado de la sesión');
    }
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
} 