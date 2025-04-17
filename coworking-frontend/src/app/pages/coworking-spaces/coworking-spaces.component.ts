import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';

@Component({
  selector: 'app-coworking-spaces',
  templateUrl: './coworking-spaces.component.html',
  styleUrls: ['./coworking-spaces.component.scss']
})
export class CoworkingSpacesComponent implements OnInit {
  space: any = {
    name: '',
    description: '',
    city: '',
    address: '',
    price_per_hour: 1,
    capacity: 1,
    latitude: 0,
    longitude: 0,
    space_type: '',
    metropole_id: 1
  };

  selectedImage: File | null = null;
  spaces: any[] = [];

  constructor(private coworkingService: CoworkingService) {}

  ngOnInit(): void {
    this.loadSpaces();
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedImage = fileInput.files[0];
    }
  }

  onSubmit(): void {
    const formData = new FormData();
    for (const key in this.space) {
      if (Object.prototype.hasOwnProperty.call(this.space, key)) {
        formData.append(key, this.space[key]);
      }
    }

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.coworkingService.addSpace(formData).subscribe({
      next: () => {
        alert('Espace ajouté avec succès !');
        this.space = {
          name: '', description: '', city: '', address: '', price_per_hour: 1,
          capacity: 1, latitude: 0, longitude: 0, space_type: '', metropole_id: 1
        };
        this.selectedImage = null;
        this.loadSpaces();
      },
      error: (err) => {
        console.error('❌ Erreur ajout espace :', err);
        if (err.error) {
          console.error('💥 Erreur API :', err.error);
          alert('Erreur API : ' + JSON.stringify(err.error));
        }
      }
    });
  }

  loadSpaces(): void {
    this.coworkingService.getSpaces().subscribe({
      next: (data) => this.spaces = data,
      error: (err) => console.error('Erreur chargement espaces :', err)
    });
  }
}
