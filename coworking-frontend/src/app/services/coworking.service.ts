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
          // console.log('En-tête d\'authentification envoyé:', `Bearer ${token}`);
          return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          });
        } else {
          console.error('Aucun token trouvé dans le localStorage');
          return new HttpHeaders({'Content-Type': 'application/json'});
        }
      }
  
    // Récupérer les réservations de l'utilisateur connecté
    getUserBookings(): Observable<any> {
      if (!this.checkToken()) return throwError(() => new Error('Utilisateur non authentifié.'));
      return this.http.get<any>(`${this.apiUrl}/my-bookings/`, { headers: this.getAuthHeaders() })
        .pipe(
          catchError(error => {
            console.error('Erreur lors du chargement des réservations:', error);
            return throwError(() => new Error('Erreur lors du chargement des réservations.'));
          })
        );
    }

    
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
  
  getTakenSlots(payload: { coworking_space: number; start_date: string; end_date?: string }) {
    return this.http.post<any>(`${this.apiUrl}/bookings/taken-slots/`, payload);
  }
  
  getDashboardStats(payload: { start_date: string, end_date: string, view_mode: 'global' | 'metropole' | 'type' }) {
    return this.http.post<any>(`${this.apiUrl}/dashboard/`, payload);
  }


  cancelBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/delete/${id}/`,{ headers: this.getAuthHeaders() });
  }

  addReview(bookingId: number, reviewData: any): Observable<any> {
    const url = `${this.apiUrl}/bookings/${bookingId}/add_review/`;
    return this.http.post<any>(url, reviewData, { headers: this.getAuthHeaders() });
  }
  
  getReservationsBySpace(spaceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/${spaceId}/reservations/`, {headers: this.getAuthHeaders()});
  }
  
  updateSpace(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/spaces/${id}/`, data);
  }
  
  getEquipments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipments/`);
  }

  updateBooking(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/bookings/${id}/`, data, {
      headers: this.getAuthHeaders()
    });
  }
  

  updateSpaceWithFormData(id: number, data: FormData): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = token? new HttpHeaders({'Authorization': `Bearer ${token}`}): new HttpHeaders();
    return this.http.put(`${this.apiUrl}/spaces/${id}/`, data, { headers });
  }

  toggleSpaceVisibility(spaceId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/spaces/${spaceId}/toggle-visibility/`, {}, {
      headers: this.getAuthHeaders()
    });
  }
  
  deleteSpace(spaceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/spaces/${spaceId}/`, {
      headers: this.getAuthHeaders()
    });
  }
  
  cancelBookingAsAdmin(bookingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/${bookingId}/`, {
      headers: this.getAuthHeaders()
    });
  }
  
  getMyPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payments/mine`, {
      headers: this.getAuthHeaders()
    });
  }
  
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/`, {
      headers: this.getAuthHeaders()
    });
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}/`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUserRole(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/`, data, { headers: this.getAuthHeaders() });
  }
  
  addSpace(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/spaces/`, formData, {
      headers: this.getAuthHeaders().delete('Content-Type') // Laisse FormData gérer le type
    });
  }
  
  // getUserBookingsById(userId: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/bookings`, {
  //     headers: this.getAuthHeaders()
  //   });
  // }
    
  


}
