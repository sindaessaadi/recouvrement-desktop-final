import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { LABELS_ROLE } from '../../../core/models/auth';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  navItems: NavItem[] = [
    { label: 'Tableau de bord', path: '/' },
    { label: 'Suivi emission', path: '/quittances' },
    { label: 'Création mémoire', path: '/creation-memoire' },
    { label: 'Suivi des mémoires', path: '/memoires' },
    { label: 'Suivi des clients', path: '/clients' },
    { label: 'Relances', path: '/relances' },
    { label: 'Paiements', path: '/paiements' },
    { label: 'Reporting', path: '/reporting' },
    { label: 'Paramètres', path: '/parametres' },
  ];

  pageTitle = 'Tableau de bord';
  labelsRole = LABELS_ROLE;

  constructor(private readonly router: Router, public readonly authService: AuthService) {}

  get estPageLogin(): boolean {
    return this.router.url.startsWith('/login');
  }

  ngOnInit(): void {
    this.pageTitle = this.computeTitle(this.router.url);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.pageTitle = this.computeTitle(e.urlAfterRedirects);
      });
  }

  onDeconnexion(): void {
    this.authService.logout();
  }

  private computeTitle(url: string): string {
    if (url === '/') return 'Tableau de bord';
    if (url === '/memoires') return 'Suivi des mémoires';
    if (url.startsWith('/creation')) return "Création d'un mémoire de règlement";
    if (url === '/quittances') return 'Quittances / Impayés';
    if (url === '/clients') return 'Clients';
    if (url === '/relances') return 'Relances';
    if (url === '/paiements') return 'Paiements';
    if (url === '/reporting') return 'Reporting';
    if (url === '/parametres') return 'Paramètres';
    if (url.startsWith('/memoire/')) return 'Détail mémoire';
    return 'Tableau de bord';
  }
}