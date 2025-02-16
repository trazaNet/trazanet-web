import { Routes } from '@angular/router';
import { TablaAnimalesComponent } from './components/tabla-animales/tabla-animales.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ListasPersonalizadasComponent } from './components/listas-personalizadas/listas-personalizadas.component';
import { CargarGuiasComponent } from './components/cargar-guias/cargar-guias.component';
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
    path: 'register',
    component: RegisterComponent
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
  { 
    path: 'guias/cargar', 
    component: CargarGuiasComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
