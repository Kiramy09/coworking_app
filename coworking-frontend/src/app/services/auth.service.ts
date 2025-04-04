import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  // Enregistrer un nouvel utilisateur
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
      avatar: null  // Avatar sera mis à jour plus tard
    };

    return new Observable(observer => {
      this.http.post(`${this.baseUrl}register/`, completeUser).subscribe({
        next: (res) => {
          const credentials = {
            email: completeUser.email,
            password: completeUser.password
          };
          // Après enregistrement, connexion automatique
          this.login(credentials).subscribe({
            next: (loginRes: any) => {
              this.saveToken(loginRes.access, loginRes.refresh);
              console.log('Enregistrement réussi et token sauvegardé.');
              observer.next({ register: res, login: loginRes });
              observer.complete();
            },
            error: (err) => {
              console.error('Erreur lors de la connexion après inscription:', err);
              observer.error(err);
            }
          });
        },
        error: (err) => {
          console.error('Erreur lors de l\'enregistrement:', err);
          observer.error(err);
        }
      });
    });
  }

  // Connexion utilisateur
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login/`, credentials).pipe(
      map((response: any) => {
        if (response.access && response.refresh) {
          this.saveToken(response.access, response.refresh);
          console.log('Token enregistré après connexion:', this.getAccessToken());
        } else {
          console.error('Le token JWT n\'a pas été récupéré.');
        }
        return response;
      }),
      catchError((error) => {
        console.error('Erreur de connexion:', error);
        return throwError(() => new Error('Erreur de connexion'));
      })
    );
  }

  // Enregistrer les tokens dans le localStorage
  private saveToken(access: string, refresh: string): void {
    try {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      console.log('Tokens enregistrés:', {
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token')
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des tokens:', error);
    }
  }

  // Récupérer le token d'accès
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Récupérer le token de rafraîchissement
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.log('Déconnexion réussie. Tokens supprimés.');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  // Rafraîchir le token d'accès
  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    if (!refresh) return throwError(() => new Error('Aucun token de rafraîchissement trouvé'));

    return this.http.post(`${this.baseUrl}refresh/`, { refresh }).pipe(
      map((response: any) => {
        this.saveToken(response.access, refresh);
        console.log('Token rafraîchi:', response.access);
        return response;
      }),
      catchError((error) => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        this.logout();
        return throwError(() => new Error('Erreur lors du rafraîchissement du token'));
      })
    );
  }

  // Mettre à jour le profil utilisateur
  updateProfile(profileData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAccessToken()}`
    });

    return this.http.post(`${this.baseUrl}profile/`, profileData, { headers }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return throwError(() => new Error('Erreur lors de la mise à jour du profil'));
      })
    );
  }

  // Vérifier et renouveler automatiquement le token si nécessaire
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
