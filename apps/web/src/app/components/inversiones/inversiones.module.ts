import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { InversionesComponent } from './inversiones.component';
import { InversionAnalyticsComponent } from './inversion-analytics/inversion-analytics.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule,
    // Importar componentes standalone
    InversionesComponent,
    InversionAnalyticsComponent
  ],
  exports: [
    InversionesComponent,
    InversionAnalyticsComponent
  ]
})
export class InversionesModule { } 