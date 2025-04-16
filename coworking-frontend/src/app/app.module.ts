import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { CompleteProfileComponent } from './pages/complete-profile/complete-profile.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { MapViewComponent } from './pages/map-view/map-view.component';
import { LoginComponent } from './pages/login/login.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { BookingComponent } from './pages/booking/booking.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { StatsComponent } from './pages/stats/stats.component';
import { CoworkingSpacesComponent } from './pages/coworking-spaces/coworking-spaces.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    CompleteProfileComponent,
    LoginComponent,
    MapViewComponent,
    NavbarComponent,
    BookingComponent,
    PaymentComponent,
    StatsComponent,
    ReservationComponent,
    CoworkingSpacesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgChartsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
