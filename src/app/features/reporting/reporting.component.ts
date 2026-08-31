import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { EtatArriereRow, ArriereParBranche, EvolutionAnnee } from '../../core/models/reporting';
import { ReportingService } from '../../core/services/reporting.service';
import { ExportService } from '../../core/services/export.service';
import { FormatService } from '../../core/services/format.service';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './reporting.component.html',
  styleUrl: './reporting.component.scss',
})
export class ReportingComponent implements OnInit {
  etatDetaille: EtatArriereRow[] = [];
  arriereParBranche: ArriereParBranche[] = [];
  evolutionAnnee: EvolutionAnnee[] = [];

  periodeOptions: string[] = [];
  anneeOptions: number[] = [];
  moisOptions: string[] = [];
  brancheOptions: string[] = [];

  filtrePeriode = 'Mensuel';
filtreAnnee: number = new Date().getFullYear();
filtreMois = 'Juin';
filtreBranche: string | null = null;

etatAffiche: EtatArriereRow[] = [];

onGenerer(): void {
  this.etatAffiche = this.filtreBranche
    ? this.etatDetaille.filter((r) => r.branche === this.filtreBranche)
    : this.etatDetaille;
}

  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 } } },
      y: { grid: { color: '#EFF2F5' }, ticks: { font: { size: 9 } } },
    },
  };

  constructor(
    private reportingService: ReportingService,
    private exportService: ExportService,
    public format: FormatService,
  ) {}

  ngOnInit(): void {
    this.periodeOptions = this.reportingService.periodeOptions;
    this.anneeOptions = this.reportingService.anneeOptions;
    this.moisOptions = this.reportingService.moisOptions;
    this.brancheOptions = this.reportingService.brancheOptions;

    this.reportingService.getEtatDetaille().subscribe((e) => {
      this.etatDetaille = e;
      this.etatAffiche = this.etatDetaille;
    });

    this.reportingService.getArriereParBranche().subscribe((a) => (this.arriereParBranche = a));

    this.reportingService.getEvolutionAnnee().subscribe((e) => {
      this.evolutionAnnee = e;
      this.barData = {
        labels: e.map((x) => x.annee),
        datasets: [
          { data: e.map((x) => x.valeur1), backgroundColor: '#1E7A4E', borderRadius: 2, barThickness: 20 },
          { data: e.map((x) => x.valeur2), backgroundColor: '#5DADE2', borderRadius: 2, barThickness: 20 },
        ],
      };
    });
  }

  get totalEmis(): number {
  return this.etatAffiche.reduce((s, r) => s + r.montantEmis, 0);
}

get totalEncaissement(): number {
  return this.etatAffiche.reduce((s, r) => s + r.encaissement, 0);
}

get totalSolde(): number {
  return this.etatAffiche.reduce((s, r) => s + r.solde, 0);
}

  get tauxGlobal(): number {
    return this.totalEmis ? Math.round((this.totalEncaissement / this.totalEmis) * 100) : 0;
  }

  onExporterExcel(): void {
    const lignes = this.etatDetaille.map((r) => [r.client, r.police, r.montantEmis, r.encaissement, r.solde, `${r.taux}%`]);
    lignes.push(['Total general', '', this.totalEmis, this.totalEncaissement, this.totalSolde, `${this.tauxGlobal}%`]);

    this.exportService.exporterCsv(
      `Etat_primes_arrierees_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Client', 'Police', 'Montant emis (DT)', 'Encaissement (DT)', 'Solde (DT)', 'Taux (%)'],
      lignes,
    );
  }
}