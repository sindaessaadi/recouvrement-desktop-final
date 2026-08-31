import { StatutMemoire } from './memoire';

export interface AncienneteData {
  label: string;
  valeur: number;
  couleur: string;
}

export interface EvolutionMoisData {
  mois: string;
  attente: number;
  recupere: number;
}

// Reprend directement les statuts reels du memoire (EN_ATTENTE/PARTIEL/REGLE/ANNULE) : le mock
// utilisait des libelles de workflow document (ENVOYE/VALIDE/BROUILLON) qui n'ont pas d'equivalent
// cote backend.
export type StatutMemoireDashboard = StatutMemoire;

export interface MemoireRecent {
  id: string;
  client: string;
  date: string;
  montant: string;
  statut: StatutMemoireDashboard;
}

export interface RepartitionStatut {
  label: string;
  valeur: string;
  nombre: number;
}