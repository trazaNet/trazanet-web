import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Inversion } from '../../../models/inversion.model';
import { InversionesService } from '../../../services/inversiones.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inversiones-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './inversiones-list.component.html',
  styleUrls: ['./inversiones-list.component.scss']
})
export class InversionesListComponent implements OnInit {
  inversiones: Inversion[] = [];
  selectedInversiones: Inversion[] = [];
  editingInversion: Inversion | null = null;

  constructor(
    private inversionesService: InversionesService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadInversiones();
  }

  loadInversiones(): void {
    this.inversionesService.getInversiones().subscribe({
      next: (inversiones) => {
        this.inversiones = inversiones.map(inversion => ({
          ...inversion,
          selected: false
        }));
      },
      error: (error) => {
        console.error('Error al cargar inversiones:', error);
        this.toastr.error('Error al cargar las inversiones');
      }
    });
  }

  toggleSelection(inversion: Inversion): void {
    const index = this.selectedInversiones.findIndex(i => i.id === inversion.id);
    if (index === -1) {
      this.selectedInversiones.push(inversion);
      this.toastr.success('Inversión seleccionada');
    } else {
      this.selectedInversiones.splice(index, 1);
      this.toastr.warning('Inversión deseleccionada');
    }
  }

  updateTickets(): void {
    if (this.selectedInversiones.length === 0) {
      this.toastr.warning('Por favor seleccione al menos una inversión');
      return;
    }
    this.inversionesService.updateSelectedInversiones(this.selectedInversiones);
    this.toastr.success('Tickets actualizados correctamente');
  }

  editInversion(inversion: Inversion): void {
    this.editingInversion = { ...inversion };
  }

  deleteInversion(inversion: Inversion): void {
    if (confirm('¿Está seguro de eliminar esta inversión?')) {
      const index = this.inversiones.findIndex(i => i.id === inversion.id);
      if (index !== -1) {
        this.inversiones.splice(index, 1);
        this.toastr.success('Inversión eliminada correctamente');
      }
    }
  }

  onInversionUpdated(updatedInversion: Inversion): void {
    const index = this.inversiones.findIndex(i => i.id === updatedInversion.id);
    if (index !== -1) {
      this.inversiones[index] = updatedInversion;
      this.toastr.success('Inversión actualizada correctamente');
    }
    this.editingInversion = null;
  }

  onCancelEdit(): void {
    this.editingInversion = null;
  }
} 