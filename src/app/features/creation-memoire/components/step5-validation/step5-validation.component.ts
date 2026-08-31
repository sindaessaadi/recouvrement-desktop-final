import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import { ClientContact } from '../../../../core/models/quittance';
import { FormatService } from '../../../../core/services/format.service';

export type DelaiReglement = 15 | 30 | 45 | 60;

@Component({
  selector: 'app-step5-validation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step5-validation.component.html',
  styleUrl: './step5-validation.component.scss',
})
export class Step5ValidationComponent {
  @Input() contact: ClientContact | undefined;
  @Input() clientNom = '';
  @Input() numeroMemoire = '';
  @Input() dateCreation = '';
  @Input() delaiReglement: DelaiReglement = 30;
  @Input() dateLimiteLabel = '';
  @Input() totalAvecFraisTaxe = 0;
  @Input() deviseActive = 'DT';
  @Input() transfertConfirme = false;
  @Input() montantConverti = 0;

  @Output() retour = new EventEmitter<void>();

  constructor(public format: FormatService) {}

  anciennete(): string {
    if (!this.contact?.anneeAppartenance) return '-';
    const anneeCourante = 2026;
    const ans = anneeCourante - this.contact.anneeAppartenance;
    return `depuis ${this.contact.anneeAppartenance} - ${ans} an${ans > 1 ? 's' : ''}`;
  }

  onRetour(): void {
    this.retour.emit();
  }

  onTelechargerPdf(): void {
    this.genererPdf().save(`memoire-${this.numeroMemoire || 'sans-numero'}.pdf`);
  }

  onApercuPdf(): void {
    window.open(this.genererPdf().output('bloburl'), '_blank');
  }

  private genererPdf(): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Memoire de reglement', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${this.numeroMemoire}`, pageWidth / 2, y, { align: 'center' });
    y += 12;

    doc.setDrawColor(200);
    doc.line(15, y, pageWidth - 15, y);
    y += 10;

    const ligne = (label: string, valeur: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(valeur, 80, y);
      y += 8;
    };

    if (this.clientNom) {
      ligne('Client :', this.clientNom);
    }
    ligne('Anciennete :', this.anciennete());
    ligne('Date de creation :', this.dateCreation);
    ligne('Delai de reglement :', `${this.delaiReglement} jours`);
    ligne('Statut :', 'Planifie');
    ligne('Motif :', 'Reglement impayes');

    y += 4;
    doc.setDrawColor(200);
    doc.line(15, y, pageWidth - 15, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Echeancier', 15, y);
    y += 8;

    doc.setFontSize(10);
    doc.text('TRANCHE', 15, y);
    doc.text('DATE ECHEANCE', 60, y);
    doc.text(`MONTANT (${this.deviseActive})`, 130, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('1', 15, y);
    doc.text(this.dateLimiteLabel, 60, y);
    doc.text(this.format.fmt(this.montantConverti), 130, y);
    y += 10;

    if (this.transfertConfirme) {
      doc.setFontSize(10);
      const texte = `Memoire transfere en ${this.deviseActive} - montant total ${this.format.fmt(this.montantConverti)} ${this.deviseActive} (equivalent ${this.format.fmt(this.totalAvecFraisTaxe)} DT).`;
      const lignes = doc.splitTextToSize(texte, pageWidth - 30);
      doc.text(lignes, 15, y);
      y += lignes.length * 6;
    }

    return doc;
  }
}