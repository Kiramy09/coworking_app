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

  // Nouveaux attributs pour le toast
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'danger' = 'success';

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}
  
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
        console.log('Profil reçu:', response);
        
        // Mapper les noms de champs Django vers ceux du composant
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
        
        // Si c'est une erreur d'authentification, essayer de rafraîchir le token
        if (err.status === 401) {
          console.log('Tentative de rafraîchissement du token...');
          
          this.authService.refreshToken().subscribe({
            next: () => {
              console.log('Token rafraîchi avec succès, nouvelle tentative...');
              // Réessayer la requête après rafraîchissement du token
              this.loadUserProfile();
            },
            error: (refreshErr) => {
              console.error('Échec du rafraîchissement du token', refreshErr);
              this.showErrorToast('Votre session a expiré. Veuillez vous reconnecter.');
              // Rediriger vers la page de connexion
              // this.router.navigate(['/login']);
              this.isLoading = false;
            }
          });
        } else {
          this.showErrorToast('Impossible de charger les informations du profil.');
          this.isLoading = false;
        }
      }
    });
  }
  
  /* Modifier le profil */
  enableEditing(): void {
    this.isEditing = true;
  }

  isAdmin(): boolean {
    return localStorage.getItem('is_staff') === 'true';
  }
  cancelEditing(): void {
    this.isEditing = false;
    this.loadUserProfile(); // Pour recharger les données pour annuler les modifications
  }

  updateProfile(): void {
    const formData = new FormData();
    formData.append('nom', this.userProfile.nom);
    formData.append('prenom', this.userProfile.prenom);
    
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
        // Afficher un toast de succès
        this.showSuccessToast('Profil mis à jour avec succès');
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil', err);
        
        if (err.status === 401) {
          this.authService.refreshToken().subscribe({
            next: () => {
              console.log('Token rafraîchi, nouvelle tentative de mise à jour...');
              this.updateProfile(); // Récursif, mais seulement une fois
            },
            error: () => {
              this.showErrorToast('Votre session a expiré. Veuillez vous reconnecter.');
              // this.router.navigate(['/login']);
            }
          });
        } else {
          this.showErrorToast('Erreur lors de la mise à jour du profil.');
        }
      }
    });
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
  
  /* Gestion de l'upload d'avatar */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Vérifier le type et la taille du fichier
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        this.showErrorToast('Format d\'image non supporté. Veuillez utiliser JPG, PNG ou GIF.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        this.showErrorToast('L\'image est trop volumineuse. Taille maximale: 5MB.');
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
          this.showSuccessToast('Avatar mis à jour avec succès');
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'upload de l\'avatar', err);
        
        if (err.status === 401) {
          console.log('Tentative de rafraîchissement du token pour l\'upload d\'avatar...');
          
          this.authService.refreshToken().subscribe({
            next: () => {
              console.log('Token rafraîchi avec succès, nouvelle tentative d\'upload...');
              // Réessayer l'upload après rafraîchissement du token
              this.uploadAvatar(file);
            },
            error: (refreshErr) => {
              console.error('Échec du rafraîchissement du token', refreshErr);
              this.showErrorToast('Votre session a expiré. Veuillez vous reconnecter.');
              // Rediriger vers la page de connexion
              // this.router.navigate(['/login']);
            }
          });
        } else {
          this.showErrorToast('Erreur lors de la mise à jour de la photo de profil.');
        }
      }
    });
  }
}