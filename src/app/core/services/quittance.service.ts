import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../api-config';
import { Quittance, ClientContact, StatutPaiement, StatutQuittance } from '../models/quittance';

/** Reponse minimale utilisee ici (voir ClientResponse cote backend pour le detail complet) */
interface ClientApiResponseMinimal {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  anneeAppartenance: number | null;
}

/** Reponse telle que renvoyee par GET /api/quittances (voir QuittanceResponse cote backend) */
interface QuittanceApiResponse {
  id: number;
  identifiant: string;
  clientId: number | null;
  client: string | null;
  contratId: number | null;
  police: string | null;
  branche: string | null;
  agence: string | null;
  emission: string | null;
  echeance: string | null;
  montant: number;
  frais: number;
  taxe: number;
  fga: number;
  montantDu: number;
  statut: StatutQuittance;
  hasMemoire: boolean;
  derniereRelance: string | null;
}

/** Statut d'avancement affiche, derive du statut calcule cote backend (pas de champ dedie dans l'API) */
function deriverStatutPaiement(statut: StatutQuittance): StatutPaiement {
  switch (statut) {
    case 'PAYE':
      return 'Regle';
    case 'EN_COURS_DE_PAIEMENT':
      return 'En_cours';
    default:
      return 'Planifie';
  }
}

/** Convertit une date ISO (aaaa-mm-jj, format renvoye par l'API) vers jj/mm/aaaa (format attendu par l'UI) */
function isoVersJJMMAAAA(iso: string | null): string {
  if (!iso) return '-';
  const [aaaa, mm, jj] = iso.split('-');
  return `${jj}/${mm}/${aaaa}`;
}

function versQuittance(r: QuittanceApiResponse): Quittance {
  return {
    id: String(r.id),
    identifiant: r.identifiant,
    police: r.police ?? '-',
    client: r.client ?? '-',
    branche: r.branche ?? '-',
    agence: r.agence ?? '-',
    emission: isoVersJJMMAAAA(r.emission),
    echeance: isoVersJJMMAAAA(r.echeance),
    montant: r.montant,
    frais: r.frais,
    taxe: r.taxe,
    fga: r.fga,
    statut: r.statut,
    statutPaiement: deriverStatutPaiement(r.statut),
    modeReglement: '-',
    reference: '-',
    derniereRelance: isoVersJJMMAAAA(r.derniereRelance),
    checked: false,
    hasMemoire: r.hasMemoire,
  };
}

@Injectable({
  providedIn: 'root',
})
export class QuittanceService {
  // Cache rempli une fois au demarrage du service : les composants du wizard lisent les contacts
  // de facon synchrone (via des getters), donc pas d'appel HTTP direct dans getContactClient.
  private contactsParNom: Record<string, ClientContact> = {};

  constructor(private http: HttpClient) {
    this.http.get<ClientApiResponseMinimal[]>(`${API_BASE_URL}/clients`).subscribe((clients) => {
      this.contactsParNom = Object.fromEntries(
        clients.map((c) => [
          c.nom,
          {
            identifiant: `CLI-${String(c.id).padStart(4, '0')}`,
            tel: c.telephone,
            email: c.email,
            adresse: c.adresse,
            anneeAppartenance: c.anneeAppartenance ?? 0,
          } as ClientContact,
        ]),
      );
    });
  }

  /** Utilise par l'ecran Quittances / Impayes : uniquement statut IMPAYE */
  getQuittancesImpayees(): Observable<Quittance[]> {
    return this.http
      .get<QuittanceApiResponse[]>(`${API_BASE_URL}/quittances`)
      .pipe(map((liste) => liste.filter((q) => q.statut === 'IMPAYE').map(versQuittance)));
  }

  /** Utilise par Creation memoire : toutes les quittances, tous statuts confondus */
  getToutesQuittances(): Observable<Quittance[]> {
    return this.http
      .get<QuittanceApiResponse[]>(`${API_BASE_URL}/quittances`)
      .pipe(map((liste) => liste.map(versQuittance)));
  }

  getContactClient(nomClient: string): ClientContact | undefined {
    return this.contactsParNom[nomClient];
  }

  getTousLesContacts(): Record<string, ClientContact> {
    return this.contactsParNom;
  }
}
