import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  usuario: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  usuario: string;
}

export interface CambioContrasenaRequest {
  contrasenaActual: string;
  contrasenaNueva: string;
}

export interface MessageResponse {
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';
  private loggedIn = signal(false);
  private currentUser = signal<string | null>(null);
  private token: string | null = null; // Guardamos el token en memoria
  
  // Observable para componentes que necesiten reaccionar
  public isLoggedIn$ = new BehaviorSubject<boolean>(false);
  public currentUser$ = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // No verificamos con el servidor al inicio
    // El usuario debe hacer login explícitamente
  }

  /**
   * Login del usuario
   * El backend devuelve el token en el response body
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        this.token = response.token; // Guardar token en memoria
        this.setAuthState(true, response.usuario);
      }),
      catchError(error => {
        this.setAuthState(false, null);
        this.token = null;
        throw error;
      })
    );
  }

  /**
   * Cambio de contraseña
   * Requiere que el usuario esté autenticado (cookie httpOnly)
   */
  cambiarContrasena(request: CambioContrasenaRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/auth/cambiar-contrasena`,
      request,
      { withCredentials: true } // IMPORTANTE: para enviar cookies
    );
  }

  /**
   * Logout del usuario
   */
  logout(): Observable<any> {
    this.token = null;
    this.setAuthState(false, null);
    this.router.navigate(['/login']);
    return of(null);
  }

  /**
   * Establece el estado de autenticación
   */
  private setAuthState(isLoggedIn: boolean, usuario: string | null): void {
    this.loggedIn.set(isLoggedIn);
    this.currentUser.set(usuario);
    this.isLoggedIn$.next(isLoggedIn);
    this.currentUser$.next(usuario);
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.loggedIn() && this.token !== null;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): string | null {
    return this.currentUser();
  }
}
