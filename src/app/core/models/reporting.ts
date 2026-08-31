export interface EtatArriereRow {
  client: string;
  police: string;
  branche: string;
  montantEmis: number;
  encaissement: number;
  solde: number;
  taux: number;
}

export interface ArriereParBranche {
  branche: string;
  montant: number;
  pourcentage: number;
  couleur: string;
}

export interface EvolutionAnnee {
  annee: string;
  valeur1: number;
  valeur2: number;
}