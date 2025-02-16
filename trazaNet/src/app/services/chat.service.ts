import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  sendMessage(messages: ChatMessage[]): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/chat`, { messages });
  }
} 