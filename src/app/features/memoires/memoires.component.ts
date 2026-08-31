import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Memoire, StatutMemoire } from '../../core/models/memoire';
import { MemoireService } from '../../core/services/memoire.service';
import { ExportService } from '../../core/services/export.service';
import { FormatService } from '../../core/services/format.service';

type Onglet = 'Tous' | 'En attente' | 'Partiels' | 'Regles' | 'Annules';

const ONGLET_TO_STATUT: Record<Onglet, StatutMemoire | null> = {
  Tous: null,
  'En attente': 'EN_ATTENTE',
  Partiels: 'PARTIEL',
  Regles: 'REGLE',
  Annules: 'ANNULE',
};

const LABELS_STATUT: Record<StatutMemoire, string> = {
  EN_ATTENTE: 'EN ATTENTE',
  PARTIEL: 'PARTIEL',
  REGLE: 'REGLE',
  ANNULE: 'ANNULE',
};

const BRANCHE_OPTIONS = ['AUTO', 'SANTE', 'PROASSURE', 'IRDS', 'TRANSPORT'];
const MEMOIRE_FILTER_OPTIONS = ['Avec memoire', 'Sans memoire'];

@Component({
  selector: 'app-memoires',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './memoires.component.html',
  styleUrl: './memoires.component.scss',
})
export class MemoiresComponent implements OnInit {
  memoires: Memoire[] = [];

  onglets: Onglet[] = ['Tous', 'En attente', 'Partiels', 'Regles', 'Annules'];
  ongletActif: Onglet = 'Tous';

  brancheOptions = BRANCHE_OPTIONS;
  memoireFilterOptions = MEMOIRE_FILTER_OPTIONS;
  labelsStatut = LABELS_STATUT;

  filtreClient = '';
  filtreNumero = '';
  filtreBranche: string | null = null;
  filtreMemoire: string | null = null;
  filtreDateDu = '2026-01-01';
  filtreDateAu = '2026-12-31';

  constructor(
    private memoireService: MemoireService,
    private exportService: ExportService,
    public format: FormatService,
  ) {}

  ngOnInit(): void {
    this.memoireService.getMemoires().subscribe((data) => {
      this.memoires = data;
    });
  }

  get memoiresFiltres(): Memoire[] {
    const statutFiltre = ONGLET_TO_STATUT[this.ongletActif];
    const q = this.filtreClient.trim().toLowerCase();
    const numQ = this.filtreNumero.trim().toLowerCase();

    return this.memoires.filter((m) => {
      if (statutFiltre && m.statut !== statutFiltre) return false;
      if (this.filtreBranche && m.branche !== this.filtreBranche) return false;
      if (this.filtreMemoire) {
        const veutAvecMemoire = this.filtreMemoire === 'Avec memoire';
        if (m.avecMemoire !== veutAvecMemoire) return false;
      }
      if (q && !m.client.toLowerCase().includes(q)) return false;
      if (numQ && !m.id.toLowerCase().includes(numQ)) return false;
      return true;
    });
  }

  classeStatut(statut: StatutMemoire): string {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'badge badge--yellow';
      case 'PARTIEL':
        return 'badge badge--purple';
      case 'REGLE':
        return 'badge badge--success';
      case 'ANNULE':
        return 'badge badge--danger';
      default:
        return 'badge';
    }
  }

  selectionnerOnglet(o: Onglet): void {
    this.ongletActif = o;
  }

  onModifier(m: Memoire): void {
    console.log('Modification demandee (simulation) :', m.id);
  }

  onExporter(): void {
    this.exportService.exporterCsv(
      'memoires.csv',
      ['N° memoire', 'Branche', 'Client', 'Date echeance', 'Montant net', 'Statut'],
      this.memoiresFiltres.map((m) => [
        m.id,
        m.branche,
        m.client,
        m.dateLimitePaiement,
        `${m.montantNet} DT`,
        this.labelsStatut[m.statut],
      ]),
    );
  }
}