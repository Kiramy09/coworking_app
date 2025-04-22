import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';
declare const bootstrap: any;

@Component({
  selector: 'app-coworking-management',
  templateUrl: './coworking-management.component.html',
  styleUrls: ['./coworking-management.component.scss']
})
export class CoworkingManagementComponent implements OnInit {
  spaces: any[] = [];
  loading = false;
  selectedSpace: any = null;

  // Champs pour ajout
  newSpace: any = {
    name: '',
    description: '',
    city: '',
    address: '',
    price_per_hour: 0,
    capacity: 0,
    latitude: 0,
    longitude: 0,
    space_type: '',
    metropole_id: 1
  };
  newSelectedImage: File | null = null;

  constructor(private coworkingService: CoworkingService) {}

  ngOnInit(): void {
    this.fetchSpaces();
    setTimeout(() => this.enableTooltips(), 100);
  }

  fetchSpaces() {
    this.loading = true;
    this.coworkingService.getSpaces().subscribe({
      next: (res) => {
        this.spaces = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement espaces :', err);
        this.loading = false;
      }
    });
  }

  // Suppression
  openDeleteModal(space: any) {
    this.selectedSpace = space;
    const modal = new bootstrap.Modal(document.getElementById('deleteSpaceModal'));
    modal.show();
  }

  confirmDelete() {
    if (!this.selectedSpace) return;
    this.coworkingService.deleteSpace(this.selectedSpace.id).subscribe(() => {
      this.spaces = this.spaces.filter(s => s.id !== this.selectedSpace.id);
      bootstrap.Modal.getInstance(document.getElementById('deleteSpaceModal'))?.hide();
    });
  }

  // Tooltips Bootstrap
  enableTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl: any) => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  // Fichier image sélectionné
  onNewFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newSelectedImage = input.files[0];
    }
  }

  // Ajout espace
  submitNewSpace(): void {
    const formData = new FormData();
    for (const key in this.newSpace) {
      if (this.newSpace[key] !== null && this.newSpace[key] !== undefined) {
        formData.append(key, this.newSpace[key]);
      }
    }
    if (this.newSelectedImage) {
      formData.append('image', this.newSelectedImage);
    }

    this.coworkingService.addSpace(formData).subscribe({
      next: () => {
        this.fetchSpaces();
        this.newSpace = {
          name: '',
          description: '',
          city: '',
          address: '',
          price_per_hour: 0,
          capacity: 0,
          latitude: 0,
          longitude: 0,
          space_type: '',
          metropole_id: 1
        };
        this.newSelectedImage = null;
        (window as any).bootstrap.Modal.getInstance(document.getElementById('addSpaceModal')).hide();
      },
      error: (err) => {
        console.error('Erreur ajout espace :', err);
        alert("Erreur API : " + JSON.stringify(err.error));
      }
    });
  }
}
