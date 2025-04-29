import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InversionesService } from '../../../services/inversiones.service';

@Component({
  selector: 'app-inversion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inversion-form.component.html',
  styleUrls: ['./inversion-form.component.scss']
})
export class InversionFormComponent implements OnInit {
  inversionForm: FormGroup;
  tiposInversion = ['ganado', 'pastura', 'infraestructura', 'otro'];

  constructor(
    private fb: FormBuilder,
    private inversionesService: InversionesService
  ) {
    this.inversionForm = this.fb.group({
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      costo: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.inversionForm.valid) {
      this.inversionesService.addInversion(this.inversionForm.value)
        .subscribe({
          next: () => {
            this.inversionForm.reset();
            // Aquí podrías agregar una notificación de éxito
          },
          error: (error) => {
            console.error('Error al guardar la inversión:', error);
            // Aquí podrías agregar una notificación de error
          }
        });
    }
  }
} 