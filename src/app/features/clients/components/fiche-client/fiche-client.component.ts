import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client, MemoireHistorique } from '../../../../core/models/client';
import { StatutMemoire } from '../../../../core/models/memoire';
import { ClientService } from '../../../../core/services/client.service';

const LABELS_STATUT: Record<StatutMemoire, string> = {
  EN_ATTENTE: 'EN ATTENTE',
  PARTIEL: 'PARTIEL',
  REGLE: 'REGLE',
  ANNULE: 'ANNULE',
};

@Component({
  selector: 'app-fiche-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fiche-client.component.html',
  styleUrl: './fiche-client.component.scss',
})
export class FicheClientComponent implements OnChanges {
  @Input() client: Client | null = null;
  @Output() retour = new EventEmitter<void>();

  memoires: MemoireHistorique[] = [];
  labelsStatut = LABELS_STATUT;

  constructor(private clientService: ClientService) {}

  ngOnChanges(): void {
    if (this.client) {
      this.clientService.getMemoiresParClient(this.client.id).subscribe((m) => {
        this.memoires = m;
      });
    }
  }

  classeStatutMemoire(statut: StatutMemoire): string {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'badge badge--yellow';
      case 'PARTIEL':
        return 'badge badge--purple';
      case 'REGLE':
        return 'badge badge--success';
      default:
        return 'badge';
    }
  }

  onRetour(): void {
    this.retour.emit();
  }
}