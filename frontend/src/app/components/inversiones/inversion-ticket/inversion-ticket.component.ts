import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InversionesService } from '../../../services/inversiones.service';
import { GanadoService } from '../../../services/ganado.service';
import { Inversion } from '../../../models/inversion.model';
import { Subscription, combineLatest, catchError, of } from 'rxjs';

interface InversionAgrupada {
  tipo: string;
  cantidad: number;
  resultado: number;
}

@Component({
  selector: 'app-inversion-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inversion-ticket.component.html',
  styleUrls: ['./inversion-ticket.component.scss']
})
export class InversionTicketComponent implements OnInit, OnDestroy {
  inversiones: Inversion[] = [];
  inversionesAgrupadas: InversionAgrupada[] = [];
  precioKg = 0;
  pesoTotalGanado = 0;
  total = 0;
  costoTotal = 0;
  valorTotalGanado = 0;
  private subscriptions = new Subscription();

  constructor(
    private inversionesService: InversionesService,
    private ganadoService: GanadoService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadData(): void {
    const inversionesSub = this.inversionesService.getInversiones().pipe(
      catchError(error => {
        console.error('Error cargando inversiones:', error);
        return of([]);
      })
    );

    const pesoTotalSub = this.ganadoService.getPesoTotalGanadoActivo().pipe(
      catchError(error => {
        console.error('Error cargando peso total:', error);
        return of(0);
      })
    );

    this.subscriptions.add(
      combineLatest([inversionesSub, pesoTotalSub]).subscribe({
        next: ([inversiones, pesoTotal]) => {
          console.log('Datos cargados:', { inversiones, pesoTotal });
          this.inversiones = inversiones;
          this.pesoTotalGanado = pesoTotal;
          this.calcularCostoTotal();
          this.recalcularGanancia();
        },
        error: (error) => {
          console.error('Error en combineLatest:', error);
          // En caso de error, intentamos mantener la funcionalidad básica
          this.inversiones = [];
          this.pesoTotalGanado = 0;
          this.calcularCostoTotal();
          this.recalcularGanancia();
        }
      })
    );
  }

  private calcularCostoTotal(): void {
    this.costoTotal = this.inversiones.reduce((sum, inversion) => 
      sum + inversion.costo, 0
    );
  }

  private agruparInversiones(): void {
    const gruposPorTipo = new Map<string, InversionAgrupada>();

    this.inversiones.forEach(inversion => {
      const tipo = inversion.tipo.charAt(0).toUpperCase() + inversion.tipo.slice(1);
      if (!gruposPorTipo.has(tipo)) {
        gruposPorTipo.set(tipo, {
          tipo,
          cantidad: 1,
          resultado: inversion.resultado ?? 0
        });
      } else {
        const grupo = gruposPorTipo.get(tipo)!;
        grupo.cantidad++;
        grupo.resultado += inversion.resultado ?? 0;
      }
    });

    this.inversionesAgrupadas = Array.from(gruposPorTipo.values())
      .sort((a, b) => a.tipo.localeCompare(b.tipo));
  }

  recalcularGanancia(): void {
    // Calcular el valor total del ganado basado en el precio por kg
    this.valorTotalGanado = this.pesoTotalGanado * this.precioKg;

    // Crear una copia de las inversiones para no modificar las originales directamente
    const inversionesActualizadas = this.inversiones.map(inv => ({...inv}));

    if (this.precioKg > 0) {
      inversionesActualizadas.forEach(inversion => {
        // Calculamos el porcentaje que representa esta inversión del total
        const porcentaje = inversion.costo / this.costoTotal;
        // Asignamos la parte proporcional del valor total del ganado
        const valorAsignado = this.valorTotalGanado * porcentaje;
        // Calculamos el resultado (ganancia o pérdida)
        inversion.resultado = valorAsignado - inversion.costo;
      });
    } else {
      // Si no hay precio por kg, el resultado es la pérdida del costo
      inversionesActualizadas.forEach(inversion => {
        inversion.resultado = -inversion.costo;
      });
    }

    // Actualizamos las inversiones con los nuevos resultados
    this.inversiones = inversionesActualizadas;
    this.agruparInversiones();
    this.calcularTotal();
  }

  private calcularTotal(): void {
    this.total = this.inversiones.reduce((sum, inversion) => 
      sum + (inversion.resultado ?? 0), 0
    );
  }
} 