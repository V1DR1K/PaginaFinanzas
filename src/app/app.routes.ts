import { Routes, provideRouter } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home', // Redirige la raíz a /home
    pathMatch: 'full',  // Asegúrate de usar pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent, // Carga el HomeComponent para la ruta /home
  },
  {
    path: '**',
    redirectTo: 'home', // Redirige cualquier ruta no encontrada a /home
  },
];
export const appRouter = provideRouter(routes);