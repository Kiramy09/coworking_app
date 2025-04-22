import { Component, OnInit } from '@angular/core';
import { CoworkingService } from '../../services/coworking.service';
declare const bootstrap: any;

@Component({
  selector: 'app-coworking-management',
  templateUrl: './coworking-management.component.html',
  styleUrls: ['./coworking-management.component.scss']
})
export class CoworkingManagementComponent implements OnInit {
  spaces: any[] = [];
  loading = false;
  selectedSpace: any = null;

  constructor(private coworkingService: CoworkingService) {}

  ngOnInit(): void {
    this.fetchSpaces();
    setTimeout(() => this.enableTooltips(), 100);
  }

  fetchSpaces() {
    this.loading = true;
    this.coworkingService.getSpaces().subscribe({
      next: (res) => {
        this.spaces = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement espaces :', err);
        this.loading = false;
      }
    });
  }

  openDeleteModal(space: any) {
    this.selectedSpace = space;
    const modal = new bootstrap.Modal(document.getElementById('deleteSpaceModal'));
    modal.show();
  }

  confirmDelete() {
    if (!this.selectedSpace) return;
    this.coworkingService.deleteSpace(this.selectedSpace.id).subscribe(() => {
      this.spaces = this.spaces.filter(s => s.id !== this.selectedSpace.id);
      bootstrap.Modal.getInstance(document.getElementById('deleteSpaceModal'))?.hide();
    });
  }

  enableTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl: any) => new bootstrap.Tooltip(tooltipTriggerEl));
  }
  
}
