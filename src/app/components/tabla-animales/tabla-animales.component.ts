import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalesService } from '../../services/animales.service';
import { ListasPersonalizadasService } from '../../services/listas-personalizadas.service';
import { HighlightPipe } from '../../pipes/highlight.pipe';

@Component({
  selector: 'app-tabla-animales',
  templateUrl: './tabla-animales.component.html',
  styleUrls: ['./tabla-animales.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HighlightPipe
  ]
})
export class TablaAnimalesComponent implements OnInit {
  animales: any[] = [];
  animalesFiltrados: any[] = [];
  terminoBusqueda: string = '';
  isDragging: boolean = false;
  showContextMenu: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };
  selectedAnimal: any = null;
  editingName: string | null = null;
  showNewListInput: boolean = false;
  showListDetails: boolean = false;

  constructor(
    private animalesService: AnimalesService,
    private listasService: ListasPersonalizadasService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.animalesService.getAnimales().subscribe({
      next: (data) => {
        this.animales = data;
        this.animalesFiltrados = data;
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      }
    });
  }

  buscar() {
    if (!this.terminoBusqueda.trim()) {
      this.animalesFiltrados = this.animales;
      return;
    }
    
    const termino = this.terminoBusqueda.toLowerCase();
    this.animalesFiltrados = this.animales.filter(animal => {
      return Object.values(animal).some(value => 
        value && value.toString().toLowerCase().includes(termino)
      );
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.animalesService.uploadExcel(formData).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error al subir el archivo:', error);
        }
      });
    }
  }

  vaciarLista() {
    if (confirm('¿Está seguro que desea vaciar la lista de animales?')) {
      this.animalesService.vaciarLista().subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error al vaciar la lista:', error);
        }
      });
    }
  }

  onContextMenu(event: MouseEvent, animal: any) {
    event.preventDefault();
    this.showContextMenu = true;
    this.selectedAnimal = animal;
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
  }

  onContextMenuClick(event: Event) {
    event.stopPropagation();
  }

  editarNombre(animal: any) {
    this.editingName = animal.nombre_propietario;
    this.selectedAnimal = animal;
    this.showContextMenu = false;
  }

  guardarNombre(animal: any, nuevoNombre: string) {
    // Implementar la lógica para guardar el nuevo nombre
    this.editingName = null;
  }

  cancelarEdicion(propietario: string) {
    this.editingName = null;
  }

  closeListDetails() {
    this.showListDetails = false;
  }
} 