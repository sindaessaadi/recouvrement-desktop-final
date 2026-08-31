import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Quittance, ClientContact } from '../../../../core/models/quittance';
import { FormatService } from '../../../../core/services/format.service';
import { FiscaliteService } from '../../../../core/services/fiscalite.service';
import { ComparisonAmountComponent } from '../comparison-amount/comparison-amount.component';

@Component({
  selector: 'app-quittance-summary-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, ComparisonAmountComponent],
  templateUrl: './quittance-summary-bar.component.html',
  styleUrl: './quittance-summary-bar.component.scss',
})
export class QuittanceSummaryBarComponent implements OnChanges {
  @Input() quittance: Quittance | null = null;
  @Input() client: string | null = null;
  @Input() contact: ClientContact | undefined;
  @Input() dateLimite = '';
  @Input() montantForce: number | null = null;

  @Output() appliquerForcage = new EventEmitter<number>();
  @Output() annulerForcage = new EventEmitter<void>();
  @Output() voirContrat = new EventEmitter<string>();

  forcageOuvert = false;
  saisieMontant = '';

  constructor(
    public format: FormatService,
    public fiscalite: FiscaliteService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['quittance']) {
      this.forcageOuvert = false;
      this.saisieMontant = '';
    }
  }

  get clientName(): string {
    return this.quittance?.client ?? this.client ?? '';
  }

  get isTunisaire(): boolean {
    return this.clientName === 'Tunisaire';
  }

  get montantOriginal(): number {
    return this.quittance?.montant ?? 0;
  }

  get fraisOriginal(): number {
    return this.quittance ? this.fiscalite.calcFrais(this.quittance.montant, this.quittance.branche) : 0;
  }

  get taxeOriginal(): number {
    return this.quittance ? this.fiscalite.calcTaxe(this.quittance.montant, this.quittance.branche) : 0;
  }

  get totalOriginal(): number {
    return this.quittance ? this.fiscalite.calcMontantDu(this.quittance.montant, this.quittance.branche) : 0;
  }

  get montantEffectif(): number {
    return this.isTunisaire && this.montantForce !== null ? this.montantForce : this.montantOriginal;
  }

  get fraisEffectif(): number {
    return this.quittance ? this.fiscalite.calcFrais(this.montantEffectif, this.quittance.branche) : 0;
  }

  get taxeEffectif(): number {
    return this.quittance ? this.fiscalite.calcTaxe(this.montantEffectif, this.quittance.branche) : 0;
  }

  get totalEffectif(): number {
    return this.quittance ? this.fiscalite.calcMontantDu(this.montantEffectif, this.quittance.branche) : 0;
  }

  ouvrirForcage(): void {
    this.saisieMontant = this.format.fmt(this.montantEffectif);
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

  onVoirContrat(): void {
    if (this.quittance) {
      this.voirContrat.emit(this.quittance.police);
    }
  }
}