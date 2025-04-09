import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CoworkingService } from '../../services/coworking.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Supprimer l'icône Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  map: any;
  spaces: any[] = [];

  selectedType: string = '';
  selectedCity: string = '';

  // Coordonnées des villes disponibles
  cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    paris: { lat: 48.8566, lng: 2.3522 },
    marseille: { lat: 43.2965, lng: 5.3698 },
    lyon: { lat: 45.7640, lng: 4.8357 },
    toulouse: { lat: 43.6047, lng: 1.4442 },
    nice: { lat: 43.7102, lng: 7.2620 },
    bordeaux: { lat: 44.8378, lng: -0.5792 }
  };

  constructor(
    private coworkingService: CoworkingService,
    private route: ActivatedRoute,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedType = params['type'] || '';
    });
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('cityModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmCity(): void {
    const coords = this.cityCoordinates[this.selectedCity];
    if (!this.map) {
      this.initMap(coords.lat, coords.lng);
    } else {
      this.map.setView([coords.lat, coords.lng], 13);
    }

    this.loadSpaces();

    // Fermer la modale
    const modalElement = document.getElementById('cityModal');
    const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }

  initMap(lat: number, lng: number): void {
    this.map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  loadSpaces(): void {
    const params: any = {};
    if (this.selectedType) {
      params.type = this.selectedType;
    }
    if (this.selectedCity) {
      params.metropole  = this.selectedCity;
    }

    this.coworkingService.getSpaceFiltered(params).subscribe({
      next: (spaces) => {
        this.spaces = spaces;

        // Nettoyer les anciens marqueurs
        this.clearMapMarkers();

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="marker-pin"><i class="bi bi-geo-alt-fill text-primary fs-4"></i></div>`,
          iconSize: [30, 42],
          iconAnchor: [15, 42]
        });

        spaces.forEach(space => {
          console.log(spaces);
          if (space.latitude && space.longitude) {
            const marker = L.marker(
              [space.latitude, space.longitude],
              { icon: customIcon }
            ).addTo(this.map);

            const popupContent = `
              <div style="width: 200px;">
                <img src="${space.image}" alt="${space.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
                <strong>${space.name}</strong><br>
                <small>${space.address}</small>
              </div>
            `;

            marker.bindPopup(popupContent);

            // marker.bindPopup(`<b>${space.name}</b><br>${space.address}`);
          }
        });
      },
      error: (err) => {
        console.error('Erreur chargement des espaces :', err);
      }
    });
  }

  // Pour éviter de superposer les marqueurs à chaque appel
  clearMapMarkers(): void {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
  }

  filters = {
    minCapacity: null,
    maxPrice: null,
    projector: false,
    meetingRoom: false,
    ac: false,
    printer: false
  };

  addMarkers(spaces: any[]): void {
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="marker-pin"><i class="bi bi-geo-alt-fill text-primary fs-4"></i></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });
  
    spaces.forEach(space => {
      if (space.latitude && space.longitude) {
        const marker = L.marker(
          [space.latitude, space.longitude],
          { icon: customIcon }
        ).addTo(this.map);
        marker.bindPopup(`<b>${space.name}</b><br>${space.address}`);
      }
    });
  }
  
  applyAdvancedFilters(): void {
    const params: any = {};
  
    if (this.selectedType) params.type = this.selectedType;
    if (this.selectedCity) params.metropole = this.selectedCity;
  
    if (this.filters.minCapacity) params.min_capacity = this.filters.minCapacity;
    if (this.filters.maxPrice) params.max_price = this.filters.maxPrice;
    if (this.filters.projector) params.equipment = 'Projecteur';
    if (this.filters.meetingRoom) params.equipment = 'Salle de réunion';
    if (this.filters.ac) params.equipment = 'Climatisation';
    if (this.filters.printer) params.equipment = 'Imprimante';
  
    this.coworkingService.getSpaceFiltered(params).subscribe({
      next: (spaces) => {
        this.spaces = spaces;
        this.clearMapMarkers();
        this.addMarkers(spaces);
      },
      error: (err) => {
        console.error('Erreur chargement avec filtres :', err);
      }
    });
  }
    
}
