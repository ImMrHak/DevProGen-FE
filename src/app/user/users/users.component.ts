import { Component, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from '../../services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  displayedColumns: string[] = ['idUser', 'firstName', 'lastName', 'email', 'accountType', 'creationDate', 'actions'];
  dataSource!: MatTableDataSource<any>;
  emailMessage!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('resetPasswordDialog') resetPasswordDialog!: TemplateRef<any>;
  @ViewChild('sendEmailDialog') sendEmailDialog!: TemplateRef<any>;
  @ViewChild('editUserDialog') editUserDialog!: TemplateRef<any>;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;

  constructor(private adminService: AdminService, public dialog: MatDialog,  private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.adminService.getListUsers().subscribe(users => {
      this.dataSource = new MatTableDataSource(users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  exportAsCSV() {
    const csvData = this.convertToCSV(this.dataSource.data);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  convertToCSV(data: any[]): string {
    const headers = this.displayedColumns.slice(0, -1).join(';');
    const rows = data.map(row => 
      this.displayedColumns.slice(0, -1).map(column => row[column]).join(';')
    );
    return [headers, ...rows].join('\n');
  }

  openResetPasswordDialog(user: any) {
    const dialogRef = this.dialog.open(this.resetPasswordDialog, { data: user });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmResetPassword(user);
      }
    });
  }

  openSendEmailDialog(user: any) {
    const dialogRef = this.dialog.open(this.sendEmailDialog, { data: user });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendEmail(user);
      }
    });
  }

  confirmDeleteUser(user: any) {
    const dialogRef = this.dialog.open(this.confirmDeleteDialog, { data: user });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(user);
      }
    });
  }

  confirmResetPassword(user: any) {
    this.adminService.resetUserPassword(user.idUser)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Password reset for:' + user, "Close");
          this.dialog.closeAll();
        },
        error: (err) => {
          this.snackBar.open('Error resetting password:' + user, "Close");
        },
        complete: () => {
          this.snackBar.open('Password reset request completed.', "Close");
        }
      });
  }
  
  sendEmail(user: any) {
    this.adminService.sendEmailToUser(user.email, this.emailMessage)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Email sent to:' + user.email, "Close");
          this.dialog.closeAll();
        },
        error: (err) => {
          this.snackBar.open('Error sending email:', "Close");
        },
        complete: () => {
          this.snackBar.open('Email sending request completed.', "Close");
        }
      });
  }
  
  deleteUser(user: any) {
    this.adminService.deleteUser(user.idUser)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Deleted user:' + user, "Close");
          this.dialog.closeAll();
        },
        error: (err) => {
          this.snackBar.open('Error deleting user:', "Close");
        },
        complete: () => {
          this.snackBar.open('User deletion request completed.', "Close");
        }
      });
  }
  
}
