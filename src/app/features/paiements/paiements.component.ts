import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Paiement, StatutReglement, SuiviMemoire } from '../../core/models/paiement';
import { MODES, PaiementService } from '../../core/services/paiement.service';
import { PaiementDetailModalComponent } from './components/paiement-detail-modal/paiement-detail-modal.component';
import { FormulairePaiementComponent } from './components/formulaire-paiement/formulaire-paiement.component';
import { BadgeComponent } from './components/badge/badge.component';

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
const TYPE_CLS: Record<string, string> = {
  Total: 'badge--success',
  Partiel: 'badge--violet',
  Tranche: 'badge--info',
};
const DEVISE_CLS: Record<string, string> = {
  EUR: 'badge--info',
  USD: 'badge--success',
  DT: 'badge--neutral',
};

@Component({
  selector: 'app-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule, PaiementDetailModalComponent, FormulairePaiementComponent, BadgeComponent],
  templateUrl: './paiements.component.html',
  styleUrl: './paiements.component.scss',
})
export class PaiementsComponent implements OnInit {
  paiements: Paiement[] = [];
  suiviMemoires: SuiviMemoire[] = [];

  showForm = false;
  tab: 'historique' | 'suivi' = 'historique';

  search = '';
  filterStatut: StatutReglement | '' = '';
  filterMode = '';

  detailPaiement: Paiement | null = null;

  readonly modes = MODES;
  readonly statutOptions: (StatutReglement | '')[] = ['', 'Confirme', 'En_attente', 'Annule'];
  get statutOptionsSansVide(): StatutReglement[] {
  return this.statutOptions.slice(1) as StatutReglement[];
   }
  readonly statutLabel = STATUT_LABEL;
  readonly statutCls = STATUT_CLS;
  readonly typeCls = TYPE_CLS;
  readonly deviseCls = DEVISE_CLS;

  toastMessage = '';
  private toastTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly paiementService: PaiementService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.paiementService.paiements$.subscribe((p) => (this.paiements = p));
    this.paiementService.getSuiviMemoires().subscribe((s) => (this.suiviMemoires = s));
  }

  get filtered(): Paiement[] {
    return this.paiements.filter((p) => {
      const matchSearch =
        p.client.toLowerCase().includes(this.search.toLowerCase()) ||
        p.memoire.includes(this.search.toUpperCase());
      return matchSearch && (!this.filterStatut || p.statut === this.filterStatut) && (!this.filterMode || p.mode === this.filterMode);
    });
  }

  readonly totalEncaisse = 3535;
  readonly totalDu = 5910;
  get tauxAbsorption(): number {
    return Math.round((this.totalEncaisse / this.totalDu) * 100);
  }
  get nbAnomalies(): number {
    return this.paiements.filter((p) => p.anomalie).length;
  }

  setTab(t: 'historique' | 'suivi'): void {
    this.tab = t;
  }

  resetFilters(): void {
    this.search = '';
    this.filterStatut = '';
    this.filterMode = '';
  }

  openDetail(p: Paiement): void {
    this.detailPaiement = p;
  }
  closeDetail(): void {
    this.detailPaiement = null;
  }

  handleSave(p: Paiement): void {
    this.paiementService.addPaiement(p);
    this.notify(`Paiement ${p.id} de ${p.montant} ${p.devise} enregistre.`);
  }

  // ⚠️ Export CSV local en attendant confirmation du contenu de export.service.ts
  // (à remplacer par exportService.xxx() si une méthode équivalente existe déjà)
  handleExport(): void {
    const headers = ['N° paiement', 'Date', 'Client', 'N° memoire', 'Montant', 'Devise', 'Mode', 'Type', 'Statut', 'Reference'];
    const rows = this.filtered.map((p) => [p.id, p.date, p.client, p.memoire, p.montant, p.devise, p.mode, p.type, this.statutLabel[p.statut], p.reference]);
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map((v) => escape(String(v))).join(','))];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paiements.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.notify(`${this.filtered.length} paiement(s) exporte(s).`);
  }

  voirMemoire(memoire: string): void {
    this.router.navigate(['/memoire', memoire]);
  }

  private notify(message: string): void {
    this.toastMessage = message;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => (this.toastMessage = ''), 3000);
  }
}
