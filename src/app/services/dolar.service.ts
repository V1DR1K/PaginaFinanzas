import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DolarTipo {
  nombre: string;
  compra: number;
  venta: number;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class DolarService {
  private apiUrl = `${environment.apiUrl}/dolar`;

  constructor(private http: HttpClient) {}

  getDolares(): Observable<DolarTipo[]> {
    return this.http.get<DolarTipo[]>(`${this.apiUrl}/todos`);
  }
}
