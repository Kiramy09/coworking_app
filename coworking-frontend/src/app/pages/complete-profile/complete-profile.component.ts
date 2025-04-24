import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss']
})
export class CompleteProfileComponent {

  toastMessage: string = '';
  toastType: string = '';
  showToast: boolean = false;
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  profile = {
    gender: '',
    birth_date: '',
    address: '',
    activity: '',
    avatar: null as File | null
  };

  previewUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.profile.avatar = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = e.target!.result;
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSubmit(): void {
    if (!this.profile.gender || !this.profile.birth_date || !this.profile.activity) {
      this.showErrorToast('Veuillez remplir tous les champs obligatoires.');
      return;
    }
  
    const formData = new FormData();
    formData.append('gender', this.profile.gender);
    formData.append('birth_date', this.profile.birth_date);
    formData.append('address', this.profile.address);
    formData.append('activity', this.profile.activity);
  
    if (this.profile.avatar) {
      formData.append('avatar', this.profile.avatar);
    } else {
      // 👉 Charger une image par défaut depuis les assets
      fetch('assets/default-avatar.png')
        .then(res => res.blob())
        .then(blob => {
          const defaultFile = new File([blob], 'default-avatar.png', { type: 'image/png' });
          formData.append('avatar', defaultFile);
  
          this.sendForm(formData);
        });
      return; // on attend fetch
    }
  
    // Si avatar fourni → envoie direct
    this.sendForm(formData);
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
  private sendForm(formData: FormData): void {
    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.showSuccessToast('Profil complété avec succès !');
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil', err);
        this.showErrorToast('Erreur lors de la mise à jour du profil.');
      }
    });
  }
  
}
