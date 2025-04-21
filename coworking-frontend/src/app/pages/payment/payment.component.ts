import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoworkingService } from '../../services/coworking.service';
import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  bookingId!: number;
  booking: any;
  totalAmount = 0;

  card = {
    number: '',
    expiry: '',
    cvv: ''
  };

  constructor(
    private route: ActivatedRoute,
    private coworkingService: CoworkingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bookingId = +this.route.snapshot.paramMap.get('bookingId')!;
    this.coworkingService.getBooking(this.bookingId).subscribe({
      next: (res) => {
        this.booking = res;
        const start = new Date(res.start_time);
        const end = new Date(res.end_time);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        // this.totalAmount = Math.round(duration * res.coworking_space.price_per_hour * 100) / 100;
        this.totalAmount = Math.round(duration * res.coworking_space_info.price_per_hour * 100) / 100;

      },
      error: (err) => console.error('Erreur chargement booking :', err)
    });
  }

  confirmPayment(): void {
    const paymentData = {
      booking: this.bookingId,
      amount: this.totalAmount,
      payment_method: 'Carte bancaire (factice)',
      payment_date: new Date().toISOString()
    };
  
    this.coworkingService.createPayment(paymentData).subscribe({
      next: () => {
        // Mettre à jour la réservation comme payée
        this.coworkingService.updateBooking(this.bookingId, { is_paid: true }).subscribe({
          next: () => {
            const modalElement = document.getElementById('paymentSuccessModal');
            if (modalElement) {
              const modal = new (window as any).bootstrap.Modal(modalElement);
              modal.show();
            }
          },
          error: err => {
            console.error("Erreur mise à jour réservation :", err);
          }
        });
      },
      error: (err) => {
        console.error('Erreur paiement :', err);
        alert('Erreur lors du paiement.');
      }
    });
  }
  

  redirectHome(): void {
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('paymentSuccessModal'));
    modal?.hide();
    this.router.navigate(['/home']);
  }
  goToMyBookings(): void {
    const modalElement = document.getElementById('paymentSuccessModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    
    if (modal) {
      modal.hide();
    }
  
    // Supprimer manuellement le backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  
    this.router.navigate(['/reservation']);
  }
  
  downloadInvoice(): void {
    const doc = new jsPDF();
  
    const date = new Date().toLocaleString();
    const start = new Date(this.booking.start_time).toLocaleString();
    const end = new Date(this.booking.end_time).toLocaleString();
  
    doc.setFontSize(16);
    doc.text('FACTURE DE RÉSERVATION', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date : ${date}`, 20, 30);
    doc.text(`Client : ${this.booking.customer?.first_name || 'N/A'} ${this.booking.customer?.last_name || ''}`, 20, 40);
    doc.text(`Espace réservé : ${this.booking.coworking_space_info.name}`, 20, 50);
    doc.text(`Début : ${start}`, 20, 60);
    doc.text(`Fin : ${end}`, 20, 70);
    doc.text(`Total payé : ${this.totalAmount} €`, 20, 80);
    doc.text(`Méthode de paiement : Carte bancaire (factice)`, 20, 90);
  
    doc.setFontSize(10);
    doc.text('Merci pour votre réservation !', 20, 110);
  
    doc.save(`facture_cowo_${this.bookingId}.pdf`);
  }
}
