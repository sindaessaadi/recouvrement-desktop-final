// Ligne d'echeancier au sens backend (voir EcheancierRequest) : dateEcheance au format ISO
// (aaaa-mm-jj), fourni directement par les champs <input type="date"> des composants du wizard.
export interface EcheancierLigne {
  ordre: number;
  montant: number;
  dateEcheance: string;
}
