import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  bookings: any[] = [];
  userId: number | null = null;
  selectedBooking: any = null;
  showModal: boolean = false;
  showReviewModal: boolean = false;
  reviewForm: FormGroup;

  constructor(
    private coworkingService: CoworkingService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.reviewForm = this.fb.group({
      rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      review_comment: ['']
    });
  }

  ngOnInit(): void {
    this.fetchUserBookings();
  }

  fetchUserBookings(): void {
    this.coworkingService.getUserBookings().subscribe({
      next: (response: any) => {
        const bookings = response?.bookings;
          if (Array.isArray(bookings) && bookings.length > 0) {
          this.userId = response.user_id || null;
          this.bookings = bookings.sort(
            (a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
          );
        } else {
          this.userId = null;
          this.bookings = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des réservations de l\'utilisateur:', error);
      }
    });
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
    this.showReviewModal = false;
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

  // Nouvelles méthodes pour les avis
  openReviewModal(booking: any): void {
    this.selectedBooking = booking;
    this.showReviewModal = true;
  }

  submitReview(): void {
    if (this.reviewForm.valid && this.selectedBooking) {
      const reviewData = {
        rating: this.reviewForm.value.rating,
        review_comment: this.reviewForm.value.review_comment
      };

      this.coworkingService.addReview(this.selectedBooking.id, reviewData).subscribe(
        (response) => {
          // Mettre à jour la réservation dans la liste locale
          const index = this.bookings.findIndex(b => b.id === this.selectedBooking.id);
          if (index !== -1) {
            this.bookings[index] = response;
          }
          
          alert('Avis ajouté avec succès.');
          this.reviewForm.reset();
          this.closeModal();
        },
        error => {
          console.error('Erreur lors de l\'ajout de l\'avis:', error);
          alert('Erreur lors de l\'ajout de l\'avis.');
        }
      );
    }
  }

  goToPayment(bookingId: number): void {
    this.router.navigate(['/payment', bookingId]);
  }

  // Méthode utilitaire pour l'affichage des étoiles
  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
}