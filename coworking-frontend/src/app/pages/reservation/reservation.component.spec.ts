import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ReservationComponent } from './reservation.component';
import { CoworkingService } from '../../services/coworking.service';

describe('ReservationComponent', () => {
  let component: ReservationComponent;
  let fixture: ComponentFixture<ReservationComponent>;
  let coworkingService: jasmine.SpyObj<CoworkingService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CoworkingService', ['getUserBookings']);

    await TestBed.configureTestingModule({
      declarations: [ReservationComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: CoworkingService, useValue: spy }
      ]
    }).compileComponents();

    coworkingService = TestBed.inject(CoworkingService) as jasmine.SpyObj<CoworkingService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user bookings on initialization', () => {
    const mockResponse = {
      user_id: 1,
      bookings: [
        { id: 1, start_time: '2025-04-01T10:00:00', end_time: '2025-04-01T12:00:00', is_paid: true, coworking_space: { name: 'Space A' } }
      ]
    };

    coworkingService.getUserBookings.and.returnValue(of(mockResponse));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.userId).toBe(1);
    expect(component.bookings.length).toBe(1);
    expect(component.bookings[0].coworking_space.name).toBe('Space A');
  });

  it('should handle error during fetching bookings', () => {
    coworkingService.getUserBookings.and.returnValue(throwError(() => new Error('Error')));

    component.fetchUserBookings();
    fixture.detectChanges();

    expect(component.bookings.length).toBe(0);
    expect(component.userId).toBeNull();
  });

  it('should handle empty response', () => {
    const mockResponse = { user_id: 1, bookings: [] };

    coworkingService.getUserBookings.and.returnValue(of(mockResponse));

    component.fetchUserBookings();
    fixture.detectChanges();

    expect(component.userId).toBe(1);
    expect(component.bookings.length).toBe(0);
  });

  it('should handle null response', () => {
    coworkingService.getUserBookings.and.returnValue(of(null));

    component.fetchUserBookings();
    fixture.detectChanges();

    expect(component.userId).toBeNull();
    expect(component.bookings.length).toBe(0);
  });
});
