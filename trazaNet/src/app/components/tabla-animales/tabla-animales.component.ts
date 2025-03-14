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

@Component({
  selector: 'app-tabla-animales',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightPipe],
  templateUrl: './tabla-animales.component.html',
  styleUrls: ['./tabla-animales.component.scss'],
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

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
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
    return file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
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
} 