import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Utilisateur,
  Preferences,
  Organisation,
  LogActivite,
  SessionActive,
} from '../../core/models/utilisateur';
import { UtilisateurService } from '../../core/services/utilisateur.service';

import { ParametresNavComponent, OngletParametres } from './components/parametres-nav/parametres-nav.component';
import { ProfilComponent } from './components/profil/profil.component';
import { SecuriteComponent } from './components/securite/securite.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { AffichageComponent } from './components/affichage/affichage.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { OrganisationComponent } from './components/organisation/organisation.component';
import { IntegrationsComponent } from './components/integrations/integrations.component';
import { JournalComponent } from './components/journal/journal.component';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [
    CommonModule,
    ParametresNavComponent,
    ProfilComponent,
    SecuriteComponent,
    NotificationsComponent,
    AffichageComponent,
    UtilisateursComponent,
    OrganisationComponent,
    IntegrationsComponent,
    JournalComponent,
  ],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss',
})
export class ParametresComponent implements OnInit {
  ongletActif: OngletParametres = 'profil';

  utilisateur: Utilisateur | null = null;
  preferences: Preferences | null = null;
  organisation: Organisation | null = null;
  utilisateurs: Utilisateur[] = [];
  logs: LogActivite[] = [];
  sessions: SessionActive[] = [];

  saved = false;

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.utilisateurService.getUtilisateur().subscribe((d) => (this.utilisateur = d));
    this.utilisateurService.getPreferences().subscribe((d) => (this.preferences = d));
    this.utilisateurService.getOrganisation().subscribe((d) => (this.organisation = d));
    this.rechargerUtilisateurs();
    this.utilisateurService.getLogs().subscribe((d) => (this.logs = d));
    this.utilisateurService.getSessions().subscribe((d) => (this.sessions = d));
  }

  private rechargerUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe((d) => (this.utilisateurs = d));
  }

  onOngletChange(onglet: OngletParametres): void {
    this.ongletActif = onglet;
  }

  onChangerMotDePasse(donnees: { ancien: string; nouveau: string }): void {
    this.utilisateurService.changerMotDePasse(donnees.ancien, donnees.nouveau).subscribe((resultat) => {
      alert(resultat.message);
    });
  }

  onDeconnecterSession(session: SessionActive): void {
    this.utilisateurService.deconnecterSession(session.id).subscribe(() => {
      this.utilisateurService.getSessions().subscribe((d) => (this.sessions = d));
    });
  }

  onAjouterUtilisateur(): void {
    // Pas de formulaire de creation d'utilisateur dans l'UI existante ; reste a construire.
    console.log('Ajout utilisateur demande (simulation)');
  }

  onSupprimerUtilisateur(u: Utilisateur): void {
    this.utilisateurService.supprimerUtilisateur(u.id).subscribe(() => this.rechargerUtilisateurs());
  }

  onEnregistrer(): void {
    if (this.preferences) {
      this.utilisateurService.enregistrerPreferences(this.preferences).subscribe();
    }
    if (this.organisation) {
      this.utilisateurService.enregistrerOrganisation(this.organisation).subscribe();
    }
    this.saved = true;
    setTimeout(() => (this.saved = false), 2000);
  }
}