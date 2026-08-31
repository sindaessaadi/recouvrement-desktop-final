import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatService } from '../../../../core/services/format.service';
import { EcheancierLigne } from '../../../../core/models/echeancier';

function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

interface PctRow {
  pct: string;
  libelle: string;
  frais: string;
  taxes: string;
  date: string;
}

@Component({
  selector: 'app-mode-par-pourcentage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mode-par-pourcentage.component.html',
  styleUrl: './mode-par-pourcentage.component.scss',
})
export class ModeParPourcentageComponent implements OnChanges {
  @Input() principal = 0;
  @Input() frais = 0;
  @Input() taxe = 0;
  @Input() devise = 'DT';

  @Output() echeancierChange = new EventEmitter<EcheancierLigne[]>();
  @Output() validChange = new EventEmitter<boolean>();

  nbTranches = '';
  rows: PctRow[] = [];

  constructor(public format: FormatService) {}

  ngOnChanges(): void {
    this.emettre();
  }

  // frais/taxes sont saisis par l'utilisateur en DT (comme partout ailleurs dans l'app), alors
  // que frais/taxe (les @Input) sont en millimes : conversion ici.
  private millimes(valeur: string): number {
    const n = Number(String(valeur).replace(',', '.'));
    return Number.isFinite(n) ? Math.round(n * 1000) : 0;
  }

  handleNbChange(val: string): void {
    this.nbTranches = val;
    const n = Math.max(0, Math.min(20, parseInt(val, 10) || 0));
    const prev = this.rows;
    this.rows = Array.from({ length: n }, (_, i) => prev[i] ?? {
      pct: '',
      libelle: `Tranche ${i + 1}`,
      frais: '',
      taxes: '',
      date: '',
    });
    this.emettre();
  }

  minDate(i: number): string {
    return i === 0 ? todayISO() : (this.rows[i - 1]?.date || todayISO());
  }

  isDateDisabled(i: number): boolean {
    return i > 0 && !this.rows[i - 1]?.date;
  }

  updateRow(i: number, field: keyof PctRow, val: string): void {
    this.rows = this.rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r));
    if (field === 'date') {
      for (let j = i + 1; j < this.rows.length; j++) {
        this.rows[j] = { ...this.rows[j], date: '' };
      }
    }
    this.emettre();
  }

  handleAmountChange(i: number, field: keyof PctRow, val: string): void {
    if (val !== '' && (!/^\d*([.,]\d*)?$/.test(val) || Number(val) < 0)) return;
    this.updateRow(i, field, val);
  }

  get n(): number {
    return this.rows.length;
  }

  get sumOtherPct(): number {
    return this.rows.slice(0, Math.max(0, this.n - 1)).reduce((s, r) => s + (Number(r.pct) || 0), 0);
  }

  get lastPct(): number {
    return this.n > 0 ? Math.round(Math.max(0, 100 - this.sumOtherPct) * 100) / 100 : 0;
  }

  get depassement(): boolean {
    return this.sumOtherPct > 100;
  }

  getPct(i: number): number {
    return i === this.n - 1 ? this.lastPct : Number(this.rows[i]?.pct) || 0;
  }

  getMontant(i: number): number {
    return Math.round((this.principal * this.getPct(i)) / 100);
  }

  statut(i: number): string {
    return i === 0 ? 'En cours' : 'Planifie';
  }

  get totalMontant(): number {
    return this.rows.reduce((s, _, i) => s + this.getMontant(i), 0);
  }

  get totalFraisSaisi(): number {
    return this.rows.reduce((s, r) => s + this.millimes(r.frais), 0);
  }

  get totalTaxesSaisi(): number {
    return this.rows.reduce((s, r) => s + this.millimes(r.taxes), 0);
  }

  get totalGeneral(): number {
    return this.totalMontant + this.totalFraisSaisi + this.totalTaxesSaisi;
  }

  get fraisMismatch(): boolean {
    return this.n > 0 && this.totalFraisSaisi !== this.frais;
  }

  get taxesMismatch(): boolean {
    return this.n > 0 && this.totalTaxesSaisi !== this.taxe;
  }

  get datesIncompletes(): boolean {
    return this.n > 0 && this.rows.some((r) => !r.date);
  }

  get tautCorrect(): boolean {
    return !this.depassement && !this.fraisMismatch && !this.taxesMismatch && !this.datesIncompletes;
  }

  private emettre(): void {
    const lignes: EcheancierLigne[] = this.rows.map((r, i) => ({
      ordre: i + 1,
      montant: this.getMontant(i),
      dateEcheance: r.date,
    }));
    this.echeancierChange.emit(lignes);
    this.validChange.emit(this.n > 0 && this.tautCorrect);
  }
}