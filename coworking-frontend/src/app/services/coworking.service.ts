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

  // Génère les en-têtes d'authentification si le token est présent
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  // Gérer les erreurs de manière centralisée
  private handleError(error: any): Observable<never> {
    console.error('Une erreur est survenue :', error);
    return throwError(() => new Error('Une erreur est survenue lors de la requête.'));
  }

  // Récupérer tous les espaces
  getSpaces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Récupérer les espaces par type
  getSpacesByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/?type=${type}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Récupérer un espace par ID
  getSpace(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/spaces/${id}/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Récupérer les espaces avec des filtres dynamiques
  getSpacesFiltered(params: any): Observable<any[]> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<any[]>(`${this.apiUrl}/spaces/`, { headers: this.getAuthHeaders(), params: httpParams })
      .pipe(catchError(this.handleError));
  }

  getBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings/`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des réservations:', error);
          return throwError(() => new Error('Erreur lors du chargement des réservations.'));
        })
      );
  }
}
