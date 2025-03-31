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

  getSpacesFiltered(params: any) {
    return this.http.get<any[]>('/api/coworking-spaces/', { params });
  }
  
}
