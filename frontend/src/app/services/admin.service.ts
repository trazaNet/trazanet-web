import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.production 
    ? 'https://trazanet-production.up.railway.app/api'
    : environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/users/${userId}`);
  }

  updateUserRole(userId: number, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/users/${userId}/role`, { role });
  }
} 