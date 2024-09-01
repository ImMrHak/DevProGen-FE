import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { filter } from 'rxjs';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMobile = false;
  RID: string | null = null;
  userInfo: any = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.refreshNavbar();
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.isBrowser()) {
      if(this.checkTokenValidity()){
        this.RID = sessionStorage.getItem('rid');
        await this.fetchUserInfo();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isMobile = (event.target as Window).innerWidth <= 600;
  }

  async fetchUserInfo(): Promise<void> {
    if (this.isBrowser()) {
      this.RID = sessionStorage.getItem('rid');
      if (this.RID === 'A') {
        try {
          this.userInfo = await lastValueFrom(this.adminService.getUserInfo());
        } catch (err) {
          console.error('Error fetching admin info', err);
        }
      } else if (this.RID === 'U') {
        try {
          this.userInfo = await lastValueFrom(this.userService.getUserInfo());
        } catch (err) {
          console.error('Error fetching user info', err);
        }
      } else {
        this.userInfo = null;
      }
      this.cdr.detectChanges();
    }
  }

checkTokenValidity(): boolean {
  const token = sessionStorage.getItem('token');

  if(sessionStorage.getItem('rid')){
    if (token) {
      this.userService.isTokenCorrect(token).subscribe(
        (isValid: boolean) => {
          if (isValid) {
            console.log('Token is valid');
            return true;
          } else {
            console.log('Token is invalid');
            this.logout();
            return false;
          }
        },
        (error) => {
          console.error('Error checking token validity:', error);
          this.logout();
          return false;
        }
      );
    } else {
      console.error('No token found in session storage');
      this.logout();
      return false;
    }
    return false;
  }
  
  return false;
  }


  goToSettings(): void {
    const profileRoute = (sessionStorage.getItem('rid') === 'U') 
      ? '/DevProGen/User/Profile' 
      : '/DevProGen/Admin/Profile';
    this.router.navigate([profileRoute]);
  }

  refreshNavbar(): void {
    this.fetchUserInfo();
  }

  logout(): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('rid');
    }
    this.router.navigate(['/DevProGen/SignIn']);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }
}
