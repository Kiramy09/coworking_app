import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  bookings: any[] = [];
  userId: number | null = null;
  selectedBooking: any = null;  // Réservation sélectionnée pour l'annulation
  showModal: boolean = false;

  constructor(private coworkingService: CoworkingService) {}

  ngOnInit(): void {
    this.fetchUserBookings();
  }

  fetchUserBookings(): void {
    this.coworkingService.getUserBookings().subscribe(
      (response: any) => {
        if (Array.isArray(response) && response.length > 0) {
          this.userId = response[0]?.customer?.id || null;
          this.bookings = response.sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime());
        } else {
          this.userId = null;
          this.bookings = [];
        }
      },
      error => {
        console.error('Erreur lors de la récupération des réservations de l\'utilisateur:', error);
      }
    );
  }

  isBookingPast(endTime: string): boolean {
    const now = new Date();
    const endDate = new Date(endTime);
    return endDate < now;
  }

  openCancelModal(booking: any): void {
    this.selectedBooking = booking;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  confirmCancel(): void {
    if (this.selectedBooking) {
      this.coworkingService.cancelBooking(this.selectedBooking.id).subscribe(
        () => {
          alert('Réservation annulée avec succès.');
          this.bookings = this.bookings.filter(booking => booking.id !== this.selectedBooking.id);
          this.closeModal();
        },
        error => {
          console.error('Erreur lors de l\'annulation:', error);
          alert('Erreur lors de l\'annulation de la réservation.');
        }
      );
    }
  }
}
