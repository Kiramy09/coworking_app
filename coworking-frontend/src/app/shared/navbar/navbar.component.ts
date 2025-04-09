import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.checkAdminStatus();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  checkAdminStatus(): void {
    if (this.isLoggedIn()) {
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          this.isAdmin = user.is_staff;
        },
        error: (err) => {
          console.error('Erreur lors de la vérification admin :', err);
        }
      });
    }
  }

  logout(): void {
    localStorage.clear();
    window.location.reload();
  }
}
