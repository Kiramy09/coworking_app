import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any[]) => {
        this.users = res;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
      }
    });
  }

  confirmDelete(user: any): void {
    const confirmDelete = confirm(`Supprimer l'utilisateur ${user.email} ?`);
    if (confirmDelete) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          alert('Utilisateur supprimé avec succès.');
        },
        error: (err) => {
          console.error('Erreur suppression utilisateur', err);
        }
      });
    }
  }
}
