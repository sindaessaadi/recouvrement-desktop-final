import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepIndicatorComponent } from './components/step-indicator/step-indicator.component';
import { SelectionClientComponent } from './components/selection-client/selection-client.component';
import { SelectionQuittanceComponent } from './components/selection-quittance/selection-quittance.component';
import { QuittanceSummaryBarComponent } from './components/quittance-summary-bar/quittance-summary-bar.component';
import { ContratDetailModalComponent } from './components/contrat-detail-modal/contrat-detail-modal.component';
import { DetailsMemoireComponent, DelaiReglement } from './components/details-memoire/details-memoire.component';
import { Quittance, ClientContact } from '../../core/models/quittance';
import { Contrat } from '../../core/models/contrat';
import { QuittanceService } from '../../core/services/quittance.service';
import { ContratService } from '../../core/services/contrat.service';
import { FiscaliteService } from '../../core/services/fiscalite.service';
import { Step4EcheancierComponent } from './components/step4-echeancier/step4-echeancier.component';
import { EcheancierLigne } from '../../core/models/echeancier';
import { Router } from '@angular/router';
import { Step5ValidationComponent } from './components/step5-validation/step5-validation.component';
import { MemoireService } from '../../core/services/memoire.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-creation-memoire',
  standalone: true,
  imports: [
    CommonModule,
    StepIndicatorComponent,
    SelectionClientComponent,
    SelectionQuittanceComponent,
    QuittanceSummaryBarComponent,
    ContratDetailModalComponent,
    DetailsMemoireComponent,
    Step4EcheancierComponent,
    Step5ValidationComponent,
  ],
  templateUrl: './creation-memoire.component.html',
  styleUrl: './creation-memoire.component.scss',
})
export class CreationMemoireComponent {
  step = 1;

  selectedClient: string | null = null;
  quittanceSelectionnee: Quittance | null = null;
  montantForce: number | null = null;

  contratOuvert: Contrat | null = null;

  dateCreation = new Date().toLocaleDateString('fr-FR');
  delaiReglement: DelaiReglement = 30;

  memoireCree = false;
  numeroMemoireCree = '';
  erreurCreation = '';

  deviseSelectionnee = 'EUR';
  transfertConfirme = false;

  fichierMemoire: File | null = null;

  echeancierActuel: EcheancierLigne[] = [];
  echeancierValide = false;
  echeancierCommentaire = '';

  constructor(
    private quittanceService: QuittanceService,
    private contratService: ContratService,
    private fiscalite: FiscaliteService,
    private memoireService: MemoireService,
    private router: Router,
    private authService: AuthService,
  ) {}

  get contactClient(): ClientContact | undefined {
    return this.selectedClient
      ? this.quittanceService.getContactClient(this.selectedClient)
      : undefined;
  }

  get dateLimiteLabel(): string {
    const [j, m, a] = this.dateCreation.split('/').map(Number);
    const d = new Date(a, m - 1, j);
    d.setDate(d.getDate() + this.delaiReglement);
    return d.toLocaleDateString('fr-FR');
  }

  get totalAvecFraisTaxe(): number {
    if (!this.quittanceSelectionnee) return 0;
    const montant = this.montantForce ?? this.quittanceSelectionnee.montant;
    return this.fiscalite.calcMontantDu(montant, this.quittanceSelectionnee.branche);
  }

  get tauxActif(): number {
    return this.transfertConfirme ? (this.tauxChangeMap[this.deviseSelectionnee] ?? 1) : 1;
  }

  get deviseActive(): string {
    return this.transfertConfirme ? this.deviseSelectionnee : 'DT';
  }

  private tauxChangeMap: Record<string, number> = {
    EUR: 0.3,
    USD: 0.32,
    GBP: 0.25,
    CAD: 0.44,
    CHF: 0.28,
  };

  get principalConverti(): number {
    if (!this.quittanceSelectionnee) return 0;
    const montant = this.montantForce ?? this.quittanceSelectionnee.montant;
    return montant * this.tauxActif;
  }

  get fraisConverti(): number {
    if (!this.quittanceSelectionnee) return 0;
    const montant = this.montantForce ?? this.quittanceSelectionnee.montant;
    return this.fiscalite.calcFrais(montant, this.quittanceSelectionnee.branche) * this.tauxActif;
  }

  get taxeConvertie(): number {
    if (!this.quittanceSelectionnee) return 0;
    const montant = this.montantForce ?? this.quittanceSelectionnee.montant;
    return this.fiscalite.calcTaxe(montant, this.quittanceSelectionnee.branche) * this.tauxActif;
  }

  onClientSelected(client: string | null): void {
    this.selectedClient = client;
    this.quittanceSelectionnee = null;
    this.montantForce = null;
    this.resetEcheancier();
  }

  onQuittanceSelected(q: Quittance | null): void {
    this.quittanceSelectionnee = q;
    this.montantForce = null;
    this.resetEcheancier();
  }

  private resetEcheancier(): void {
    this.echeancierActuel = [];
    this.echeancierValide = false;
    this.echeancierCommentaire = '';
  }

  onVoirContrat(police: string): void {
    this.contratService.getContrat(police).subscribe((c) => {
      this.contratOuvert = c;
    });
  }

  onFermerContrat(): void {
    this.contratOuvert = null;
  }

  onAppliquerForcage(montant: number): void {
    this.montantForce = montant;
  }

  onAnnulerForcage(): void {
    this.montantForce = null;
  }

  onDelaiChange(delai: DelaiReglement): void {
    this.delaiReglement = delai;
  }

  onFichierChange(fichier: File | null): void {
    this.fichierMemoire = fichier;
  }

  onDeviseChange(devise: string): void {
    this.deviseSelectionnee = devise;
  }

  onTransfertToggle(confirme: boolean): void {
    this.transfertConfirme = confirme;
  }

  onEcheancierChange(lignes: EcheancierLigne[]): void {
    this.echeancierActuel = lignes;
  }

  onEcheancierValidChange(valide: boolean): void {
    this.echeancierValide = valide;
  }

  onEcheancierCommentaireChange(commentaire: string): void {
    this.echeancierCommentaire = commentaire;
  }

  onRetourListe(): void {
  this.router.navigate(['/memoires']);
   }

  canProceed(): boolean {
    if (this.step === 1) {
      return this.selectedClient !== null;
    }
    if (this.step === 2) {
      return this.quittanceSelectionnee !== null;
    }
    if (this.step === 4) {
      return this.echeancierValide;
    }
    return true;
  }

  nextStep(): void {
  if (!this.canProceed() || this.step >= 5) return;

  if (this.step === 4 && !this.echeanceQuittanceAtteinte()) {
    alert(
      `Impossible de creer le memoire : la date d'echeance de la quittance (${this.quittanceSelectionnee?.echeance}) n'est pas encore atteinte. Le recouvrement ne peut demarrer qu'apres l'echeance.`,
    );
    return;
  }

  this.step++;
  if (this.step === 5 && !this.memoireCree) {
    this.creerMemoire();
  }
}
private parseDateFr(dateStr: string): Date {
  const [j, m, a] = dateStr.split('/').map(Number);
  return new Date(a, m - 1, j);
}

private echeanceQuittanceAtteinte(): boolean {
  if (!this.quittanceSelectionnee) return false;
  const echeance = this.parseDateFr(this.quittanceSelectionnee.echeance);
  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);
  echeance.setHours(0, 0, 0, 0);
  return aujourdHui >= echeance;
}
private jjmmaaaaVersIso(jjmmaaaa: string): string {
  const [jj, mm, aaaa] = jjmmaaaa.split('/');
  return `${aaaa}-${mm}-${jj}`;
}

private creerMemoire(): void {
  if (!this.quittanceSelectionnee || !this.selectedClient) return;

  // Note : le "forcage" de montant (montantForce) n'a pas d'equivalent cote backend pour l'instant
  // (voir CLAUDE.md - pas de mecanisme de forcage modelise) : il influence uniquement l'aperçu
  // affiche dans le wizard, le memoire cree en base utilise toujours le montantNet reel de la quittance.
  const quittanceId = Number(this.quittanceSelectionnee.id);

  this.erreurCreation = '';
  this.memoireService
    .creerMemoire({
      quittanceId,
      dateCreation: this.jjmmaaaaVersIso(this.dateCreation),
      delaiReglement: this.delaiReglement,
      motif: this.echeancierCommentaire || '',
      agentTraitant: this.authService.utilisateurActuel?.nom ?? '',
    })
    .subscribe({
      next: ({ id, memoire }) => {
        this.numeroMemoireCree = memoire.id;
        if (this.echeancierActuel.length === 0) {
          this.memoireCree = true;
          return;
        }
        // Le memoire est deja cree a ce stade : un echec ici n'annule pas la creation, juste
        // l'echeancier qui ne sera pas enregistre (a corriger ensuite depuis le suivi des memoires).
        this.memoireService.setEcheanciers(id, this.echeancierActuel).subscribe({
          next: () => { this.memoireCree = true; },
          error: () => { this.memoireCree = true; },
        });
      },
      error: (err) => {
        this.erreurCreation = err?.error?.message ?? 'Erreur lors de la creation du memoire.';
        this.step = 4;
      },
    });
}



  previousStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }
}