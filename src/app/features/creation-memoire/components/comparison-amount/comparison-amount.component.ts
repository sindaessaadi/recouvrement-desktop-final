import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatService } from '../../../../core/services/format.service';

@Component({
  selector: 'app-comparison-amount',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comparison-amount.component.html',
  styleUrl: './comparison-amount.component.scss',
})
export class ComparisonAmountComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() accent = false;
  @Input() devise = 'DT';

  constructor(public format: FormatService) {}
}