import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { Inversion } from '../models/inversion.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InversionesService {
  private apiUrl = `${environment.apiUrl}/inversiones`;
  private inversiones$ = new BehaviorSubject<Inversion[]>([]);

  constructor(private http: HttpClient) {
    this.loadInversiones();
  }

  private loadInversiones() {
    console.log('Cargando inversiones...');
    this.http.get<Inversion[]>(this.apiUrl).pipe(
      tap(inversiones => console.log('Inversiones cargadas:', inversiones)),
      catchError(error => {
        console.error('Error al cargar inversiones:', error);
        return [];
      })
    ).subscribe(
      inversiones => this.inversiones$.next(inversiones)
    );
  }

  getInversiones(): Observable<Inversion[]> {
    return this.inversiones$.asObservable();
  }

  addInversion(inversion: Inversion): Observable<Inversion> {
    console.log('Agregando inversión:', inversion);
    return this.http.post<Inversion>(this.apiUrl, inversion).pipe(
      tap(newInversion => {
        console.log('Nueva inversión agregada:', newInversion);
        const currentInversiones = this.inversiones$.getValue();
        this.inversiones$.next([...currentInversiones, newInversion]);
      }),
      catchError(error => {
        console.error('Error al agregar inversión:', error);
        throw error;
      })
    );
  }

  updateInversion(id: number, inversion: Inversion): Observable<Inversion> {
    console.log('Actualizando inversión:', { id, inversion });
    return this.http.put<Inversion>(`${this.apiUrl}/${id}`, inversion).pipe(
      tap(updatedInversion => {
        console.log('Inversión actualizada:', updatedInversion);
        const currentInversiones = this.inversiones$.getValue();
        const index = currentInversiones.findIndex(i => i.id === id);
        if (index !== -1) {
          currentInversiones[index] = updatedInversion;
          this.inversiones$.next([...currentInversiones]);
        }
      }),
      catchError(error => {
        console.error('Error al actualizar inversión:', error);
        throw error;
      })
    );
  }

  deleteInversion(id: number): Observable<void> {
    console.log('Eliminando inversión:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log('Inversión eliminada:', id);
        const currentInversiones = this.inversiones$.getValue();
        this.inversiones$.next(currentInversiones.filter(i => i.id !== id));
      }),
      catchError(error => {
        console.error('Error al eliminar inversión:', error);
        throw error;
      })
    );
  }
} 