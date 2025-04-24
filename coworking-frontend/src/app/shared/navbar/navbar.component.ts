import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  userFirstName = 'Utilisateur';
  avatarUrl: string | null = null;
  defaultAvatar = 'assets/default-avatar.png';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
  this.authService.currentUser$.subscribe((user) => {
    if (user) {
      this.userFirstName = user.first_name || 'Utilisateur';
      this.avatarUrl = user.avatar_url
        ? user.avatar_url
        : `https://ui-avatars.com/api/?name=${user.first_name}&background=0D8ABC&color=fff&size=64`;
    }
  });

  if (this.isLoggedIn()) {
    // Si on a déjà le token, on force le chargement du profil
    this.authService.getUserProfile().subscribe();
  }
}


  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (res) => {
        console.log('Données utilisateur reçues :', res);
        this.userFirstName = res.first_name || 'Utilisateur';
        this.avatarUrl = res.avatar_url
          ? res.avatar_url
          : `https://ui-avatars.com/api/?name=${res.first_name}&background=0D8ABC&color=fff&size=64`;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil :', err);
        this.userFirstName = 'Utilisateur';
        this.avatarUrl = this.defaultAvatar;
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return localStorage.getItem('is_staff') === 'true';
  }

  logout() {
    this.authService.logout();
  }
}
