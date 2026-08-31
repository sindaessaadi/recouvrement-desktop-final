import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.scss',
})
export class IntegrationsComponent {
  cleApi = 'sk_live_....................3f9a';
  exportAutomatique = true;

  regenererCle(): void {
    // TODO : appel reel au backend plus tard
    console.log('Regeneration de la cle API demandee (simulation)');
  }
}