import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

interface UserData {
  dicose: string;
  email: string;
  phone: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeSwitchComponent, ToastrModule],
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
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
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
    if (!this.email || !this.password) {
      this.toastr.warning('Por favor complete todos los campos', 'Campos requeridos');
      return;
    }

    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
        // La navegación ahora se maneja en el servicio de autenticación
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error en el login:', error);
        let errorMessage = 'Error al iniciar sesión';
        
        if (error.status === 401) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.toastr.error(errorMessage, 'Error');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
} 