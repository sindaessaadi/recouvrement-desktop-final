export interface Vehicule {
  marque: string;
  modele: string;
  immatriculation: string;
  anneeMiseCirculation: number;
}

export interface Contrat {
  police: string;
  client: string;
  branche: string;
  garantie: string;
  compagnie: string;
  agence: string;
  dateSouscription: string;
  dateEffet: string;
  dateEcheanceContrat: string;
  vehicule?: Vehicule;
  primeRC: number;
  primeAutresGaranties: number;
  primeNette: number;
}