import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento } from '../modelos/movimiento.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MovimientoService {
private apiUrl = `${environment.apiUrl}/movimiento`;

  constructor(private http: HttpClient) {}

  findAllMovimientos(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}/findAllMovimientos`);
  }

  findMovimientoById(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.apiUrl}/findMovimientoById/${id}`);
  }

  newMovimiento(movimiento: Omit<Movimiento, 'id'>): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.apiUrl}/newMovimiento`, movimiento);
  }

  editMovimiento(id: number, movimiento: Partial<Movimiento>): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.apiUrl}/editMovimiento/${id}`, movimiento);
  }

  deleteMovimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteMovimiento/${id}`);
  }
}
