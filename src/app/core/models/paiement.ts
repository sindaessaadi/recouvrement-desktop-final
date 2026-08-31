export type StatutReglement = 'Confirme' | 'En_attente' | 'Annule';

export interface Paiement {
  id: string;
  date: string;
  client: string;
  memoire: string;
  montant: string;
  devise: 'DT' | 'EUR' | 'USD';
  mode: string;
  type: string;
  statut: StatutReglement;
  anomalie: boolean;
  reference: string;
  enregistrePar: string;
  commentaire: string;
}

export interface SuiviMemoire {
  memoire: string;
  client: string;
  montantDu: string;
  encaisse: string;
  reste: string;
  nb: number;
  progression: number;
}