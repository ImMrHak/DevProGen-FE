import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oauth2-redirect',
  templateUrl: './oauth2-redirect.component.html',
  styleUrls: ['./oauth2-redirect.component.css']
})
export class Oauth2RedirectComponent implements OnInit {
  token: string | null = null;
  rid: string | null = null;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.handleRedirect();
  }

  private handleRedirect(): void {
    const { token, rid } = this.authService.handleOAuth2Redirect();
    this.token = token;
    this.rid = rid;

    if (token && rid) {
      if (rid === 'A') {
        this.router.navigate(['/DevProGen/Admin/Dashboard']);
      } else if (rid === 'U') {
        this.router.navigate(['/DevProGen/User/Dashboard']);
      }
    } else {
      this.router.navigate(['/DevProGen/SignIn']);
    }
  }
}
