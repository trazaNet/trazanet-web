import { Routes } from '@angular/router';
import { TablaAnimalesComponent } from './components/tabla-animales/tabla-animales.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { ListasPersonalizadasComponent } from './components/listas-personalizadas/listas-personalizadas.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    pathMatch: 'full',
    component: LoginComponent
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'inicio', 
    component: InicioComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'datos', 
    component: TablaAnimalesComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'listas', 
    component: ListasPersonalizadasComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
