// filepath: d:\Importante\PaginaFinanzas\src\app\services\data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ahorrosService {
  private apiUrl = 'http://localhost:8080/finanzas';

  constructor(private http: HttpClient) { }

  getEstadisticasEsteMes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ahorros/getEstadisticasEsteMes`);
  }
}