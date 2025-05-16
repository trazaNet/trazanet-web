import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Animal } from '../interfaces/animal.interface';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimalesService {
  private readonly API_URL = `${environment.apiUrl}/excel`;
  private animalesSubject = new BehaviorSubject<Animal[]>([]);
  animales$ = this.animalesSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/animales`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  cargarDatosIniciales(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.API_URL}/data`, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    });
  }

  setAnimales(animales: Animal[]) {
    this.animalesSubject.next(animales);
  }

  buscarAnimales(termino: string): Animal[] {
    const animales = this.animalesSubject.value;
    if (!termino) return animales;
    
    termino = termino.toLowerCase();
    return animales.filter(animal => {
      return Object.values(animal).some(valor => 
        String(valor).toLowerCase().includes(termino)
      );
    });
  }

  buscarPorDispositivo(dispositivo: string): Animal | undefined {
    const animales = this.animalesSubject.value;
    console.log('Buscando dispositivo:', dispositivo, 'en', animales.length, 'animales');
    
    const animalEncontrado = animales.find(animal => {
      const numeroAnimal = animal.dispositivo.replace(/[^0-9]/g, '');
      return numeroAnimal.endsWith(dispositivo);
    });

    console.log('Resultado de búsqueda:', animalEncontrado);
    return animalEncontrado;
  }

  getMisAnimales(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}/mis-animales`);
  }

  getAnimalById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/${id}`);
  }
} 