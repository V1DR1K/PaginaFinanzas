import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Insight, InsightsResponse, GastoInusual } from '../modelos/insight.model';

@Injectable({
  providedIn: 'root'
})
export class InsightService {
  private apiUrl = `${environment.apiUrl}/insights`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los insights y gastos inusuales del usuario
   */
  getInsights(): Observable<InsightsResponse> {
    return this.http.get<InsightsResponse>(this.apiUrl);
  }

  /**
   * Obtiene solo insights no leídos
   */
  getInsightsNoLeidos(): Observable<Insight[]> {
    return this.http.get<Insight[]>(`${this.apiUrl}/no-leidos`);
  }

  /**
   * Marca un insight como leído
   */
  marcarComoLeido(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/leer`, {});
  }

  /**
   * Marca todos los insights como leídos
   */
  marcarTodosComoLeidos(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/leer-todos`, {});
  }

  /**
   * Obtiene gastos inusuales del último período
   */
  getGastosInusuales(): Observable<GastoInusual[]> {
    return this.http.get<GastoInusual[]>(`${this.apiUrl}/gastos-inusuales`);
  }

  /**
   * Fuerza regeneración de insights
   */
  regenerarInsights(): Observable<InsightsResponse> {
    return this.http.post<InsightsResponse>(`${this.apiUrl}/regenerar`, {});
  }
}
