import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contrat } from '../../../../core/models/contrat';
import { FormatService } from '../../../../core/services/format.service';
import { FiscaliteService, DetailFiscal } from '../../../../core/services/fiscalite.service';

@Component({
  selector: 'app-contrat-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contrat-detail-modal.component.html',
  styleUrl: './contrat-detail-modal.component.scss',
})
export class ContratDetailModalComponent {
  @Input() contrat: Contrat | null = null;
  @Output() close = new EventEmitter<void>();

  constructor(
    public format: FormatService,
    public fiscalite: FiscaliteService,
  ) {}

  get details(): DetailFiscal | null {
    if (!this.contrat) return null;
    return this.fiscalite.calculerFraisEtTaxes(this.contrat.primeNette, this.contrat.branche);
  }

  onClose(): void {
    this.close.emit();
  }
}