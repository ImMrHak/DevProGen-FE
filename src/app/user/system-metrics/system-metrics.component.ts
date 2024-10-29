import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-system-metrics',
  templateUrl: './system-metrics.component.html',
  styleUrls: ['./system-metrics.component.css']
})
export class SystemMetricsComponent implements OnInit {
  backEndMetrics: any = {};
  frontEndMetrics: any = {};
  diskMetrics: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.getBackEndMetrics();
    this.getFrontEndMetrics();
    setInterval(() => this.getBackEndMetrics(), 5000); // Refresh every 5 seconds
  }

  getBackEndMetrics() {
    this.adminService.getSystemMetrics().subscribe(data => {
      this.backEndMetrics = {
        cpuUsage: this.ensureNumber(data.cpuUsage).toString().split('.')[0],
        cpuSpeed: this.ensureNumber(data.cpuSpeed),
        ramUsage: this.ensureNumber(data.ramUsage).toString().split('.')[0]
      };
      this.diskMetrics = data.diskMetrics.map((disk: any) => ({
        ...disk,
        usedPercentage: this.ensureNumber((disk.usedSpace / disk.totalSpace) * 100),
        totalSpace: this.ensureNumber(disk.totalSpace),
        freeSpace: this.ensureNumber(disk.freeSpace)
      }));
    }, error => {
      console.error('Error fetching backend metrics:', error);
    });
  }

  getFrontEndMetrics() {
    this.frontEndMetrics = {
      cpuUsage: this.getRandomInt(0, 100),
      cpuSpeed: this.getRandomInt(1, 4),
      ramUsage: this.getRandomInt(0, 100),
      totalDiskSpace: 256, // Example: 256 GB
      diskUsage: this.getRandomInt(0, 100),
      freeDiskSpace: (256 * this.getRandomInt(0, 100) / 100) // Example: Free space in GB
    };
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  formatDiskSpace(value: any): string {
    const num = this.ensureNumber(value);
    if (num >= 1024) {
      return (num / 1024).toFixed(2) + ' GB';
    } else {
      return num.toFixed(2) + ' MB';
    }
  }

  ensureNumber(value: any): number {
    const num = Number(value);
    if (isNaN(num)) {
      console.error('Invalid value for formatting disk space:', value);
      return 0;
    }
    return num;
  }
}
