import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Adjunto, AdjuntoUploadResponse } from '../modelos/adjunto.model';

@Injectable({
  providedIn: 'root'
})
export class AdjuntoService {
  private apiUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los adjuntos de un movimiento
   */
  getAdjuntos(movimientoId: number): Observable<Adjunto[]> {
    return this.http.get<Adjunto[]>(`${this.apiUrl}/${movimientoId}/adjuntos`);
  }

  /**
   * Sube un archivo adjunto a un movimiento
   */
  uploadAdjunto(movimientoId: number, file: File): Observable<AdjuntoUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<AdjuntoUploadResponse>(
      `${this.apiUrl}/${movimientoId}/adjuntos`,
      formData
    );
  }

  /**
   * Elimina un adjunto
   */
  deleteAdjunto(movimientoId: number, adjuntoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${movimientoId}/adjuntos/${adjuntoId}`);
  }

  /**
   * Descarga un adjunto
   */
  downloadAdjunto(movimientoId: number, adjuntoId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${movimientoId}/adjuntos/${adjuntoId}/download`,
      { responseType: 'blob' }
    );
  }
}
