import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatService } from '../../../../core/services/format.service';
import { ModePaiementTotalComponent } from '../mode-paiement-total/mode-paiement-total.component';
import { ModeParPourcentageComponent } from '../mode-par-pourcentage/mode-par-pourcentage.component';
import { ModeParTrancheComponent } from '../mode-par-tranche/mode-par-tranche.component';
import { EcheancierLigne } from '../../../../core/models/echeancier';

interface ModeDef {
  id: string;
  icon: string;
  label: string;
  desc: string;
}

const MODES: ModeDef[] = [
  { id: 'total', icon: '\u{1F4B0}', label: 'Paiement total', desc: 'Paiement en une seule fois du montant total.' },
  { id: 'pct', icon: '%', label: 'Par pourcentage %', desc: 'Choisissez un % - le montant se calcule automatiquement.' },
  { id: 'tranche', icon: '\u{1F4CA}', label: 'Echelonnement par tranche', desc: 'Indiquez le nombre de tranches et le montant de chacune.' },
];

@Component({
  selector: 'app-step4-echeancier',
  standalone: true,
  imports: [CommonModule, ModePaiementTotalComponent, ModeParPourcentageComponent, ModeParTrancheComponent],
  templateUrl: './step4-echeancier.component.html',
  styleUrl: './step4-echeancier.component.scss',
})
export class Step4EcheancierComponent {
  @Input() principal = 0;
  @Input() frais = 0;
  @Input() taxe = 0;
  @Input() devise = 'DT';

  @Output() echeancierChange = new EventEmitter<EcheancierLigne[]>();
  @Output() commentaireChange = new EventEmitter<string>();
  @Output() validChange = new EventEmitter<boolean>();

  modes = MODES;
  selectedMode: string | null = null;

  constructor(public format: FormatService) {}

  get total(): number {
    return this.principal + this.frais + this.taxe;
  }

  get modeLabel(): string {
    return this.modes.find((m) => m.id === this.selectedMode)?.label ?? '';
  }

  selectionner(id: string): void {
    this.selectedMode = this.selectedMode === id ? null : id;
    // Changer de mode invalide l'echeancier precedent : on repart de zero cote parent.
    this.echeancierChange.emit([]);
    this.commentaireChange.emit('');
    this.validChange.emit(false);
  }

  onEcheancierChange(lignes: EcheancierLigne[]): void {
    this.echeancierChange.emit(lignes);
  }

  onCommentaireChange(commentaire: string): void {
    this.commentaireChange.emit(commentaire);
  }

  onValidChange(valide: boolean): void {
    this.validChange.emit(valide);
  }
}