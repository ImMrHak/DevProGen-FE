import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { AdminService } from '../../services/admin.service';

interface Log {
  idLog: number;
  logMessage: string;
  logSeverity: 'LOW' | 'MID' | 'HIGH';
}

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  displayedColumns: string[] = ['idLog', 'logMessage', 'logSeverity'];
  dataSource!: MatTableDataSource<Log>;
  severityFilter: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private adminService: AdminService,private router: Router) {}

  ngOnInit(): void {
    if (!sessionStorage.getItem('token') || !sessionStorage.getItem('rid')) {
      this.router.navigate(['/DevProGen/SignIn']);
      return;
    }
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.adminService.getListLogs().subscribe((logs: any) => {
      this.dataSource = new MatTableDataSource(logs.data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.applyFilter();
      this.dataSource.data = this.sortLogsBySeverity(this.dataSource.data);
    });
  }

  applyFilter(): void {
    this.dataSource.filterPredicate = (data: Log, filter: string) => {
      if (!filter) return true;
      return data.logSeverity === filter;
    };
    this.dataSource.filter = this.severityFilter;
  }

  onSeverityChange(severity: string): void {
    this.severityFilter = severity;
    this.applyFilter();
  }

  sortLogsBySeverity(logs: Log[]): Log[] {
    const severityOrder = { 'HIGH': 1, 'MID': 2, 'LOW': 3 };
    return logs.sort((a, b) => severityOrder[a.logSeverity] - severityOrder[b.logSeverity]);
  }

  exportCSV(): void {
    const logsToExport = this.dataSource.filteredData.map(log => ({
      idLog: log.idLog,
      logMessage: log.logMessage,
      logSeverity: log.logSeverity
    }));

    const csvContent = 'idLog;logMessage;logSeverity\n' + logsToExport.map(row => Object.values(row).join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'LOW':
        return 'blue';
      case 'MID':
        return 'yellow';
      case 'HIGH':
        return 'red';
      default:
        return '';
    }
  }
}
