import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from './role.guard';
import { NoAccessComponent } from './no-access/no-access.component';

const routes: Routes = [
  // ROUTES FOR VISITOR
  { path: 'DevProGen/Home', loadChildren: () => import('./visitor/home/home.module').then(m => m.HomeModule) },
  { path: 'DevProGen/SignIn', loadChildren: () => import('./visitor/sign-in/sign-in.module').then(m => m.SignInModule) },
  { path: 'DevProGen/SignUp', loadChildren: () => import('./visitor/sign-up/sign-up.module').then(m => m.SignUpModule) },
  { path: 'DevProGen/oauth2/redirect', loadChildren: () => import('./visitor/oauth2-redirect/oauth2-redirect.module').then(m => m.OAuth2RedirectModule) },
  // END ROUTES FOR VISITOR


  // ROUTES FOR USER
  { path: 'DevProGen/User/Dashboard', loadChildren: () => import('./user/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [RoleGuard], data: { expectedRole: 'U' } },
  { path: 'DevProGen/User/Projects', loadChildren: () => import('./user/projects/projects.module').then(m => m.ProjectsModule), canActivate: [RoleGuard], data: { expectedRole: 'U' } },
  { path: 'DevProGen/User/Projects/Generator', loadChildren: () => import('./user/generator/generator.module').then(m => m.GeneratorModule), canActivate: [RoleGuard], data: { expectedRole: 'U' } },
  { path: 'DevProGen/User/Profile', loadChildren: () => import('./user/profile/profile.module').then(m => m.ProfileModule), canActivate: [RoleGuard], data: { expectedRole: 'U' } },
  // END ROUTES FOR USER


  // ROUTES FOR ADMIN
  { path: 'DevProGen/Admin/Dashboard', loadChildren: () => import('./user/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [RoleGuard], data: { expectedRole: 'A' } },
  { path: 'DevProGen/Admin/Projects', loadChildren: () => import('./user/projects/projects.module').then(m => m.ProjectsModule), canActivate: [RoleGuard], data: { expectedRole: 'A' } },
  { path: 'DevProGen/Admin/Projects/Generator', loadChildren: () => import('./user/generator/generator.module').then(m => m.GeneratorModule), canActivate: [RoleGuard], data: { expectedRole: 'A' } },
  { path: 'DevProGen/Admin/Users', loadChildren: () => import('./user/users/users.module').then(m => m.UsersModule), canActivate: [RoleGuard], data: { expectedRole: 'A' } },
  { path: 'DevProGen/Admin/Logs', loadChildren: () => import('./user/logs/logs.module').then(m => m.LogsModule), canActivate: [RoleGuard], data: { expectedRole: 'A' } },
  { path: 'DevProGen/Admin/System/Metrics', loadChildren: () => import('./user/system-metrics/system-metrics.module').then(m => m.SystemMetricsModule), canActivate: [RoleGuard], data: { expectedRole: 'A' } },
  { path: 'DevProGen/Admin/RecycleBin', loadChildren: () => import('./user/recycle-bin/recycle-bin.module').then(m => m.RecycleBinModule), canActivate: [RoleGuard], data: { expectedRole: 'A' } },
  { path: 'DevProGen/Admin/Profile', loadChildren: () => import('./user/profile/profile.module').then(m => m.ProfileModule), canActivate: [RoleGuard], data: { expectedRole: 'A' } },
  // END ROUTES FOR ADMIN


  // ACCESS DENIED (NEED TO BE FIXED FOR ERRORS LIKE 404-500)
  { path: 'no-access', component: NoAccessComponent },


  // WRONG PATH URL
  { path: '', redirectTo: '/DevProGen/Home', pathMatch: 'full' },
  { path: '**', redirectTo: '/DevProGen/Home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
