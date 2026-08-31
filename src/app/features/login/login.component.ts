import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  motDePasse = '';
  erreur = '';
  enCours = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.motDePasse) {
      this.erreur = 'Veuillez renseigner votre email et votre mot de passe.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.erreur = 'Adresse email invalide.';
      return;
    }
    this.erreur = '';
    this.enCours = true;
    this.authService.login(this.email, this.motDePasse).subscribe({
      next: () => {
        this.enCours = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.enCours = false;
        this.erreur = err?.error?.message ?? 'Email ou mot de passe incorrect.';
      },
    });
  }
}
