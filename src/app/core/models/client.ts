import { StatutMemoire } from './memoire';

export interface MemoireHistorique {
  ref: string;
  date: string;
  montant: string;
  resteAPayer: string;
  statut: StatutMemoire;
  dernierPaiement: string;
}

export interface ContactResponsable {
  nom: string;
  poste: string;
  tel: string;
  email: string;
}

export type StatutClient = 'Actif' | 'En attente' | 'Inactif';

export interface Client {
  id: number;
  nom: string;
  raisonSociale: string;
  matricule: string | null;
  cin: string;
  telephone: string;
  email: string;
  adresse: string;
  branche: string;
  statut: StatutClient;
  charge: string;
  montantImpaye: string;
  nbMemoires: number;
  tauxRecouvrement: number;
  dernierPaiement: string;
  alertes: number;
  polices: string[];
  contacts: ContactResponsable[];
}