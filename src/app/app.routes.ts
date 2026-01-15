import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MovimientosComponent } from './components/movimientos/movimientos.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'movimientos',
    component: MovimientosComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];