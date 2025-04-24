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
  filteredBookings: any[] = [];
  activeFilter: 'current' | 'past' | 'unpaid' | 'all' = 'current'; 
  isLoading: boolean = true;

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
    this.isLoading = true;
    this.coworkingService.getUserBookings().subscribe({
      next: (response: any) => {
        const bookings = response?.bookings;
        if (Array.isArray(bookings) && bookings.length > 0) {
          this.userId = response.user_id || null;
  
          const now = new Date();
  
          this.bookings = bookings
            .map((b: any) => ({
              ...b,
              is_past: new Date(b.end_time) < now
            }))
            .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime());
  
          this.applyFilter(this.activeFilter);
        } else {
          this.userId = null;
          this.bookings = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des réservations de l\'utilisateur:', error);
        this.isLoading = false;
      }
    });
  }
  


  applyFilter(filter: 'current' | 'past' | 'unpaid' | 'all'): void {
    this.activeFilter = filter;
  
    switch (filter) {
      case 'current':
        this.filteredBookings = this.bookings.filter(b => !b.is_past);
        break;
      case 'past':
        this.filteredBookings = this.bookings.filter(b => b.is_past);
        break;
      case 'unpaid':
        this.filteredBookings = this.bookings.filter(b => !b.is_paid);
        break;
      case 'all':
      default:
        this.filteredBookings = [...this.bookings];
        break;
    }
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
          this.successToast('Réservation annulée avec succès.');
          this.bookings = this.bookings.filter(booking => booking.id !== this.selectedBooking.id);
          this.applyFilter(this.activeFilter); //  MAJ filtrée
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
            // this.bookings[index] = response;
            const now = new Date();
            this.bookings[index] = {
              ...response,
              is_past: new Date(response.end_time) < now
            };

          }
          
          this.successToast('Avis ajouté avec succès.');
          this.applyFilter(this.activeFilter); //  MAJ filtrée          
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


   //methode pour afficher les toats 

   showToast(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success'): void {
    // Créer un élément toast
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Contenu du toast
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    // Trouver ou créer le conteneur
    let container = document.getElementById('toastContainer');
    
    // Si le conteneur n'existe pas, le créer
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      document.body.appendChild(container);
    }
    
    // On utilise l'opérateur de non-nullité car on sait que container existe maintenant
    container!.appendChild(toastEl);
    
    // Initialiser le toast avec Bootstrap
    const bsToast = new (window as any).bootstrap.Toast(toastEl, {
      autohide: true,
      delay: 5000
    });
    
    // Afficher le toast
    bsToast.show();
    
    // Supprimer du DOM après disparition
    toastEl.addEventListener('hidden.bs.toast', () => {
      // On capture une référence au conteneur qui est forcément non-null ici
      const parentContainer = document.getElementById('toastContainer');
      if (parentContainer && parentContainer.contains(toastEl)) {
        parentContainer.removeChild(toastEl);
      }
    });
  }
  successToast(message: string): void {
    this.showToast(message, 'success');
  }
  
  errorToast(message: string): void {
    this.showToast(message, 'danger');
  }
  
}