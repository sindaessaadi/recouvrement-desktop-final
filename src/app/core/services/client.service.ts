import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../api-config';
import { Client, MemoireHistorique, StatutClient } from '../models/client';
import { StatutMemoire } from '../models/memoire';
import { FormatService } from './format.service';

/** Reponse telle que renvoyee par GET /api/clients (voir ClientResponse cote backend) */
interface ClientApiResponse {
  id: number;
  nom: string;
  raisonSociale: string;
  matricule: string | null;
  cin: string;
  telephone: string;
  email: string;
  adresse: string;
  statut: 'ACTIF' | 'EN_ATTENTE' | 'INACTIF';
  charge: string;
  anneeAppartenance: number | null;
  montantImpaye: number;
  branche: string | null;
  polices: string[];
  nbMemoires: number;
  tauxRecouvrement: number;
  dernierPaiement: string | null;
  alertes: number;
  contactsResponsables: { nom: string; fonction: string; telephone: string; email: string }[];
}

interface MemoireHistoriqueApiResponse {
  numero: string;
  date: string | null;
  montantDu: number;
  montantRegle: number;
  reste: number;
  statut: StatutMemoire;
  dernierPaiement: string | null;
}

const STATUT_MAP: Record<ClientApiResponse['statut'], StatutClient> = {
  ACTIF: 'Actif',
  EN_ATTENTE: 'En attente',
  INACTIF: 'Inactif',
};

const STATUT_MAP_INVERSE: Record<StatutClient, ClientApiResponse['statut']> = {
  Actif: 'ACTIF',
  'En attente': 'EN_ATTENTE',
  Inactif: 'INACTIF',
};

/** Payload envoye a POST /api/clients (voir ClientRequest cote backend) */
export interface NouveauClientPayload {
  nom: string;
  raisonSociale: string;
  matricule: string | null;
  cin: string;
  telephone: string;
  email: string;
  adresse: string;
  statut: StatutClient;
  charge: string;
  anneeAppartenance: number | null;
}

function isoVersJJMMAAAA(iso: string | null): string {
  if (!iso) return '-';
  const [aaaa, mm, jj] = iso.split('-');
  return `${jj}/${mm}/${aaaa}`;
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private http: HttpClient, private format: FormatService) {}

  private versClient = (r: ClientApiResponse): Client => ({
    id: r.id,
    nom: r.nom,
    raisonSociale: r.raisonSociale,
    matricule: r.matricule,
    cin: r.cin,
    telephone: r.telephone,
    email: r.email,
    adresse: r.adresse,
    branche: r.branche ?? '-',
    statut: STATUT_MAP[r.statut],
    charge: r.charge,
    montantImpaye: `${this.format.fmt(r.montantImpaye)} DT`,
    nbMemoires: r.nbMemoires,
    tauxRecouvrement: r.tauxRecouvrement,
    dernierPaiement: isoVersJJMMAAAA(r.dernierPaiement),
    alertes: r.alertes,
    polices: r.polices,
    contacts: r.contactsResponsables.map((c) => ({
      nom: c.nom,
      poste: c.fonction,
      tel: c.telephone,
      email: c.email,
    })),
  });

  private versMemoireHistorique = (r: MemoireHistoriqueApiResponse): MemoireHistorique => ({
    ref: r.numero,
    date: isoVersJJMMAAAA(r.date),
    montant: `${this.format.fmt(r.montantDu)} DT`,
    resteAPayer: `${this.format.fmt(r.reste)} DT`,
    statut: r.statut,
    dernierPaiement: isoVersJJMMAAAA(r.dernierPaiement),
  });

  getClients(): Observable<Client[]> {
    return this.http
      .get<ClientApiResponse[]>(`${API_BASE_URL}/clients`)
      .pipe(map((liste) => liste.map(this.versClient)));
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<ClientApiResponse>(`${API_BASE_URL}/clients/${id}`).pipe(map(this.versClient));
  }

  getMemoiresParClient(clientId: number): Observable<MemoireHistorique[]> {
    return this.http
      .get<MemoireHistoriqueApiResponse[]>(`${API_BASE_URL}/clients/${clientId}/memoires`)
      .pipe(map((liste) => liste.map(this.versMemoireHistorique)));
  }

  creerClient(payload: NouveauClientPayload): Observable<Client> {
    return this.http
      .post<ClientApiResponse>(`${API_BASE_URL}/clients`, {
        nom: payload.nom,
        raisonSociale: payload.raisonSociale || null,
        matricule: payload.matricule || null,
        cin: payload.cin || null,
        telephone: payload.telephone || null,
        email: payload.email || null,
        adresse: payload.adresse || null,
        statut: STATUT_MAP_INVERSE[payload.statut],
        charge: payload.charge || null,
        anneeAppartenance: payload.anneeAppartenance,
        contactsResponsables: [],
      })
      .pipe(map(this.versClient));
  }
}
