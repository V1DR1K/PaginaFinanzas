import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MovimientosComponent } from './components/movimientos/movimientos.component';
import { InversionesComponent } from './components/inversiones/inversiones.component';
import { LoginComponent } from './components/login/login.component';
import { CambioContrasenaComponent } from './components/cambio-contrasena/cambio-contrasena.component';
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
    path: 'cambiar-contrasena',
    component: CambioContrasenaComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];