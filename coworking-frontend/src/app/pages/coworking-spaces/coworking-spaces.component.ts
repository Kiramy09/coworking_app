// coworking-admin.component.ts
import { Component } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';

@Component({
  selector: 'app-coworking-admin',
  templateUrl: './coworking-spaces.component.html',
})
export class CoworkingSpacesComponent {
  space: any = {
    name: '',
    capacity: 1,
    city: '',
  };
  selectedFile: File | null = null;

  constructor(private coworkingService: CoworkingService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('name', this.space.name);
    formData.append('capacity', this.space.capacity.toString());
    formData.append('city', this.space.city);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.coworkingService.addSpace(formData).subscribe({
      next: () => alert('✅ Espace ajouté'),
      error: (err) => {
        console.error(err);
        alert('Erreur API : ' + JSON.stringify(err.error));
      }
    });
  }
}
