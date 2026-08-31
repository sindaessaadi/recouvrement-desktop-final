import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuittanceService } from '../../../../core/services/quittance.service';
import { FormatService } from '../../../../core/services/format.service';
import { ClientDetailModalComponent } from '../client-detail-modal/client-detail-modal.component';
import { ClientSummaryRow, Quittance, ClientContact } from '../../../../core/models/quittance';
import { PreselectionService } from '../../../../core/services/preselection.service';

@Component({
  selector: 'app-selection-client',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientDetailModalComponent],
  templateUrl: './selection-client.component.html',
  styleUrls: ['./selection-client.component.scss'],
})
export class SelectionClientComponent implements OnInit {
  @Output() clientSelected = new EventEmitter<string | null>();

  quittances: Quittance[] = [];

  selectedClient: string | null = null;
  detailClient: string | null = null;

  filterIdentifiant = '';
  filterAdresse = '';
  filterEmail = '';
  filterNumero = '';

  onIdentifiantChange(val: string): void {
  this.filterIdentifiant = val.replace(/[^a-zA-Z0-9-]/g, '');
}

onEmailChange(val: string): void {
  this.filterEmail = val.replace(/\s/g, '');
}

onNumeroChange(val: string): void {
  this.filterNumero = val.replace(/[^\d\s]/g, '');
}

  constructor(
    private readonly quittanceService: QuittanceService,
    private readonly formatService: FormatService,
    private readonly preselectionService: PreselectionService,
  ) {}

  ngOnInit(): void {
  this.quittanceService.getToutesQuittances().subscribe((quittances: Quittance[]) => {
    this.quittances = quittances;

    const preselection = this.preselectionService.consulter();
    if (preselection) {
      this.selectedClient = preselection.client;
      this.clientSelected.emit(this.selectedClient);
    }
  });
}

  fmt(n: number): string {
    return this.formatService.fmt(n);
  }

  get clientSummary(): ClientSummaryRow[] {
    const map = new Map<string, { nb: number; total: number }>();

    this.quittances
      .filter((q) => q.statut === 'IMPAYE')
      .forEach((q) => {
        const current = map.get(q.client) ?? { nb: 0, total: 0 };
        current.nb += 1;
        current.total += q.montant;
        map.set(q.client, current);
      });

    return Array.from(map.entries()).map(([client, v]) => {
      const contact = this.quittanceService.getContactClient(client);
      return {
        client,
        nb: v.nb,
        total: v.total,
        identifiant: contact?.identifiant ?? '—',
        adresse: contact?.adresse ?? '—',
        tel: contact?.tel ?? '—',
        email: contact?.email ?? '—',
      };
    });
  }

  get filteredClientSummary(): ClientSummaryRow[] {
    const idQ = this.filterIdentifiant.trim().toLowerCase();
    const adrQ = this.filterAdresse.trim().toLowerCase();
    const mailQ = this.filterEmail.trim().toLowerCase();
    const telQ = this.filterNumero.trim().toLowerCase();

    return this.clientSummary.filter((c) => {
      const okId = !idQ || c.identifiant.toLowerCase().includes(idQ);
      const okAdr = !adrQ || c.adresse.toLowerCase().includes(adrQ);
      const okMail = !mailQ || c.email.toLowerCase().includes(mailQ);
      const okTel = !telQ || c.tel.toLowerCase().includes(telQ);
      return okId && okAdr && okMail && okTel;
    });
  }

  toggleClient(client: string): void {
    this.selectedClient = this.selectedClient === client ? null : client;
    this.quittances = this.quittances.map((q) => ({ ...q, checked: false }));
    this.clientSelected.emit(this.selectedClient);
  }

  clearClient(): void {
    this.selectedClient = null;
    this.quittances = this.quittances.map((q) => ({ ...q, checked: false }));
    this.clientSelected.emit(null);
  }

  openDetail(client: string): void {
    this.detailClient = client;
  }

  closeDetail(): void {
    this.detailClient = null;
  }

  get detailSummary(): ClientSummaryRow | undefined {
    return this.clientSummary.find((c) => c.client === this.detailClient);
  }

  get detailContact(): ClientContact | undefined {
  return this.detailClient
    ? this.quittanceService.getContactClient(this.detailClient)
    : undefined;
    }
}