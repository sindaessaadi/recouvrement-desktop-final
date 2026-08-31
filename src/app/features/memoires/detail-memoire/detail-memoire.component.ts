import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Memoire, Paiement, StatutMemoire, HistoriqueStatut } from '../../../core/models/memoire';
import { MemoireService } from '../../../core/services/memoire.service';
import { TimelinePaiementComponent } from './components/timeline-paiement/timeline-paiement.component';

@Component({
  selector: 'app-detail-memoire',
  standalone: true,
  imports: [CommonModule, RouterLink, TimelinePaiementComponent],
  templateUrl: './detail-memoire.component.html',
  styleUrl: './detail-memoire.component.scss',
})
export class DetailMemoireComponent implements OnInit {
  id: string | null = null;
  memoire: Memoire | null = null;
  paiements: Paiement[] = [];
  chargementTermine = false;
  historique: HistoriqueStatut[] = [];

  labelsStatut: Record<StatutMemoire, string> = {
    EN_ATTENTE: 'EN ATTENTE',
    PARTIEL: 'PARTIEL',
    REGLE: 'REGLE',
    ANNULE: 'ANNULE',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memoireService: MemoireService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) {
      this.chargementTermine = true;
      return;
    }

    this.memoireService.getMemoire(this.id).subscribe((m) => {
      this.memoire = m;
      this.chargementTermine = true;
    });

    this.memoireService.getPaiements(this.id).subscribe((p) => {
      this.paiements = p;
    });

    this.memoireService.getHistorique(this.id).subscribe((h) => {
  this.historique = h;
});
  }

  get totalEncaisse(): number {
    return this.paiements.reduce((somme, p) => somme + p.montant, 0);
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

  onTelecharger(): void {
    console.log('Telechargement PDF demande (simulation) pour', this.id);
  }

  onImprimer(): void {
    window.print();
  }

  onRetourListe(): void {
    this.router.navigate(['/memoires']);
  }
}