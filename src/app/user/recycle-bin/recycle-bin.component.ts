import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AdminService } from '../../services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-recycle-bin',
  templateUrl: './recycle-bin.component.html',
  styleUrls: ['./recycle-bin.component.css']
})
export class RecycleBinComponent implements OnInit, AfterViewInit {

  displayedColumnsUsers: string[] = ['idUser', 'firstName', 'lastName', 'email', 'accountType', 'creationDate', 'actions'];
  displayedColumnsProjects: string[] = ['idProject', 'name', 'userEmail', 'userName', 'creationDate', 'actions'];

  dataSourceUsers = new MatTableDataSource<any>([]);
  dataSourceProjects = new MatTableDataSource<any>([]);

  @ViewChild('paginatorUsers') paginatorUsers: MatPaginator | undefined;
  @ViewChild('paginatorProjects') paginatorProjects: MatPaginator | undefined;

  constructor(private adminService: AdminService,  private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadDeletedUsers();
    this.loadDeletedProjects();
  }

  ngAfterViewInit(): void {
    // Ensure paginator is set after view initialization
    if (this.paginatorUsers) {
      this.dataSourceUsers.paginator = this.paginatorUsers;
    }
    if (this.paginatorProjects) {
      this.dataSourceProjects.paginator = this.paginatorProjects;
    }
  }

  loadDeletedUsers(): void {
    this.adminService.getDeletedUsers().subscribe(users => {
      this.dataSourceUsers.data = users;
    });
  }

  loadDeletedProjects(): void {
    this.adminService.getDeletedProjects().subscribe(projects => {
      this.dataSourceProjects.data = projects;
    });
  }

  recoverUser(userId: number): void {
    this.adminService.recoverUser(userId).subscribe(response => {
      console.log('Recover user response:', response);
      this.snackBar.open('Account recovered successfully', 'Close', {
        duration: 3000
      });
      this.loadDeletedUsers(); // Refresh the list
    });
  }
  
  recoverProject(projectId: number): void {
    this.adminService.recoverProject(projectId).subscribe(response => {
      console.log('Recover project response:', response);
      this.snackBar.open('Project recovered successfully', 'Close', {
        duration: 3000
      });
      this.loadDeletedProjects(); // Refresh the list
    });
  }

  applyUserFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.dataSourceUsers.filter = input.value.trim().toLowerCase();
    }
  }

  applyProjectFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.dataSourceProjects.filter = input.value.trim().toLowerCase();
    }
  }
}
