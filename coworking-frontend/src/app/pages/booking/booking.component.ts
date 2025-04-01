import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoworkingService } from '../../services/coworking.service';


@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  spaceId!: number;
  space: any;
  bookingForm = {
    date: '',
    startTime: '',
    endTime: ''
  };

  constructor(
    private route: ActivatedRoute,
    private coworkingService: CoworkingService
  ) {}

  ngOnInit(): void {
    this.spaceId = +this.route.snapshot.paramMap.get('id')!;
    this.coworkingService.getSpace(this.spaceId).subscribe({
      next: (res) => this.space = res,
      error: (err) => console.error('Erreur chargement espace :', err)
    });
  }

  submitBooking(): void {
    const userId = 1; // à remplacer par l'utilisateur connecté

    const startDateTime = `${this.bookingForm.date}T${this.bookingForm.startTime}`;
    const endDateTime = `${this.bookingForm.date}T${this.bookingForm.endTime}`;

    const bookingData = {
      customer: userId,
      coworking_space: this.spaceId,
      start_time: startDateTime,
      end_time: endDateTime
    };

    this.coworkingService.createBooking(bookingData).subscribe({
      next: () => {
        alert(" Réservation effectuée !");
      },
      error: (err) => {
        console.error(' Erreur réservation :', err);
        alert("Une erreur est survenue.");
      }
    });
  }
}
