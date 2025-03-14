import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TablaAnimalesComponent } from './components/tabla-animales/tabla-animales.component';

const routes: Routes = [
  { path: '', component: TablaAnimalesComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 