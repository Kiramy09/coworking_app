import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CoworkingService } from '../../services/coworking.service';  
declare const bootstrap: any;


@Component({
  selector: 'app-spaces',
  templateUrl: './spaces.component.html',
  styleUrls: ['./spaces.component.scss']
})
export class SpacesComponent implements OnInit {
  metropoles: string[] = [];
  availableCities: string[] = [];
  metropoleList: any[] = [];
  searchResults: any[] = [];
  searchTimeout: any = null;
  selectedImageFile: File | null = null;
  previewUrl: string | null = null;
  selectedMetropoleName: string = '';
  isAddressValid: boolean | null = null;
  spaces: any[] = [];
  selectedSpace: any = null;
  loading = false;

  toastMessage: string = '';
  toastType: string = '';
  showToast: boolean = false;


  form: any = {
    name: '',
    metropole: null,
    city: '',
    address: '',
    space_type: '',
    capacity: null,
    price_per_hour: null,
    description: '',
    latitude: null,
    longitude: null,
  };

  cityByMetropole: { [key: string]: string[] } = {};

    constructor(private http: HttpClient,private coworkingService: CoworkingService,private router: Router) {}

  ngOnInit(): void {
    this.coworkingService.getMetropoleCityMap().subscribe({
      next: (res) => {
        this.cityByMetropole = res;
        this.metropoles = Object.keys(res);
      },
      error: (err) => console.error("Erreur map métropole/villes :", err)
    });
  
    // Facultatif si tu veux afficher les ID/metropoles ailleurs
    this.coworkingService.getMetropoles().subscribe({
      next: (res) => this.metropoleList = res,
      error: (err) => console.error("Erreur récupération métropoles :", err)
    });
    // console.log(this.metropoleList);
    this.fetchSpaces(); // charger la liste des salles
  }

  fetchSpaces() {
    this.loading = true;
    this.coworkingService.getAllSpaces().subscribe({
      next: (res) => {
        this.spaces = res;
        this.loading = false;
      },
      error: (err) => {
        console.error("Erreur récupération espaces:", err);
        this.loading = false;
      }
    });
  }
  
  openDeleteModal(space: any) {
    this.selectedSpace = space;
    const modal = new bootstrap.Modal(document.getElementById('deleteSpaceModal'));
    modal.show();
  }
  
  confirmDelete() {
    if (!this.selectedSpace) return;
    this.coworkingService.deleteSpace(this.selectedSpace.id).subscribe({
      next: () => {
        this.spaces = this.spaces.filter(s => s.id !== this.selectedSpace.id);
        bootstrap.Modal.getInstance(document.getElementById('deleteSpaceModal'))?.hide();
         // Affichage du toast de succès
        this.showSuccessToast(`L'espace "${this.selectedSpace.name}" a été supprimé avec succès`);
      },
      error: (err) => {
        console.error("Erreur suppression espace:", err);
        
        // Affichage du toast d'erreur
        this.showErrorToast(`Erreur lors de la suppression de l'espace: ${err.message || 'Veuillez réessayer'}`);
      }
    });
  }
  
  editSpace(space: any) {
    this.router.navigate(['/admin/spaces', space.id]);
  }

  onMetropoleChangeById(metropoleId: any) {
    let idMet = parseInt(metropoleId);
    const selected = this.metropoleList.find(m => m.id === idMet);
    const name = selected?.name || '';
    this.form.metropole = idMet; 
    this.availableCities = this.cityByMetropole[name] || [];
    this.form.city = '';
  }
  

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];
  
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(this.selectedImageFile);
    }
  }
  

  resetForm() {
    this.form = {
      name: '',
      metropole: null,  // <-- ici la correction !
      city: '',
      space_type: '',
      address: '',
      capacity: null,
      price_per_hour: null,
      description: '',
      latitude: null,
      longitude: null,
    };
  
    this.availableCities = [];
    this.searchResults = [];
    this.isAddressValid = null;
    this.selectedImageFile = null;
    this.previewUrl = null;
  }
  
  
  onAddressInput() {
    if (!this.form.city) return; // bloquer tant que ville non choisie
  
    const fullAddress = `${this.form.address}, ${this.form.city}, France`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&addressdetails=1&limit=5`;
  
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.http.get<any[]>(url).subscribe(results => {
        this.searchResults = results;
      });
    }, 400);
  }
  
  selectSuggestion(result: any) {
    // On ne met que la partie rue dans le champ adresse
    const street = result.address.road || result.address.pedestrian || result.address.footway || '';
    const number = result.address.house_number || '';
    this.form.address = [number, street].filter(Boolean).join(' ');
  
    this.form.latitude = parseFloat(result.lat);
    this.form.longitude = parseFloat(result.lon);
  
    const returnedCity = result.address.city || result.address.town || result.address.village || '';
    this.isAddressValid = returnedCity.toLowerCase().includes(this.form.city.toLowerCase());
  
    this.searchResults = [];
  }
  

  submitForm() {
    const requiredFields = ['name', 'metropole', 'city', 'address', 'space_type', 'capacity', 'price_per_hour', 'latitude', 'longitude'];
    for (const field of requiredFields) {
      if (!this.form[field]) {
        alert(`Le champ "${field}" est requis.`);
        return;
      }
    }
  
    if (!this.form.latitude || !this.form.longitude) {
      alert("Adresse invalide ou incohérente avec la ville.");
      return;
    }
  
    const formData = new FormData();
  
    // Ajouter tous les champs texte/nombre
    // Object.keys(this.form).forEach(key => {
    //   const value = this.form[key];
    //   if (value !== null && value !== undefined) {
    //     formData.append(key, value.toString());
    //   }
    // });
    Object.keys(this.form).forEach(key => {
      const value = this.form[key];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    
  
    // Ajouter l'image
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }
  
    this.coworkingService.createSpaceWithFormData(formData).subscribe({
      next: () => {
        this.showSuccessToast('Espace ajouté avec succès !');
        this.resetForm(); // Facultatif : tu peux ajouter cette fonction pour tout réinitialiser

         // Fermer la modal Bootstrap
      const modalElement = document.getElementById('addSpaceModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
      
      // Rafraîchir la liste des espaces
      this.fetchSpaces();
      },
      error: err => {
        console.error(err);
        this.showErrorToast(`Erreur lors de l'ajout de l'espace: ${err.message || 'Veuillez réessayer'}`);
      }
    });
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
