import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mon-profil',
  templateUrl: './mon-profil.component.html',
  styleUrl: './mon-profil.component.scss'
})
export class MonProfilComponent implements OnInit {

  userProfile: any = {
    nom: '',
    prenom: '',
    email: '',
    gender: '',
    birth_date: '',
    address: '',
    activity: '',
   
  };
  
  // Options pour le genre basées sur votre modèle Django
  genderOptions = [
    { value: 'F', label: 'Madame' },
    { value: 'M', label: 'Monsieur' }
  ];
  
  isEditing = false;
  avatarUrl: string | null = null;
  isLoading = true;

  constructor(private http: HttpClient, private authService: AuthService) {}
  
  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Vous devez vous connecter pour accéder à votre profil');
      // Rediriger vers la page de connexion si nécessaire
      // this.router.navigate(['/login']);
      return;
    }
    
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.authService.getUserProfile().subscribe({
      next: (response) => {
        // Stocker les données reçues
        console.log('Profil reçu:', response);
        
        // Mapper les noms de champs Django (first_name, last_name) vers les noms utilisés dans le composant (prenom, nom)
        this.userProfile = {
          ...this.userProfile,
          ...response,
          prenom: response.first_name,
          nom: response.last_name
        };
        
        this.avatarUrl = this.userProfile.avatar_url || null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil', err);
        alert('Impossible de charger les informations du profil.');
        this.isLoading = false;
      }
    });
  }
  
  /* Modifier le profil */
  enableEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.loadUserProfile(); // Pour recharger les données pour annuler les modifications
  }

  updateProfile(): void {
    const formData = new FormData();
    formData.append('nom', this.userProfile.nom);
    formData.append('prenom', this.userProfile.prenom);
    formData.append('gender', this.userProfile.gender);
    
    // Vérifier si birth_date est défini avant de l'ajouter
    if (this.userProfile.birth_date) {
      formData.append('birth_date', this.userProfile.birth_date);
    }
    
    formData.append('address', this.userProfile.address || '');
    formData.append('activity', this.userProfile.activity || '');
    
    // Ajouter les préférences si elles sont définies
    if (this.userProfile.preference_bureau_prive !== undefined) {
      formData.append('preference_bureau_prive', this.userProfile.preference_bureau_prive ? '1' : '0');
    }
    
    if (this.userProfile.preference_espace_ouvert !== undefined) {
      formData.append('preference_espace_ouvert', this.userProfile.preference_espace_ouvert ? '1' : '0');
    }
    
    if (this.userProfile.preference_salle_reunion !== undefined) {
      formData.append('preference_salle_reunion', this.userProfile.preference_salle_reunion ? '1' : '0');
    }
    
    if (this.userProfile.budget) {
      formData.append('budget', this.userProfile.budget.toString());
    }

    // Utiliser la nouvelle méthode updateUserProfile
    this.authService.updateUserProfile(formData).subscribe({
      next: (res) => {
        console.log('Profil mis à jour', res);
        
        // Mettre à jour les données locales avec la réponse
        this.userProfile = {
          ...this.userProfile,
          ...res,
          prenom: res.first_name,
          nom: res.last_name
        };
        
        alert('Profil mis à jour avec succès !');
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil', err);
        alert('Erreur lors de la mise à jour du profil.');
      }
    });
  }

  /* Gestion de l'upload d'avatar */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Vérifier le type et la taille du fichier
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        alert('Format d\'image non supporté. Veuillez utiliser JPG, PNG ou GIF.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert('L\'image est trop volumineuse. Taille maximale: 5MB.');
        return;
      }
      
      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
      
      // Upload de l'image
      this.uploadAvatar(file);
    }
  }
  
  uploadAvatar(file: File): void {
    this.authService.uploadAvatar(file).subscribe({
      next: (response) => {
        console.log('Avatar mis à jour', response);
        if (response && response.avatar_url) {
          this.avatarUrl = response.avatar_url;
          this.userProfile.avatar_url = response.avatar_url;
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'upload de l\'avatar', err);
        alert('Erreur lors de la mise à jour de la photo de profil.');
      }
    });
  }
}