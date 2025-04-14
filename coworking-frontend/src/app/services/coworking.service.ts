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

  private handleError(error: any): Observable<never> {
    console.error('❌ Une erreur est survenue :', error);

    if (error.error) {
      console.error('💥 Erreur renvoyée par l\'API :', error.error);
      alert('Erreur API : ' + JSON.stringify(error.error)); // Temporaire pour debug
    }

    return throwError(() => new Error('Une erreur est survenue lors de la requête.'));
  }

  private getAuthHeaders(skipContentType = false): HttpHeaders {
    const token = localStorage.getItem('access_token');

    let headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });

    if (!skipContentType) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  private checkToken(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Erreur : le token d\'accès est manquant ou invalide.');
      return false;
    }
    return true;
  }

  getSpaces(): Observable<any[]> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    return this.http.get<any[]>(`${this.apiUrl}/spaces/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSpacesByType(type: string): Observable<any[]> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    return this.http.get<any[]>(`${this.apiUrl}/spaces/?type=${type}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSpace(id: number): Observable<any> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    return this.http.get<any>(`${this.apiUrl}/spaces/${id}/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSpacesFiltered(params: any): Observable<any[]> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<any[]>(`${this.apiUrl}/spaces/`, { headers: this.getAuthHeaders(), params: httpParams })
      .pipe(catchError(this.handleError));
  }

  getUserBookings(): Observable<any> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    return this.http.get<any>(`${this.apiUrl}/bookings/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

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
    return this.http.delete(`${this.apiUrl}/bookings/${id}/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ✅ POST - Ajouter un espace avec image (FormData)
  addSpace(space: any): Observable<any> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));

    const formData = new FormData();
    formData.append('name', space.name);
    formData.append('description', space.description);
    formData.append('city', space.city);
    formData.append('address', space.address);
    formData.append('price_per_hour', space.price_per_hour.toString());

    if (space.type) formData.append('type', space.type);
    if (space.image) formData.append('image', space.image); // 👈 MUST be File!

    return this.http.post<any>(`${this.apiUrl}/spaces/`, formData, {
      headers: this.getAuthHeaders(true) // 🚫 skip Content-Type
    }).pipe(catchError(this.handleError));
  }

  deleteSpace(id: number): Observable<any> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
    return this.http.delete(`${this.apiUrl}/spaces/${id}/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSpace(id: number, space: any): Observable<any> {
    if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));

    const formData = new FormData();
    formData.append('name', space.name);
    formData.append('description', space.description);
    formData.append('city', space.city);
    formData.append('address', space.address);
    formData.append('price_per_hour', space.price_per_hour.toString());

    if (space.type) formData.append('type', space.type);
    if (space.image) formData.append('image', space.image); // 👈 support maj image

    return this.http.put<any>(`${this.apiUrl}/spaces/${id}/`, formData, {
      headers: this.getAuthHeaders(true)
    }).pipe(catchError(this.handleError));
  }
}
