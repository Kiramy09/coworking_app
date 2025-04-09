import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  isAdmin: boolean = false;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isAdmin = user.is_staff;
        if (!this.isAdmin) {
          alert("Accès refusé. Vous devez être administrateur.");
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error("Erreur lors de la récupération de l'utilisateur:", err);
        this.router.navigate(['/']);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
