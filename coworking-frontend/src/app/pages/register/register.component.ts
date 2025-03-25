import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  user = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    gender: '',           // ← facultatif pour l'instant
    birth_date: null,     // ← idem
    address: '',
    activity: '',
    avatar: null          // ← null ou un fichier si tu veux
  };
  

  confirmPassword = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  isSubmitting = false;

onRegister() {
  if (this.user.password !== this.confirmPassword) {
    alert("Les mots de passe ne correspondent pas !");
    return;
  }

  this.isSubmitting = true;

  this.authService.register(this.user).subscribe({
    next: (res) => {
      this.isSubmitting = false;
      this.router.navigate(['/complete-profile']);
    },
    error: (err) => {
      this.isSubmitting = false;
      alert("Une erreur est survenue.");
    }
  });
}

  
}
