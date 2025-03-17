import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { AuthAnimationService } from '../../services/auth-animation.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

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

  togglePanel(isSignUp: boolean) {
    if (!isSignUp) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      if (this.f['email'].errors?.['required']) {
        this.toastr.warning('El email es requerido', 'Campo requerido');
      } else if (this.f['email'].errors?.['email']) {
        this.toastr.warning('El email no es válido', 'Formato inválido');
      }
      
      if (this.f['password'].errors?.['required']) {
        this.toastr.warning('La contraseña es requerida', 'Campo requerido');
      } else if (this.f['password'].errors?.['minlength']) {
        this.toastr.warning('La contraseña debe tener al menos 6 caracteres', 'Contraseña muy corta');
      }

      if (this.registerForm.errors?.['mismatch']) {
        this.toastr.warning('Las contraseñas no coinciden', 'Error de validación');
      }

      return;
    }

    this.loading = true;
    const { confirmPassword, ...userData } = this.registerForm.value;
    
    console.log('Intentando registrar con:', userData);
    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.toastr.success('Registro exitoso', 'Bienvenido');
        // La navegación ahora se maneja en el servicio de autenticación
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error en el registro:', error);
        let errorMessage = 'Error en el registro';
        
        if (error.status === 409) {
          errorMessage = 'El email ya está registrado';
        } else if (error.status === 400) {
          errorMessage = 'Datos de registro inválidos';
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

  registerWithGoogle() {
    this.authService.googleSignIn().subscribe({
      next: (response) => {
        this.toastr.success('Registro con Google exitoso', 'Bienvenido');
        // La navegación ahora se maneja en el servicio de autenticación
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = error.message || 'Error al registrar con Google';
        if (error.status === 409) {
          errorMessage = 'Este correo de Google ya está registrado';
        }
        this.toastr.error(errorMessage, 'Error');
      }
    });
  }
} 