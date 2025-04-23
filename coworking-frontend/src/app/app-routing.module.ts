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
import { MonProfilComponent } from './pages/mon-profil/mon-profil.component';
import { AdminSpaceDetailComponent } from './pages/admin-space-detail/admin-space-detail.component';
import { authGuard } from './guards/auth.guard';
import {InvoicesComponent } from './pages/invoices/invoices.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import {ContactComponent} from './pages/contact/contact.component';


const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent }, 
  { path: 'complete-profile', component: CompleteProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'explore', component: MapViewComponent },
  { path: 'booking/:id', component: BookingComponent },
  { path: 'reservation', component: ReservationComponent, canActivate: [authGuard] },
  { path: 'payment/:bookingId', component: PaymentComponent, canActivate: [authGuard] },
  { path: 'profile', component: MonProfilComponent, canActivate: [authGuard] },
  { path: 'stats', component: StatsComponent, canActivate: [authGuard] },
  { path: 'admin/spaces/:id', component: AdminSpaceDetailComponent, canActivate: [authGuard] },
  { path: 'invoices', component: InvoicesComponent },
  {path: 'admin/users',component: UserManagementComponent,canActivate: [authGuard]},
  {path: 'contact', component: ContactComponent },


];

@NgModule({
  imports: [    RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled', // ← remet le scroll en haut à chaque navigation
    anchorScrolling: 'enabled',           // ← permet le scroll sur des ancres (si jamais)
    scrollOffset: [0, 0]                  // ← facultatif, ajuste le scroll (par ex. pour header fixe)
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
