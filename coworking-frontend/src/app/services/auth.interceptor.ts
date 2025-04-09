// src/app/services/auth.interceptor.ts
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');
    const isPublic = req.url.includes('/spaces') || req.url.includes('/register') || req.url.includes('/login');

    let authReq = req;

    if (token && !isPublic) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Token expiré
        if (error.status === 401 && localStorage.getItem('refresh_token')) {
          return this.authService.refreshToken().pipe(
            switchMap((res: any) => {
              localStorage.setItem('access_token', res.access);
              const clonedReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${res.access}`)
              });
              return next.handle(clonedReq);
            }),
            catchError(err => {
              // Refresh échoué → déconnexion
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              // Optionnel : rediriger vers /login
              // this.router.navigate(['/login']);
              return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
