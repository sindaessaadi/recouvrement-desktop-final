export type StatutMemoire = 'EN_ATTENTE' | 'PARTIEL' | 'REGLE' | 'ANNULE';

export type EtapePaiement = 'PLANIFIE' | 'EN_ATTENTE_DEPOT' | 'DEPOSE' | 'PAYE' | 'CLOTURE';

export interface Paiement {
  id: string;
  date: string;
  montant: number;
  mode: string;
  reference: string;
}

export interface HistoriqueStatut {
  etape: EtapePaiement;
  commentaire: string;
}

export interface Memoire {
  id: string;
  client: string;
  branche: string;

  /** Date d'emission de la quittance d'origine (fixee par la compagnie) */
  dateEmissionQuittance: string;
  /** Date d'echeance contractuelle de la quittance d'origine (limite de paiement de la prime) */
  dateEcheanceQuittance: string;
  /** Date de creation du memoire de reglement (toujours >= dateEcheanceQuittance, puisque cree pour une quittance impayee) */
  dateCreation: string;
  /** Date limite de paiement du memoire = dateCreation + delai de reglement choisi */
  dateLimitePaiement: string;

  /** Tous les montants ci-dessous sont en DT (pas en millimes) */
  montantNet: number;
  frais: number;
  taxe: number;
  totalTTC: number;
  reste: number;
  statut: StatutMemoire;
  dernierPaiement: string;
  avecMemoire: boolean;
  adresseClient: string;
  telephoneClient: string;
  policeNumero: string;
  agent: string;
  planifie: boolean;
  etapeActuelle: EtapePaiement;
}