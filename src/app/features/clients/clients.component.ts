import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../../core/models/client';
import { ClientService, NouveauClientPayload } from '../../core/services/client.service';
import { ListeClientsComponent } from './components/liste-clients/liste-clients.component';
import { FicheClientComponent } from './components/fiche-client/fiche-client.component';
import { NouveauClientModalComponent } from './components/nouveau-client-modal/nouveau-client-modal.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ListeClientsComponent, FicheClientComponent, NouveauClientModalComponent],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  clientSelectionne: Client | null = null;
  modalNouveauClientOuvert = false;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.chargerClients();
  }

  private chargerClients(): void {
    this.clientService.getClients().subscribe((data) => {
      this.clients = data;
    });
  }

  onVoirClient(client: Client): void {
    this.clientSelectionne = client;
  }

  onRetour(): void {
    this.clientSelectionne = null;
  }

  onOuvrirNouveauClient(): void {
    this.modalNouveauClientOuvert = true;
  }

  onFermerNouveauClient(): void {
    this.modalNouveauClientOuvert = false;
  }

  onCreerClient(payload: NouveauClientPayload): void {
    this.clientService.creerClient(payload).subscribe(() => {
      this.modalNouveauClientOuvert = false;
      this.chargerClients();
    });
  }
}