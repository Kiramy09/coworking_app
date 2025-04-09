import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/api/';

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
      avatar: null  // on gère l'avatar plus tard via `updateProfile`
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
  
  
  
}
