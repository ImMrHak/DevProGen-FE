import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;
  passwordStrength = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) {
    this.signUpForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.signUpForm.get('password')!.valueChanges.subscribe(value => {
      this.passwordStrength = this.calculatePasswordStrength(value);
    });
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      const { firstname, lastname, email, username, password } = this.signUpForm.value;
      this.loading = true;

      this.authService.signUp({ "firstName":firstname, "lastName":lastname, "Email":email, "userName":username, "password":password }).subscribe(
        response => { 
          localStorage.setItem('usernamemail', username);
          localStorage.setItem('password', password);
          console.log('Sign up successful', response);
          this.loading = false;
          this.snackBar.open(response.message, 'Close', {
            duration: 3000,
          });
          console.log(response.data.token);
          response.data.rid;
          this.router.navigate(['/DevProGen/SignIn']);
        },
        error => {
          console.error('Sign up failed', error);
          this.snackBar.open(error.error.message, 'Close', {
            duration: 3000,
          });
          this.loading = false;
        }
      );
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword!.setErrors(null);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  calculatePasswordStrength(password: string): number {
    // Basic password strength calculation logic
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  }

  goToSignIn(): void {
    this.router.navigate(['/DevProGen/SignIn']);
  }
}
