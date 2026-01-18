import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas que requieren autenticación
 * Usa el estado local del AuthService para verificación inmediata
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar estado local primero (más rápido)
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado localmente, redirigir al login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

/**
 * Guard para rutas públicas (como login)
 * Redirige al home si el usuario ya está autenticado
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar estado local
  if (authService.isAuthenticated()) {
    // Si ya está autenticado, redirigir al home
    router.navigate(['/home']);
    return false;
  }
  
  // Si no está autenticado, permitir acceso a la ruta pública
  return true;
};
