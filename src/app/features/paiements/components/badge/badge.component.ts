import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="cls">{{ label }}</span>`,
  styles: [
    `.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 600; }
     .badge--info { background-color: var(--star-info-bg); color: var(--star-info-text); }
     .badge--success { background-color: var(--star-success-bg); color: var(--star-success-text); }
     .badge--yellow { background-color: var(--star-yellow-bg); color: var(--star-yellow-text); }
     .badge--danger { background-color: #fee2e2; color: #b91c1c; }
     .badge--violet { background-color: #ede9fe; color: #6d28d9; }
     .badge--neutral { background-color: #f3f4f6; color: #374151; }`,
  ],
})
export class BadgeComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) cls!: string;
}
