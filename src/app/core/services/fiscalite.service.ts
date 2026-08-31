import { Injectable } from '@angular/core';

export interface DetailFiscal {
  primeNette: number;
  fraisPolice: number;
  taxe: number;
  fga: number;
  montantDu: number;
}

/**
 * Regles fiscales par branche (Taxe Unique sur les Assurances + contribution FGA).
 * TUA : 12% (auto/sante/dommages aux biens), 5% (transport maritime/aerien), 0% (vie).
 * FGA (Fonds de Garantie Automobile) : 2% de la prime nette, uniquement branche AUTO.
 */
@Injectable({
  providedIn: 'root',
})
export class FiscaliteService {
  private readonly TAUX_FRAIS_POLICE = 0.03;

  private reglesFiscalesBranche(branche: string): { tauxTUA: number; tauxFGA: number } {
    switch (branche) {
      case 'AUTO':
        return { tauxTUA: 0.12, tauxFGA: 0.02 };
      case 'SANTE':
      case 'IRDS':
        return { tauxTUA: 0.12, tauxFGA: 0 };
      case 'TRANSPORT':
        return { tauxTUA: 0.05, tauxFGA: 0 };
      case 'VIE':
        return { tauxTUA: 0, tauxFGA: 0 };
      default:
        return { tauxTUA: 0.12, tauxFGA: 0 };
    }
  }

  calculerFraisEtTaxes(montant: number, branche: string): DetailFiscal {
    const primeNette = montant;
    const fraisPolice = Math.round(primeNette * this.TAUX_FRAIS_POLICE);
    const assiette = primeNette + fraisPolice;
    const { tauxTUA, tauxFGA } = this.reglesFiscalesBranche(branche);
    const taxe = Math.round(assiette * tauxTUA);
    const fga = Math.round(primeNette * tauxFGA);
    const montantDu = primeNette + fraisPolice + taxe + fga;
    return { primeNette, fraisPolice, taxe, fga, montantDu };
  }

  calcFrais(montant: number, branche: string): number {
    return this.calculerFraisEtTaxes(montant, branche).fraisPolice;
  }

  calcTaxe(montant: number, branche: string): number {
    const d = this.calculerFraisEtTaxes(montant, branche);
    return d.taxe + d.fga;
  }

  calcMontantTTC(montant: number, branche: string): number {
    return this.calcFrais(montant, branche) + this.calcTaxe(montant, branche);
  }

  calcMontantDu(montant: number, branche: string): number {
    return montant + this.calcMontantTTC(montant, branche);
  }

  /**
   * Repartit un montant entier sur n tranches aussi equitablement que possible,
   * le reste (arrondi) etant reporte sur la derniere tranche.
   */
  repartir(montant: number, n: number): number[] {
    if (n <= 0) return [];
    const base = Math.floor(montant / n);
    const arr = Array.from({ length: n }, () => base);
    arr[n - 1] += montant - base * n;
    return arr;
  }

  /** Taux de TUA applicable a une branche, pour affichage (ex. "12%") */
  tauxTUA(branche: string): number {
    return Math.round(this.reglesFiscalesBranche(branche).tauxTUA * 100);
  }
}