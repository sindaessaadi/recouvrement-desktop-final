import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { API_BASE_URL } from '../api-config';
import { EtatArriereRow, ArriereParBranche, EvolutionAnnee } from '../models/reporting';

const PERIODE_OPTIONS = ['Mensuel', 'Annuel'];
const ANNEE_OPTIONS = Array.from({ length: 11 }, (_, i) => 2016 + i).reverse();
const MOIS_OPTIONS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
const BRANCHE_OPTIONS = ['AUTO', 'SANTE', 'VIE', 'IRDS', 'TRANSPORT'];

const COULEUR_PAR_BRANCHE: Record<string, string> = {
  AUTO: '#1E7A4E',
  SANTE: '#27AE72',
  IRDS: '#F39C12',
  TRANSPORT: '#5DADE2',
  VIE: '#8E44AD',
  AUTRE: '#95A5A6',
};

interface ReportingApiResponse {
  etatDetaille: { client: string | null; police: string | null; branche: string | null; montantEmis: number; encaissement: number; solde: number; taux: number }[];
  arriereParBranche: { branche: string; montant: number; pourcentage: number }[];
  evolution: { branche: string; montantEmis: number; montantEncaisse: number }[];
}

function versDT(millimes: number): number {
  return Math.round(millimes / 1000);
}

@Injectable({
  providedIn: 'root',
})
export class ReportingService {
  periodeOptions = PERIODE_OPTIONS;
  anneeOptions = ANNEE_OPTIONS;
  moisOptions = MOIS_OPTIONS;
  brancheOptions = BRANCHE_OPTIONS;

  private reporting$: Observable<ReportingApiResponse>;

  constructor(private http: HttpClient) {
    this.reporting$ = this.http.get<ReportingApiResponse>(`${API_BASE_URL}/reporting`).pipe(shareReplay(1));
  }

  getEtatDetaille(): Observable<EtatArriereRow[]> {
    return this.reporting$.pipe(
      map((r) =>
        r.etatDetaille.map((l) => ({
          client: l.client ?? '-',
          police: l.police ?? '-',
          branche: l.branche ?? '-',
          montantEmis: versDT(l.montantEmis),
          encaissement: versDT(l.encaissement),
          solde: versDT(l.solde),
          taux: l.taux,
        })),
      ),
    );
  }

  getArriereParBranche(): Observable<ArriereParBranche[]> {
    return this.reporting$.pipe(
      map((r) =>
        r.arriereParBranche.map((a) => ({
          branche: a.branche,
          montant: versDT(a.montant),
          pourcentage: a.pourcentage,
          couleur: COULEUR_PAR_BRANCHE[a.branche] ?? '#95A5A6',
        })),
      ),
    );
  }

  // Reprend le comportement du mock d'origine : le libelle "annee" affiche en fait la branche
  // (aucune agregation par annee d'appartenance n'existe cote backend pour l'instant).
  getEvolutionAnnee(): Observable<EvolutionAnnee[]> {
    return this.reporting$.pipe(
      map((r) =>
        r.evolution.map((e) => ({
          annee: e.branche,
          valeur1: versDT(e.montantEmis),
          valeur2: versDT(e.montantEncaisse),
        })),
      ),
    );
  }
}
