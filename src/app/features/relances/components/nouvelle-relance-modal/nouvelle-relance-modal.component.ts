import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Relance } from '../../../../core/models/relance';
import { RelanceService, CANAUX } from '../../../../core/services/relance.service';
import { AuthService } from '../../../../core/services/auth.service';

function nowLabel(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-nouvelle-relance-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-relance-modal.component.html',
  styleUrl: './nouvelle-relance-modal.component.scss',
})
export class NouvelleRelanceModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<Relance>();

  readonly canaux = CANAUX;

  memoiresOptions: string[] = [];
  private clientParMemoire: Record<string, string> = {};

  memoire = '';
  canal = this.canaux[0];
  message = '';
  erreur = '';

  constructor(
    private relanceService: RelanceService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.relanceService.getMemoireNumeros().subscribe((liste) => {
      this.memoiresOptions = liste.map((m) => m.numero);
      this.clientParMemoire = Object.fromEntries(liste.map((m) => [m.numero, m.client]));
      if (!this.memoire && this.memoiresOptions.length) {
        this.memoire = this.memoiresOptions[0];
      }
    });
  }

  get client(): string {
    return this.clientParMemoire[this.memoire] ?? '-';
  }

  choisirCanal(c: string): void {
    this.canal = c;
  }

  onClose(): void {
    this.close.emit();
  }

  onCreer(): void {
    this.erreur = '';
    if (!this.memoire) {
      this.erreur = 'Veuillez selectionner un memoire.';
      return;
    }
    if (!this.canal) {
      this.erreur = 'Veuillez selectionner un canal.';
      return;
    }
    const relance: Relance = {
      date: nowLabel(),
      client: this.client,
      memoire: this.memoire,
      type: 'ENVOYE',
      canal: this.canal,
      user: this.authService.utilisateurActuel?.nom ?? '',
      resultat: 'Envoye',
      message: this.message.trim() || `Relance envoyee manuellement au client concernant le memoire ${this.memoire}.`,
    };
    this.created.emit(relance);
    this.onClose();
  }
}
