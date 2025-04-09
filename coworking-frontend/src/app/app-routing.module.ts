import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { CompleteProfileComponent } from './pages/complete-profile/complete-profile.component';
import { LoginComponent } from './pages/login/login.component';
import { MapViewComponent } from './pages/map-view/map-view.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
// Optionnel : si tu veux plus tard ajouter une guard d'accès admin
// import { AdminGuard } from './guards/admin.guard';

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
  
  // ❌ Catch-all si la route n'existe pas
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
