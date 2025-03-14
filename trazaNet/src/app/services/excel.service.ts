import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  private readonly API_URL = 'http://localhost:3001/api/excel';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  cargarExcel(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);

    return this.http.post(`${this.API_URL}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    });
  }

  obtenerDatos(): Observable<any> {
    return this.http.get(`${this.API_URL}/data`, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    });
  }
} 