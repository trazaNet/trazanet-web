import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListasPersonalizadasService } from '../../services/listas-personalizadas.service';
import { ListaPersonalizada } from '../../interfaces/lista-personalizada.interface';
import { AnimalesService } from '../../services/animales.service';
import { Animal } from '../../interfaces/animal.interface';
import { first } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-listas-personalizadas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="listas-container">
      <header class="listas-header">
        <h1>Listas Personalizadas</h1>
        <p class="subtitle">Gestiona tus listas de animales y propietarios</p>
      </header>

      <div class="listas-grid">
        <div *ngIf="listas.length === 0" class="empty-state">
          <i class="fas fa-list"></i>
          <h2>No hay listas personalizadas</h2>
          <p>Las listas se crearán automáticamente cuando agregues propietarios desde la tabla de datos.</p>
        </div>

        <div *ngFor="let lista of listas" class="lista-card">
          <div class="lista-header">
            <h3>{{ lista.nombre }}</h3>
            <div class="lista-stats">
              <span class="stat">
                <i class="fas fa-users"></i>
                {{ getPropietariosCount(lista) }} propietarios
              </span>
              <span class="stat">
                <i class="fas fa-calendar"></i>
                {{ lista.fechaCreacion | date:'dd/MM/yyyy' }}
              </span>
            </div>
          </div>
          
          <div class="lista-actions">
            <button class="action-btn view-btn" (click)="verDetalles(lista)">
              <i class="fas fa-eye"></i>
              Ver detalles
            </button>
            <button class="action-btn export-btn" (click)="exportarLista(lista)">
              <i class="fas fa-file-excel"></i>
              Exportar
            </button>
            <button class="action-btn delete-btn" (click)="eliminarLista(lista, $event)">
              <i class="fas fa-trash"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de detalles -->
      <div class="modal-overlay" *ngIf="listaSeleccionada" (click)="cerrarDetalles()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ listaSeleccionada.nombre }}</h2>
            <div class="modal-actions">
              <button class="export-btn" (click)="exportarLista(listaSeleccionada)">
                <i class="fas fa-file-excel"></i>
                Exportar Excel
              </button>
              <button class="close-btn" (click)="cerrarDetalles()">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="modal-body">
            <div class="list-info">
              <p class="list-date">Creada: {{ listaSeleccionada.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="list-date">Última modificación: {{ listaSeleccionada.ultimaModificacion | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <div class="list-content">
              <div *ngFor="let propietario of getPropietariosLista()" class="propietario-item">
                <div class="propietario-header">
                  <h3>{{ propietario.nombre }}</h3>
                  <span class="propietario-numero">({{ propietario.numero }})</span>
                </div>
                <div class="animales-list">
                  <div *ngFor="let dispositivo of propietario.animales" class="animal-item">
                    {{ dispositivo }}
                  </div>
                </div>
              </div>
              <div *ngIf="!getPropietariosLista().length" class="empty-list">
                No hay propietarios en esta lista
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Diálogo de confirmación -->
      <div class="confirm-dialog" *ngIf="showConfirmDialog" [style.left.px]="confirmDialogPosition.x" [style.top.px]="confirmDialogPosition.y">
        <div class="confirm-content">
          <p>{{ confirmDialogMessage }}</p>
          <div class="confirm-actions">
            <button class="confirm-btn" (click)="confirmAction()">
              <i class="fas fa-check"></i>
              Confirmar
            </button>
            <button class="cancel-btn" (click)="cancelConfirmation()">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .listas-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .listas-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 3rem;
      background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%);
      color: white;
      border-radius: 16px;
      box-shadow: var(--shadow-lg);

      h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: white;
      }

      .subtitle {
        font-size: 1.4rem;
        opacity: 0.9;
      }
    }

    .listas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      padding: 1rem;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem;
      background: var(--background-light);
      border-radius: 16px;
      box-shadow: var(--shadow-sm);

      i {
        font-size: 4rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }

      h2 {
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      p {
        color: var(--text-secondary);
        max-width: 400px;
        margin: 0 auto;
      }
    }

    .lista-card {
      background: var(--background-light);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-md);
        border-color: var(--light-green);
      }
    }

    .lista-header {
      margin-bottom: 1.5rem;

      h3 {
        color: var(--text-primary);
        font-size: 1.3rem;
        margin-bottom: 1rem;
      }
    }

    .lista-stats {
      display: flex;
      gap: 1rem;
      color: var(--text-secondary);
      font-size: 0.9rem;

      .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        i {
          color: var(--primary-green);
        }
      }
    }

    .lista-actions {
      display: flex;
      gap: 0.5rem;

      .action-btn {
        flex: 1;
        padding: 0.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.2s ease;

        &.view-btn {
          background: var(--background-grey);
          color: var(--text-primary);

          &:hover {
            background: var(--light-green);
            color: var(--primary-green);
          }
        }

        &.export-btn {
          background: var(--success-green);
          color: white;

          &:hover {
            background: var(--primary-green);
          }
        }

        &.delete-btn {
          background: #fff5f5;
          color: #dc3545;

          &:hover {
            background: #dc3545;
            color: white;
          }
        }
      }
    }

    // Estilos para el modal
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: var(--background-light);
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.5rem;
      }

      .modal-actions {
        display: flex;
        gap: 10px;
        align-items: center;

        .export-btn {
          background: var(--success-green);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: background-color 0.2s;

          i {
            font-size: 16px;
          }

          &:hover {
            background-color: var(--primary-green);
          }
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 5px;
          border-radius: 4px;

          &:hover {
            background-color: var(--background-grey);
            color: var(--text-primary);
          }
        }
      }
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
    }

    .list-info {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--border-color);

      .list-date {
        color: var(--text-secondary);
        margin: 5px 0;
        font-size: 0.9rem;
      }
    }

    .list-content {
      .propietario-item {
        background-color: var(--background-grey);
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 15px;

        .propietario-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.1rem;
          }

          .propietario-numero {
            margin-left: 10px;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }
        }

        .animales-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;

          .animal-item {
            background-color: var(--background-light);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 0.9rem;
            color: var(--text-primary);
          }
        }
      }

      .empty-list {
        text-align: center;
        color: var(--text-secondary);
        font-style: italic;
        padding: 20px;
      }
    }

    // Estilos para el diálogo de confirmación
    .confirm-dialog {
      position: fixed;
      background: var(--background-light);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      padding: 20px;
      z-index: 2000;
      width: 300px;
      animation: fadeIn 0.2s ease-out;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      &::before {
        content: 'Confirmar acción';
        display: block;
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        color: var(--text-primary);
        font-weight: 500;
        font-size: 0.9rem;
        background: var(--background-light);
        padding: 4px 12px;
        border-radius: 6px;
        box-shadow: var(--shadow-sm);
        white-space: nowrap;
      }

      .confirm-content {
        p {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          font-size: 14px;
          text-align: center;
        }

        .confirm-actions {
          display: flex;
          gap: 10px;
          justify-content: center;

          button {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;

            i {
              font-size: 14px;
            }

            &.confirm-btn {
              background-color: #dc3545;
              color: white;

              &:hover {
                background-color: #c82333;
                transform: translateY(-1px);
              }
            }

            &.cancel-btn {
              background-color: var(--background-grey);
              color: var(--text-primary);

              &:hover {
                background-color: var(--border-color);
                transform: translateY(-1px);
              }
            }
          }
        }
      }
    }
  `]
})
export class ListasPersonalizadasComponent implements OnInit {
  listas: ListaPersonalizada[] = [];
  listaSeleccionada: ListaPersonalizada | null = null;
  showConfirmDialog = false;
  confirmDialogMessage = '';
  confirmDialogAction: () => void = () => {};
  confirmDialogPosition = { x: 0, y: 0 };

  constructor(
    private listasService: ListasPersonalizadasService,
    private animalesService: AnimalesService
  ) {}

  getPropietariosCount(lista: ListaPersonalizada): number {
    return Object.keys(lista.propietarios).length;
  }

  ngOnInit() {
    this.listasService.listas$.subscribe(listas => {
      this.listas = listas;
    });
  }

  verDetalles(lista: ListaPersonalizada) {
    this.listaSeleccionada = lista;
  }

  cerrarDetalles() {
    this.listaSeleccionada = null;
  }

  getPropietariosLista() {
    if (!this.listaSeleccionada) return [];
    
    return Object.entries(this.listaSeleccionada.propietarios).map(([numero, datos]) => ({
      numero,
      nombre: datos.nombre,
      animales: datos.animales
    }));
  }

  showConfirmation(message: string, action: () => void, event: MouseEvent) {
    this.confirmDialogMessage = message;
    this.confirmDialogAction = action;
    
    // Calcular la posición centrada con respecto al cursor
    const dialogWidth = 300;
    const dialogHeight = 150;
    
    this.confirmDialogPosition = {
      x: Math.max(0, event.pageX - (dialogWidth / 2)),
      y: Math.max(0, event.pageY - (dialogHeight / 2))
    };
    
    this.showConfirmDialog = true;
  }

  confirmAction() {
    this.confirmDialogAction();
    this.showConfirmDialog = false;
  }

  cancelConfirmation() {
    this.showConfirmDialog = false;
  }

  eliminarLista(lista: ListaPersonalizada, event: MouseEvent) {
    this.showConfirmation(
      '¿Estás seguro de que deseas eliminar esta lista?',
      () => {
        this.listasService.eliminarLista(lista.id);
      },
      event
    );
  }

  exportarLista(lista: ListaPersonalizada) {
    // Obtener todos los animales de la lista
    this.animalesService.animales$.pipe(first()).subscribe(animales => {
      const animalesLista = animales.filter((animal: Animal) => {
        return lista.propietarios[animal.propietario] !== undefined;
      });

      // Crear el workbook y la worksheet
      const wb = XLSX.utils.book_new();
      
      // Transformar los datos al formato deseado
      const data = animalesLista.map((animal: Animal) => ({
        dispositivo: animal.dispositivo,
        raza: animal.raza,
        cruza: animal.cruza,
        sexo: animal.sexo,
        edadMeses: animal.edadMeses,
        edadDias: animal.edadDias,
        propietario: animal.propietario,
        nombrePropietario: animal.nombrePropietario,
        ubicacion: animal.ubicacion,
        tenedor: animal.tenedor,
        statusVida: animal.statusVida,
        statusTrazabilidad: animal.statusTrazabilidad,
        errores: animal.errores,
        fechaIdentificacion: animal.fechaIdentificacion,
        fechaRegistro: animal.fechaRegistro
      }));

      // Crear la worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Agregar la worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Animales');

      // Generar el archivo y descargarlo
      const nombreArchivo = `${lista.nombre}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
    });
  }
} 