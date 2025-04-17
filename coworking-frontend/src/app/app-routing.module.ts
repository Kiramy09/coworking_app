import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { CompleteProfileComponent } from './pages/complete-profile/complete-profile.component';
import { LoginComponent } from './pages/login/login.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { MapViewComponent } from './pages/map-view/map-view.component';
import { BookingComponent } from './pages/booking/booking.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { StatsComponent } from './pages/stats/stats.component';
import { CoworkingSpacesComponent } from './pages/coworking-spaces/coworking-spaces.component';



const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent }, 
  { path: 'complete-profile', component: CompleteProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'explore', component: MapViewComponent },
  { path: 'booking/:id',component: BookingComponent},
  { path: 'reservation',component:ReservationComponent },
  { path: 'payment/:bookingId', component: PaymentComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'coworking-spaces', component: CoworkingSpacesComponent }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
