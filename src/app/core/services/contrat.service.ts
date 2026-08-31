import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../api-config';
import { Contrat } from '../models/contrat';

interface ContratApiResponse {
  id: number;
  numeroPolice: string;
  client: string | null;
  branche: string | null;
  agence: string | null;
  dateEffet: string | null;
  dateEcheanceContrat: string | null;
  primeNette: number | null;
  vehicule: {
    marque: string | null;
    modele: string | null;
    immatriculation: string | null;
    anneeMiseEnCirculation: number | null;
  } | null;
}

function isoVersJJMMAAAA(iso: string | null): string {
  if (!iso) return '-';
  const [aaaa, mm, jj] = iso.split('-');
  return `${jj}/${mm}/${aaaa}`;
}

function versContrat(r: ContratApiResponse): Contrat {
  // primeNette reste en millimes (comme Quittance.montant) : FiscaliteService et FormatService
  // s'attendent tous les deux a des montants en millimes en entree.
  const primeNette = r.primeNette ?? 0;
  return {
    police: r.numeroPolice,
    client: r.client ?? '-',
    branche: r.branche ?? '-',
    // Pas de champ dedie cote backend pour l'instant (garantie(s) souscrite(s) par contrat) : a
    // completer quand le detail des champs par branche sera confirme (voir CLAUDE.md).
    garantie: '-',
    compagnie: 'STAR Assurances',
    agence: r.agence ?? '-',
    // dateSouscription n'existe pas cote backend (seule dateEffet est modelisee).
    dateSouscription: '-',
    dateEffet: isoVersJJMMAAAA(r.dateEffet),
    dateEcheanceContrat: isoVersJJMMAAAA(r.dateEcheanceContrat),
    vehicule: r.vehicule
      ? {
          marque: r.vehicule.marque ?? '-',
          modele: r.vehicule.modele ?? '-',
          immatriculation: r.vehicule.immatriculation ?? '-',
          anneeMiseCirculation: r.vehicule.anneeMiseEnCirculation ?? 0,
        }
      : undefined,
    // Pas de repartition RC / autres garanties cote backend : une seule prime globale.
    primeRC: 0,
    primeAutresGaranties: 0,
    primeNette,
  };
}

@Injectable({
  providedIn: 'root',
})
export class ContratService {
  constructor(private http: HttpClient) {}

  getContrat(numeroPolice: string): Observable<Contrat | null> {
    return this.http
      .get<ContratApiResponse[]>(`${API_BASE_URL}/contrats`)
      .pipe(map((liste) => {
        const trouve = liste.find((c) => c.numeroPolice === numeroPolice);
        return trouve ? versContrat(trouve) : null;
      }));
  }
}
