import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Oauth2RedirectComponent } from './oauth2-redirect.component';

const routes: Routes = [
  { path: '', component: Oauth2RedirectComponent }
];

@NgModule({
  declarations: [Oauth2RedirectComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule
  ]
})
export class OAuth2RedirectModule { }
