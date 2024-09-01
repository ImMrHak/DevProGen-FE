import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let roleGuard: RoleGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [RoleGuard]
    });

    roleGuard = TestBed.inject(RoleGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(roleGuard).toBeTruthy();
  });

  it('should allow activation if roles match', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('A');
    const route: any = { data: { expectedRole: 'A' } };
    const state: any = {};

    expect(roleGuard.canActivate(route, state)).toBe(true);
  });

  it('should deny activation and redirect if roles do not match', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('U');
    spyOn(router, 'navigate');
    const route: any = { data: { expectedRole: 'A' } };
    const state: any = {};

    expect(roleGuard.canActivate(route, state)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/no-access']);
  });
});
