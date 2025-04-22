import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminReservationsComponent } from './pages/admin-reservations/admin-reservations.component';
import { AdminSpacesComponent } from './pages/admin-spaces/admin-spaces.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { CompleteProfileComponent } from './pages/complete-profile/complete-profile.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { MapViewComponent } from './pages/map-view/map-view.component';
import { RegisterComponent } from './pages/register/register.component';
import { ReservationComponent } from './pages/reservation/reservation.component';

const routes: Routes = [
  // 🌍 Page d'accueil
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  // 👤 Auth & Profil
  { path: 'register', component: RegisterComponent },
  { path: 'complete-profile', component: CompleteProfileComponent },
  { path: 'login', component: LoginComponent },

  // 🗺️ Exploration des espaces
  { path: 'explore', component: MapViewComponent },

  // 📅 Réservations
  { path: 'reservation', component: ReservationComponent },

  // 🔐 Dashboard admin (tu peux ajouter une guard plus tard)
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin-users', component: AdminUsersComponent },
  { path: 'admin-reservations', component: AdminReservationsComponent },
  { path: 'admin-spaces', component: AdminSpacesComponent },

  //Contact
  { path: 'contact', component: ContactComponent },
  // ❌ Catch-all si la route n'existe pas
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
