import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        console.log('Connexion réussie', res);

        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('is_staff', res.is_staff ? 'true' : 'false');

        // ✅ Récupère et partage le profil utilisateur immédiatement
        this.authService.getUserProfile().subscribe({
          next: () => {
            // Redirection après avoir bien mis à jour le profil
            this.router.navigate(['/']);
          }
        });
      },
      error: (err: any) => {
        console.error('Erreur de connexion', err);
        alert("Email ou mot de passe incorrect.");
      }
    });
  }
}
