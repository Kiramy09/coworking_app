import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
      this.http.get<any>('http://127.0.0.1:8000/api/profile/info/').subscribe({
        next: (res) => {
          this.userFirstName = res.first_name || 'Utilisateur';
          this.avatarUrl = res.avatar_url;
        },
        error: () => {
          this.userFirstName = 'Utilisateur';
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
