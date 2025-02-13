import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { ListasPersonalizadasService } from './services/listas-personalizadas.service';
import { ListaPersonalizada } from './interfaces/lista-personalizada.interface';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'trazaNet';
  showSidebar = false;
  isLoginPage = true;
  showingLists = false;
  showNewListInput = false;
  newListName = '';
  listas: ListaPersonalizada[] = [];
  listaSeleccionada: ListaPersonalizada | null = null;
  showConfirmDialog = false;
  confirmDialogMessage = '';
  confirmDialogAction: () => void = () => {};
  confirmDialogPosition = { x: 0, y: 0 };

  constructor(
    private router: Router,
    private authService: AuthService,
    private listasService: ListasPersonalizadasService
  ) {
    // Suscribirse a los cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Actualizar isLoginPage basado en la ruta actual
      this.isLoginPage = event.url === '/login' || event.url === '/';
      
      // Si no está autenticado y no está en la página de login, redirigir a login
      if (!this.authService.isLoggedIn() && !this.isLoginPage) {
        this.router.navigate(['/login']);
      }
    });

    // Suscribirse a las listas
    this.listasService.listas$.subscribe(listas => {
      this.listas = listas;
    });
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  toggleListasSection() {
    this.showingLists = !this.showingLists;
    if (!this.showingLists) {
      this.showNewListInput = false;
    }
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
    this.showSidebar = false;
    this.showingLists = false;
  }

  logout() {
    this.authService.logout();
  }

  crearLista() {
    if (this.newListName.trim()) {
      this.listasService.crearLista(this.newListName);
      this.newListName = '';
      this.showNewListInput = false;
    }
  }

  getListaCount(lista: ListaPersonalizada): number {
    return Object.keys(lista.propietarios).length;
  }

  showConfirmation(message: string, action: () => void) {
    this.confirmDialogMessage = message;
    this.confirmDialogAction = action;
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
    event.stopPropagation(); // Evitar que el evento se propague
    this.showConfirmation(
      '¿Estás seguro de que deseas eliminar esta lista?',
      () => {
        this.listasService.eliminarLista(lista.id);
        this.showSidebar = false; // Cerrar el sidebar después de eliminar
      }
    );
  }

  mostrarDetallesLista(lista: ListaPersonalizada) {
    this.listaSeleccionada = lista;
  }

  cerrarDetallesLista() {
    this.listaSeleccionada = null;
  }

  getPropietariosLista(lista: ListaPersonalizada) {
    return Object.entries(lista.propietarios).map(([numero, datos]) => ({
      numero,
      nombre: datos.nombre,
      animales: datos.animales
    }));
  }

  exportarListaExcel(lista: ListaPersonalizada) {
    // Crear el workbook y la worksheet
    const wb = XLSX.utils.book_new();
    
    // Obtener todos los propietarios y sus animales
    const data = this.getPropietariosLista(lista).flatMap(propietario => 
      propietario.animales.map(dispositivo => ({
        dispositivo,
        propietario: propietario.numero,
        nombre: propietario.nombre
      }))
    );

    // Crear la worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Agregar la worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Animales');

    // Generar el archivo y descargarlo
    const nombreArchivo = `${lista.nombre}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }
}
