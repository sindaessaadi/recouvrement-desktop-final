import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client, StatutClient } from '../../../../core/models/client';

const BRANCHE_OPTIONS = ['AUTO', 'SANTE', 'VIE', 'IRDS', 'TRANSPORT'];
const STATUT_OPTIONS: StatutClient[] = ['Actif', 'En attente', 'Inactif'];

@Component({
  selector: 'app-liste-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './liste-clients.component.html',
  styleUrl: './liste-clients.component.scss',
})
export class ListeClientsComponent {
  @Input() clients: Client[] = [];
  @Output() voirClient = new EventEmitter<Client>();
  @Output() nouveauClient = new EventEmitter<void>();

  brancheOptions = BRANCHE_OPTIONS;
  statutOptions = STATUT_OPTIONS;

  search = '';
  brancheFiltre: string | null = null;
  statutFiltre: string | null = null;

  get filtres(): Client[] {
    const q = this.search.trim().toLowerCase();
    return this.clients.filter((c) => {
      const okSearch =
        !q ||
        c.nom.toLowerCase().includes(q) ||
        c.raisonSociale.toLowerCase().includes(q) ||
        (c.matricule ?? '').toLowerCase().includes(q);
      const okBranche = !this.brancheFiltre || c.branche === this.brancheFiltre;
      const okStatut = !this.statutFiltre || c.statut === this.statutFiltre;
      return okSearch && okBranche && okStatut;
    });
  }

  get totalClients(): number {
    return this.clients.length;
  }

  get clientsAvecAlertes(): number {
    return this.clients.filter((c) => c.alertes > 0).length;
  }

  get tauxMoyenRecouvrement(): number {
    if (this.clients.length === 0) return 0;
    const somme = this.clients.reduce((s, c) => s + c.tauxRecouvrement, 0);
    return Math.round(somme / this.clients.length);
  }

  get arriereTotal(): string {
    const somme = this.clients.reduce((s, c) => {
      const n = Number(c.montantImpaye.replace(/[^\d]/g, ''));
      return s + n;
    }, 0);
    return `${somme.toLocaleString('fr-FR')} DT`;
  }

  classeStatut(statut: StatutClient): string {
    return statut === 'Actif' ? 'badge badge--success' : 'badge badge--yellow';
  }

  reinitialiser(): void {
    this.search = '';
    this.brancheFiltre = null;
    this.statutFiltre = null;
  }

  onVoir(c: Client): void {
    this.voirClient.emit(c);
  }

  onNouveauClient(): void {
    this.nouveauClient.emit();
  }
}