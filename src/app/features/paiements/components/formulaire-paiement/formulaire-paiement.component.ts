import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paiement } from '../../../../core/models/paiement';
import { DEVISES, MODES, PaiementService, TYPES } from '../../../../core/services/paiement.service';
import { AuthService } from '../../../../core/services/auth.service';

function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Component({
  selector: 'app-formulaire-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulaire-paiement.component.html',
  styleUrl: './formulaire-paiement.component.scss',
})
export class FormulairePaiementComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Paiement>();

  readonly modes = MODES;
  readonly devises = DEVISES;
  readonly types = TYPES;

  memoiresOptions: string[] = [];
  private clientParMemoire: Record<string, string> = {};

  memoire = '';
  montant = '';
  devise = 'DT';
  dateReception = todayISO();
  mode = 'Virement bancaire';
  type = 'Total';
  tranche = '';
  echeanceTranche = '';
  reference = '';
  error = '';

  constructor(
    private readonly paiementService: PaiementService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.paiementService.getMemoireNumeros().subscribe((liste) => {
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

  onMontantChange(): void {
    this.error = '';
  }

  onClose(): void {
    this.closed.emit();
  }

  // ⚠️ Formatage local en attendant confirmation du contenu de format.service.ts
  // (à remplacer par formatService.formatMontant()/todayLabel() si les méthodes existent déjà)
  private formatMontant(n: number): string {
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }
  private todayLabel(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  handleSubmit(): void {
    this.error = '';

    if (!this.memoire) {
      this.error = 'Veuillez selectionner un memoire.';
      return;
    }
    const n = Number(this.montant);
    if (!this.montant || !Number.isFinite(n) || n <= 0) {
      this.error = 'Veuillez saisir un montant superieur a 0.';
      return;
    }
    if (!this.dateReception) {
      this.error = 'Veuillez saisir la date de reception.';
      return;
    }
    if (this.dateReception > todayISO()) {
      this.error = 'La date de reception ne peut pas etre dans le futur.';
      return;
    }
    if (this.type === 'Tranche') {
      const t = Number(this.tranche);
      if (!this.tranche || !Number.isFinite(t) || t <= 0) {
        this.error = 'Veuillez saisir un numero de tranche valide.';
        return;
      }
      if (!this.echeanceTranche) {
        this.error = "Veuillez saisir la date d'echeance de la tranche.";
        return;
      }
    }

    const id = `PAY-${String(Math.floor(Math.random() * 900) + 100)}`;
    const [y, m, d] = this.dateReception.split('-');
    const dateFr = d && m && y ? `${d}/${m}/${y}` : this.todayLabel();

    const paiement: Paiement = {
      id,
      date: dateFr,
      client: this.client,
      memoire: this.memoire,
      montant: this.formatMontant(n),
      devise: this.devise as Paiement['devise'],
      mode: this.mode as Paiement['mode'],
      type: this.type as Paiement['type'],
      statut: 'En_attente',
      anomalie: false,
      reference: this.reference.trim() || '-',
      enregistrePar: this.authService.utilisateurActuel?.nom ?? '',
      commentaire:
        this.type === 'Tranche'
          ? `Paiement en tranche n°${this.tranche || '1'} (echeance ${this.echeanceTranche || dateFr}).`
          : `Paiement ${this.type.toLowerCase()} enregistre.`,
    };

    this.saved.emit(paiement);
    this.onClose();
  }
}
