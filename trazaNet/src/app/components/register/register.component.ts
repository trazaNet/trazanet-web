import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { AuthAnimationService } from '../../services/auth-animation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ThemeSwitchComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  fullName: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private authAnimationService: AuthAnimationService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // Aquí iría la lógica de registro
    console.log('Registro:', { fullName: this.fullName, email: this.email, username: this.username });
  }

  registerWithGoogle() {
    // Aquí iría la lógica de registro con Google
    console.log('Registro con Google');
    this.errorMessage = 'El registro con Google estará disponible próximamente';
  }

  togglePanel(showRegister: boolean) {
    this.authAnimationService.togglePanel(showRegister);
  }
} 