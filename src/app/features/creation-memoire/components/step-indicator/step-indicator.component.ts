import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EtapeDef {
  n: number;
  label: string;
}

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-indicator.component.html',
  styleUrl: './step-indicator.component.scss',
})
export class StepIndicatorComponent {
  @Input() step = 1;

  etapes: EtapeDef[] = [
    { n: 1, label: 'Selection' },
    { n: 2, label: 'Quittances' },
    { n: 3, label: 'Details memoire' },
    { n: 4, label: 'Echeancier' },
    { n: 5, label: 'Validation' },
  ];
}