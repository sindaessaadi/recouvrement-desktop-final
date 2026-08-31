import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FiltresQuittances {
  systeme: string | null;
  branche: string | null;
  dateEmission: string;
  recherche: string;
}

const SYSTEME_OPTIONS = ['PI', 'ProAssure', 'S.Fichier Centrale'];
const BRANCHE_OPTIONS = ['VIE', 'AUTO', 'IRDS', 'TRANSPORT'];
const BRANCHE_PI = ['Auto', 'IRDS', 'Transport'];

@Component({
  selector: 'app-quittances-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quittances-filters.component.html',
  styleUrl: './quittances-filters.component.scss',
})
export class QuittancesFiltersComponent {
  systemeOptions = SYSTEME_OPTIONS;

  systeme: string | null = null;
  branche: string | null = null;
  dateEmission = '';
  recherche = '';

  /** Emis a chaque changement de filtre, avec l'etat complet des criteres */
  @Output() filtresChanges = new EventEmitter<FiltresQuittances>();

  /** Les branches proposees dependent du systeme selectionne (regle metier de la maquette) */
  get brancheOptions(): string[] {
    return this.systeme === 'PI' ? BRANCHE_PI : BRANCHE_OPTIONS;
  }

  onSystemeChange(valeur: string): void {
    this.systeme = valeur || null;
    // si la branche courante n'est plus proposee pour ce systeme, on la reinitialise
    if (
      this.systeme === 'PI' &&
      this.branche &&
      !BRANCHE_PI.some((b) => b.toUpperCase() === this.branche!.toUpperCase())
    ) {
      this.branche = null;
    }
    this.emettreChangements();
  }

  onChamp(): void {
    this.emettreChangements();
  }

  reinitialiser(): void {
  this.systeme = null;
  this.branche = null;
  this.dateEmission = '';
  this.recherche = '';
  this.emettreChangements();
}

  private emettreChangements(): void {
  this.filtresChanges.emit({
    systeme: this.systeme,
    branche: this.branche,
    dateEmission: this.dateEmission,
    recherche: this.recherche,
  });
}
}