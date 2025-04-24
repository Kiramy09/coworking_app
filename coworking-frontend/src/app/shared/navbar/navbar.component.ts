import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  userFirstName = 'Utilisateur';
  avatarUrl: string | null = null;
  defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=64';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      const token = localStorage.getItem('access_token');

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      this.http.get<any>('http://127.0.0.1:8000/api/profile/info/', { headers }).subscribe({
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
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  isAdmin(): boolean {
    return localStorage.getItem('is_staff') === 'true';
  }

  logout() {
    localStorage.clear();
    window.location.reload();
  }
}
