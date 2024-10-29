import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  isDarkTheme: boolean = false;
  loginForm: FormGroup;
  hidePassword = true;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private snackBar: MatSnackBar) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.detectTheme();
    this.fillLoginForm();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password, rememberMe } = this.loginForm.value;
      this.authService.signIn(username, password).subscribe(
        response => {
          console.log('Login successful', response);
          if (rememberMe) {
            this.setLocalStorage('usernamemail', username);
            this.setLocalStorage('password', password);
          } else {
            this.removeLocalStorage('usernamemail');
            this.removeLocalStorage('password');
          }

          this.setSessionStorage('token', response.data.token);
          this.setSessionStorage('rid', response.data.rid);

         // Show success message
          this.snackBar.open('Login successful!', 'Close', {
            duration: 2000 // Adjust the duration as needed
          });

          // Navigate after a short delay
          setTimeout(() => {
            if (response.data.rid === 'A') {
              this.router.navigate(['/DevProGen/Admin/Dashboard']);
            } else if (response.data.rid === 'U') {
              this.router.navigate(['/DevProGen/User/Dashboard']);
            }
          }, 2000); // Delay should match the snack bar duration
        },
        error => {
          console.error('Login failed', error);
          this.snackBar.open('Login failed!', "Close")
        }
      );
    }
  }

  loginWithOAuth(provider: string): void {
    this.authService.loginWithOAuth(provider);
  }

  navigateToSignUp(): void {
    this.router.navigate(['/DevProGen/SignUp']);
  }

  private fillLoginForm(): void {
    if (this.isBrowser()) {
      const storedUsername = localStorage.getItem('usernamemail');
      const storedPassword = localStorage.getItem('password');

      if (storedUsername && storedPassword) {
        this.loginForm.patchValue({
          username: storedUsername,
          password: storedPassword,
          rememberMe: true
        });
      }
    }
  }

  private detectTheme(): void {
    if (this.isBrowser()) {
      const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkTheme = darkThemeMq.matches;
      this.updateThemeClass();

      darkThemeMq.addEventListener('change', (e) => {
        this.isDarkTheme = e.matches;
        this.updateThemeClass();
      });
    }
  }

  private updateThemeClass(): void {
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

  private setLocalStorage(key: string, value: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(key, value);
    }
  }

  private removeLocalStorage(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
    }
  }

  private setSessionStorage(key: string, value: string): void {
    if (this.isBrowser()) {
      sessionStorage.setItem(key, value);
    }
  }
}
