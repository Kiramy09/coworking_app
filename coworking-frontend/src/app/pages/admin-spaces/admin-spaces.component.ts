import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';

@Component({
  selector: 'app-admin-spaces',
  templateUrl: './admin-spaces.component.html',
  styleUrls: ['./admin-spaces.component.scss']
})
export class AdminSpacesComponent implements OnInit {
  spaces: any[] = [];
  newSpace: any = {
    name: '',
    description: '',
    city: '',
    address: '',
    price_per_hour: 1,
    capacity: 1,
    latitude: 1,
    longitude: 1,
    space_type: '',
    image: '',
    metropole_id: 0,
    equipments:[]
  };
  constructor(private coworkingService: CoworkingService) {}

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.coworkingService.getSpaces().subscribe({
      next: (data) => this.spaces = data,
      error: (err) => console.error('Erreur chargement espaces :', err)
    });
  }

  addSpace(): void {
    console.log('🚀 Données envoyées à l’API :', this.newSpace);
  
    this.coworkingService.addSpace(this.newSpace).subscribe({
      next: (res) => {
        alert('Espace ajouté avec succès');
        this.newSpace = {
          name: '',
          description: '',
          city: '',
          address: '',
          price_per_hour: 1,
          capacity: 1,
          latitude: 1,
          longitude: 1,
          space_type: '',
          image: null,
          metropole_id: 0,
          equipments: []
        };
        
        this.loadSpaces();
      },
      error: (err) => {
        console.error('❌ Erreur ajout espace :', err);
        if (err.error) {
          console.error('💥 Erreur Django (err.error) :', err.error);
          alert('Erreur API : ' + JSON.stringify(err.error)); // <= Ajoute ça temporairement
        }
      }
      
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.newSpace.image = input.files[0]; // 👈 un vrai fichier
      console.log('📸 Fichier sélectionné :', this.newSpace.image);
    }
  }
  
}
