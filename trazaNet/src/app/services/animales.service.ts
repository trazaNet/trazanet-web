import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Animal } from '../interfaces/animal.interface';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class AnimalesService {
  private animalesSubject = new BehaviorSubject<Animal[]>([]);
  animales$ = this.animalesSubject.asObservable();

  constructor() {}

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
      // Limpiar el número de dispositivo del animal de cualquier formato especial
      const numeroAnimal = animal.dispositivo.replace(/[^0-9]/g, '');
      // Comparar los últimos 8 dígitos
      return numeroAnimal.endsWith(dispositivo);
    });

    console.log('Resultado de búsqueda:', animalEncontrado);
    return animalEncontrado;
  }
} 