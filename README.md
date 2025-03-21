# coworking_app
Plateforme de Gestion des Espaces de Coworking
Objectif : Une application permettant aux utilisateurs de réserver des espaces de travail, tandis que les administrateurs gèrent les espaces et suivent les réservations.
Technos utilisées :
•	Frontend : Angular (UI dynamique et responsive)
•	Backend : Spring Boot (API REST sécurisée)
•	Base de données : PostgreSQL (gestion des utilisateurs, espaces, réservations)
•	Extras : WebSockets (notifications en temps réel), Stripe API (paiements), JWT (authentification sécurisée)
________________________________________
Profils Utilisateurs
Utilisateur classique (Client) poura :
-S'inscrire et se connecter (avec JWT)
-Consulter les espaces disponibles
-Réserver un espace pour une durée (journée/semaine/mois)
-Payer en ligne via Stripe
-Voir son historique de réservations
-Annuler une réservation (sous conditions)
________________________________________
Administrateur pourra

 -Gérer les utilisateurs (bloquer, supprimer, etc.)
 -Ajouter, modifier ou supprimer des espaces de coworking
 - Consulter et gérer les réservations
- Suivre les revenus générés par les réservations
- Voir des statistiques détaillées sur l'occupation des espaces
________________________________________
 Fonctionnalités principales
 1. Authentification et gestion des rôles (JWT)
•	Inscription et connexion sécurisée avec JWT
•	Différents accès selon le rôle (Utilisateur / Admin)
•	Protection des routes dans Angular avec Guards
________________________________________
 2. Gestion des espaces de coworking
 Côté utilisateur :
•	Recherche des espaces par ville, prix, équipements
•	Consultation des disponibilités en temps réel
•	Sélection et réservation d'un créneau
 Côté admin :
•	Ajout, modification et suppression des espaces
•	Gestion des équipements disponibles dans chaque espace
________________________________________
 3. Réservations et paiements
•	Réservation d’un espace pour une date précise
•	Paiement en ligne sécurisé via Stripe
•	Facturation automatique avec génération de PDF
•	Annulation possible selon une politique définie
________________________________________
 4. Notifications et rappels
•	WebSockets pour mise à jour des réservations en temps réel
•	Envoi d'un rappel automatique avant la réservation
•	Notification si une réservation est annulée
________________________________________
 5. Tableau de bord et statistiques (Admin)
 Statistiques sur :
•	Le taux d’occupation des espaces
•	Les revenus générés par période
•	Nombre de nouvelles réservations par semaine
