import { Component } from '@angular/core';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss']
})
export class CompleteProfileComponent {
  profile: {
    gender: string;
    birth_date: string;
    address: string;
    activity: string;
    avatar: File | null;
  } = {
    gender: '',
    birth_date: '',
    address: '',
    activity: '',
    avatar: null
  };
  

  previewUrl: string | ArrayBuffer | null = null; // ← Assure-toi que cette ligne existe bien ici

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target!.result as string | ArrayBuffer;
      };
      reader.readAsDataURL(input.files[0]);

      this.profile.avatar = input.files[0]; // on garde aussi le fichier à envoyer au back
    }
  }

  onSubmit() {
    console.log('Profil envoyé', this.profile);
  }
}
