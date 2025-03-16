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

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    try {
      await this.authService.login({ email: this.email, password: this.password });
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión';
    }
  }
} 