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
  // takenSlots: string[] = [];
  takenSlots: { [date: string]: string[] } = {};



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

  loadTakenSlotsForDate(): void {
    if (!this.bookingForm.startDate) return;
  
    const payload = {
      coworking_space: this.spaceId,
      start_date: this.bookingForm.startDate,
      end_date: this.isMultiDay ? this.bookingForm.endDate : this.bookingForm.startDate
    };
  
    this.coworkingService.getTakenSlots(payload).subscribe({
      next: (res) => {
        this.takenSlots = res.taken_slots || {};
      },
      error: (err) => {
        console.error("Erreur chargement des créneaux occupés :", err);
      }
    });
  }
  

  markUnavailableSlots(selectedDate: string): void {
    const slotsForDay = this.takenSlots[selectedDate] || [];
  
    this.timeSlots = this.timeSlots.map(slot => ({
      ...slot,
      available: !slotsForDay.includes(slot.time)
    }));
  
    let showToast = false;
  
    if (this.bookingForm.startTime && selectedDate === this.bookingForm.startDate && slotsForDay.includes(this.bookingForm.startTime)) {
      this.bookingForm.startTime = '';
      showToast = true;
    }
  
    const endDate = this.isMultiDay ? this.bookingForm.endDate : this.bookingForm.startDate;
    if (this.bookingForm.endTime && selectedDate === endDate && slotsForDay.includes(this.bookingForm.endTime)) {
      this.bookingForm.endTime = '';
      showToast = true;
    }
  
    if (showToast) {
      const toastEl = document.getElementById('timeSlotToast');
      if (toastEl) {
        const toast = new (window as any).bootstrap.Toast(toastEl);
        toast.show();
      }
    }
  }
  
  
  

  submitBooking(): void {

    if (!this.bookingForm.startDate || !this.bookingForm.startTime || !this.bookingForm.endTime) {
      console.warn("Formulaire incomplet");
      return;
    }
    
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

  openStartTimeModal(): void {
    if (this.bookingForm.startDate) {
      this.markUnavailableSlots(this.bookingForm.startDate);
    }
  }
  
  openEndTimeModal(): void {
    const date = this.isMultiDay ? this.bookingForm.endDate : this.bookingForm.startDate;
    if (date) {
      this.markUnavailableSlots(date);
    }
  }
  
  
  isEndTimeDisabled(endTime: string): boolean {
    if (!this.bookingForm.startTime) return false;
  
    const [sh, sm] = this.bookingForm.startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
  
    const startTotal = sh * 60 + sm;
    const endTotal = eh * 60 + em;
  
    return endTotal <= startTotal;
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

      // this.checkAvailability();
    }
  }

  
}
