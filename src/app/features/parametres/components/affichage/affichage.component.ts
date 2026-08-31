import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Preferences } from '../../../../core/models/utilisateur';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-affichage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affichage.component.html',
  styleUrl: './affichage.component.scss',
})
export class AffichageComponent {
  @Input() preferences: Preferences | null = null;
  @Output() enregistrer = new EventEmitter<Preferences>();

  constructor(private themeService: ThemeService) {}

  onEnregistrer(): void {
    if (this.preferences) {
      this.enregistrer.emit(this.preferences);
    }
  }

  choisirTheme(theme: 'clair' | 'sombre'): void {
    if (this.preferences) {
      this.preferences.theme = theme;
      this.themeService.appliquer(theme);
    }
  }
}