import { Injectable } from '@angular/core';

const ANNEE_COURANTE = 2026;

@Injectable({ providedIn: 'root' })
export class FormatService {
  /**
   * Formate un montant stocké en millimes vers un affichage en dinars.
   * (n / 1000, avec séparateurs de milliers en locale fr-FR)
   */
  fmt(n: number): string {
    return (n / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }

  fmtSansDecimales(montant: number): string {
  return Math.round(montant / 1000).toLocaleString('fr-FR', {
    maximumFractionDigits: 0,
  });
  }

  /** Construit le libellé d'ancienneté d'un client à partir de son année d'appartenance */
  anciennete(annee?: number): string {
    if (!annee) return '—';
    const ans = ANNEE_COURANTE - annee;
    return `depuis ${annee} · ${ans} an${ans > 1 ? 's' : ''}`;
  }
}