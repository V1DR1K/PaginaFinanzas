import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Crypto, CryptoRequest, CryptoSymbol } from '../modelos/crypto.model';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private apiUrl = `${environment.apiUrl}/cryptos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las tenencias de crypto del usuario
   */
  getCryptos(): Observable<Crypto[]> {
    return this.http.get<Crypto[]>(this.apiUrl);
  }

  /**
   * Obtiene solo las cryptos activas
   */
  getCryptosActivas(): Observable<Crypto[]> {
    return this.http.get<Crypto[]>(`${this.apiUrl}/activas`);
  }

  /**
   * Obtiene todos los símbolos disponibles para monitoreo
   */
  getSymbolos(): Observable<CryptoSymbol[]> {
    return this.http.get<CryptoSymbol[]>(`${this.apiUrl}/simbolos`);
  }

  /**
   * Crea una nueva tenencia de crypto
   */
  createCrypto(request: CryptoRequest): Observable<Crypto> {
    return this.http.post<Crypto>(this.apiUrl, request);
  }

  /**
   * Actualiza una tenencia de crypto existente
   */
  updateCrypto(id: number, request: CryptoRequest): Observable<Crypto> {
    return this.http.post<Crypto>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Elimina una tenencia de crypto
   */
  deleteCrypto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activa/desactiva una crypto para monitoreo
   */
  toggleActivo(id: number): Observable<Crypto> {
    return this.http.post<Crypto>(`${this.apiUrl}/${id}/toggle`, {});
  }
}
