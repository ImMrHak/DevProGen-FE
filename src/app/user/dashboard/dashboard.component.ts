import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { Color, ScaleType } from '@swimlane/ngx-charts';

interface Project {
  idProject: number;
  name: string;
  creationDate: string;
}

interface User {
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  accountType: string;
  creationDate: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isAdmin: boolean = false;
  totalProjects: number = 0;
  projectData: any[] = [];
  yearlyData: any[] = [];
  monthlyData: { [year: string]: { [month: string]: Project[] } } = {};
  dailyData: { [yearMonth: string]: { [day: string]: Project[] } } = {};
  userGrowthData: any[] = [];
  logSeverityData: any[] = [];
  ownProjectsChartData: any[] = [];

  currentLevel: 'year' | 'month' | 'day' = 'year';
  currentYear: string | null = null;
  currentMonth: string | null = null;

  // Chart options
  view: [number, number] = [700, 400];
  showLegend: boolean = true;
  showLabels: boolean = true;
  explodeSlices: boolean = false;
  doughnut: boolean = false;
  colorScheme: Color = {
    name: 'cool',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(
    private router: Router,
    private userService: UserService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    if (!sessionStorage.getItem('token') || !sessionStorage.getItem('rid')) {
      this.router.navigate(['/DevProGen/SignIn']);
      return;
    }

    const role = sessionStorage.getItem('rid');
    this.isAdmin = (role === 'A');

    if (this.isAdmin) {
      this.fetchUserGrowthData();
      this.fetchLogSeverityData();
      this.fetchTotalProjectsAdmin();
      this.fetchProjectDataAdmin();
      this.fetchOwnProjectsAdmin();
    } else {
      this.fetchTotalProjects();
      this.fetchProjectData();
    }
  }

  fetchTotalProjects(): void {
    this.userService.getCountTotalProjects().subscribe(data => {
      this.totalProjects = data;
    });
  }

  fetchProjectData(): void {
    this.userService.getListProjects().subscribe(projects => {
      this.processProjectData(projects);
    });
  }

  fetchTotalProjectsAdmin(): void {
    this.adminService.getCountTotalProjects().subscribe(data => {
      this.totalProjects = data;
    });
  }

  fetchProjectDataAdmin(): void {
    this.adminService.getListProjects().subscribe(projects => {
      this.processProjectData(projects);
    });
  }

  fetchOwnProjectsAdmin(): void {
    this.adminService.getListOwnProjects().subscribe(projects => {
      this.ownProjectsChartData = projects.map(p => ({ name: p.name, value: 1 }));
    });
  }

  processProjectData(projects: Project[]): void {
    this.yearlyData = this.processYearlyData(projects);
    this.monthlyData = this.processMonthlyData(projects);
    this.dailyData = this.processDailyData(projects);
    this.projectData = this.yearlyData;
  }

  processYearlyData(projects: Project[]): any[] {
    const data: { [key: string]: number } = {};

    projects.forEach(project => {
      const year = new Date(project.creationDate).getFullYear().toString();
      if (!data[year]) {
        data[year] = 0;
      }
      data[year]++;
    });

    return Object.keys(data).map(key => ({
      name: key,
      value: data[key]
    }));
  }

  processMonthlyData(projects: Project[]): { [year: string]: { [month: string]: Project[] } } {
    const data: { [year: string]: { [month: string]: Project[] } } = {};

    projects.forEach(project => {
      const date = new Date(project.creationDate);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      if (!data[year]) {
        data[year] = {};
      }
      if (!data[year][month]) {
        data[year][month] = [];
      }
      data[year][month].push(project);
    });

    return data;
  }

  processDailyData(projects: Project[]): { [yearMonth: string]: { [day: string]: Project[] } } {
    const data: { [yearMonth: string]: { [day: string]: Project[] } } = {};

    projects.forEach(project => {
      const date = new Date(project.creationDate);
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const day = date.getDate().toString().padStart(2, '0');
      if (!data[yearMonth]) {
        data[yearMonth] = {};
      }
      if (!data[yearMonth][day]) {
        data[yearMonth][day] = [];
      }
      data[yearMonth][day].push(project);
    });

    return data;
  }

  fetchUserGrowthData(): void {
    this.adminService.getListUsers().subscribe((users: User[]) => {
      const accountTypeCounts = users.reduce((acc: any, user: User) => {
        acc[user.accountType] = (acc[user.accountType] || 0) + 1;
        return acc;
      }, {});

      this.userGrowthData = Object.keys(accountTypeCounts).map(accountType => ({
        name: accountType,
        value: accountTypeCounts[accountType]
      }));
    });
  }

  fetchLogSeverityData(): void {
    this.adminService.getListLogs().subscribe(logs => {
      const logSeverityCount = logs.reduce((acc: any, log: any) => {
        acc[log.logSeverity] = (acc[log.logSeverity] || 0) + 1;
        return acc;
      }, {});

      this.logSeverityData = [
        { name: 'Low', value: logSeverityCount['LOW'] || 0 },
        { name: 'Mid', value: logSeverityCount['MID'] || 0 },
        { name: 'High', value: logSeverityCount['HIGH'] || 0 }
      ];
    });
  }

  onSelect(event: any): void {
    if (this.currentLevel === 'year') {
      this.currentLevel = 'month';
      this.currentYear = event.name;
      this.projectData = this.transformMonthlyData(this.monthlyData[this.currentYear!] || {});
    } else if (this.currentLevel === 'month') {
      this.currentLevel = 'day';
      this.currentMonth = this.getMonthNumber(event.name).toString().padStart(2, '0');
      const key = `${this.currentYear}-${this.currentMonth}`;
      this.projectData = this.transformDailyData(this.dailyData[key] || {});
    }
  }

  onSelectProject(event: any, projectType: string): void {
    if (projectType === 'all') {
      console.log('Selected All Projects:', event);
      // Add your logic for handling all projects selection
    } else if (projectType === 'own') {
      console.log('Selected Own Projects:', event);
      // Add your logic for handling own projects selection
    }
  }

  onReset(): void {
    if (this.currentLevel === 'day') {
      this.currentLevel = 'month';
      this.projectData = this.transformMonthlyData(this.monthlyData[this.currentYear!] || {});
      this.currentMonth = null;
    } else if (this.currentLevel === 'month') {
      this.currentLevel = 'year';
      this.projectData = this.yearlyData;
      this.currentYear = null;
    }
  }

  private transformMonthlyData(data: { [month: string]: Project[] }): any[] {
    const result: { [key: string]: number } = {};

    Object.keys(data).forEach(month => {
      result[month] = data[month].length;
    });

    return Object.keys(result).map(month => ({
      name: this.getMonthName(parseInt(month, 10)),
      value: result[month]
    }));
  }

  private transformDailyData(data: { [day: string]: Project[] }): any[] {
    const result: { [key: string]: number } = {};
  
    Object.keys(data).forEach(day => {
      result[day] = data[day].length;
    });
  
    return Object.keys(result).map(day => ({
      name: this.getDayName(parseInt(day, 10)),
      value: result[day]
    }));
  }
  

  private getMonthName(month: number): string {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('default', { month: 'long' });
  }

  private getMonthNumber(monthName: string): number {
    const date = new Date();
    date.setMonth(0);
    for (let i = 0; i < 12; i++) {
      if (date.toLocaleString('default', { month: 'long' }) === monthName) {
        return i + 1;
      }
      date.setMonth(date.getMonth() + 1);
    }
    return 0; // Default value if monthName is invalid
  }

  private getDayName(day: number): string {
    const date = new Date();
    date.setDate(day);
    return date.toLocaleString('default', { weekday: 'long' });
  }
}
