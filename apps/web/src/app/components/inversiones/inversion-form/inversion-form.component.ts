import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InversionesService } from '../../../services/inversiones.service';

@Component({
  selector: 'app-inversion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inversion-form.component.html',
  styleUrls: ['./inversion-form.component.scss']
})
export class InversionFormComponent implements OnInit {
  inversionForm: FormGroup;
  tiposInversion = ['ganado', 'pastura', 'infraestructura', 'otro'];
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private inversionesService: InversionesService
  ) {
    this.inversionForm = this.fb.group({
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      costo: ['', [Validators.required, Validators.min(0)]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.inversionForm.valid) {
      const formData = {
        ...this.inversionForm.value,
        fecha: new Date(),
        resultado: 0 // Inicializar resultado en 0
      };
      
      this.inversionesService.addInversion(formData)
        .subscribe({
          next: () => {
            this.inversionForm.reset();
            this.isEditing = false;
          },
          error: (error) => {
            console.error('Error al guardar la inversión:', error);
          }
        });
    }
  }

  onCancel(): void {
    this.inversionForm.reset();
    this.isEditing = false;
  }
} 