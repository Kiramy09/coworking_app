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
    const formData = new FormData();
    formData.append('gender', this.profile.gender);
    formData.append('birth_date', this.profile.birth_date);
    formData.append('address', this.profile.address);
    formData.append('activity', this.profile.activity);

    if (this.profile.avatar) {
      formData.append('avatar', this.profile.avatar);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        console.log('Profil mis à jour', res);
        alert('Profil complété avec succès !');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil', err);
        alert('Erreur lors de la mise à jour du profil.');
      }
    });
  }
}
