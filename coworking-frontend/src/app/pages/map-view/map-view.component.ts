import { Component, OnInit } from '@angular/core';

import * as L from 'leaflet';
import { CoworkingService } from '../../services/coworking.service';
import { ActivatedRoute } from '@angular/router';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit {
  map: any;
  spaces: any[] = [];

  constructor(
    private coworkingService: CoworkingService,
    private route: ActivatedRoute
  ) {}
  
  selectedType: string = '';
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedType = params['type'] || '';
      this.initMap();
      this.loadSpaces();
    });
  }
  

  initMap(): void {
    this.map = L.map('map').setView([44.837789, -0.579180], 13); // Bordeaux

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  loadSpaces(): void {
    const observable = this.selectedType
      ? this.coworkingService.getSpacesByType(this.selectedType)
      : this.coworkingService.getSpaces();
  
    observable.subscribe({
      next: (spaces) => {
        this.spaces = spaces;
  
        // Ajout des marqueurs filtrés
        spaces.forEach(space => {
          if (space.latitude && space.longitude) {
            const marker = L.marker([space.latitude, space.longitude]).addTo(this.map);
            marker.bindPopup(`<b>${space.name}</b><br>${space.address}`);
          }
        });
      },
      error: (err) => {
        console.error('Erreur chargement des espaces :', err);
      }
    });
  }
  
}
