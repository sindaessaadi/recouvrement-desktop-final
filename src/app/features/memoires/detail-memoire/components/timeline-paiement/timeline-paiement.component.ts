import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtapePaiement, HistoriqueStatut } from '../../../../../core/models/memoire';

interface EtapeDef {
  key: EtapePaiement;
  label: string;
}

const ETAPES_AVEC_PLANIFICATION: EtapeDef[] = [
  { key: 'PLANIFIE', label: 'Planifie' },
  { key: 'EN_ATTENTE_DEPOT', label: 'En attente de depot' },
  { key: 'DEPOSE', label: 'Depose' },
  { key: 'PAYE', label: 'Paye' },
  { key: 'CLOTURE', label: 'Cloture' },
];

const ETAPES_SANS_PLANIFICATION = ETAPES_AVEC_PLANIFICATION.filter((e) => e.key !== 'PLANIFIE');

@Component({
  selector: 'app-timeline-paiement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-paiement.component.html',
  styleUrl: './timeline-paiement.component.scss',
})
export class TimelinePaiementComponent {
  @Input() planifie = false;
  @Input() etapeActuelle: EtapePaiement = 'PLANIFIE';
  @Input() historique: HistoriqueStatut[] = [];

  get etapes(): EtapeDef[] {
    return this.planifie ? ETAPES_AVEC_PLANIFICATION : ETAPES_SANS_PLANIFICATION;
  }

  get indexActuel(): number {
    return this.etapes.findIndex((e) => e.key === this.etapeActuelle);
  }

  estFait(index: number): boolean {
    return index < this.indexActuel;
  }

  estActuel(index: number): boolean {
    return index === this.indexActuel;
  }

  estDernier(index: number): boolean {
    return index === this.etapes.length - 1;
  }
  commentairePourEtape(etape: EtapePaiement): string | null {
  const entree = this.historique.find((h) => h.etape === etape);
  return entree?.commentaire ?? null;
}

}