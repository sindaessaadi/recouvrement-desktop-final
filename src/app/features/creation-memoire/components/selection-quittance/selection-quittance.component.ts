import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Quittance, StatutPaiement } from '../../../../core/models/quittance';
import { QuittanceService } from '../../../../core/services/quittance.service';
import { FormatService } from '../../../../core/services/format.service';
import { FiscaliteService } from '../../../../core/services/fiscalite.service';
import { PreselectionService } from '../../../../core/services/preselection.service';

const STATUT_PAIEMENT_OPTIONS: StatutPaiement[] = [
  'Planifie',
  'En_cours',
  'Depose',
  'Paiement_partiel',
  'Regle',
];

const LABELS_STATUT_PAIEMENT: Record<StatutPaiement, string> = {
  Planifie: 'Planifie',
  En_cours: 'En cours',
  Depose: 'Depose',
  Paiement_partiel: 'Paiement partiel',
  Regle: 'Regle',
};

@Component({
  selector: 'app-selection-quittance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selection-quittance.component.html',
  styleUrl: './selection-quittance.component.scss',
})
export class SelectionQuittanceComponent implements OnChanges {
  @Input() selectedClient: string | null = null;

  @Output() quittanceSelected = new EventEmitter<Quittance | null>();
  @Output() voirContrat = new EventEmitter<string>();

  quittances: Quittance[] = [];

  filterQuittance = '';
  filterDateEmission = '';
  filterDateEcheance = '';
  filterMontantNet = '';
  filterMontantTTC = '';
  filterStatutPaiement = '';

  statutPaiementOptions = STATUT_PAIEMENT_OPTIONS;
  labelsStatutPaiement = LABELS_STATUT_PAIEMENT;

  constructor(
    private quittanceService: QuittanceService,
    public format: FormatService,
    public fiscalite: FiscaliteService,
    private preselectionService: PreselectionService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedClient']) {
      this.chargerQuittances();
    }
  }

  private chargerQuittances(): void {
  this.quittanceService.getToutesQuittances().subscribe((toutes) => {
    const preselection = this.preselectionService.consommer();

    this.quittances = this.selectedClient
      ? toutes
          .filter((q) => q.client === this.selectedClient)
          .map((q) => ({
            ...q,
            checked: preselection ? q.id === preselection.quittanceId : false,
          }))
      : [];

    if (preselection) {
      this.quittanceSelected.emit(this.selectionnee);
    }
  });
}

  get quittancesFiltrees(): Quittance[] {
    const qQ = this.filterQuittance.trim().toLowerCase();
    const emQ = this.filterDateEmission.trim().toLowerCase();
    const ecQ = this.filterDateEcheance.trim().toLowerCase();
    const netQ = this.filterMontantNet.trim();
    const ttcQ = this.filterMontantTTC.trim();
    const statutQ = this.filterStatutPaiement.trim();

    return this.quittances.filter((q) => {
      const totalTTCRow = this.fiscalite.calcMontantDu(q.montant, q.branche);
      const okQ = !qQ || q.id.toLowerCase().includes(qQ);
      const okEm = !emQ || q.emission.toLowerCase().includes(emQ);
      const okEc = !ecQ || q.echeance.toLowerCase().includes(ecQ);
      const okNet = !netQ || String(q.montant).includes(netQ);
      const okTtc = !ttcQ || String(totalTTCRow).includes(ttcQ);
      const okStatut = !statutQ || q.statutPaiement === statutQ;
      return okQ && okEm && okEc && okNet && okTtc && okStatut;
    });
  }

  get selectionnee(): Quittance | null {
    return this.quittances.find((q) => q.checked) ?? null;
  }

  get totalTTCSelection(): number {
    const q = this.selectionnee;
    return q ? this.fiscalite.calcMontantDu(q.montant, q.branche) : 0;
  }

  isEligible(q: Quittance): boolean {
    return q.statut === 'IMPAYE' && !q.hasMemoire;
  }

  isDisabled(q: Quittance): boolean {
    const hasSelection = this.quittances.some((x) => x.checked);
    return !this.isEligible(q) || (hasSelection && !q.checked);
  }

  toggle(id: string): void {
    this.quittances = this.quittances.map((q) => {
      if (!this.isEligible(q)) return q;
      return { ...q, checked: q.id === id ? !q.checked : false };
    });
    this.quittanceSelected.emit(this.selectionnee);
  }

  onVoirContrat(police: string): void {
    this.voirContrat.emit(police);
  }
}