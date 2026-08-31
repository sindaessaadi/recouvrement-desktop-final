import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatutClient } from '../../../../core/models/client';
import { NouveauClientPayload } from '../../../../core/services/client.service';

const STATUT_OPTIONS: StatutClient[] = ['Actif', 'En attente', 'Inactif'];

@Component({
  selector: 'app-nouveau-client-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nouveau-client-modal.component.html',
  styleUrl: './nouveau-client-modal.component.scss',
})
export class NouveauClientModalComponent {
  @Output() creer = new EventEmitter<NouveauClientPayload>();
  @Output() close = new EventEmitter<void>();

  statutOptions = STATUT_OPTIONS;

  nom = '';
  raisonSociale = '';
  matricule = '';
  cin = '';
  telephone = '';
  email = '';
  adresse = '';
  statut: StatutClient = 'En attente';
  charge = '';
  anneeAppartenance: number | null = null;

  erreur = '';

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (!this.nom.trim()) {
      this.erreur = 'Le nom du client est obligatoire.';
      return;
    }
    this.erreur = '';
    this.creer.emit({
      nom: this.nom.trim(),
      raisonSociale: this.raisonSociale.trim(),
      matricule: this.matricule.trim() || null,
      cin: this.cin.trim(),
      telephone: this.telephone.trim(),
      email: this.email.trim(),
      adresse: this.adresse.trim(),
      statut: this.statut,
      charge: this.charge.trim(),
      anneeAppartenance: this.anneeAppartenance,
    });
  }
}
