import { Injectable } from '@angular/core';

export interface Preselection {
  client: string;
  quittanceId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PreselectionService {
  private preselection: Preselection | null = null;

  definir(client: string, quittanceId: string): void {
    this.preselection = { client, quittanceId };
  }

  /** Recupere la preselection ET la vide immediatement (usage unique, evite de la reappliquer si l'utilisateur revient plus tard sur cette page sans repartir de Suivi emission) */
  consommer(): Preselection | null {
    const valeur = this.preselection;
    this.preselection = null;
    return valeur;
  }

  consulter(): Preselection | null {
  return this.preselection;
}
}