import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  bookings: any[] = [];

  constructor(private coworkingService: CoworkingService) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

  fetchBookings(): void {
    this.coworkingService.getBookings().subscribe(
      (data: any[]) => {
        this.bookings = data;
        console.log('Réservations récupérées:', this.bookings);
      },
      error => {
        console.error('Erreur lors de la récupération des réservations:', error);
      }
    );
  }
}
