import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Utilisateur } from '../../../../core/models/utilisateur';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './utilisateurs.component.html',
  styleUrl: './utilisateurs.component.scss',
})
export class UtilisateursComponent {
  @Input() utilisateurs: Utilisateur[] = [];

  @Output() ajouter = new EventEmitter<void>();
  @Output() supprimer = new EventEmitter<Utilisateur>();

  onAjouter(): void {
    this.ajouter.emit();
  }

  onSupprimer(u: Utilisateur): void {
    this.supprimer.emit(u);
  }
}