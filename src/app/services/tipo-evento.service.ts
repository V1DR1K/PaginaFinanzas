import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoEvento } from '../modelos/tipo-evento.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TipoEventoService {
  private apiUrl = `${environment.apiUrl}/tipos-evento`;

  constructor(private http: HttpClient) {}

  getTipos(): Observable<TipoEvento[]> {
    return this.http.get<TipoEvento[]>(`${this.apiUrl}/getTipos`);
  }

  crearTipo(tipo: TipoEvento): Observable<TipoEvento> {
    return this.http.post<TipoEvento>(`${this.apiUrl}/addTipos`, tipo);
  }

  actualizarTipo(tipo: TipoEvento): Observable<TipoEvento> {
    return this.http.put<TipoEvento>(`${this.apiUrl}/updateTipo/${tipo.id}`, tipo);
  }

  eliminarTipo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteTipo/${id}`);
  }
}
