import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { HttpEventType } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Project {
  idProject: number;
  name: string;
  creationDate: string;
  user: any
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ProjectsComponent implements OnInit {
  isAdmin: boolean = false;
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  paginatedProjects: Project[] = [];
  pageSize: number = 6;
  years: string[] = [];
  selectedYear: string | null = '';
  editForm: FormGroup;
  selectedProject: Project | null = null;
  showDeleteDialog: boolean = false;
  projectToDelete: number | null = null;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!sessionStorage.getItem('token') || !sessionStorage.getItem('rid')) {
      this.router.navigate(['/DevProGen/SignIn']);
      return;
    }

    const role = sessionStorage.getItem('rid');
    this.isAdmin = (role === 'A');

    if (this.isAdmin) {
      this.loadAdminAllProjects();
    } else {
      this.loadUserProjects();
    }
  }

  loadAdminAllProjects(): void {
    this.adminService.getListAllProjects().subscribe((response: { data: Project[] }) => {
        this.projects = response.data; // Extracting projects from response.data
        this.filteredProjects = response.data;
        this.paginateProjects();
        this.populateYears();
    });
}

loadUserProjects(): void {
  this.userService.getListProjects().subscribe((response: { data: Project[] }) => {
      this.projects = response.data; // Extracting projects from response.data
      this.filteredProjects = response.data;
      this.paginateProjects();
      this.populateYears();
  });
}

  filterProjectsByName(event: Event): void {
    const target = event.target as HTMLInputElement;
    const name = target.value.trim().toLowerCase();
    this.filteredProjects = this.projects.filter(project => project.name.toLowerCase().includes(name));
    this.paginateProjects();
  }

  filterProjectsByYear(year: string): void {
    this.selectedYear = year;
    if (year) {
      this.filteredProjects = this.projects.filter(project => project.creationDate.startsWith(year));
    } else {
      this.filteredProjects = this.projects;
    }
    this.paginateProjects();
  }

  populateYears(): void {
    const yearsSet = new Set<string>();
    this.projects.forEach(project => {
      yearsSet.add(project.creationDate.substring(0, 4));
    });
    this.years = Array.from(yearsSet).sort();
  }

  paginateProjects(): void {
    this.paginatedProjects = this.filteredProjects.slice(0, this.pageSize);
  }

  handlePageEvent(event: PageEvent): void {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.paginatedProjects = this.filteredProjects.slice(startIndex, endIndex);
  }

  openEditDialog(project: Project): void {
    this.selectedProject = project;
    this.editForm.setValue({ name: project.name });
  }

  saveProject(): void {
    if (this.editForm.invalid || !this.selectedProject) return;

    const newName = this.editForm.value.name;
    const projectUpdate = { idProject: this.selectedProject.idProject, name: newName };

    if (this.isAdmin) {
      this.adminService.updateProjectName(projectUpdate).subscribe(response => {
        this.snackBar.open('Project updated successfully', "Close")
        this.loadAdminAllProjects();
        this.selectedProject = null; // Close the dialog
      });
    } else {
      this.userService.updateProjectName(projectUpdate).subscribe(response => {
        this.snackBar.open('Project updated successfully', "Close")
        this.loadUserProjects();
        this.selectedProject = null; // Close the dialog
      });
    }
  }

  cancelEdit(): void {
    this.selectedProject = null;
  }

  openDeleteDialog(id: number): void {
    this.projectToDelete = id;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.projectToDelete = null;
    this.showDeleteDialog = false;
  }

  confirmDelete(): void {
    if (!this.projectToDelete) return;

    const service = this.isAdmin ? this.adminService : this.userService;
    service.deleteProject(this.projectToDelete).subscribe({
        next: (response) => {
          this.snackBar.open('Project deleted successfully', "Close")
            console.log('Project deleted successfully:', response);
            this.loadProjects();
            this.cancelDelete();
        },
        error: (error) => {
            console.error('Error deleting project:', error.message);
            this.snackBar.open('Failed to delete the project. Please try again later.', "Close")
        }
    });
}


  downloadProject(id: number, name: string): void {
    const service = this.isAdmin ? this.adminService : this.userService;
    service.downloadProject(id).subscribe(event => {
      if (event.type === HttpEventType.Response) {
        const contentDisposition = event.headers.get('Content-Disposition');
        const filename = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"/g, '') : `${name}.zip`;

        const blob = new Blob([event.body], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    });
  }

  generateProject(): void {
    this.router.navigate([(this.isAdmin) ? '/DevProGen/Admin/Projects/Generator' : '/DevProGen/User/Projects/Generator']);
  }

  loadProjects(): void {
    if (this.isAdmin) {
      this.loadAdminAllProjects();
    } else {
      this.loadUserProjects();
    }
  }
}
