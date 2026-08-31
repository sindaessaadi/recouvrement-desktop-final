import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from '../api-config';
import { LABELS_ROLE, RoleUtilisateur } from '../models/auth';
import { AuthService } from './auth.service';
import {
  Utilisateur,
  Preferences,
  Organisation,
  LogActivite,
  SessionActive,
} from '../models/utilisateur';

interface UtilisateurApiResponse {
  id: number;
  nom: string;
  email: string;
  role: RoleUtilisateur;
  telephone: string;
  actif: boolean;
  initiales: string;
}

interface OrganisationApiResponse {
  id: number;
  nomCompagnie: string;
  devise: string;
  prefixeNumerotationMemoires: string;
  delaiRelanceParDefaut: number;
  tauxTva: number;
  exerciceComptable: string;
}

interface PreferencesApiResponse {
  notificationsEmail: boolean;
  notificationsApp: boolean;
  alerteRelanceEchue: boolean;
  alerteImpaye: boolean;
  seuilAlerteImpaye: number;
  theme: string;
  langue: string;
  densite: string;
  formatDate: string;
}

interface LogActiviteApiResponse {
  id: number;
  date: string;
  utilisateur: string;
  action: string;
}

interface SessionApiResponse {
  id: number;
  appareil: string;
  adresseIp: string;
  dateConnexion: string;
  derniereActivite: string;
  actif: boolean;
  sessionActuelle: boolean;
}

function isoVersDateHeureLabel(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function versPreferences(p: PreferencesApiResponse): Preferences {
  return {
    notificationsEmail: p.notificationsEmail,
    notificationsApp: p.notificationsApp,
    alerteRelanceEchue: p.alerteRelanceEchue,
    alerteImpaye: p.alerteImpaye,
    seuilAlerteImpaye: p.seuilAlerteImpaye,
    theme: p.theme as Preferences['theme'],
    langue: p.langue as Preferences['langue'],
    densite: p.densite as Preferences['densite'],
    formatDate: p.formatDate as Preferences['formatDate'],
  };
}

function versLogActivite(l: LogActiviteApiResponse): LogActivite {
  return {
    date: isoVersDateHeureLabel(l.date),
    utilisateur: l.utilisateur ?? '-',
    action: l.action ?? '-',
  };
}

function versSessionActive(s: SessionApiResponse): SessionActive {
  return {
    id: s.id,
    appareil: s.appareil ?? 'Inconnu',
    // Pas de service de geolocalisation IP branche : on affiche l'adresse IP brute plutot
    // qu'une fausse ville.
    localisation: s.adresseIp ?? '-',
    statut: s.sessionActuelle ? 'active' : 'inactive',
    derniereActivite: s.sessionActuelle ? 'active maintenant' : isoVersDateHeureLabel(s.derniereActivite),
  };
}

function versUtilisateur(u: UtilisateurApiResponse): Utilisateur {
  return {
    id: u.id,
    nom: u.nom,
    role: LABELS_ROLE[u.role],
    email: u.email,
    telephone: u.telephone,
    initiales: u.initiales,
    actif: u.actif,
  };
}

function versOrganisation(o: OrganisationApiResponse): Organisation {
  return {
    nomCompagnie: o.nomCompagnie,
    devise: o.devise as Organisation['devise'],
    prefixeNumerotationMemoires: o.prefixeNumerotationMemoires,
    delaiRelanceParDefaut: o.delaiRelanceParDefaut,
    tauxTva: o.tauxTva,
    exerciceComptable: o.exerciceComptable,
  };
}

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getUtilisateur(): Observable<Utilisateur | null> {
    const courant = this.authService.utilisateurActuel;
    if (!courant) {
      return of(null);
    }
    return of({
      id: courant.id,
      nom: courant.nom,
      role: LABELS_ROLE[courant.role],
      email: courant.email,
      telephone: courant.telephone,
      initiales: courant.initiales,
      actif: courant.actif,
    });
  }

  getPreferences(): Observable<Preferences> {
    return this.http.get<PreferencesApiResponse>(`${API_BASE_URL}/preferences`).pipe(map(versPreferences));
  }

  getOrganisation(): Observable<Organisation> {
    return this.http
      .get<OrganisationApiResponse>(`${API_BASE_URL}/organisation`)
      .pipe(map(versOrganisation));
  }

  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<UtilisateurApiResponse[]>(`${API_BASE_URL}/utilisateurs`).pipe(
      map((liste) => liste.map(versUtilisateur)),
      catchError(() => of([])),
    );
  }

  getLogs(): Observable<LogActivite[]> {
    return this.http.get<LogActiviteApiResponse[]>(`${API_BASE_URL}/logs`).pipe(
      map((liste) => liste.map(versLogActivite)),
      catchError(() => of([])),
    );
  }

  getSessions(): Observable<SessionActive[]> {
    return this.http.get<SessionApiResponse[]>(`${API_BASE_URL}/sessions`).pipe(
      map((liste) => liste.map(versSessionActive)),
      catchError(() => of([])),
    );
  }

  deconnecterSession(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/sessions/${id}`);
  }

  enregistrerPreferences(preferences: Preferences): Observable<Preferences> {
    return this.http
      .put<PreferencesApiResponse>(`${API_BASE_URL}/preferences`, preferences)
      .pipe(map(versPreferences));
  }

  enregistrerOrganisation(organisation: Organisation): Observable<Organisation> {
    return this.http
      .put<OrganisationApiResponse>(`${API_BASE_URL}/organisation`, organisation)
      .pipe(map(versOrganisation));
  }

  supprimerUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/utilisateurs/${id}`);
  }

  changerMotDePasse(ancien: string, nouveau: string): Observable<{ succes: boolean; message: string }> {
    return this.http.put(`${API_BASE_URL}/auth/mot-de-passe`, { ancien, nouveau }).pipe(
      map(() => ({ succes: true, message: 'Mot de passe modifie avec succes.' })),
      catchError((err) => {
        const message = err?.error?.message || 'Erreur lors du changement de mot de passe.';
        return of({ succes: false, message });
      }),
    );
  }
}
