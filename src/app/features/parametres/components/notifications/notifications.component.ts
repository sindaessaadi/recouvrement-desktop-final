import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Preferences } from '../../../../core/models/utilisateur';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  @Input() preferences: Preferences | null = null;
  @Output() enregistrer = new EventEmitter<Preferences>();

  onEnregistrer(): void {
    if (this.preferences) {
      this.enregistrer.emit(this.preferences);
    }
  }
}