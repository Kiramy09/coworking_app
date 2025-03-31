import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @ViewChild('spacesSection') spacesSection!: ElementRef;

  spaces = [
    {
      title: 'Salles de réunion ',
      description: `Accédez à des salles de téléphonie d’entreprise modernes, 
      idéales pour la présentation, l’installation et la configuration de vos offres.
      Profitez d’un cadre professionnel, lumineux et équipé, propice à la concentration 
      et à la collaboration.`,
      image: 'assets/meeting-room.jpg',
      type: 'meeting_room'
    },
    {
      title: 'Open Space',
      description: `Découvrez l’offre de formation sélectionnée et labellisée pour la montée 
      en compétences de la filière numérique. Nos open spaces favorisent l’échange, la créativité 
      et l’efficacité au quotidien.`,      
      image: 'assets/open-space.jpg',
      type: 'open_space'
    },
    {
      title: 'Bureaux Fermés',
      description: `Ambiance calme et design soigné pour booster votre productivité. 
      Nos bureaux fermés sont adaptés aux équipes comme aux indépendants en quête d’intimité 
      dans leur travail. Accès sécurisé, wifi haut débit et café à volonté.`,
      image: 'assets/open-space2.jpg',
      type: 'office'
    }
  ];

  scrollToSpaces() {
    this.spacesSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
