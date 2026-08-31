import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { UtilisateurCourant } from '../models/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface LoginApiResponse {
  token: string;
  utilisateur: UtilisateurCourant;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private utilisateurSubject = new BehaviorSubject<UtilisateurCourant | null>(this.lireUtilisateurStocke());
  readonly utilisateur$ = this.utilisateurSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get utilisateurActuel(): UtilisateurCourant | null {
    return this.utilisateurSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  login(email: string, motDePasse: string): Observable<UtilisateurCourant> {
    return this.http.post<LoginApiResponse>(`${API_BASE_URL}/auth/login`, { email, motDePasse }).pipe(
      tap((r) => {
        localStorage.setItem(TOKEN_KEY, r.token);
        localStorage.setItem(USER_KEY, JSON.stringify(r.utilisateur));
        this.utilisateurSubject.next(r.utilisateur);
      }),
      map((r) => r.utilisateur),
    );
  }

  logout(): void {
    // Revocation cote serveur en best-effort : le nettoyage local doit se faire meme si l'appel
    // echoue (token deja expire/invalide, backend injoignable, etc.).
    if (this.token) {
      this.http.post(`${API_BASE_URL}/auth/logout`, {}).pipe(catchError(() => of(undefined))).subscribe();
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.utilisateurSubject.next(null);
    this.router.navigate(['/login']);
  }

  private lireUtilisateurStocke(): UtilisateurCourant | null {
    const brut = localStorage.getItem(USER_KEY);
    if (!brut) return null;
    try {
      return JSON.parse(brut) as UtilisateurCourant;
    } catch {
      return null;
    }
  }
}
