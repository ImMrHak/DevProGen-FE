import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080';
  private regularAuthUrl = `${this.apiUrl}/api/v1/auth`;
  private oauthUrl = `${this.apiUrl}/oauth2/authorization`;

  constructor(private http: HttpClient) {}

  signIn(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.regularAuthUrl}/SignIn`, { "usernameOrEmail": username, "password": password });
  }

  signUp(user: any): Observable<any> {
    return this.http.post(`${this.regularAuthUrl}/SignUp`, user);
  }

  loginWithOAuth(provider: string): void {
    window.location.href = `${this.oauthUrl}/${provider}`;
  }

  handleOAuth2Redirect(): { token: string | null, rid: string | null } {
    if (this.isBrowser()) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const rid = urlParams.get('rid');
      if (token && rid) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('rid', rid);
      }
      return { token, rid };
    }
    return { token: null, rid: null };
  }

  getRole(): string | null {
    return sessionStorage.getItem('rid');
  }

  hasRole(expectedRole: string): boolean {
    const role = this.getRole();
    return role === expectedRole;
  }
  
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
