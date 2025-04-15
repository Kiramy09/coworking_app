import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CoworkingService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient,  private authService: AuthService) {}
  
  getSpaces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/`);
  }

  getSpacesByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/?type=${type}`);
  }

  getSpace(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/spaces/${id}/`);
  }

  
  getSpaceFiltered(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/`, { params });
  }


  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/`, data);
  }

  createPayment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/`, data);
  }
  
  getBooking(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/bookings/${id}/`);
  }

  checkAvailability(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/check/`, data);
  }

  // getTakenSlots(data: { coworking_space: number; date: string }) {
  //   return this.http.post<{ taken_slots: string[] }>(`${this.apiUrl}/bookings/taken-slots/`,data);
  // }
  
  
  getTakenSlots(payload: { coworking_space: number; start_date: string; end_date?: string }) {
    return this.http.post<any>(`${this.apiUrl}/bookings/taken-slots/`, payload);
  }
  
  getDashboardStats(payload: { start_date: string, end_date: string, view_mode: 'global' | 'metropole' | 'type' }) {
    return this.http.post<any>(`${this.apiUrl}/dashboard/`, payload);
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

  cancelBooking(id: number): Observable<any> {
    const url = `${this.apiUrl}/bookings/${id}/`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  addReview(bookingId: number, reviewData: any): Observable<any> {
    const token = this.authService.getAccessToken();
    
    if (!token) {
      return throwError(() => new Error('Token manquant'));
    }
  
  // Construisez l'en-tête explicitement
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
  
  
  // Faites la requête avec ces en-têtes
  return this.http.post<any>(
    `${this.apiUrl}/bookings/${bookingId}/add_review/`, 
    reviewData, 
    { headers: headers }
  ).pipe(
    catchError(error => {
      console.error('Erreur détaillée:', error);
      return throwError(() => error);
    })
  );
  }



}
