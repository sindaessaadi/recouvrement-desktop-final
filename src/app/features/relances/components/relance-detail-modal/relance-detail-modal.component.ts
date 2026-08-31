import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Relance, TypeRelance } from '../../../../core/models/relance';

const LABELS_TYPE: Record<TypeRelance, string> = {
  RELANCE_1: 'RELANCE 1',
  VALIDE: 'VALIDE',
  ENVOYE: 'ENVOYE',
  MISE_EN_DEMEURE: 'MISE EN DEMEURE',
  BROUILLON: 'BROUILLON',
};

const CLASSES_TYPE: Record<TypeRelance, string> = {
  RELANCE_1: 'badge--yellow',
  VALIDE: 'badge--success',
  ENVOYE: 'badge--info',
  MISE_EN_DEMEURE: 'badge--danger',
  BROUILLON: 'badge--yellow',
};

@Component({
  selector: 'app-relance-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relance-detail-modal.component.html',
  styleUrl: './relance-detail-modal.component.scss',
})
export class RelanceDetailModalComponent {
  @Input({ required: true }) relance!: Relance;
  @Output() close = new EventEmitter<void>();

  labelsType = LABELS_TYPE;

  get classeType(): string {
    return CLASSES_TYPE[this.relance.type];
  }

  get infos(): [string, string][] {
    const r = this.relance;
    return [
      ['Date / Heure', r.date],
      ['Client', r.client],
      ['N\u00b0 memoire', r.memoire],
      ['Canal', r.canal],
      ['Utilisateur', r.user],
      ['Resultat', r.resultat],
    ];
  }

  onClose(): void {
    this.close.emit();
  }
}