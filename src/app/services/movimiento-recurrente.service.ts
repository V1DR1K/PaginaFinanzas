import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MovimientoRecurrente, MovimientoRecurrenteRequest } from '../modelos/movimiento-recurrente.model';

@Injectable({
  providedIn: 'root'
})
export class MovimientoRecurrenteService {
  private apiUrl = `${environment.apiUrl}/movimientos/recurrentes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los movimientos recurrentes del usuario
   */
  getMovimientosRecurrentes(): Observable<MovimientoRecurrente[]> {
    return this.http.get<MovimientoRecurrente[]>(this.apiUrl);
  }

  /**
   * Obtiene un movimiento recurrente por ID
   */
  getMovimientoRecurrenteById(id: number): Observable<MovimientoRecurrente> {
    return this.http.get<MovimientoRecurrente>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene solo los movimientos recurrentes activos
   */
  getMovimientosRecurrentesActivos(): Observable<MovimientoRecurrente[]> {
    return this.http.get<MovimientoRecurrente[]>(`${this.apiUrl}/activos`);
  }

  /**
   * Crea un nuevo movimiento recurrente
   */
  createMovimientoRecurrente(request: MovimientoRecurrenteRequest): Observable<MovimientoRecurrente> {
    return this.http.post<MovimientoRecurrente>(this.apiUrl, request);
  }

  /**
   * Actualiza un movimiento recurrente
   */
  updateMovimientoRecurrente(id: number, request: MovimientoRecurrenteRequest): Observable<MovimientoRecurrente> {
    return this.http.put<MovimientoRecurrente>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Activa/desactiva un movimiento recurrente
   */
  toggleActivo(id: number): Observable<MovimientoRecurrente> {
    return this.http.patch<MovimientoRecurrente>(`${this.apiUrl}/${id}/toggle`, {});
  }

  /**
   * Elimina un movimiento recurrente
   */
  deleteMovimientoRecurrente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Ejecuta manualmente un movimiento recurrente
   */
  ejecutarAhora(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ejecutar`, {});
  }
}
