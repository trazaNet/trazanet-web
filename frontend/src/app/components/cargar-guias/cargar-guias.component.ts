import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { GuiasService } from '../../services/guias.service';
import { Guia } from '../../interfaces/guia.interface';
import { AnimalesService } from '../../services/animales.service';

@Component({
  selector: 'app-cargar-guias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Sección de carga -->
      <div class="upload-section">
        <div class="container" 
             (dragover)="onDragOver($event)"
             (dragenter)="onDragEnter($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)">
          <!-- Área de drop que solo se muestra cuando se arrastra un archivo -->
          <div class="drop-overlay" *ngIf="isDragging">
            <div class="drop-zone">
              <div class="drop-message">
                <i class="fas fa-file-alt"></i>
                <h2>Suelta tu guía aquí</h2>
              </div>
            </div>
          </div>

          <!-- Contenedor principal siempre visible -->
          <div class="upload-container">
            <div class="upload-content">
              <i class="fas fa-file-alt"></i>
              <h2>Arrastra y suelta tu guía aquí</h2>
              <p>o</p>
              <button class="upload-button" (click)="fileInput.click()">
                <i class="fas fa-folder-open"></i>
                Selecciona el archivo
              </button>
              <input #fileInput type="file" 
                     (change)="onFileSelected($event)"
                     accept=".txt"
                     style="display: none">
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de lista de guías -->
      <div class="guides-section">
        <div class="guides-header">
          <div class="header">
            <label class="switch">
              <input type="checkbox" [(ngModel)]="mostrarGuiasExportadas" (change)="actualizarListaGuias()">
              <div class="slider">
                <span class="slider-text left" [class.active]="!mostrarGuiasExportadas">Guías Guardadas</span>
                <span class="slider-text right" [class.active]="mostrarGuiasExportadas">Guías Exportadas</span>
              </div>
            </label>
          </div>
          <div class="search-container">
            <input 
              type="text" 
              [(ngModel)]="terminoBusqueda" 
              (input)="buscar()"
              placeholder="Buscar guías..."
              class="search-input">
          </div>
        </div>

        <div class="guides-grid">
          <div *ngFor="let guia of guiasFiltradas" class="guide-card">
            <div class="guide-info">
              <i class="fas fa-file-alt"></i>
              <div class="guide-details">
                <h3>{{ guia.nombre }}</h3>
                <p>{{ formatFileSize(guia.tamano) }} • {{ guia.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>
            <div class="guide-actions">
              <button class="view-btn" (click)="verGuia(guia)" title="Ver contenido">
                <i class="fas fa-eye"></i>
              </button>
              <button *ngIf="!mostrarGuiasExportadas" 
                      class="export-btn" 
                      (click)="exportarGuia(guia, $event)" 
                      title="Procesar guía">
                <i class="fas fa-file-export"></i>
              </button>
              <button class="delete-btn" (click)="eliminarGuia(guia, $event)" title="Eliminar guía">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div *ngIf="guiasFiltradas.length === 0" class="empty-guides">
            No hay guías guardadas
          </div>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div class="error-message" *ngIf="errorMessage" @fadeInOut>
        <i class="fas fa-exclamation-circle"></i>
        {{ errorMessage }}
      </div>

      <!-- Diálogo de vista previa -->
      <div class="preview-dialog" *ngIf="showPreview" @dialogAnimation>
        <div class="preview-content">
          <div class="preview-header">
            <h2>Vista Previa de la Guía</h2>
            <div class="preview-actions">
              <button class="confirm-btn" (click)="confirmarGuia()">
                <i class="fas fa-check"></i>
                Confirmar
              </button>
              <button class="cancel-btn" (click)="cancelarGuia()">
                <i class="fas fa-times"></i>
                Cancelar
              </button>
            </div>
          </div>
          <div class="preview-body">
            <div class="file-info">
              <p><strong>Nombre del archivo:</strong> {{ currentFile?.name }}</p>
              <p><strong>Tamaño:</strong> {{ formatFileSize(currentFile?.size || 0) }}</p>
            </div>
            <div class="preview-data">
              <pre>{{ fileContent }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Diálogo de confirmación -->
      <div class="confirm-dialog" *ngIf="showConfirmDialog" @dialogAnimation>
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

      <!-- Diálogo de procesamiento -->
      <div class="preview-dialog" *ngIf="showProcessDialog" @dialogAnimation>
        <div class="preview-content">
          <div class="preview-header">
            <h2>Procesar Guía</h2>
            <button class="close-btn" (click)="showProcessDialog = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="preview-body">
            <div class="process-content">
              <h3>Guías procesadas por productor</h3>
              <div class="producers-list">
                <div *ngFor="let guia of processedGuides" class="producer-item">
                  <div class="producer-info">
                    <h4>Productor: {{ guia.propietario }} - {{ guia.nombrePropietario }}</h4>
                    <p>{{ guia.dispositivos.length }} dispositivos encontrados</p>
                  </div>
                  <button class="download-btn" (click)="descargarGuiaProcesada(guia.propietario, guia.nombrePropietario, guia.dispositivos)">
                    <i class="fas fa-download"></i>
                    Descargar
                  </button>
                </div>
                <div *ngIf="processedGuides.length === 0" class="no-results">
                  No se encontraron guías para procesar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
      overflow-y: auto;
    }

    .upload-section {
      flex: 0 0 auto;
    }

    .guides-section {
      flex: 1;
      background: var(--background-light);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .guides-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-primary);
      }
    }

    .search-container {
      width: 300px;

      .search-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 0.9rem;
        
        &:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 2px var(--light-green);
        }
      }
    }

    .guides-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .guide-card {
      background: var(--background-grey);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .guide-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      i {
        font-size: 2rem;
        color: var(--primary-green);
      }
    }

    .guide-details {
      h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--text-primary);
      }

      p {
        margin: 0.25rem 0 0;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
    }

    .guide-actions {
      display: flex;
      gap: 0.5rem;

      button {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;

        i {
          font-size: 0.9rem;
        }
      }

      .view-btn {
        background: var(--primary-green);
        color: white;

        &:hover {
          background: var(--secondary-green);
        }
      }

      .export-btn {
        background: var(--secondary-green);
        color: white;

        &:hover {
          background: var(--primary-green);
        }
      }

      .delete-btn {
        background: #dc3545;
        color: white;

        &:hover {
          background: #c82333;
        }
      }
    }

    .empty-guides {
      grid-column: 1 / -1;
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
      background: var(--background-grey);
      border-radius: 12px;
      font-size: 1.1rem;
    }

    .container {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      position: relative;
    }

    .upload-container {
      width: 100%;
      max-width: 500px;
      height: 250px;
      background: var(--background-light);
      border: 2px dashed var(--border-color);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--primary-green);
        background: var(--background-grey);
      }
    }

    .upload-content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;

      i {
        font-size: 2.5rem;
        color: var(--primary-green);
        margin-bottom: 0.5rem;
      }

      h2 {
        font-size: 1.2rem;
        color: var(--text-primary);
        margin: 0;
      }

      p {
        color: var(--text-secondary);
        margin: 0;
        font-size: 0.9rem;
      }
    }

    .upload-button {
      background: var(--primary-green);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.3s ease;

      &:hover {
        background: var(--secondary-green);
        transform: translateY(-2px);
      }

      i {
        font-size: 1rem;
        color: white;
        margin: 0;
      }
    }

    .drop-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .drop-zone {
      width: 100%;
      max-width: 500px;
      height: 250px;
      border: 3px dashed var(--primary-green);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background-grey);
    }

    .drop-message {
      text-align: center;

      i {
        font-size: 2.5rem;
        color: var(--primary-green);
        margin-bottom: 0.5rem;
      }

      h2 {
        font-size: 1.2rem;
        color: var(--text-primary);
        margin: 0;
      }
    }

    .error-message {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #fff5f5;
      color: #dc3545;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1000;

      i {
        font-size: 1.2rem;
      }
    }

    .preview-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .preview-content {
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      background: var(--background-light);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
    }

    .preview-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-primary);
      }
    }

    .preview-actions {
      display: flex;
      gap: 1rem;

      button {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 8px;

        i {
          font-size: 1rem;
        }
      }

      .confirm-btn {
        background: var(--primary-green);
        color: white;

        &:hover {
          background: var(--secondary-green);
        }
      }

      .cancel-btn {
        background: #dc3545;
        color: white;

        &:hover {
          background: #c82333;
        }
      }
    }

    .preview-body {
      padding: 1.5rem;
      overflow-y: auto;
    }

    .file-info {
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--background-grey);
      border-radius: 8px;

      p {
        margin: 0.5rem 0;
        color: var(--text-secondary);

        strong {
          color: var(--text-primary);
        }
      }
    }

    .preview-data {
      background: var(--background-grey);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;

      pre {
        margin: 0;
        font-family: monospace;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: var(--text-primary);
      }
    }

    .confirm-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .confirm-content {
      width: 90%;
      max-width: 400px;
      max-height: 80vh;
      background: var(--background-light);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }

    .confirm-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;

      button {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .confirm-btn {
        background: var(--primary-green);
        color: white;

        &:hover {
          background: var(--secondary-green);
        }
      }

      .cancel-btn {
        background: #dc3545;
        color: white;

        &:hover {
          background: #c82333;
        }
      }
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 320px;
      height: 40px;
      margin: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--light-green);
      transition: .4s;
      border-radius: 24px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px;
      overflow: hidden;

      &:before {
        position: absolute;
        content: "";
        height: 32px;
        width: 156px;
        left: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 20px;
        z-index: 1;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    }

    .slider-text {
      color: var(--text-secondary);
      font-size: 0.95rem;
      z-index: 2;
      flex: 1;
      text-align: center;
      transition: all 0.3s ease;
      user-select: none;
      padding: 0 12px;

      &.active {
        color: var(--primary-green);
        font-weight: 600;
      }

      &.left {
        margin-right: 4px;
      }

      &.right {
        margin-left: 4px;
      }
    }

    input:checked + .slider:before {
      transform: translateX(156px);
    }

    input:checked + .slider,
    input:not(:checked) + .slider {
      background-color: var(--light-green);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }

    .process-content {
      padding: 1rem;
      background: var(--background-grey);
      border-radius: 8px;
      margin-bottom: 1rem;

      h3 {
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      p {
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
        line-height: 1.5;
      }
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      font-size: 1.2rem;
      transition: color 0.2s ease;

      &:hover {
        color: var(--text-primary);
      }
    }

    .producers-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .producer-item {
      background: var(--background-light);
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-sm);
    }

    .producer-info {
      h4 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1rem;
      }

      p {
        margin: 0.25rem 0 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
    }

    .download-btn {
      background: var(--primary-green);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--secondary-green);
        transform: translateY(-2px);
      }

      i {
        font-size: 1rem;
      }
    }

    .no-results {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
      background: var(--background-light);
      border-radius: 8px;
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class CargarGuiasComponent implements OnInit {
  isDragging = false;
  errorMessage = '';
  showPreview = false;
  showProcessDialog = false;
  selectedGuide: Guia | null = null;
  fileContent = '';
  currentFile: File | null = null;
  guiasFiltradas: Guia[] = [];
  terminoBusqueda = '';
  showConfirmDialog = false;
  confirmDialogMessage = '';
  confirmDialogAction: () => void = () => {};
  private errorTimeout: any;
  mostrarGuiasExportadas = false;
  processedGuides: { propietario: string, nombrePropietario: string, dispositivos: string[] }[] = [];

  constructor(
    private guiasService: GuiasService,
    private animalesService: AnimalesService
  ) {}

  ngOnInit() {
    this.actualizarListaGuias();
  }

  public actualizarListaGuias() {
    if (this.mostrarGuiasExportadas) {
      this.guiasService.guiasExportadas$.subscribe(guias => {
        this.guiasFiltradas = guias;
      });
    } else {
      this.guiasService.guias$.subscribe(guias => {
        this.guiasFiltradas = guias;
      });
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    if (!target.contains(relatedTarget)) {
      this.isDragging = false;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.showError('Solo se permiten archivos .txt');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showError('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    this.currentFile = file;
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.fileContent = e.target?.result as string || '';
      this.showPreview = true;
    };

    reader.onerror = () => {
      this.showError('Error al leer el archivo');
    };

    reader.readAsText(file);
  }

  private showError(message: string) {
    this.errorMessage = message;
    
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
    
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  confirmarGuia() {
    if (this.currentFile && this.fileContent) {
      this.guiasService.agregarGuia(
        this.currentFile.name,
        this.fileContent,
        this.currentFile.size
      );
      this.showPreview = false;
      this.currentFile = null;
      this.fileContent = '';
    }
  }

  cancelarGuia() {
    this.showPreview = false;
    this.currentFile = null;
    this.fileContent = '';
  }

  buscar() {
    this.guiasFiltradas = this.guiasService.buscarGuias(this.terminoBusqueda, this.mostrarGuiasExportadas);
  }

  verGuia(guia: Guia) {
    this.fileContent = guia.contenido;
    this.currentFile = {
      name: guia.nombre,
      size: guia.tamano
    } as File;
    this.showPreview = true;
  }

  eliminarGuia(guia: Guia, event: MouseEvent) {
    event.stopPropagation();
    this.confirmDialogMessage = '¿Estás seguro de que deseas eliminar esta guía?';
    this.confirmDialogAction = () => {
      this.guiasService.eliminarGuia(guia.id, this.mostrarGuiasExportadas);
      this.showConfirmDialog = false;
    };
    this.showConfirmDialog = true;
  }

  exportarGuia(guia: Guia, event: MouseEvent) {
    event.stopPropagation();
    this.selectedGuide = guia;
    this.processedGuides = this.procesarGuia(guia.contenido);
    this.showProcessDialog = true;
  }

  cancelConfirmation() {
    this.showConfirmDialog = false;
  }

  confirmAction() {
    this.confirmDialogAction();
  }

  private procesarGuia(contenido: string): { propietario: string, nombrePropietario: string, dispositivos: string[] }[] {
    const lineas = contenido.split('\n').filter(linea => linea.trim());
    const guiasPorPropietario: { [key: string]: { nombrePropietario: string, dispositivos: Set<string> } } = {};

    // Procesar cada línea
    for (const linea of lineas) {
      // Limpiar la línea de espacios y caracteres especiales
      const lineaLimpia = linea.trim().replace(/\[|\]/g, '');
      
      // Separar los campos por el delimitador |
      const campos = lineaLimpia.split('|');
      
      // El número de dispositivo está en el segundo campo (índice 1)
      if (campos.length > 1) {
        const numeroCompleto = campos[1]; // Ejemplo: A0000000858000035507089
        
        // Extraer los últimos 8 dígitos del número
        const numeroDispositivo = numeroCompleto.slice(-8);
        
        console.log('Procesando línea:', lineaLimpia);
        console.log('Número de dispositivo encontrado:', numeroDispositivo);
        
        // Buscar el dispositivo en la tabla de datos
        const animal = this.animalesService.buscarPorDispositivo(numeroDispositivo);
        
        if (animal) {
          console.log('Animal encontrado:', animal);
          console.log('Propietario:', animal.propietario);
          console.log('Nombre del propietario:', animal.nombrePropietario);
          
          // Si encontramos el animal, usamos su propietario
          const numeroPropietario = animal.propietario;
          const nombrePropietario = animal.nombrePropietario || 'Sin nombre';
          
          // Si el propietario no existe en nuestro registro, lo inicializamos
          if (!guiasPorPropietario[numeroPropietario]) {
            guiasPorPropietario[numeroPropietario] = {
              nombrePropietario,
              dispositivos: new Set()
            };
          }
          
          // Agregar la línea completa al conjunto de dispositivos del propietario
          guiasPorPropietario[numeroPropietario].dispositivos.add(lineaLimpia);
        } else {
          console.log('No se encontró animal para el dispositivo:', numeroDispositivo);
        }
      }
    }

    // Convertir el objeto a un array y mostrar el resultado final
    const resultado = Object.entries(guiasPorPropietario)
      .map(([propietario, datos]) => ({
        propietario,
        nombrePropietario: datos.nombrePropietario,
        dispositivos: Array.from(datos.dispositivos).sort()
      }))
      .sort((a, b) => a.propietario.localeCompare(b.propietario));
    
    console.log('Resultado final del procesamiento:', resultado);
    return resultado;
  }

  descargarGuiaProcesada(propietario: string, nombrePropietario: string, dispositivos: string[]) {
    // Crear el contenido del archivo
    const contenido = `Propietario: ${propietario} - ${nombrePropietario}\n` +
                     `Total de dispositivos: ${dispositivos.length}\n` +
                     `Fecha de procesamiento: ${new Date().toLocaleString()}\n` +
                     `\nDispositivos:\n${dispositivos.join('\n')}`;

    // Crear el blob y el link de descarga
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Limpiar el nombre del propietario para el nombre del archivo
    const nombreLimpio = nombrePropietario.replace(/[^a-zA-Z0-9]/g, '_');
    a.href = url;
    a.download = `guia_${propietario}_${nombreLimpio}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
} 