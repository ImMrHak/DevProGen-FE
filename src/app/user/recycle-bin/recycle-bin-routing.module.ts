import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecycleBinComponent } from './recycle-bin.component';

const routes: Routes = [{ path: '', component: RecycleBinComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecycleBinRoutingModule { }
