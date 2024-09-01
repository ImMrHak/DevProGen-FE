import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

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

  getCountTotalProjects(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/countProjects`, { headers: this.getAuthHeaders() });
  }

  getListProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/listProjects`, { headers: this.getAuthHeaders() });
  }

  generateProject(file: File, projectName: string): Observable<Blob> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectName', projectName);
    return this.http.post(`${this.baseUrl}/generateProject`, formData, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  generateProjectWithoutFrontEnd(file: File, projectName: string): Observable<Blob> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectName', projectName);
    return this.http.post(`${this.baseUrl}/genereateProjectWithoutFE`, formData, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  generateProjectWithInserts(file: File, projectName: string, csvFiles: File[]): Observable<Blob> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('projectName', projectName);

    if (csvFiles.length === 1) {
        formData.append('csvDataFile', csvFiles[0]);
    }

    return this.http.post(`${this.baseUrl}/generateProjectWithInserts`, formData, {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
    });
}

  
  

  updateProjectName(project: { idProject: number, name: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/updateProjectName`, project, { headers: this.getAuthHeaders() });
  }
  
  downloadProject(projectId: number): Observable<HttpEvent<any>> {
    return this.http.get(`${this.baseUrl}/downloadExistingProject`, {
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
    return this.http.delete<any>(`${this.baseUrl}/deleteProject?projectId=${id}`, { headers, responseType: 'text' as 'json' })
        .pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return throwError(() => new Error('An error occurred while deleting the project.'));
            })
        );
}

updateUserProfile(user: { firstName: string; lastName: string; email: string;}): Observable<any> {
  return this.http.put(`${this.baseUrl}/updateMe`, user, { headers: this.getAuthHeaders() })
    .pipe(
      catchError(this.handleError)
    );
}

isTokenCorrect(token: string): Observable<boolean> {
  return this.http.get<boolean>(`http://localhost:8080/api/v1/auth/isTokenCorrect?token=${token}`);
}



  private handleError(error: HttpErrorResponse) {
    console.error(error);
    return throwError('An error occurred while downloading the file. Please try again.');
  }
}
