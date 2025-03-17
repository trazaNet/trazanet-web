import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { AuthAnimationService } from '../../services/auth-animation.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ThemeSwitchComponent,
    ToastrModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  dicose: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';
  registerForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private authAnimationService: AuthAnimationService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      name: ['', Validators.required],
      lastName: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  get f() { return this.registerForm.controls; }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const { confirmPassword, ...userData } = this.registerForm.value;
    
    this.authService.register(userData).subscribe({
      next: () => {
        this.toastr.success('Registro exitoso', 'Bienvenido');
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        this.toastr.error(error.message || 'Error en el registro', 'Error');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  registerWithGoogle() {
    this.authService.googleSignIn().subscribe({
      next: () => {
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al registrar con Google';
      }
    });
  }

  togglePanel(isSignUp: boolean) {
    this.authAnimationService.togglePanel(isSignUp);
  }
} 