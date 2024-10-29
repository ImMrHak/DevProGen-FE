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
    return this.http.get<number>(`${this.baseUrl}/countMyProjects`, { headers: this.getAuthHeaders() });
  }

  getListProjects(): Observable<{ data: any }> {
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
    return this.http.put<any>(`${this.baseUrl}/updateProjectName`, project, { headers: this.getAuthHeaders() });
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
    return this.http.delete<any>(`${this.baseUrl}/deleteProject?projectId=${id}`, { headers, responseType: 'text' as 'json' })
        .pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error occurred:', error);
                return throwError(() => new Error('An error occurred while deleting the project.'));
            })
        );
}

updateUserProfile(userUpdateProfileDTO: { firstName: string; lastName: string; email: string;}): Observable<any> {
  return this.http.put(`${this.baseUrl}/updateMyProfile`, userUpdateProfileDTO, { headers: this.getAuthHeaders() })
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
