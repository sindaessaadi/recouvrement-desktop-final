import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Organisation } from '../../../../core/models/utilisateur';

@Component({
  selector: 'app-organisation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organisation.component.html',
  styleUrl: './organisation.component.scss',
})
export class OrganisationComponent {
  @Input() organisation: Organisation | null = null;
  @Output() enregistrer = new EventEmitter<Organisation>();

  erreur = '';

  onEnregistrer(): void {
    this.erreur = '';
    if (!this.organisation) return;

    if (!this.organisation.nomCompagnie?.trim()) {
      this.erreur = 'Le nom de la compagnie est obligatoire.';
      return;
    }
    if (!this.organisation.prefixeNumerotationMemoires?.trim()) {
      this.erreur = 'Le prefixe de numerotation est obligatoire.';
      return;
    }
    const delai = Number(this.organisation.delaiRelanceParDefaut);
    if (!Number.isFinite(delai) || delai <= 0) {
      this.erreur = 'Le delai de relance par defaut doit etre un nombre de jours superieur a 0.';
      return;
    }
    const tva = Number(this.organisation.tauxTva);
    if (!Number.isFinite(tva) || tva < 0 || tva > 100) {
      this.erreur = 'Le taux de TVA doit etre compris entre 0 et 100.';
      return;
    }

    this.enregistrer.emit(this.organisation);
  }
}