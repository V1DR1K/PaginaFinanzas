import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MovimientosComponent } from './components/movimientos/movimientos.component';
import { InversionesComponent } from './components/inversiones/inversiones.component';
import { LoginComponent } from './components/login/login.component';
import { CambioContrasenaComponent } from './components/cambio-contrasena/cambio-contrasena.component';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { RecurrentesComponent } from './components/recurrentes/recurrentes.component';
import { InsightsComponent } from './components/insights/insights.component';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'movimientos',
    component: MovimientosComponent,
    canActivate: [authGuard],
  },
  {
    path: 'inversiones',
    component: InversionesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'categorias',
    component: CategoriasComponent,
    canActivate: [authGuard],
  },
  {
    path: 'recurrentes',
    component: RecurrentesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'insights',
    component: InsightsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'cambiar-contrasena',
    component: CambioContrasenaComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];