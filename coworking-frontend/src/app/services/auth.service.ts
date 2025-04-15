import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, of, throwError, tap, switchMap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/api/';
  private refreshTokenInProgress = false;
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient ,private router: Router) {
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
    return this.http.post(`${this.baseUrl}login/`, credentials);
  }
  
  
  updateProfile(profileData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}profile/`, profileData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });
  }
  
  refreshToken(): Observable<any> {
    const refresh = localStorage.getItem('refresh_token');
    return this.http.post(`${this.baseUrl}refresh/`, { refresh });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
  
  
  // Récupérer le token d'accès
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }



  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}profile/info/`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handleTokenExpired(() => 
            this.http.get(`${this.baseUrl}profile/info/`)
          );
        }
        return throwError(() => error);
      })
    );
  }
  

  updateUserProfile(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}profile/update/`, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handleTokenExpired(() => 
            this.http.post(`${this.baseUrl}profile/update/`, formData)
          );
        }
        return throwError(() => error);
      })
    );
  }
  
  
   uploadAvatar(file: File): Observable<any> {
      const formData = new FormData();
      formData.append('avatar', file);
      
      return this.http.post(`${this.baseUrl}profile/avatar/`, formData).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return this.handleTokenExpired(() => 
              this.http.post(`${this.baseUrl}profile/avatar/`, formData)
            );
          }
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
