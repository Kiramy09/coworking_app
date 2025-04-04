import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Récupérer le token d'accès
    const token = localStorage.getItem('access_token');

    // Si un token existe, l'ajouter à l'en-tête de la requête
    if (token) {
      console.log('Ajout du token à la requête:', request.url);
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Gérer les erreurs de requête
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Vérifier si l'erreur est une erreur d'autorisation (401)
        if (error.status === 401) {
          // Tenter de rafraîchir le token
          return this.handleUnauthorizedError(request, next);
        }
        
        // Pour toutes les autres erreurs, renvoyer l'erreur
        return throwError(() => error);
      })
    );
  }

  private handleUnauthorizedError(request: HttpRequest<unknown>, next: HttpHandler) {
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        // Récupérer le nouveau token
        const newToken = localStorage.getItem('access_token');
        
        // Cloner la requête originale avec le nouveau token
        const newRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        
        // Renvoyer la requête avec le nouveau token
        return next.handle(newRequest);
      }),
      catchError((refreshError) => {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        this.authService.logout();
        return throwError(() => refreshError);
      })
    );
  }
}