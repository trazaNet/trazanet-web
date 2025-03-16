import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';

interface UserData {
  dicose: string;
  email: string;
  phone: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeSwitchComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  dicose: string = '';
  phone: string = '';
  isRegistering: boolean = false;
  errorMessage = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Si ya está autenticado, redirigir a inicio
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/inicio']);
    }
  }

  togglePanel(register: boolean) {
    this.isRegistering = register;
    // Limpiar campos y mensajes de error al cambiar de panel
    this.email = '';
    this.password = '';
    this.dicose = '';
    this.phone = '';
    this.errorMessage = '';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.isRegistering) {
      const userData: UserData = {
        email: this.email,
        password: this.password,
        dicose: this.dicose,
        phone: this.phone
      };

      this.authService.register(userData).then(() => {
        console.log('Registro exitoso');
        this.router.navigate(['/inicio']);
      }).catch(error => {
        console.error('Error en el registro:', error);
        this.errorMessage = error.message || 'Ha ocurrido un error en el registro';
      });
    } else {
      // Login directo para pruebas
      if (this.email === 'dev123' && this.password === 'dev123') {
        console.log('Login exitoso con credenciales de prueba');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('auth_token', 'test_token');
        localStorage.setItem('user_data', JSON.stringify({
          email: 'dev123',
          role: 'admin'
        }));
        this.authService['isAuthenticatedSubject'].next(true);
        this.router.navigate(['/inicio']);
        return;
      }

      // Si no son las credenciales de prueba, usar el servicio de auth
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          console.log('Login exitoso');
          this.router.navigate(['/inicio']);
        },
        error: (error) => {
          console.error('Error en el login:', error);
          this.errorMessage = error.message || 'Ha ocurrido un error en el login';
        }
      });
    }
  }
} 