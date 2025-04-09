import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  };

  totalAmount: number = 0;
  isMultiDay: boolean = false;
  dateError: boolean = false;
  sameHoursEachDay: boolean = true;
  today: string = '';
  slotUnavailable: boolean = false;

  timeSlots: { time: string; available: boolean }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coworkingService: CoworkingService
  ) {}

  ngOnInit(): void {
    this.spaceId = +this.route.snapshot.paramMap.get('id')!;
    this.coworkingService.getSpace(this.spaceId).subscribe({
      next: (res) => this.space = res,
      error: (err) => console.error('Erreur chargement espace :', err)
    });

    const now = new Date();
    this.today = now.toISOString().split('T')[0]; // Format "YYYY-MM-DD"
    this.generateTimeSlots();
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    const startHour = 8;
    const endHour = 20;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min of [0, 30]) {
        const formatted = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        this.timeSlots.push({ time: formatted, available: true });
      }
    }
  }

  selectStartTime(time: string): void {
    this.bookingForm.startTime = time;
    this.calculateTotal();
  }

  selectEndTime(time: string): void {
    this.bookingForm.endTime = time;
    this.calculateTotal();
  }

  submitBooking(): void {

    
    const startDateTime = `${this.bookingForm.startDate}T${this.bookingForm.startTime}`;
    const endDateTime = `${this.isMultiDay ? this.bookingForm.endDate : this.bookingForm.startDate}T${this.bookingForm.endTime}`;

    const bookingData = {
      coworking_space: this.spaceId,
      start_time: startDateTime,
      end_time: endDateTime,
      is_paid: false
    };

    this.coworkingService.createBooking(bookingData).subscribe({
      next: (res) => {
        const bookingId = res.id;
        this.router.navigate(['/payment', bookingId]);
      },
      error: (err) => {
        console.error('Erreur réservation :', err);
        alert("Une erreur est survenue.");
      }
    });
  }

  checkAvailability(): void {
    const { startDate, startTime, endDate, endTime } = this.bookingForm;

    if (!startDate || !startTime || !endTime) return;

    const startDateTime = `${startDate}T${startTime}`;
    const endDateTime = `${this.isMultiDay ? endDate : startDate}T${endTime}`;

    const payload = {
      coworking_space: this.spaceId,
      start_time: startDateTime,
      end_time: endDateTime
    };

    this.coworkingService.checkAvailability(payload).subscribe({
      next: (res) => {
        this.slotUnavailable = !res.available;
      },
      error: (err) => {
        console.error("Erreur vérification créneau :", err);
        this.slotUnavailable = true;
      }
    });
  }

  closeModal(id: string): void {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }
  

  calculateTotal(): void {
    if (
      this.bookingForm.startDate &&
      this.bookingForm.startTime &&
      this.bookingForm.endTime &&
      this.space?.price_per_hour
    ) {
      const startDate = new Date(this.bookingForm.startDate);
      const endDate = this.isMultiDay && this.bookingForm.endDate
        ? new Date(this.bookingForm.endDate)
        : startDate;

      if (endDate < startDate) {
        this.dateError = true;
        this.totalAmount = 0;
        return;
      }

      // Heure de fin < heure de début => erreur
      if (
        this.bookingForm.startTime >= this.bookingForm.endTime
      ) {
        this.dateError = true;
        this.totalAmount = 0;
        return;
      }

      this.dateError = false;

      // Heures par jour
      const [sh, sm] = this.bookingForm.startTime.split(':').map(Number);
      const [eh, em] = this.bookingForm.endTime.split(':').map(Number);
      const hoursPerDay = (eh + em / 60) - (sh + sm / 60);

      if (hoursPerDay <= 0) {
        this.totalAmount = 0;
        return;
      }

      // Calcul des jours ouvrés
      let totalDays = 1;
      if (this.isMultiDay) {
        let current = new Date(startDate);
        totalDays = 0;
        while (current <= endDate) {
          const day = current.getDay();
          if (day !== 0 && day !== 6) totalDays++;
          current.setDate(current.getDate() + 1);
        }
      }

      const totalHours = hoursPerDay * totalDays;
      this.totalAmount = Math.round(totalHours * this.space.price_per_hour * 100) / 100;

      this.checkAvailability();
    }
  }
}
