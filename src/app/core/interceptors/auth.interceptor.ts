import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../api-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token;

  const authReq = token && req.url.startsWith(API_BASE_URL)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err) => {
      // Token absent/expiré/invalide : on force une reconnexion plutôt que de laisser
      // l'app dans un état incohérent (401 silencieux sur chaque appel).
      if (err.status === 401 && authService.isAuthenticated()) {
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        authService.logout();
        router.navigate(['/login']);
      } else if (err.status === 403) {
        alert("Vous n'avez pas les droits nécessaires pour cette action.");
      }
      return throwError(() => err);
    }),
  );
};