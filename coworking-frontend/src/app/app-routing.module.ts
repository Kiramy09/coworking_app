import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { CompleteProfileComponent } from './pages/complete-profile/complete-profile.component';
import { LoginComponent } from './pages/login/login.component';
import { MapViewComponent } from './pages/map-view/map-view.component';
import { MonProfilComponent } from './pages/mon-profil/mon-profil.component';



const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent }, 
  { path: 'complete-profile', component: CompleteProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'explore', component: MapViewComponent },
  { path: 'profile', component: MonProfilComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
