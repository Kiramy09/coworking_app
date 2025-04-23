import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoworkingService } from '../../services/coworking.service';

@Component({
  selector: 'app-spaces',
  templateUrl: './spaces.component.html',
  styleUrl: './spaces.component.scss'
})
export class SpacesComponent implements OnInit {
  spaces: any[] = [];
  metropoles: any[] = [];
  showAddModal = false;
  spaceForm!: FormGroup;
  toastMessage: string = '';
  toastType: 'success' | 'danger' = 'success';
  showToast: boolean = false;
  
  constructor(
    private coworkingService: CoworkingService,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadSpaces();
    this.loadMetropoles();
  }

  loadMetropoles(): void {
    this.coworkingService.getAllMetropoles().subscribe(
      metropoles => this.metropoles = metropoles,
      error => console.error('Erreur lors du chargement des métropoles:', error)
    );
  }

  createForm(): void {
    this.spaceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      space_type: ['meeting_room', Validators.required],
      price_per_hour: ['', [Validators.required, Validators.min(0)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      metropole: [null, Validators.required] 
    });
  }
  
  loadSpaces(): void {
    this.coworkingService.getAllSpaces().subscribe(
      spaces => this.spaces = spaces,
      error => console.error('Erreur lors du chargement des espaces:', error)
    );
  }
  
  openAddModal(): void {
    this.spaceForm.reset({
      space_type: 'meeting_room'
    });
    this.showAddModal = true;
  }

  
  closeModal(): void {
    this.showAddModal = false;
  }
  
  submitForm(): void {
    if (this.spaceForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.spaceForm.controls).forEach(key => {
        this.spaceForm.get(key)?.markAsTouched();
      });
      return;
    }
  
    // Préparer les données à envoyer
    const spaceData = this.spaceForm.value;
  
    console.log('Données à envoyer:', spaceData);
  
    this.coworkingService.createSpace(spaceData).subscribe(
      response => {
        console.log('Espace créé avec succès:', response);
        // Ajouter le nouvel espace à la liste
        this.spaces.push(response);
        this.closeModal();
        // Afficher un message de succès
        this.showSuccessToast('Espace ajouté avec succès !');
      },
      error => {
        console.error('Erreur lors de la création de l\'espace:', error);
        this.showErrorToast('Erreur lors de la création de l\'espace');
      }
    );
  }

  getSpaceTypeLabel(type: string): string {
    const types: {[key: string]: string} = {
      'office': 'Bureau individuel',
      'meeting_room': 'Salle de réunion',
      'open_space': 'Espace ouvert',
      'other': 'Autre'
    };
    return types[type] || 'Autre';
  }

   // Méthodes utilitaires pour afficher les toasts
  showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'success';
    this.showToast = true;
  }

  showErrorToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'danger';
    this.showToast = true;
  }

}
