import { Injectable } from '@angular/core';

export type Theme = 'clair' | 'sombre';

const CLE_STOCKAGE = 'star-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    const themeSauvegarde = (localStorage.getItem(CLE_STOCKAGE) as Theme) ?? 'clair';
    this.appliquer(themeSauvegarde);
  }

  appliquer(theme: Theme): void {
    if (theme === 'sombre') {
      document.body.classList.add('theme-sombre');
    } else {
      document.body.classList.remove('theme-sombre');
    }
    localStorage.setItem(CLE_STOCKAGE, theme);
  }

  getThemeActuel(): Theme {
    return (localStorage.getItem(CLE_STOCKAGE) as Theme) ?? 'clair';
  }
}