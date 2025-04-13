// filepath: d:\Importante\PaginaFinanzas\src\app\services\data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  recuperarAhorros(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ahorros`);
  }
}