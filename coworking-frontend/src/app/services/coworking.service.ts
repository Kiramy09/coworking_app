import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  
  

}
