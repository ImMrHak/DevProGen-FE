import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    if (sessionStorage.getItem('rid') === 'A') {
      this.adminService.getUserInfo().subscribe(user => {
        this.profileForm.patchValue({
          firstName: user.data.firstName,
          lastName: user.data.lastName,
          email: user.data.email,
        });
      });
    } else {
      this.userService.getUserInfo().subscribe(user => {
        this.profileForm.patchValue({
          firstName: user.data.firstName,
          lastName: user.data.lastName,
          email: user.data.email,
        });
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      if (sessionStorage.getItem('rid') === 'A'){
        this.adminService.updateAdminProfile(this.profileForm.value).subscribe(
          response => {
            this.snackBar.open('Profile updated successfully', 'Close', {
              duration: 3000
            });
          },
          error => {
            this.snackBar.open('Failed to update profile', 'Close', {
              duration: 3000
            });
          }
        );
      }
      else{
        this.userService.updateUserProfile(this.profileForm.value).subscribe(
          response => {
            this.snackBar.open('Profile updated successfully', 'Close', {
              duration: 3000
            });
          },
          error => {
            this.snackBar.open('Failed to update profile', 'Close', {
              duration: 3000
            });
          }
        );
      }
      
    }
  }

  onCancel(): void {
    this.loadUserProfile();  // Reload user profile to revert unsaved changes
  }
}
