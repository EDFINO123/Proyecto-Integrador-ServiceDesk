import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { rolGuard } from './guards/rol.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { GestionPersonalComponent } from './pages/gestion-personal/gestion-personal.component';
import { LoginComponent } from './pages/login/login.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { TecnicoDashboardComponent } from './pages/tecnico-dashboard/tecnico-dashboard.component';
import { TicketDetalleComponent } from './pages/ticket-detalle/ticket-detalle.component';
import { TicketsComponent } from './pages/tickets/tickets.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'perfil',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [{ path: '', component: PerfilComponent }],
  },
  {
    path: 'ticket/:id',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [{ path: '', component: TicketDetalleComponent }],
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard, rolGuard(['ROLE_ADMIN', 'ROLE_USUARIO'])],
    children: [
      { path: '', component: TicketsComponent },
      {
        path: 'personal',
        component: GestionPersonalComponent,
        canActivate: [rolGuard(['ROLE_ADMIN'])],
      },
    ],
  },
  {
    path: 'tecnico/dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard, rolGuard(['ROLE_TECNICO', 'ROLE_ADMIN'])],
    children: [
      { path: '', component: TecnicoDashboardComponent },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
