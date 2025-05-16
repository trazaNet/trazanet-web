import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TablaAnimalesComponent } from './components/tabla-animales/tabla-animales.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { ListasPersonalizadasComponent } from './components/listas-personalizadas/listas-personalizadas.component';
import { CargarGuiasComponent } from './components/cargar-guias/cargar-guias.component';
import { MiGanadoComponent } from './components/mi-ganado/mi-ganado.component';
import { AuthGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { InversionesComponent } from './components/inversiones/inversiones.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MovimientosComponent } from './components/movimientos/movimientos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'inicio', 
    component: InicioComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'datos', 
    component: TablaAnimalesComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'mi-ganado', 
    component: MiGanadoComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'listas', 
    component: ListasPersonalizadasComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'guias',
    component: CargarGuiasComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'inversiones',
    component: InversionesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'movimientos',
    component: MovimientosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard, adminGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];
