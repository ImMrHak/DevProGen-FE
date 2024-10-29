import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemMetricsComponent } from './system-metrics.component';

const routes: Routes = [{ path: '', component: SystemMetricsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemMetricsRoutingModule { }
