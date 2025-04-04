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

        // Stockage des tokens avec le bon nom
        localStorage.setItem('token', res.access); 
        localStorage.setItem('refresh_token', res.refresh);

        // Vérification du token après l'enregistrement
        const token = localStorage.getItem('token');
        console.log('Token enregistré:', token);

        this.router.navigate(['/']); // Redirection vers la page d'accueil
      },
      error: (err: any) => {
        console.error('Erreur de connexion', err);
        alert("Email ou mot de passe incorrect.");
      }
    });
  }
}
