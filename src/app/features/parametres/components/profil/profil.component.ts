import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Utilisateur } from '../../../../core/models/utilisateur';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss',
})
export class ProfilComponent {
  @Input() utilisateur: Utilisateur | null = null;
}