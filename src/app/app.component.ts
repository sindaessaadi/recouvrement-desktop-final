import { Component } from '@angular/core';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { ThemeService } from './core/services/theme.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(private themeService: ThemeService) {}
}