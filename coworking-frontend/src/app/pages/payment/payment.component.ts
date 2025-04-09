import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoworkingService } from '../../services/coworking.service';

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
        this.totalAmount = Math.round(duration * res.coworking_space.price_per_hour * 100) / 100;
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
        alert('Paiement réussi ');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Erreur paiement :', err);
        alert('Erreur lors du paiement.');
      }
    });
  }
}
