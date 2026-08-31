import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionActive } from '../../../../core/models/utilisateur';

@Component({
  selector: 'app-securite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './securite.component.html',
  styleUrl: './securite.component.scss',
})
export class SecuriteComponent {
  @Input() sessions: SessionActive[] = [];

  ancienMotDePasse = '';
  nouveauMotDePasse = '';
  confirmationMotDePasse = '';
  messageErreur = '';
  messageSucces = '';

  twoFA = false;

  @Output() changerMotDePasse = new EventEmitter<{ ancien: string; nouveau: string }>();
  @Output() deconnecterSession = new EventEmitter<SessionActive>();

  onValider(): void {
    this.messageErreur = '';
    this.messageSucces = '';

    if (!this.ancienMotDePasse || !this.nouveauMotDePasse || !this.confirmationMotDePasse) {
      this.messageErreur = 'Tous les champs sont obligatoires.';
      return;
    }
    if (this.nouveauMotDePasse.length < 8) {
      this.messageErreur = 'Le nouveau mot de passe doit contenir au moins 8 caracteres.';
      return;
    }
    if (this.nouveauMotDePasse !== this.confirmationMotDePasse) {
      this.messageErreur = 'La confirmation ne correspond pas au nouveau mot de passe.';
      return;
    }

    this.changerMotDePasse.emit({
      ancien: this.ancienMotDePasse,
      nouveau: this.nouveauMotDePasse,
    });
  }

  afficherResultat(succes: boolean, message: string): void {
    if (succes) {
      this.messageSucces = message;
      this.ancienMotDePasse = '';
      this.nouveauMotDePasse = '';
      this.confirmationMotDePasse = '';
    } else {
      this.messageErreur = message;
    }
  }

  onDeconnecter(session: SessionActive): void {
    this.deconnecterSession.emit(session);
  }
}