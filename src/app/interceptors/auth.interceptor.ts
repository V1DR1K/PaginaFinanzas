import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP para manejar autenticación y errores
 * - Agrega el token JWT en el header Authorization
 * - Maneja errores 401 (No autorizado) redirigiendo al login
 * - Maneja otros errores HTTP mostrando mensajes apropiados
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const authService = inject(AuthService);

  // Obtener el token del AuthService
  const token = authService.getToken();

  // Clonar la request para agregar el header Authorization si hay token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Error de autenticación - redirigir al login
        toastr.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'Sesión expirada');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Acceso prohibido
        toastr.error('No tienes permisos para realizar esta acción.', 'Acceso denegado');
      } else if (error.status === 0) {
        // Error de conexión
        toastr.error('No se pudo conectar con el servidor. Verifica tu conexión.', 'Error de conexión');
      } else if (error.status >= 500) {
        // Error del servidor
        toastr.error('Ocurrió un error en el servidor. Intenta nuevamente más tarde.', 'Error del servidor');
      }

      return throwError(() => error);
    })
  );
};
