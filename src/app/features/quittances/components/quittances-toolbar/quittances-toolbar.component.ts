import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quittances-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quittances-toolbar.component.html',
  styleUrl: './quittances-toolbar.component.scss',
})
export class QuittancesToolbarComponent {
  /** Nombre de quittances actuellement selectionnees (0 ou 1, comportement radio) */
  @Input() nombreSelectionne = 0;

  /** Emis quand l'utilisateur clique sur "Exporter Excel" */
  @Output() exporter = new EventEmitter<void>();

  /** Emis quand l'utilisateur clique sur "Generer memoire" */
  @Output() genererMemoire = new EventEmitter<void>();

  onExporter(): void {
    this.exporter.emit();
  }

  onGenererMemoire(): void {
    this.genererMemoire.emit();
  }
}