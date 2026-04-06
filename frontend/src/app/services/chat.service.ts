import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  products?: {name: string, slug: string, price: number, description: string, image: string}[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {
    // Basic welcome message
    this.messagesSubject.next([{
      role: 'bot',
      content: 'Welcome to LuxeJewels! I am your AI Assistant. How can I help you discover our premium handcrafted jewellery today?',
      timestamp: new Date()
    }]);
  }

  sendMessage(text: string): Observable<any> {
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMsg]);

    const payload = {
      message: text,
      history: currentMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }))
    };

    return this.http.post<any>(`${this.apiUrl}/send`, payload).pipe(
      tap(res => {
        const botMsg: ChatMessage = { 
          role: 'bot', 
          content: res.response, 
          timestamp: new Date(),
          products: res.recommends && res.recommends.length > 0 ? res.recommends : undefined
        };
        this.messagesSubject.next([...this.messagesSubject.value, botMsg]);
      })
    );
  }

  clearHistory() {
    this.messagesSubject.next([]);
  }
}
