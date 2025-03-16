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
  dicose: string = '';
  email: string = '';
  phone: string = '';
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

  async onSubmit() {
    try {
      const userData = {
        dicose: this.dicose,
        email: this.email,
        phone: this.phone,
        password: this.password
      };

      await this.authService.register(userData);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al registrar usuario';
    }
  }

  async registerWithGoogle() {
    try {
      await this.authService.googleSignIn();
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al registrar con Google';
    }
  }

  togglePanel(isSignUp: boolean) {
    this.authAnimationService.togglePanel(isSignUp);
  }
} 