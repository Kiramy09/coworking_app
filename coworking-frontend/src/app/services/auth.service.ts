import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, throwError, tap, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/api/';
  private refreshTokenInProgress = false;
  
  constructor(private http: HttpClient) {}
  
  register(user: any): Observable<any> {
    const completeUser = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: user.password,
      gender: user.gender || '',
      birth_date: user.birth_date || null,
      address: user.address || '',
      activity: user.activity || '',
      avatar: null
    };
    
    return new Observable(observer => {
      this.http.post(`${this.baseUrl}register/`, completeUser).subscribe({
        next: (res) => {
          const credentials = {
            email: completeUser.email,
            password: completeUser.password
          };
          
          this.login(credentials).subscribe({
            next: (loginRes: any) => {
              localStorage.setItem('access_token', loginRes.access);
              localStorage.setItem('refresh_token', loginRes.refresh);
              observer.next({ register: res, login: loginRes });
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }
  
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/`, credentials).pipe(
      tap((response: any) => {
        if (response.access) {
          localStorage.setItem('access_token', response.access);
        }
        if (response.refresh) {
          localStorage.setItem('refresh_token', response.refresh);
        }
        console.log('Login successful, tokens stored');
      })
    );
  }
  
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log('Logged out, tokens removed');
    // Rediriger vers la page de connexion si nécessaire
    // window.location.href = '/login';
  }
  
  updateProfile(profileData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}profile/`, profileData);
  }
  
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}user/profile/`).pipe(
      catchError(error => {
        if (error.status === 401 && error.error?.code === 'token_not_valid') {
          console.log('Token expired, attempting to refresh...');
          return this.handleTokenExpired(() => this.getUserProfile());
        }
        return this.handleError('getUserProfile')(error);
      })
    );
  }
  
  updateUserProfile(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}user/profile/update/`, formData).pipe(
      catchError(error => {
        if (error.status === 401 && error.error?.code === 'token_not_valid') {
          return this.handleTokenExpired(() => this.updateUserProfile(formData));
        }
        return this.handleError('updateUserProfile')(error);
      })
    );
  }
  
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post(`${this.baseUrl}user/avatar/upload/`, formData).pipe(
      catchError(error => {
        if (error.status === 401 && error.error?.code === 'token_not_valid') {
          return this.handleTokenExpired(() => this.uploadAvatar(file));
        }
        return this.handleError('uploadAvatar')(error);
      })
    );
  }
  
  refreshToken(): Observable<any> {
    const refresh = localStorage.getItem('refresh_token');
    
    if (!refresh) {
      console.error('No refresh token available');
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }
    
    console.log('Attempting to refresh token...');
    return this.http.post(`${this.baseUrl}refresh/`, { refresh }).pipe(
      tap((response: any) => {
        if (response.access) {
          localStorage.setItem('access_token', response.access);
          console.log('Token refreshed successfully');
        }
      }),
      catchError(error => {
        console.error('Token refresh failed', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }
  
  private handleTokenExpired<T>(retryCallback: () => Observable<T>): Observable<T> {
    if (this.refreshTokenInProgress) {
      // Wait for the current refresh to complete
      return new Observable<T>(observer => {
        const checkInterval = setInterval(() => {
          if (!this.refreshTokenInProgress) {
            clearInterval(checkInterval);
            retryCallback().subscribe({
              next: value => observer.next(value),
              error: err => observer.error(err),
              complete: () => observer.complete()
            });
          }
        }, 100);
      });
    }
    
    this.refreshTokenInProgress = true;
    
    return this.refreshToken().pipe(
      switchMap(() => {
        this.refreshTokenInProgress = false;
        return retryCallback();
      }),
      catchError(error => {
        this.refreshTokenInProgress = false;
        return throwError(() => error);
      })
    );
  }
  
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}