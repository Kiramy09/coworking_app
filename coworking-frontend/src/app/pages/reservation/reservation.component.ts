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
    this.coworkingService.getBookings().subscribe(data => {
      this.bookings = data;
    });
  }
}
