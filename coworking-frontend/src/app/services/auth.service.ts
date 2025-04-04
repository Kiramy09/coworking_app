import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
//import { catchError, Observable, of, throwError, tap, switchMap } from 'rxjs';
import { catchError, Observable, of, throwError, tap, switchMap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/api/';
  private refreshTokenInProgress = false;
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialiser le token au démarrage
    const token = localStorage.getItem('access_token');
    this.tokenSubject.next(token);
  }

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
  
  
  
  updateProfile(profileData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}profile/`, profileData);
  }
  
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}user/profile/`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handleTokenExpired(() => 
            this.http.get(`${this.baseUrl}user/profile/`)
          );
        }
        return throwError(() => error);
      })
    );
  }

updateUserProfile(formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}user/profile/update/`, formData).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return this.handleTokenExpired(() => 
          this.http.post(`${this.baseUrl}user/profile/update/`, formData)
        );
      }
      return throwError(() => error);
    })
  );
}


 uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post(`${this.baseUrl}user/avatar/upload/`, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handleTokenExpired(() => 
            this.http.post(`${this.baseUrl}user/avatar/upload/`, formData)
          );
        }
        return throwError(() => error);
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
          this.tokenSubject.next(response.access);
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

  public handleTokenExpired<T>(retryCallback: () => Observable<T>): Observable<T> {
    if (this.refreshTokenInProgress) {
      // Attendre que le rafraîchissement en cours se termine
      return this.tokenSubject.pipe(
        switchMap(token => {
          if (token) {
            return retryCallback();
          }
          throw new Error('Authentication failed');
        })
      );
    }
    
    this.refreshTokenInProgress = true;
    
    return this.refreshToken().pipe(
      switchMap(() => {
        this.refreshTokenInProgress = false;
        return retryCallback();
      }),
      catchError(error => {
        this.refreshTokenInProgress = false;
        this.logout();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.tokenSubject.next(null);
    console.log('Logged out, tokens removed');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}