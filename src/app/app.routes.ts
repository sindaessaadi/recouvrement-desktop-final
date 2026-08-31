import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { QuittancesComponent } from './features/quittances/quittances.component';
import { CreationMemoireComponent } from './features/creation-memoire/creation-memoire.component';
import { MemoiresComponent } from './features/memoires/memoires.component';
import { ClientsComponent } from './features/clients/clients.component';
import { RelancesComponent } from './features/relances/relances.component';
import { PaiementsComponent } from './features/paiements/paiements.component';
import { ReportingComponent } from './features/reporting/reporting.component';
import { ParametresComponent } from './features/parametres/parametres.component';
import { DetailMemoireComponent } from './features/memoires/detail-memoire/detail-memoire.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'quittances', component: QuittancesComponent, canActivate: [authGuard] },
  { path: 'creation-memoire', component: CreationMemoireComponent, canActivate: [authGuard] },
  { path: 'memoires', component: MemoiresComponent, canActivate: [authGuard] },
  { path: 'memoire/:id', component: DetailMemoireComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientsComponent, canActivate: [authGuard] },
  { path: 'relances', component: RelancesComponent, canActivate: [authGuard] },
  { path: 'paiements', component: PaiementsComponent, canActivate: [authGuard] },
  { path: 'reporting', component: ReportingComponent, canActivate: [authGuard] },
  { path: 'parametres', component: ParametresComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }, // toute route inconnue renvoie vers le tableau de bord
];