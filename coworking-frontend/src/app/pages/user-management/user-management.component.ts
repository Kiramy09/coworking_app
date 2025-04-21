import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';
import { Router } from '@angular/router';

declare const bootstrap: any;

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  loading = false;
  selectedUser: any = null;

  constructor(private coworkingService: CoworkingService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUsers();
    setTimeout(() => this.enableTooltips(), 100); // activer tooltips Bootstrap
  }

  fetchUsers() {
    this.loading = true;
    this.coworkingService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs:', err);
        this.loading = false;
      }
    });
  }

  viewReservations(userId: number) {
    this.router.navigate(['/admin/user', userId, 'bookings']);
  }

  openDeleteModal(user: any) {
    this.selectedUser = user;
    const modal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    modal.show();
  }

  confirmDelete() {
    if (!this.selectedUser) return;
    this.coworkingService.deleteUser(this.selectedUser.id).subscribe(() => {
      this.users = this.users.filter(u => u.id !== this.selectedUser.id);
      bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'))?.hide();
    });
  }

  openAdminModal(user: any) {
    this.selectedUser = user;
    const modal = new bootstrap.Modal(document.getElementById('adminUserModal'));
    modal.show();
  }

  confirmToggleAdmin() {
    const updated = {
      is_staff: !this.selectedUser.is_staff
    };
  
    this.coworkingService.updateUserRole(this.selectedUser.id, updated).subscribe((res) => {
      this.selectedUser.is_staff = res.is_staff;
      bootstrap.Modal.getInstance(document.getElementById('adminUserModal'))?.hide();
    });
  }
  

  enableTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl: any) => new bootstrap.Tooltip(tooltipTriggerEl));
  }
}