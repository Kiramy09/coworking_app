import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  confirmPassword = '';
  errorMessage = '';

  toastMessage: string = '';
  toastType: string = '';
  showToast: boolean = false;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(15),
          Validators.pattern('.*[0-9].*')  // regex pour au moins un chiffre
        ]
      ],
      confirmPassword: ['', Validators.required],
      gender: [''],
      birth_date: [null],
      address: [''],
      activity: [''],
      avatar: [null]
    });
  }

  isSubmitting = false;

  onSubmit() {
    if (this.registerForm.valid && this.registerForm.get('password')?.value === this.registerForm.get('confirmPassword')?.value) {
      this.isSubmitting = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          
          this.showSuccessToast("Inscription réussie ! Vous allez être redirigé...");
          
          // Rediriger après un court délai pour laisser le temps de voir le toast
          setTimeout(() => {
            this.router.navigate(['/complete-profile']);
          }, 2000);
        },
        error: (err) => {
          this.isSubmitting = false;
          
          const errorMessage = err.error?.message || "Une erreur est survenue lors de l'inscription.";
          this.showErrorToast(errorMessage);
        }
      });
    } else {
      if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
        this.showErrorToast("Les mots de passe ne correspondent pas !");
      } else if (!this.registerForm.valid) {
        this.showErrorToast("Veuillez remplir correctement tous les champs obligatoires.");
      }
    }
  }

  // Méthodes utilitaires pour afficher les toasts
  showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'success';
    this.showToast = true;
    
    // Auto-masquer après 3 secondes
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  showErrorToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'danger';
    this.showToast = true;
    
    // Auto-masquer après 5 secondes pour les erreurs 
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
}