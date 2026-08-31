import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type OngletParametres =
  | 'profil'
  | 'securite'
  | 'notifications'
  | 'affichage'
  | 'utilisateurs'
  | 'organisation'
  | 'integrations'
  | 'journal';

interface OngletDef {
  key: OngletParametres;
  label: string;
}

@Component({
  selector: 'app-parametres-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parametres-nav.component.html',
  styleUrl: './parametres-nav.component.scss',
})
export class ParametresNavComponent {
  @Input() ongletActif: OngletParametres = 'profil';
  @Output() ongletChange = new EventEmitter<OngletParametres>();

  onglets: OngletDef[] = [
    { key: 'profil', label: 'Profil' },
    { key: 'securite', label: 'Securite' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'affichage', label: 'Affichage' },
    { key: 'utilisateurs', label: 'Utilisateurs & roles' },
    { key: 'organisation', label: 'Organisation' },
    { key: 'integrations', label: 'Integrations & API' },
    { key: 'journal', label: "Journal d'activite" },
  ];

  selectionner(onglet: OngletParametres): void {
    this.ongletChange.emit(onglet);
  }
}