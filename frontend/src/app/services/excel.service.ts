import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  private readonly API_URL = `${environment.apiUrl}/excel`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  cargarExcel(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);

    return this.http.post(`${this.API_URL}/upload`, formData);
  }

  obtenerDatos(): Observable<any> {
    return this.http.get(`${this.API_URL}/data`);
  }
} 