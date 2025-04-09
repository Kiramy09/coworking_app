import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
              this.saveToken(loginRes.access, loginRes.refresh);
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
      map((response: any) => {
        if (response.access && response.refresh) {
          this.saveToken(response.access, response.refresh);
        }
        return response;
      }),
      catchError(error => {
        console.error('Erreur de connexion :', error);
        return throwError(() => new Error('Erreur de connexion'));
      })
    );
  }

  private saveToken(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  isAdmin(): boolean {
    const token = this.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload?.is_staff === true;
      } catch (err) {
        console.error('Erreur lors du décodage du token :', err);
        return false;
      }
    }
    return false;
  }

  getCurrentUser(): Observable<any> {
    const token = this.getAccessToken();
    if (!token) return throwError(() => new Error('Aucun token trouvé'));

    return this.http.get(`${this.baseUrl}users/me/`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    if (!refresh) return throwError(() => new Error('Token de rafraîchissement manquant'));

    return this.http.post(`${this.baseUrl}refresh/`, { refresh }).pipe(
      map((response: any) => {
        this.saveToken(response.access, refresh);
        return response;
      }),
      catchError(error => {
        this.logout();
        return throwError(() => new Error('Erreur lors du rafraîchissement du token'));
      })
    );
  }

  updateProfile(profileData: FormData): Observable<any> {
    const token = this.getAccessToken();
    if (!token) return throwError(() => new Error('Utilisateur non authentifié'));

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.post(`${this.baseUrl}profile/`, profileData, { headers }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la mise à jour du profil'));
      })
    );
  }

  ensureAuthenticated(): Observable<boolean> {
    if (this.isAuthenticated()) {
      return of(true);
    }

    const refresh = this.getRefreshToken();
    if (!refresh) return of(false);

    return this.refreshToken().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
