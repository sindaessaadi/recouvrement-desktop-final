import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quittance } from '../../../../core/models/quittance';
import { FormatService } from '../../../../core/services/format.service';

@Component({
  selector: 'app-quittances-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quittances-table.component.html',
  styleUrl: './quittances-table.component.scss',
})
export class QuittancesTableComponent {
  /** Liste deja filtree, fournie par le composant parent */
  @Input() quittances: Quittance[] = [];

  /** Emis quand l'utilisateur coche/decoche une ligne (id de la quittance cliquee) */
  @Output() toggleSelection = new EventEmitter<string>();

  /** Emis quand l'utilisateur clique sur "Voir" (detail de la quittance) */
  @Output() voirDetail = new EventEmitter<Quittance>();

  constructor(public format: FormatService) {}

  onToggle(id: string): void {
    this.toggleSelection.emit(id);
  }

  onVoirDetail(quittance: Quittance): void {
    this.voirDetail.emit(quittance);
  }

  /** Style du badge selon le statut, reprend la logique validee sur la maquette */
  classeStatut(statut: string): string {
    switch (statut) {
      case 'IMPAYE':
        return 'badge badge--danger';
      case 'PAYE':
        return 'badge badge--success';
      case 'EN_COURS_DE_PAIEMENT':
        return 'badge badge--warning';
      default:
        return 'badge';
    }
  }

  libelleStatut(statut: string): string {
    switch (statut) {
      case 'IMPAYE':
        return 'IMPAYE';
      case 'PAYE':
        return 'PAYE';
      case 'EN_COURS_DE_PAIEMENT':
        return 'EN COURS DE PAIEMENT';
      default:
        return statut;
    }
  }
}