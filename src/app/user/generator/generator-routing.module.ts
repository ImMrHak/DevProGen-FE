import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneratorComponent } from './generator.component';

const routes: Routes = [{ path: '', component: GeneratorComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneratorRoutingModule { }
