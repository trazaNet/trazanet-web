import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuiasService } from '../../services/guias.service';
import { Guia } from '../../interfaces/guia.interface';
import { trigger, transition, style, animate } from '@angular/animations';
import { HistorialMovimientosComponent } from './historial-movimientos.component';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, HistorialMovimientosComponent],
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms ease', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class MovimientosComponent {
  // Mock de movimientos
  movimientos = [
    {
      fecha: new Date(),
      caravana: 'UY123456',
      origen: 'Campo Norte',
      destino: 'Campo Sur',
      gps: '-34.9011, -56.1645',
      productor: 'Juan Pérez',
      transportista: 'Carlos López',
      estado: 'En tránsito',
      guia: 'G-001'
    }
  ];

  // Para formulario
  caravana = '';
  origen = '';
  destino = '';
  gps = '';
  productorFirma = '';
  transportistaFirma = '';

  guias: Guia[] = [];
  guiaSeleccionada: Guia | null = null;

  mostrarHistorial = false;

  constructor(private guiasService: GuiasService) {
    this.guiasService.guias$.subscribe(guias => {
      this.guias = guias;
    });
  }

  registrarMovimiento() {
    this.movimientos.unshift({
      fecha: new Date(),
      caravana: this.guiaSeleccionada ? this.guiaSeleccionada.nombre : '',
      origen: this.origen,
      destino: this.destino,
      gps: this.gps,
      productor: this.productorFirma,
      transportista: this.transportistaFirma,
      estado: 'Registrado',
      guia: this.guiaSeleccionada ? this.guiaSeleccionada.nombre : ''
    });
    this.guiaSeleccionada = null;
    this.origen = '';
    this.destino = '';
    this.gps = '';
    this.productorFirma = '';
    this.transportistaFirma = '';
  }

  capturarGPS() {
    // Simulación de GPS
    this.gps = '-34.90, -56.16';
  }
} 