import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quittance } from '../../core/models/quittance';
import { QuittanceService } from '../../core/services/quittance.service';
import { QuittancesToolbarComponent } from './components/quittances-toolbar/quittances-toolbar.component';
import { QuittancesFiltersComponent, FiltresQuittances } from './components/quittances-filters/quittances-filters.component';
import { QuittancesTableComponent } from './components/quittances-table/quittances-table.component';
import { Router } from '@angular/router';
import { PreselectionService } from '../../core/services/preselection.service';

@Component({
  selector: 'app-quittances',
  standalone: true,
  imports: [
    CommonModule,
    QuittancesToolbarComponent,
    QuittancesFiltersComponent,
    QuittancesTableComponent,
  ],
  templateUrl: './quittances.component.html',
  styleUrl: './quittances.component.scss',
})
export class QuittancesComponent implements OnInit {
  toutesLesQuittances: Quittance[] = [];
  quittancesFiltrees: Quittance[] = [];

  private filtresActuels: FiltresQuittances = {
  systeme: null,
  branche: null,
  dateEmission: '',
  recherche: '',
};

  constructor(
  private quittanceService: QuittanceService,
  private preselectionService: PreselectionService,
  private router: Router,
) {}

  ngOnInit(): void {
    this.quittanceService.getQuittancesImpayees().subscribe((data) => {
      this.toutesLesQuittances = data;
      this.appliquerFiltres();
    });
  }

  get nombreSelectionne(): number {
    return this.quittancesFiltrees.filter((q) => q.checked).length;
  }

  onFiltresChanges(filtres: FiltresQuittances): void {
    this.filtresActuels = filtres;
    this.appliquerFiltres();
  }

  onToggleSelection(id: string): void {
    // comportement radio : une seule quittance selectionnee a la fois
    this.toutesLesQuittances = this.toutesLesQuittances.map((q) => ({
      ...q,
      checked: q.id === id ? !q.checked : false,
    }));
    this.appliquerFiltres();
  }

  onVoirDetail(quittance: Quittance): void {
    // TODO : ouvrir une modale de detail (prochaine etape)
    console.log('Voir detail :', quittance);
  }

  onExporter(): void {
    // TODO : export Excel (etape ulterieure)
    console.log('Export demande, quittances visibles :', this.quittancesFiltrees);
  }

  onGenererMemoire(): void {
  const selection = this.quittancesFiltrees.find((q) => q.checked);
  if (!selection) {
    alert('Selectionnez une quittance avant de generer un memoire.');
    return;
  }
  if (selection.hasMemoire) {
    alert('Un memoire existe deja pour cette quittance.');
    return;
  }
  this.preselectionService.definir(selection.client, selection.id);
  this.router.navigate(['/creation-memoire']);
}

  private appliquerFiltres(): void {
  const f = this.filtresActuels;
  const recherche = f.recherche.trim().toLowerCase();

  this.quittancesFiltrees = this.toutesLesQuittances.filter((q) => {
    if (f.branche && q.branche.toUpperCase() !== f.branche.toUpperCase()) {
      return false;
    }
    if (f.dateEmission && !this.dateCorrespond(q.emission, f.dateEmission)) {
      return false;
    }
    if (!recherche) {
      return true;
    }
    const cible = `${q.client} ${q.branche} ${q.agence} ${q.police} ${q.id}`.toLowerCase();
    return cible.includes(recherche);
  });
}

/** Compare une date stockee au format jj/mm/aaaa avec une date de filtre au format aaaa-mm-jj (input HTML) */
private dateCorrespond(dateStockeeJJMMAAAA: string, dateFiltreISO: string): boolean {
  const [jj, mm, aaaa] = dateStockeeJJMMAAAA.split('/');
  const dateStockeeISO = `${aaaa}-${mm}-${jj}`;
  return dateStockeeISO === dateFiltreISO;
}
}