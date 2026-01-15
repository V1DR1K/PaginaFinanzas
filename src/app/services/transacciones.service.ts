import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransaccionesService {
  private apiUrl = 'http://localhost:8080/finanzas/transacciones'; // URL base del backend para transacciones

  constructor(private http: HttpClient) {}

  // Obtener todas las transacciones
  getTransacciones(): Observable<{ descripcion: string; monto: number; tipo: string }[]> {
    return this.http.get<{ descripcion: string; monto: number; tipo: string }[]>(this.apiUrl);
  }

  // Agregar una nueva transacción
  addTransaccion(transaccion: { descripcion: string; monto: number; tipo: string }): Observable<any> {
    return this.http.post(this.apiUrl, transaccion);
  }

  // Eliminar una transacción por ID
  deleteTransaccion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
