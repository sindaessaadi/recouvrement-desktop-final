import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { API_BASE_URL } from '../api-config';
import { AncienneteData, EvolutionMoisData, MemoireRecent, RepartitionStatut, StatutMemoireDashboard } from '../models/dashboard';

const COULEURS_ANCIENNETE = ['#1E7A4E', '#27AE72', '#5DADE2', '#F39C12'];

interface DashboardApiResponse {
  memoiresGeneresCeMois: number;
  creancesEchues: number;
  encaissementsCeMois: number;
  tauxRecouvrementCeMois: number;
  anciennete: { label: string; pourcentage: number }[];
  evolution: { mois: string; attente: number; recupere: number }[];
  memoiresRecents: { id: string; client: string | null; date: string; montant: number; statut: StatutMemoireDashboard }[];
  repartitionStatut: { label: string; nombre: number; pourcentage: number }[];
}

function versDT(millimes: number): string {
  return `${Math.round(millimes / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} DT`;
}

function versDTBrut(millimes: number): number {
  return Math.round(millimes / 1000);
}

function isoVersJJMMAAAA(iso: string): string {
  const [aaaa, mm, jj] = iso.split('-');
  return `${jj}/${mm}/${aaaa}`;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private dashboard$: Observable<DashboardApiResponse>;

  constructor(private http: HttpClient) {
    this.dashboard$ = this.http.get<DashboardApiResponse>(`${API_BASE_URL}/dashboard`).pipe(shareReplay(1));
  }

  /** KPI globaux (memoires generes, creances echues, encaissements, taux) : bandeau non branche
   *  cote template pour l'instant, expose ici pour un futur branchage. */
  getKpis(): Observable<{ memoiresGeneres: number; creancesEchues: string; encaissements: string; taux: number }> {
    return this.dashboard$.pipe(
      map((d) => ({
        memoiresGeneres: d.memoiresGeneresCeMois,
        creancesEchues: versDT(d.creancesEchues),
        encaissements: versDT(d.encaissementsCeMois),
        taux: d.tauxRecouvrementCeMois,
      })),
    );
  }

  getAnciennete(): Observable<AncienneteData[]> {
    return this.dashboard$.pipe(
      map((d) => d.anciennete.map((a, i) => ({ label: a.label, valeur: a.pourcentage, couleur: COULEURS_ANCIENNETE[i] }))),
    );
  }

  getEvolution(): Observable<EvolutionMoisData[]> {
    return this.dashboard$.pipe(
      map((d) => d.evolution.map((e) => ({ mois: e.mois, attente: versDTBrut(e.attente), recupere: versDTBrut(e.recupere) }))),
    );
  }

  getMemoiresRecents(): Observable<MemoireRecent[]> {
    return this.dashboard$.pipe(
      map((d) =>
        d.memoiresRecents.map((m) => ({
          id: m.id,
          client: m.client ?? '-',
          date: isoVersJJMMAAAA(m.date),
          montant: versDT(m.montant),
          statut: m.statut,
        })),
      ),
    );
  }

  getRepartitionStatut(): Observable<RepartitionStatut[]> {
    return this.dashboard$.pipe(
      map((d) => d.repartitionStatut.map((r) => ({ label: r.label, valeur: `${r.nombre} (${r.pourcentage}%)`, nombre: r.nombre }))),
    );
  }
}
