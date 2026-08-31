export type TypeRelance = 'RELANCE_1' | 'VALIDE' | 'ENVOYE' | 'MISE_EN_DEMEURE' | 'BROUILLON';

export interface Relance {
  date: string;
  client: string;
  memoire: string;
  type: TypeRelance;
  canal: string;
  user: string;
  resultat: string;
  message: string;
}