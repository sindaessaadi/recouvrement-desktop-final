import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogActivite } from '../../../../core/models/utilisateur';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
})
export class JournalComponent {
  @Input() logs: LogActivite[] = [];
}