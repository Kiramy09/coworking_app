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
          localStorage.setItem('refresh_token', res.refresh);// Simple JWT renvoie `access`
          
          this.router.navigate(['/']); // Redirige vers la page d'accueil
        },
        error: (err: any) => {
          console.error('Erreur de connexion', err);
          alert("Email ou mot de passe incorrect.");
        }
      });
    }
  }
