import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  bookings: any[] = [];
  isAuthenticated: boolean = false;

  constructor(private coworkingService: CoworkingService) {}

  ngOnInit(): void {
    this.checkAuth();
    if (this.isAuthenticated) {
      this.fetchBookings();
    }
  }

  checkAuth(): void {
    const token = localStorage.getItem('token');
    this.isAuthenticated = !!token; // Vérifie si un token existe
  }

  fetchBookings(): void {
    this.coworkingService.getBookings().subscribe((data: any[]) => {
      this.bookings = data;
    }, error => {
      console.error('Erreur lors du chargement des réservations', error);
    });
  }
}
