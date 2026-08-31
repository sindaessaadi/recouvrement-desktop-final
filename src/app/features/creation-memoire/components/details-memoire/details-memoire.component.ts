import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Quittance, ClientContact } from '../../../../core/models/quittance';
import { FormatService } from '../../../../core/services/format.service';
import { FiscaliteService } from '../../../../core/services/fiscalite.service';
import { ComparisonAmountComponent } from '../comparison-amount/comparison-amount.component';


export type DelaiReglement = 15 | 30 | 45 | 60;

export const TAUX_CHANGE: Record<string, number> = {
  EUR: 0.3,
  USD: 0.32,
  GBP: 0.25,
  CAD: 0.44,
  CHF: 0.28,
};

export const DEVISE_LABELS: Record<string, string> = {
  EUR: 'Euro (EUR)',
  USD: 'Dollar americain (USD)',
  GBP: 'Livre sterling (GBP)',
  CAD: 'Dollar canadien (CAD)',
  CHF: 'Franc suisse (CHF)',
};

@Component({
  selector: 'app-details-memoire',
  standalone: true,
  imports: [CommonModule, FormsModule, ComparisonAmountComponent],
  templateUrl: './details-memoire.component.html',
  styleUrl: './details-memoire.component.scss',
})
export class DetailsMemoireComponent {
  @Input() clientPrincipal: Quittance | null = null;
  @Input() contact: ClientContact | undefined;
  @Input() dateCreation = '';
  @Input() delaiReglement: DelaiReglement = 30;
  @Input() dateLimiteLabel = '';
  @Input() montantForce: number | null = null;
  @Input() deviseSelectionnee = 'EUR';
  @Input() transfertConfirme = false;
  @Input() totalAvecFraisTaxe = 0;

  @Output() delaiChange = new EventEmitter<DelaiReglement>();
  @Output() fichierChange = new EventEmitter<File | null>();
  @Output() appliquerForcage = new EventEmitter<number>();
  @Output() annulerForcage = new EventEmitter<void>();
  @Output() deviseChange = new EventEmitter<string>();
  @Output() transfertToggle = new EventEmitter<boolean>();

  fichierMemoire: File | null = null;
  forcageOuvert = false;
  saisieMontant = '';

  devises = Object.keys(TAUX_CHANGE);
  deviseLabels = DEVISE_LABELS;
  tauxChange = TAUX_CHANGE;

  constructor(
    public format: FormatService,
    public fiscalite: FiscaliteService,
  ) {}

  onDelaiChange(valeur: string): void {
    this.delaiChange.emit(Number(valeur) as DelaiReglement);
  }

  onFichier(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fichierMemoire = input.files?.[0] ?? null;
    this.fichierChange.emit(this.fichierMemoire);
  }

  get montantOriginal(): number {
    return this.clientPrincipal?.montant ?? 0;
  }

  ouvrirForcage(): void {
    if (!this.clientPrincipal) return;
    const base = this.montantForce !== null ? this.montantForce : this.montantOriginal;
    this.saisieMontant = this.format.fmt(base);
    this.forcageOuvert = true;
  }

  onAppliquerForcage(): void {
    const saisie = Number(String(this.saisieMontant).replace(/\s/g, '').replace(',', '.'));
    if (!Number.isFinite(saisie) || saisie < 0) return;
    this.appliquerForcage.emit(Math.round(saisie * 1000));
    this.forcageOuvert = false;
  }

  onAnnulerForcage(): void {
    this.annulerForcage.emit();
    this.forcageOuvert = false;
    this.saisieMontant = '';
  }

  onDeviseChange(valeur: string): void {
    this.deviseChange.emit(valeur);
  }

  onEffectuerTransfert(): void {
    this.transfertToggle.emit(true);
  }

  onAnnulerTransfert(): void {
    this.transfertToggle.emit(false);
  }

  get tauxActif(): number {
    return this.tauxChange[this.deviseSelectionnee] ?? 1;
  }

  get montantConverti(): number {
    return this.totalAvecFraisTaxe * this.tauxActif;
  }

  anciennete(): string {
    if (!this.contact?.anneeAppartenance) return '-';
    const anneeCourante = 2026;
    const ans = anneeCourante - this.contact.anneeAppartenance;
    return `depuis ${this.contact.anneeAppartenance} - ${ans} an${ans > 1 ? 's' : ''}`;
  }
}