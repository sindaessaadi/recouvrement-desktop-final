import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  AncienneteData,
  EvolutionMoisData,
  MemoireRecent,
  RepartitionStatut,
  StatutMemoireDashboard,
} from '../../core/models/dashboard';
import { DashboardService } from '../../core/services/dashboard.service';

const LABELS_STATUT: Record<StatutMemoireDashboard, string> = {
  EN_ATTENTE: 'EN ATTENTE',
  PARTIEL: 'PARTIEL',
  REGLE: 'REGLE',
  ANNULE: 'ANNULE',
};

const CLASSES_STATUT: Record<StatutMemoireDashboard, string> = {
  EN_ATTENTE: 'badge--yellow',
  PARTIEL: 'badge--purple',
  REGLE: 'badge--success',
  ANNULE: 'badge--danger',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  anciennete: AncienneteData[] = [];
  evolution: EvolutionMoisData[] = [];
  memoiresRecents: MemoireRecent[] = [];
  repartitionStatut: RepartitionStatut[] = [];
  kpis: { memoiresGeneres: number; creancesEchues: string; encaissements: string; taux: number } | null = null;

  labelsStatut = LABELS_STATUT;

  get totalMemoiresStatut(): number {
    return this.repartitionStatut.reduce((somme, s) => somme + s.nombre, 0);
  }

  donutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  };

  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 } } },
      y: { grid: { color: '#EFF2F5' }, ticks: { font: { size: 9 } } },
    },
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getAnciennete().subscribe((a) => {
      this.anciennete = a;
      this.donutData = {
        labels: a.map((x) => x.label),
        datasets: [{ data: a.map((x) => x.valeur), backgroundColor: a.map((x) => x.couleur), borderWidth: 0 }],
      };
    });

    this.dashboardService.getEvolution().subscribe((e) => {
      this.evolution = e;
      this.barData = {
        labels: e.map((x) => x.mois),
        datasets: [
          { data: e.map((x) => x.attente), label: 'En attente', backgroundColor: '#F39C12', borderRadius: 2, barThickness: 12 },
          { data: e.map((x) => x.recupere), label: 'Recupere', backgroundColor: '#1E7A4E', borderRadius: 2, barThickness: 12 },
        ],
      };
    });

    this.dashboardService.getMemoiresRecents().subscribe((m) => (this.memoiresRecents = m));
    this.dashboardService.getRepartitionStatut().subscribe((r) => (this.repartitionStatut = r));
    this.dashboardService.getKpis().subscribe((k) => (this.kpis = k));
  }

  classeStatut(statut: StatutMemoireDashboard): string {
    return CLASSES_STATUT[statut];
  }
}