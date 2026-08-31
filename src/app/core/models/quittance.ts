export type StatutQuittance = 'IMPAYE' | 'PAYE' | 'EN_COURS_DE_PAIEMENT';

export type StatutPaiement =
  | 'Planifie'
  | 'En_cours'
  | 'Depose'
  | 'Paiement_partiel'
  | 'Regle';

export interface Quittance {
  id: string;
  identifiant: string;
  police: string;
  client: string;
  branche: string;
  agence: string;
  emission: string;
  echeance: string;
  montant: number;
  frais: number;
  taxe: number;
  fga: number;
  statut: StatutQuittance;
  /** Statut d'avancement du paiement (independant du statut ci-dessus) */
  statutPaiement: StatutPaiement;
  modeReglement: string;
  reference: string;
  derniereRelance: string;
  checked: boolean;
  hasMemoire: boolean;
  memoire?: MemoireResume;
}

export interface MemoireResume {
  numero: string;
  dateCreation: string;
  dateValidation: string;
  dateReglement: string;
  montantRegle: string;
  modeReglement: string;
  reference: string;
  agentTraitant: string;
  statut: string;
}

export interface ClientContact {
  identifiant: string;
  tel: string;
  email: string;
  adresse: string;
  anneeAppartenance: number;
}

/** Ligne agrégée utilisée par l'étape "Sélection du client" du wizard de création de mémoire */
export interface ClientSummaryRow {
  client: string;
  nb: number;
  total: number;
  identifiant: string;
  adresse: string;
  tel: string;
  email: string;
}