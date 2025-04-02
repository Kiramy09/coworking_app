import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Récupérer le token d'authentification du localStorage
    const token = localStorage.getItem('access_token');

    console.log('Intercepteur appelé pour URL:', request.url);
    console.log('Token disponible:', token ? 'Oui' : 'Non');
    
    
    // Si un token existe, l'ajouter à l'en-tête de la requête
    if (token) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
      
      // Vérifier si l'en-tête a été correctement ajouté
      console.log('En-tête Authorization ajouté:', cloned.headers.get('Authorization'));

      return next.handle(cloned);
    }
    
    // Si aucun token n'existe, poursuivre avec la requête originale
    return next.handle(request);
  }
}