import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Oauth2RedirectComponent } from './oauth2-redirect.component';

const routes: Routes = [{ path: '', component: Oauth2RedirectComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Oauth2RedirectRoutingModule { }
