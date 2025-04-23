import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoworkingService } from '../../services/coworking.service';


@Component({
  selector: 'app-admin-space-detail',
  templateUrl: './admin-space-detail.component.html',
  styleUrls: ['./admin-space-detail.component.scss']
})
export class AdminSpaceDetailComponent implements OnInit {
  spaceId!: number;
  space: any;
  reservations: any[] = [];
  allEquipments: any[] = [];

  editMode: boolean = false;
  editForm: any = {};
  successMessageVisible = false;
  reservationToDelete: number | null = null;


  constructor(
    private route: ActivatedRoute,
    private coworkingService: CoworkingService
  ) {}

  ngOnInit(): void {
    this.spaceId = +this.route.snapshot.paramMap.get('id')!;
    this.loadSpace();
    this.loadReservations();
  }

  loadSpace(): void {
    this.coworkingService.getSpace(this.spaceId).subscribe({
      next: (res) => {
        this.space = res;
        this.editForm = { ...res }; // clone pour édition
        this.loadEquipments(); // charge après avoir le space
      },
      error: (err) => console.error('Erreur chargement espace :', err)
    });
  }

  loadReservations(): void {
    this.coworkingService.getReservationsBySpace(this.spaceId).subscribe({
      next: (res) => this.reservations = res,
      error: (err) => console.error('Erreur chargement réservations :', err)
    });
  }

  loadEquipments(): void {
    this.coworkingService.getEquipments().subscribe({
      next: (data) => {
        const selectedIds = this.space?.equipments?.map((e: any) => e.id) || [];
        this.allEquipments = data.map((e: any) => ({
          ...e,
          checked: selectedIds.includes(e.id),
        }));
      },
      error: (err) => console.error("Erreur chargement équipements :", err)
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.editForm = { ...this.space }; // reset si annulation
    }
  }

  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.editForm.image = fileInput.files[0]; // image = fichier sélectionné
    }
  }

  toggleVisibility(): void {
    this.coworkingService.toggleSpaceVisibility(this.spaceId).subscribe({
      next: (res) => {
        this.space.is_visible = res.is_visible;
  
        // Optionnel : afficher un message
        const modalEl = document.getElementById('visibilityModal');
        if (modalEl && (window as any).bootstrap) {
          const modal = new (window as any).bootstrap.Modal(modalEl);
          modal.show();
        }
      },
      error: (err) => {
        console.error("Erreur de visibilité :", err);
        alert("Impossible de changer la visibilité pour le moment.");
      }
    });
  }

  confirmDelete(): void {
    const modalEl = document.getElementById('confirmDeleteModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  
  deleteSpace(): void {
    this.coworkingService.deleteSpace(this.spaceId).subscribe({
      next: () => {
        // Rediriger ou afficher un message
        alert('Espace supprimé avec succès.');
        window.location.href = '/admin/spaces';
      },
      error: (err) => {
        console.error('Erreur suppression espace :', err);
        alert('Erreur lors de la suppression.');
      }
    });
  }
  

  deleteReservation(bookingId: number): void {
    this.reservationToDelete = bookingId;
  
    const modalEl = document.getElementById('confirmDeleteReservationModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  
  confirmReservationDeletion(): void {
    if (!this.reservationToDelete) return;
  
    this.coworkingService.cancelBookingAsAdmin(this.reservationToDelete).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(r => r.id !== this.reservationToDelete);
        this.reservationToDelete = null;
  
        // Fermer la modale après succès
        const modalEl = document.getElementById('confirmDeleteReservationModal');
        if (modalEl && (window as any).bootstrap) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
          modal?.hide();
        }
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de la réservation :', err);
        alert("Impossible de supprimer la réservation.");
      }
    });
  }

  saveChanges(): void {
    const selectedEquipments = this.allEquipments
      .filter(e => e.checked)
      .map(e => e.id);
  
    const dataToSend: any = {
      name: this.editForm.name,
      address: this.editForm.address,
      metropole:this.editForm.metropole,
      city: this.editForm.city,
      capacity: this.editForm.capacity,
      price_per_hour: this.editForm.price_per_hour,
      description: this.editForm.description,
      equipments: selectedEquipments,
    };
  
    // ⚠️ Si une nouvelle image a été sélectionnée, on utilise FormData + PUT
    if (this.editForm.image && typeof this.editForm.image !== 'string') {
      const formData = new FormData();
      for (const key in dataToSend) {
        if (Array.isArray(dataToSend[key])) {
          dataToSend[key].forEach((id: any) => formData.append('equipments', id.toString()));
        } else {
          formData.append(key, dataToSend[key]);
        }
      }
      formData.append('image', this.editForm.image);
  
      this.coworkingService.updateSpaceWithFormData(this.spaceId, formData).subscribe({
        next: (updated) => this.onSaveSuccess(updated),
        error: (err) => this.onSaveError(err)
      });
  
    } else {
      // Sinon → PATCH classique en JSON
      this.coworkingService.updateSpace(this.spaceId, dataToSend).subscribe({
        next: (updated) => this.onSaveSuccess(updated),
        error: (err) => this.onSaveError(err)
      });
    }
  }
  
  private onSaveSuccess(updated: any): void {
    this.space = updated;
    this.editForm = { ...updated };
    this.editMode = false;
    this.loadEquipments();
  
    const modalEl = document.getElementById('updateSuccessModal');
    if (modalEl && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  
  private onSaveError(err: any): void {
    console.error("Erreur de mise à jour :", err);
    alert("Erreur lors de la sauvegarde.");
  }
  
}
