import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { InversionesComponent } from './components/inversiones/inversiones.component';
import { CargarGuiasComponent } from './components/cargar-guias/cargar-guias.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'inicio', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'mi-ganado', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'datos', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'listas', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'guias', component: CargarGuiasComponent, canActivate: [AuthGuard] },
  { path: 'inversiones', component: InversionesComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 