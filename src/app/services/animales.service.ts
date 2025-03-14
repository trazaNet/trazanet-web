import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animal } from '../interfaces/animal.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimalesService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAnimales(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.API_URL}/animales`);
  }

  uploadExcel(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/excel/upload`, formData);
  }

  vaciarLista(): Observable<any> {
    return this.http.delete(`${this.API_URL}/animales`);
  }

  buscarPorDispositivo(dispositivo: string): Observable<Animal | null> {
    return this.http.get<Animal | null>(`${this.API_URL}/animales/${dispositivo}`);
  }
} 