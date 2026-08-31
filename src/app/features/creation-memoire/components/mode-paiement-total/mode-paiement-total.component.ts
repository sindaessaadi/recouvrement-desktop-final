import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
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

@Component({
  selector: 'app-mode-paiement-total',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mode-paiement-total.component.html',
  styleUrl: './mode-paiement-total.component.scss',
})
export class ModePaiementTotalComponent implements OnInit, OnChanges {
  @Input() total = 0;
  @Input() devise = 'DT';

  @Output() echeancierChange = new EventEmitter<EcheancierLigne[]>();
  @Output() commentaireChange = new EventEmitter<string>();
  @Output() validChange = new EventEmitter<boolean>();

  date = todayISO();
  commentaire = '';
  todayISO = todayISO();

  constructor(public format: FormatService) {}

  ngOnInit(): void {
    this.emettre();
  }

  ngOnChanges(): void {
    this.emettre();
  }

  onDateChange(valeur: string): void {
    this.date = valeur;
    this.emettre();
  }

  onCommentaireChange(valeur: string): void {
    this.commentaire = valeur;
    this.commentaireChange.emit(this.commentaire);
  }

  private emettre(): void {
    this.echeancierChange.emit([{ ordre: 1, montant: this.total, dateEcheance: this.date }]);
    this.validChange.emit(!!this.date);
  }
}