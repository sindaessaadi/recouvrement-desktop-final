import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { API_BASE_URL } from '../api-config';
import { Paiement, SuiviMemoire } from '../models/paiement';

export const MODES: string[] = ['Virement bancaire', 'Cheque', 'Traite', 'Especes', 'Protocole'];
// La devise n'est pas geree cote backend (conversion retiree, voir CLAUDE.md) : liste conservee
// pour le formulaire, mais seul "DT" est reellement persiste.
export const DEVISES: string[] = ['DT', 'EUR', 'USD'];
// Le "type" de reglement (Total/Partiel/Tranche) n'existe pas comme champ persiste cote backend :
// approxime a l'affichage a partir du montant regle vs montant du (voir versPaiement ci-dessous).
export const TYPES: string[] = ['Total', 'Partiel', 'Tranche'];

const MODE_VERS_ENUM: Record<string, string> = {
  'Virement bancaire': 'VIREMENT_BANCAIRE',
  Cheque: 'CHEQUE',
  Traite: 'TRAITE',
  Especes: 'ESPECES',
  Protocole: 'PROTOCOLE',
};

const ENUM_VERS_MODE: Record<string, string> = {
  VIREMENT_BANCAIRE: 'Virement bancaire',
  CHEQUE: 'Cheque',
  TRAITE: 'Traite',
  ESPECES: 'Especes',
  PROTOCOLE: 'Protocole',
};

const STATUT_VERS_ENUM: Record<string, string> = {
  Confirme: 'CONFIRME',
  En_attente: 'EN_ATTENTE',
  Annule: 'ANNULE',
};

const ENUM_VERS_STATUT: Record<string, Paiement['statut']> = {
  CONFIRME: 'Confirme',
  EN_ATTENTE: 'En_attente',
  ANNULE: 'Annule',
};

interface PaiementApiResponse {
  id: number;
  memoireId: number;
  memoireNumero: string | null;
  client: string | null;
  montant: number;
  totalDuMemoire: number | null;
  datePaiement: string | null;
  mode: keyof typeof ENUM_VERS_MODE;
  statut: keyof typeof ENUM_VERS_STATUT;
  reference: string | null;
}

interface MemoireApiResponse {
  numero: string;
  client: string | null;
  totalTTC: number | null;
  montantRegle: number;
  reste: number;
  paiements: unknown[];
}

function isoVersJJMMAAAA(iso: string | null): string {
  if (!iso) return '-';
  const [aaaa, mm, jj] = iso.split('-');
  return `${jj}/${mm}/${aaaa}`;
}

function versDT(millimes: number): string {
  return Math.round(millimes / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

@Injectable({
  providedIn: 'root',
})
export class PaiementService {
  private refresh$ = new BehaviorSubject<void>(undefined);

  readonly paiements$: Observable<Paiement[]> = this.refresh$.pipe(
    switchMap(() => this.http.get<PaiementApiResponse[]>(`${API_BASE_URL}/paiements`)),
    map((liste) => liste.map((r) => this.versPaiement(r))),
    shareReplay(1),
  );

  constructor(private http: HttpClient) {}

  private versPaiement(r: PaiementApiResponse): Paiement {
    return {
      id: String(r.id),
      date: isoVersJJMMAAAA(r.datePaiement),
      client: r.client ?? '-',
      memoire: r.memoireNumero ?? '-',
      montant: versDT(r.montant),
      devise: 'DT',
      mode: ENUM_VERS_MODE[r.mode] ?? r.mode,
      // Approximation : pas de champ "type" persiste cote backend (voir remarque en tete de fichier).
      type: r.totalDuMemoire != null && r.montant >= r.totalDuMemoire ? 'Total' : 'Partiel',
      statut: ENUM_VERS_STATUT[r.statut] ?? 'En_attente',
      anomalie: false,
      reference: r.reference ?? '-',
      enregistrePar: '-',
      commentaire: '-',
    };
  }

  getSuiviMemoires(): Observable<SuiviMemoire[]> {
    return this.http.get<MemoireApiResponse[]>(`${API_BASE_URL}/memoires`).pipe(
      map((liste) =>
        liste
          .filter((m) => m.paiements.length > 0)
          .map((m) => ({
            memoire: m.numero,
            client: m.client ?? '-',
            montantDu: `${versDT(m.totalTTC ?? 0)} DT`,
            encaisse: `${versDT(m.montantRegle)} DT`,
            reste: `${versDT(m.reste)} DT`,
            nb: m.paiements.length,
            progression: m.totalTTC ? Math.round((m.montantRegle * 100) / m.totalTTC) : 0,
          })),
      ),
    );
  }

  getMemoireNumeros(): Observable<{ numero: string; client: string }[]> {
    return this.http
      .get<MemoireApiResponse[]>(`${API_BASE_URL}/memoires`)
      .pipe(map((liste) => liste.map((m) => ({ numero: m.numero, client: m.client ?? '-' }))));
  }

  /** Ajoute un paiement en base pour le memoire designe par son numero (ex. MEM-2026-0011). */
  addPaiement(p: Paiement): void {
    this.http.get<MemoireApiResponse[]>(`${API_BASE_URL}/memoires`).subscribe((liste) => {
      const trouve = (liste as unknown as { numero: string; id: number }[]).find((m) => m.numero === p.memoire);
      if (!trouve) {
        console.error('Memoire introuvable pour l\'ajout du paiement :', p.memoire);
        return;
      }
      const body = {
        montant: Number(p.montant.replace(/[^\d]/g, '')) * 1000,
        datePaiement: this.jjmmaaaaVersIso(p.date),
        mode: MODE_VERS_ENUM[p.mode] ?? 'VIREMENT_BANCAIRE',
        statut: STATUT_VERS_ENUM[p.statut] ?? 'EN_ATTENTE',
        reference: p.reference,
      };
      this.http.post(`${API_BASE_URL}/memoires/${trouve.id}/paiements`, body).subscribe(() => {
        this.refresh$.next();
      });
    });
  }

  private jjmmaaaaVersIso(jjmmaaaa: string): string {
    const [jj, mm, aaaa] = jjmmaaaa.split('/');
    return `${aaaa}-${mm}-${jj}`;
  }
}
