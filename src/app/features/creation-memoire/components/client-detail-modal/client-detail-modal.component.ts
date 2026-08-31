import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientContact } from '../../../../core/models/quittance';
import { FormatService } from '../../../../core/services/format.service';

export interface ClientSummary {
  nb: number;
  total: number;
}

@Component({
  selector: 'app-client-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-detail-modal.component.html',
  styleUrl: './client-detail-modal.component.scss',
})
export class ClientDetailModalComponent {
  @Input() clientName = '';
  @Input() contact: ClientContact | undefined;
  @Input() summary: ClientSummary | undefined;
  @Output() close = new EventEmitter<void>();

  constructor(public format: FormatService) {}

  anciennete(): string {
    if (!this.contact?.anneeAppartenance) return '-';
    const anneeCourante = 2026;
    const ans = anneeCourante - this.contact.anneeAppartenance;
    return `depuis ${this.contact.anneeAppartenance} - ${ans} an${ans > 1 ? 's' : ''}`;
  }

  onClose(): void {
    this.close.emit();
  }
}