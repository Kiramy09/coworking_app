import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Données simulées qu'on va afficher avec *ngFor dans le HTML
  spaces = [
    {
      title: 'Salles de réunion',
      description: 'Accédez à des salles de réunion équipées pour vos besoins pros.',
      image: 'assets/meeting-room.jpg',
      type: 'meeting_room'
    },
    {
      title: 'Open Space',
      description: 'Travaillez dans un espace dynamique et connecté.',
      image: 'assets/open-space.jpg',
      type: 'open_space'
    },
    {
      title: 'Bureaux fermés',
      description: 'Ambiance calme et lumineuse pour booster votre productivité.',
      image: 'assets/open-space2.jpg',
      type: 'office'
    }
  ];
  
}
