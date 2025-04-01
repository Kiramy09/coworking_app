import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoworkingService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getSpaces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/`);
  }

  getSpacesByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/spaces/?type=${type}`);
  }

  getSpace(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/spaces/${id}/`);
  }

  getSpacesFiltered(params: any) {
    return this.http.get<any[]>('/api/coworking-spaces/', { params });
  }

  
  getBookings(): Observable<any[]> {
    const token = localStorage.getItem('token'); // Récupère le token stocké
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Ajoute le token dans l'entête

    return this.http.get<any[]>(`${this.apiUrl}/bookings/`, { headers });
  }

}
