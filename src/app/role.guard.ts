import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree {
    const expectedRole = route.data['expectedRole'];
    let currentRole = null;

    // Check if we're running in a browser environment
    if (typeof window !== 'undefined' && sessionStorage) {
      currentRole = sessionStorage.getItem('rid');
    }

    if (currentRole === expectedRole) {
      return true;
    } else {
      this.router.navigate(['/no-access']);
      return false;
    }
  }
}
