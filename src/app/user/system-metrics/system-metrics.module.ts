import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemMetricsRoutingModule } from './system-metrics-routing.module';
import { SystemMetricsComponent } from './system-metrics.component';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { NgxGaugeModule } from 'ngx-gauge';

@NgModule({
  declarations: [
    SystemMetricsComponent
  ],
  imports: [
    CommonModule,
    SystemMetricsRoutingModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatGridListModule,
    MatDividerModule,
    NgxGaugeModule
  ]
})
export class SystemMetricsModule { }
