import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../api-config';
import { Memoire, Paiement, HistoriqueStatut, StatutMemoire, EtapePaiement } from '../models/memoire';

/** Reponse telle que renvoyee par GET /api/memoires (voir MemoireResponse cote backend) */
interface MemoireApiResponse {
  id: number;
  numero: string;
  quittanceId: number | null;
  client: string | null;
  adresseClient: string | null;
  telephoneClient: string | null;
  policeNumero: string | null;
  branche: string | null;
  dateEmissionQuittance: string | null;
  dateEcheanceQuittance: string | null;
  dateCreation: string | null;
  delaiReglement: number | null;
  dateLimitePaiement: string | null;
  motif: string | null;
  agentTraitant: string | null;
  statut: StatutMemoire;
  etapeActuelle: EtapePaiement;
  montantNet: number | null;
  frais: number | null;
  taxe: number | null;
  totalTTC: number | null;
  montantRegle: number;
  reste: number;
  historique: { id: number; etape: EtapePaiement; commentaire: string | null }[];
  paiements: PaiementApiResponse[];
}

interface PaiementApiResponse {
  id: number;
  memoireId: number;
  montant: number;
  datePaiement: string | null;
  mode: 'VIREMENT_BANCAIRE' | 'CHEQUE' | 'TRAITE' | 'ESPECES' | 'PROTOCOLE';
  statut: string;
  reference: string | null;
}

const MODE_LABELS: Record<PaiementApiResponse['mode'], string> = {
  VIREMENT_BANCAIRE: 'Virement bancaire',
  CHEQUE: 'Cheque',
  TRAITE: 'Traite',
  ESPECES: 'Especes',
  PROTOCOLE: 'Protocole',
};

function isoVersJJMMAAAA(iso: string | null): string {
  if (!iso) return '-';
  const [aaaa, mm, jj] = iso.split('-');
  return `${jj}/${mm}/${aaaa}`;
}

function versDT(millimes: number | null): number {
  return millimes == null ? 0 : Math.round(millimes / 1000);
}

function versPaiement(r: PaiementApiResponse): Paiement {
  return {
    id: String(r.id),
    date: isoVersJJMMAAAA(r.datePaiement),
    montant: versDT(r.montant),
    mode: MODE_LABELS[r.mode],
    reference: r.reference ?? '-',
  };
}

function versMemoire(r: MemoireApiResponse): Memoire {
  return {
    id: r.numero,
    client: r.client ?? '-',
    branche: r.branche ?? '-',
    dateEmissionQuittance: isoVersJJMMAAAA(r.dateEmissionQuittance),
    dateEcheanceQuittance: isoVersJJMMAAAA(r.dateEcheanceQuittance),
    dateCreation: isoVersJJMMAAAA(r.dateCreation),
    dateLimitePaiement: isoVersJJMMAAAA(r.dateLimitePaiement),
    montantNet: versDT(r.montantNet),
    frais: versDT(r.frais),
    taxe: versDT(r.taxe),
    totalTTC: versDT(r.totalTTC),
    reste: versDT(r.reste),
    statut: r.statut,
    // Pas de champ dedie cote backend pour l'instant (voir remarque envoyee) : approxime a partir des paiements.
    dernierPaiement: r.paiements.length
      ? isoVersJJMMAAAA(
          r.paiements
            .map((p) => p.datePaiement)
            .filter((d): d is string => !!d)
            .sort()
            .at(-1) ?? null,
        )
      : '-',
    // Tout memoire cree dans le systeme passe reellement par l'etape PLANIFIE : pas de notion
    // distincte de "avec/sans memoire planifie" cote backend, donc toujours vrai ici.
    avecMemoire: true,
    adresseClient: r.adresseClient ?? '-',
    telephoneClient: r.telephoneClient ?? '-',
    policeNumero: r.policeNumero ?? '-',
    agent: r.agentTraitant ?? '-',
    planifie: true,
    etapeActuelle: r.etapeActuelle,
  };
}

@Injectable({
  providedIn: 'root',
})
export class MemoireService {
  constructor(private http: HttpClient) {}

  getMemoires(): Observable<Memoire[]> {
    return this.http
      .get<MemoireApiResponse[]>(`${API_BASE_URL}/memoires`)
      .pipe(map((liste) => liste.map(versMemoire)));
  }

  // Le "id" cote UI est en realite le numero (ex. MEM-2026-0011) : pas de recherche par numero
  // exposee cote backend, donc on filtre la liste complete.
  getMemoire(id: string): Observable<Memoire | null> {
    return this.http
      .get<MemoireApiResponse[]>(`${API_BASE_URL}/memoires`)
      .pipe(map((liste) => {
        const trouve = liste.find((m) => m.numero === id);
        return trouve ? versMemoire(trouve) : null;
      }));
  }

  getPaiements(id: string): Observable<Paiement[]> {
    return this.http
      .get<MemoireApiResponse[]>(`${API_BASE_URL}/memoires`)
      .pipe(map((liste) => {
        const trouve = liste.find((m) => m.numero === id);
        return trouve ? trouve.paiements.map(versPaiement) : [];
      }));
  }

  getHistorique(id: string): Observable<HistoriqueStatut[]> {
    return this.http
      .get<MemoireApiResponse[]>(`${API_BASE_URL}/memoires`)
      .pipe(map((liste) => {
        const trouve = liste.find((m) => m.numero === id);
        return trouve
          ? trouve.historique.map((h) => ({ etape: h.etape, commentaire: h.commentaire ?? '' }))
          : [];
      }));
  }

  creerMemoire(request: {
    quittanceId: number;
    dateCreation: string;
    delaiReglement: number;
    motif?: string;
    agentTraitant?: string;
  }): Observable<{ id: number; memoire: Memoire }> {
    return this.http
      .post<MemoireApiResponse>(`${API_BASE_URL}/memoires`, request)
      .pipe(map((r) => ({ id: r.id, memoire: versMemoire(r) })));
  }

  // ligne.dateEcheance doit deja etre au format ISO (aaaa-mm-jj), fourni par les <input type="date">.
  setEcheanciers(memoireId: number, lignes: { ordre: number; montant: number; dateEcheance: string }[]): Observable<Memoire> {
    return this.http
      .put<MemoireApiResponse>(`${API_BASE_URL}/memoires/${memoireId}/echeanciers`, lignes)
      .pipe(map(versMemoire));
  }
}
