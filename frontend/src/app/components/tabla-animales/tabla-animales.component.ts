import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { Animal } from '../../interfaces/animal.interface';
import { AnimalesService } from '../../services/animales.service';
import { ListasPersonalizadasService } from '../../services/listas-personalizadas.service';
import { ExcelService } from '../../services/excel.service';
import { ListaPersonalizada } from '../../interfaces/lista-personalizada.interface';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import * as XLSX from 'xlsx';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-tabla-animales',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightPipe],
  templateUrl: './tabla-animales.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }

    app-tabla-animales {
      display: block;
      width: calc(100vw - 140px);
      height: 100%;
      padding: 0;
      margin: 0;
      margin-top: -40px;
      margin-bottom: 0;
      margin-left: -130px;
      background-color: #f1f5f9;
      overflow-x: hidden;
      position: relative;
    }

    :host ::ng-deep .main-content {
      margin-top: -20px;
      padding-top: 0;
    }
    
    .container {
      position: relative;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1px;
      padding: 0;
      margin: 0;
    }

    .toolbar {
      background-color: white;
      border-radius: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;
      width: 100%;
      max-width: none;
      flex-shrink: 0;
    }

    .search-box {
      flex: 1;
      max-width: 400px;
      
      input {
        width: 100%;
        padding: 10px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s ease;
        background-color: #f8fafc;
        
        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background-color: white;
        }
        
        &::placeholder {
          color: #94a3b8;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      
      .btn {
        padding: 10px 18px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        border: none;
        
        i {
          font-size: 16px;
        }
        
        &.btn-success {
          background-color: #10b981;
          color: white;
          
          &:hover {
            background-color: #059669;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);
          }
          
          &:active {
            transform: translateY(0);
          }
        }
        
        &.btn-danger {
          background-color: #ef4444;
          color: white;
          
          &:hover {
            background-color: #dc2626;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1);
          }
          
          &:active {
            transform: translateY(0);
          }
        }
      }

      .hidden-file-input {
        display: none;
      }
    }

    .table-container {
      background-color: white;
      border-radius: 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      margin: 0;
      width: 100%;
      max-width: none;
      overflow: visible;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      table-layout: fixed;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      flex: 1;
      
      th, td {
        padding: 0;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        font-size: 9px;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
      }
      
      th {
        background-color: #f8fafc;
        font-weight: 600;
        color: #475569;
        text-transform: uppercase;
        font-size: 8px;
        letter-spacing: 0;
        position: sticky;
        top: 0;
        z-index: 10;
        padding: 4px 1px;
        white-space: normal;
        height: 24px;
        vertical-align: top;
        
        // Ancho específico para cada columna
        &:nth-child(1) { width: 9%; }     // Dispositivo
        &:nth-child(2) { width: 6%; }     // Raza
        &:nth-child(3) { width: 6%; }     // Cruza
        &:nth-child(4) { width: 3%; }     // Sexo
        &:nth-child(5) { 
          width: 4%; 
          word-break: break-word;
        }     // Edad (meses)
        &:nth-child(6) { 
          width: 4%; 
          word-break: break-word;
        }     // Edad (días)
        &:nth-child(7) { width: 9%; }     // Propietario
        &:nth-child(8) { 
          width: 11%;
          word-break: break-word;
        }    // Nombre Propietario
        &:nth-child(9) { width: 9%; }     // Ubicación
        &:nth-child(10) { width: 9%; }    // Tenedor
        &:nth-child(11) { 
          width: 5%;
          word-break: break-word;
        }    // Status de vida
        &:nth-child(12) { 
          width: 7%;
          word-break: break-word;
        }    // Status de trazabilidad
        &:nth-child(13) { width: 4%; }    // Errores
        &:nth-child(14) { 
          width: 7%;
          word-break: break-word;
        }    // Fecha identificación
        &:nth-child(15) { 
          width: 7%;
          word-break: break-word;
        }    // Fecha registro
      }
      
      tbody {
        tr {
          height: 14px;
          
          &:hover {
            background-color: #f1f5f9;
          }
          
          &.selected {
            background-color: #e0f2fe;
          }
          
          td {
            color: #334155;
            font-size: 9px;
            padding: 0 1px;
            line-height: 14px;
            white-space: nowrap;
            
            &:first-child {
              padding-left: 1px;
            }
            
            &:last-child {
              padding-right: 1px;
            }
            
            &[innerHTML] {
              mark {
                background-color: #fef08a;
                padding: 0;
                border-radius: 0;
              }
            }
          }
        }
      }
    }

    .empty-message {
      text-align: center;
      padding: 20px;
      color: #94a3b8;
      font-size: 14px;
      font-style: italic;
    }

    .drag-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(16, 185, 129, 0.1);
      backdrop-filter: blur(4px);
      z-index: 9999;
      pointer-events: none;
      
      &.active {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: all;
      }

      .drag-message {
        background-color: white;
        padding: 2rem 3rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        text-align: center;
        border: 3px dashed #10b981;
        animation: bounce 1s infinite;
        transform-origin: center;

        i {
          font-size: 3.5rem;
          color: #10b981;
          margin-bottom: 1rem;
          display: block;
        }

        h3 {
          margin: 0;
          color: #10b981;
          font-size: 1.5rem;
          font-weight: 500;
        }

        p {
          margin: 0.5rem 0 0;
          color: #64748b;
          font-size: 1rem;
        }
      }
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0) scale(1);
      }
      50% {
        transform: translateY(-10px) scale(1.02);
      }
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translate(-50%, -20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translate(-50%, 0)' }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ opacity: 0, transform: 'translate(-50%, -20px)' }))
      ])
    ])
  ]
})
export class TablaAnimalesComponent implements OnInit {
  animales: Animal[] = [];
  animalesFiltrados: Animal[] = [];
  terminoBusqueda: string = '';
  isDragging = false;
  editingName: { [key: string]: boolean } = {};
  propietariosNombres: { [key: string]: string } = {};
  
  // Variables para el menú contextual
  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  selectedAnimal: Animal | null = null;
  listas: ListaPersonalizada[] = [];
  showNewListInput = false;
  newListName = '';
  showListDetails = false;
  listaSeleccionada: ListaPersonalizada | null = null;
  contextMenuPosition = { x: 0, y: 0 };
  showConfirmDialog = false;
  confirmDialogMessage = '';
  confirmDialogAction: () => void = () => {};
  confirmDialogPosition = { x: 0, y: 0 };

  constructor(
    private animalesService: AnimalesService,
    private listasService: ListasPersonalizadasService,
    private excelService: ExcelService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();

    this.animalesService.animales$.subscribe(animales => {
      this.animales = animales;
      this.animalesFiltrados = animales;
      this.actualizarNombresPropietarios();
    });

    this.listasService.listas$.subscribe(listas => {
      this.listas = listas;
    });
  }

  private cargarDatosIniciales() {
    this.animalesService.cargarDatosIniciales().subscribe({
      next: (animales) => {
        console.log('Datos cargados:', animales);
        this.animalesService.setAnimales(animales);
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
      }
    });
  }

  private actualizarNombresPropietarios() {
    this.animales.forEach(animal => {
      if (animal.propietario && this.propietariosNombres[animal.propietario]) {
        animal.nombrePropietario = this.propietariosNombres[animal.propietario];
      }
    });
  }

  // Manejadores del menú contextual
  onContextMenu(event: MouseEvent, animal: Animal) {
    event.preventDefault();
    this.selectedAnimal = animal;
    this.showContextMenu = true;
    this.contextMenuX = event.pageX;
    this.contextMenuY = event.pageY;

    // Cerrar el menú cuando se hace clic fuera de él
    const closeMenu = (e: MouseEvent) => {
      if (!e.target || !(e.target as Element).closest('.context-menu')) {
        this.showContextMenu = false;
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Verificar si el clic fue dentro del menú contextual
    const contextMenu = document.querySelector('.context-menu');
    const newListInput = document.querySelector('.new-list-input');
    
    if (contextMenu && !contextMenu.contains(event.target as Node) &&
        (!newListInput || !newListInput.contains(event.target as Node))) {
      this.showContextMenu = false;
      this.showNewListInput = false;
    }
  }

  onContextMenuClick(event: Event) {
    event.stopPropagation();
  }

  mostrarInputNuevaLista() {
    this.showNewListInput = true;
    this.showContextMenu = false;
    this.newListName = '';
    
    // Calcular la posición centrada con respecto al cursor
    const inputWidth = 300; // Ancho fijo del input
    const inputHeight = 120; // Altura aproximada del input incluyendo el título flotante

    this.contextMenuPosition = {
      x: Math.max(0, this.contextMenuX - (inputWidth / 2)),
      y: Math.max(0, this.contextMenuY - (inputHeight / 2))
    };

    // Dar tiempo al DOM para actualizarse y luego enfocar el input
    setTimeout(() => {
      const input = document.querySelector('.new-list-input input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  crearNuevaLista() {
    if (this.newListName.trim()) {
      this.listasService.crearLista(this.newListName);
      this.showNewListInput = false;
      this.newListName = '';
    }
  }

  agregarALista(animal: Animal, lista: ListaPersonalizada) {
    this.listasService.agregarAnimalALista(
      lista.id,
      animal.propietario,
      animal.nombrePropietario,
      animal.dispositivo
    );
  }

  editarNombre(animal: Animal) {
    this.editingName[animal.propietario] = true;
  }

  guardarNombre(animal: Animal, nombre: string) {
    this.propietariosNombres[animal.propietario] = nombre;
    this.animales.forEach(a => {
      if (a.propietario === animal.propietario) {
        a.nombrePropietario = nombre;
      }
    });
    this.editingName[animal.propietario] = false;
  }

  cancelarEdicion(propietario: string) {
    this.editingName[propietario] = false;
  }

  @HostListener('document:dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.items) {
      const items = Array.from(event.dataTransfer.items);
      const hasExcelFile = items.some(item => 
        item.kind === 'file' && 
        (item.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
         item.type === 'application/vnd.ms-excel' ||
         item.type.includes('sheet') ||
         item.type.includes('excel'))
      );
      
      if (hasExcelFile) {
        this.isDragging = true;
      }
    }
  }

  @HostListener('document:dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = document.documentElement.getBoundingClientRect();
    if (
      event.clientX <= rect.left ||
      event.clientX >= rect.right ||
      event.clientY <= rect.top ||
      event.clientY >= rect.bottom
    ) {
      this.isDragging = false;
    }
  }

  @HostListener('document:drop', ['$event'])
  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isExcelFile(file)) {
        await this.readExcelFile(file);
      }
    }
  }

  private isExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/excel',
      'application/x-excel',
      'application/x-msexcel'
    ];
    return validTypes.includes(file.type) || 
           file.name.endsWith('.xlsx') || 
           file.name.endsWith('.xls');
  }

  private async readExcelFile(file: File) {
    try {
      await this.excelService.cargarExcel(file).toPromise();
      // Recargar los datos después de subir el archivo
      this.excelService.obtenerDatos().subscribe({
        next: (animales) => {
          this.animalesService.setAnimales(animales);
        },
        error: (error) => {
          console.error('Error al recargar datos:', error);
        }
      });
    } catch (error) {
      console.error('Error al cargar el archivo:', error);
    }
  }

  buscar() {
    if (!this.terminoBusqueda.trim()) {
      this.animalesFiltrados = this.animales;
      return;
    }
    this.animalesFiltrados = this.animalesService.buscarAnimales(this.terminoBusqueda);
  }

  agregarYMostrarLista(lista: ListaPersonalizada) {
    this.agregarALista(this.selectedAnimal!, lista);
    this.listaSeleccionada = lista;
    this.showListDetails = true;
  }

  closeListDetails() {
    this.showListDetails = false;
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

  exportarListaExcel() {
    if (!this.listaSeleccionada) return;

    // Obtener todos los animales de la lista seleccionada
    const animalesLista = this.animales.filter(animal => {
      return this.listaSeleccionada?.propietarios[animal.propietario] !== undefined;
    });

    // Crear el workbook y la worksheet
    const wb = XLSX.utils.book_new();
    
    // Transformar los datos al formato deseado (sin la columna nombrePropietario)
    const data = animalesLista.map(animal => ({
      dispositivo: animal.dispositivo,
      raza: animal.raza,
      cruza: animal.cruza,
      sexo: animal.sexo,
      edadMeses: animal.edadMeses,
      edadDias: animal.edadDias,
      propietario: animal.propietario,
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
    const nombreArchivo = `${this.listaSeleccionada.nombre}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }

  exportarExcel() {
    if (!this.selectedAnimal) return;

    // Crear el workbook y la worksheet
    const wb = XLSX.utils.book_new();
    
    // Obtener todos los animales del mismo propietario
    const animalesExportar = this.animales.filter(a => 
      a.propietario === this.selectedAnimal?.propietario
    );

    // Transformar los datos al formato deseado
    const data = animalesExportar.map(animal => ({
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
    const nombreArchivo = `animales_${this.selectedAnimal.propietario}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
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
    this.showContextMenu = false;
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.isExcelFile(file)) {
        this.readExcelFile(file);
      }
    }
  }

  vaciarLista() {
    if (confirm('¿Estás seguro de que deseas vaciar la lista? Esta acción no se puede deshacer.')) {
      this.animales = [];
      this.animalesFiltrados = [];
      this.terminoBusqueda = '';
    }
  }
} 