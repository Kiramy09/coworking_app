import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CoworkingService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Gérer les erreurs de manière centralisée
  private handleError(error: any): Observable<never> {
    console.error('Une erreur est survenue :', error);
    return throwError(() => new Error('Une erreur est survenue lors de la requête.'));
  }

  // Générer les en-têtes d'authentification
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('En-tête d\'authentification envoyé:', `Bearer ${token}`);
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Bien utiliser Bearer pour JWT
      });
    } else {
      console.error('Aucun token trouvé dans le localStorage');
      return new HttpHeaders({'Content-Type': 'application/json'});
    }
  }

  // Vérification du token avant d'envoyer la requête
  private checkToken(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Erreur : le token d\'accès est manquant ou invalide.');
      return false;
    }
    return true;
  }

  // Récupérer tous les espaces
  getSpaces(): Observable<any[]> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    return this.http.get<any[]>(`${this.apiUrl}/spaces/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Récupérer les espaces par type
  getSpacesByType(type: string): Observable<any[]> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    return this.http.get<any[]>(`${this.apiUrl}/spaces/?type=${type}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Récupérer un espace par ID
  getSpace(id: number): Observable<any> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    return this.http.get<any>(`${this.apiUrl}/spaces/${id}/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Récupérer les espaces avec des filtres dynamiques
  getSpacesFiltered(params: any): Observable<any[]> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<any[]>(`${this.apiUrl}/spaces/`, { headers: this.getAuthHeaders(), params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Récupérer les réservations de l'utilisateur connecté
  getUserBookings(): Observable<any> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    return this.http.get<any>(`${this.apiUrl}/bookings/`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des réservations:', error);
          return throwError(() => new Error('Erreur lors du chargement des réservations.'));
        })
      );
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
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
  cancelBooking(id: number): Observable<any> {
    const url = `${this.apiUrl}/bookings/${id}/`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }
}  
