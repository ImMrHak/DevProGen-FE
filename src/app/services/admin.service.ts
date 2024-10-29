import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = 'http://localhost:8080/api/v1/user';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/userInfo`, { headers: this.getAuthHeaders() });
  }

  getCountTotalUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/countUsers`, { headers: this.getAuthHeaders() });
  }

  getListUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/listUsers`, { headers: this.getAuthHeaders() });
  }

  getCountTotalLogs(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/countLogs`, { headers: this.getAuthHeaders() });
  }

  getListLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/listLogs`, { headers: this.getAuthHeaders() });
  }

  getCountTotalProjects(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/countMyProjects`, { headers: this.getAuthHeaders() });
  }

  getListProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/listMyProjects`, { headers: this.getAuthHeaders() });
  }

  getCountOwnProjects(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/countOwnProjects`, { headers: this.getAuthHeaders() });
  }

  getListOwnProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/listMyProjects`, { headers: this.getAuthHeaders() });
  }

  getListAllProjects(): Observable<{ data:any }> {
     return this.http.get<{ data: any }>(`${this.baseUrl}/listMyProjects`, { headers: this.getAuthHeaders() });
  }

  generateProject(file: File, projectName: string, isBEOnly: boolean): Observable<Blob> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectName', projectName);
    formData.append('isBEOnly', isBEOnly.toString());

    // Ensure no Content-Type header is set explicitly here
    return this.http.post(`${this.baseUrl}/generateMyProject`, formData, {
        headers: this.getAuthHeaders(), // Ensure this method does not set 'Content-Type'
        responseType: 'blob'
    });
}


  updateProjectName(project: { idProject: number, name: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/updateMyProjectName`, project, { headers: this.getAuthHeaders() });
  }

  downloadProject(projectId: number): Observable<HttpEvent<any>> {
    return this.http.get(`${this.baseUrl}/downloadMyExistingProject`, {
      headers: this.getAuthHeaders(),
      params: { projectId: projectId.toString() },
      responseType: 'blob' as 'json',
      observe: 'events',
      reportProgress: true
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            break;
          case HttpEventType.Response:
            return event;
        }
        return event;
      }),
      catchError(this.handleError)
    );
  }

  deleteProject(id: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${sessionStorage.getItem('token')}`);
    return this.http.delete<any>(`${this.baseUrl}/deleteMyProject?projectId=${id}`, { headers, responseType: 'text' as 'json' })
        .pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return throwError(() => new Error('An error occurred while deleting the project.'));
            })
        );
}

resetUserPassword(id: number): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${sessionStorage.getItem('token')}`);
  return this.http.put<any>(`${this.baseUrl}/resetUserPassword?userId=${id}`, null, { headers, responseType: 'text' as 'json' })
      .pipe(
          catchError((error: HttpErrorResponse) => {
              console.error('Error occurred:', error);
              return throwError(() => new Error('An error occurred while resetting the password.'));
          })
      );
}

sendEmailToUser(email: string, message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/sendEmailToUser`, { 'email': email, 'message': message }, {
        headers: this.getAuthHeaders(),
        responseType: 'text' as 'json'
    });
}


deleteUser(id: number): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${sessionStorage.getItem('token')}`);
  return this.http.delete<any>(`${this.baseUrl}/deleteUser?userId=${id}`, { headers, responseType: 'text' as 'json' })
      .pipe(
          catchError((error: HttpErrorResponse) => {
              console.error('Error occurred:', error);
              return throwError(() => new Error('An error occurred while deleting the user.'));
          })
      );
}

getSystemMetrics(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/systemMetrics`, { headers: this.getAuthHeaders() }).pipe(
    map((data: any) => ({
      cpuUsage: Number(data.data.cpuUsage),
      cpuSpeed: Number(data.data.cpuSpeed),
      ramUsage: Number(data.data.ramUsage),
      diskMetrics: data.data.diskMetrics.map((disk: any) => ({
        name: disk.name,
        totalSpace: Number(disk.totalSpace),
        freeSpace: Number(disk.freeSpace),
        usedSpace: Number(disk.usedSpace)
      }))
    }))
  );
}

recoverUser(userId: number): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/recoverUser`, null, {
    headers: this.getAuthHeaders(),
    params: { userId: userId.toString() }
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error occurred:', error);
      return throwError(() => new Error('An error occurred while recovering the user.'));
    })
  );
}

recoverProject(projectId: number): Observable<any> {
  return this.http.put<any>(`${this.baseUrl}/recoverProject`, null, {
    headers: this.getAuthHeaders(),
    params: { projectId: projectId.toString() }
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error occurred:', error);
      return throwError(() => new Error('An error occurred while recovering the project.'));
    })
  );
}

getDeletedUsers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/deletedUsers`, { headers: this.getAuthHeaders() })
    .pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error occurred:', error);
        return throwError(() => new Error('An error occurred while fetching deleted users.'));
      })
    );
}

getDeletedProjects(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/deletedProjects`, { headers: this.getAuthHeaders() })
    .pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error occurred:', error);
        return throwError(() => new Error('An error occurred while fetching deleted projects.'));
      })
    );
}

updateAdminProfile(userUpdateProfileDTO: { firstName: string; lastName: string; email: string;}): Observable<any> {
  return this.http.put(`${this.baseUrl}/updateMyProfile`, userUpdateProfileDTO, { headers: this.getAuthHeaders() })
    .pipe(
      catchError(this.handleError)
    );
}

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    return throwError('An error occurred while downloading the file. Please try again.');
  }
}
