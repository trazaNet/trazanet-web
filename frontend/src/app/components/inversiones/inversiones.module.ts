import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { InversionesComponent } from './inversiones.component';
import { InversionAnalyticsComponent } from './inversion-analytics/inversion-analytics.component';

@NgModule({
  declarations: [
    InversionesComponent,
    InversionAnalyticsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule
  ],
  exports: [
    InversionesComponent
  ]
})
export class InversionesModule { } 