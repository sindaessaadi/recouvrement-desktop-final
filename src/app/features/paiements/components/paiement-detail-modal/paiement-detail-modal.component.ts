import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paiement, StatutReglement } from '../../../../core/models/paiement';
import { BadgeComponent } from '../badge/badge.component';

const STATUT_LABEL: Record<StatutReglement, string> = {
  Confirme: 'Confirme',
  En_attente: 'En attente',
  Annule: 'Annule',
};
const STATUT_CLS: Record<StatutReglement, string> = {
  Confirme: 'badge--success',
  En_attente: 'badge--yellow',
  Annule: 'badge--danger',
};

@Component({
  selector: 'app-paiement-detail-modal',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './paiement-detail-modal.component.html',
  styleUrl: './paiement-detail-modal.component.scss',
})
export class PaiementDetailModalComponent {
  @Input({ required: true }) paiement!: Paiement;
  @Output() closed = new EventEmitter<void>();

  readonly statutLabel = STATUT_LABEL;
  readonly statutCls = STATUT_CLS;

  get infos(): [string, string][] {
    const p = this.paiement;
    return [
      ['N° paiement', p.id],
      ['Date', p.date],
      ['Client', p.client],
      ['N° memoire', p.memoire],
      ['Mode', p.mode],
      ['Type', p.type],
      ['Reference', p.reference],
      ['Enregistre par', p.enregistrePar],
    ];
  }

  onClose(): void {
    this.closed.emit();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
