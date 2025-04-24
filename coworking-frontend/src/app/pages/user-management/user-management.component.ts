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

  toastMessage: string = '';
  toastType: string = '';
  showToast: boolean = false;

  constructor(private coworkingService: CoworkingService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUsers();
    setTimeout(() => this.enableTooltips(), 100);
  }

  fetchUsers() {
    this.loading = true;
    this.coworkingService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res
          .map(user => {
            const hasRealAvatar = !!user.avatar_url && user.avatar_url.includes('cloudinary');
            return {
              ...user,
              avatar_url: hasRealAvatar
                ? user.avatar_url
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=0D8ABC&color=fff&size=64`
            };
          })
          .sort((a, b) => b.is_staff - a.is_staff); // Admins en premier

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showErrorToast("Erreur lors du chargement des utilisateurs.");
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
      this.showSuccessToast(`L'utilisateur ${this.selectedUser.first_name || this.selectedUser.email} a été supprimé.`);
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

      const actionText = res.is_staff ? 'est maintenant administrateur' : 'n\'est plus administrateur';
      this.showSuccessToast(`L'utilisateur ${this.selectedUser.first_name || this.selectedUser.email} ${actionText}`);
    });
  }

  enableTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl: any) => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'success';
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  showErrorToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'danger';
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
}
