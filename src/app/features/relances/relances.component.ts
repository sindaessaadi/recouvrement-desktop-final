import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Relance, TypeRelance } from '../../core/models/relance';
import { RelanceService } from '../../core/services/relance.service';
import { ExportService } from '../../core/services/export.service';
import { RelanceDetailModalComponent } from './components/relance-detail-modal/relance-detail-modal.component';
import { NouvelleRelanceModalComponent } from './components/nouvelle-relance-modal/nouvelle-relance-modal.component';

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
  selector: 'app-relances',
  standalone: true,
  imports: [CommonModule, RelanceDetailModalComponent, NouvelleRelanceModalComponent],
  templateUrl: './relances.component.html',
  styleUrl: './relances.component.scss',
})
export class RelancesComponent implements OnInit {
  relances: Relance[] = [];

  detailRelance: Relance | null = null;
  showNouvelle = false;

  toastMessage = '';
  private toastTimeout?: ReturnType<typeof setTimeout>;

  labelsType = LABELS_TYPE;

  constructor(
    private relanceService: RelanceService,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.relanceService.relances$.subscribe((r) => {
      this.relances = r;
    });
  }

  get nbMisesEnDemeure(): number {
    return this.relances.filter((r) => r.type === 'MISE_EN_DEMEURE').length;
  }

  classeType(type: TypeRelance): string {
    return CLASSES_TYPE[type];
  }

  onVoirDetail(r: Relance): void {
    this.detailRelance = r;
  }

  onFermerDetail(): void {
    this.detailRelance = null;
  }

  onOuvrirNouvelle(): void {
    this.showNouvelle = true;
  }

  onFermerNouvelle(): void {
    this.showNouvelle = false;
  }

  onCreerRelance(r: Relance): void {
    this.relanceService.ajouterRelance(r);
    this.notify(`Relance envoyee au client ${r.client} pour le memoire ${r.memoire}.`);
  }

  onExporter(): void {
    this.exportService.exporterCsv(
      'historique_relances.csv',
      ['Date / Heure', 'Client', 'N° memoire', 'Type', 'Canal', 'Utilisateur', 'Resultat'],
      this.relances.map((r) => [r.date, r.client, r.memoire, this.labelsType[r.type], r.canal, r.user, r.resultat]),
    );
    this.notify(`${this.relances.length} relance(s) exportee(s) en Excel (CSV).`);
  }

  private notify(message: string): void {
    this.toastMessage = message;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => (this.toastMessage = ''), 3000);
  }
}