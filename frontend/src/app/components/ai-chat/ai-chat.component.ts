import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Chat Button -->
    <button class="chat-toggle-btn" (click)="toggleChat()" [class.active]="isOpen">
      <i class="fa-solid" [class.fa-robot]="!isOpen" [class.fa-xmark]="isOpen"></i>
      <span *ngIf="!isOpen" class="btn-badge animate-pulse">AI</span>
    </button>

    <!-- Chat Panel -->
    <div class="chat-panel luxury-card" *ngIf="isOpen" [@slideUp]>
      <div class="chat-header">
        <div class="header-info">
          <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
          <div>
            <h4>AI Shopping Assistant</h4>
            <span class="status-dot">Online</span>
          </div>
        </div>
        <div class="header-actions">
          <button (click)="toggleChat()" title="Minimize"><i class="fa-solid fa-minus"></i></button>
        </div>
      </div>

      <div class="chat-messages" #scrollContainer>
        <div *ngFor="let msg of messages" [class]="'message-wrapper ' + msg.role">
          <div class="message-bubble">
            <p>{{msg.content}}</p>
            <span class="msg-time">{{msg.timestamp | date:'shortTime'}}</span>
          </div>
        </div>
        
        <!-- Typing Indicator -->
        <div *ngIf="isTyping" class="message-wrapper bot">
          <div class="message-bubble typing">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <input 
          #chatInput
          [(ngModel)]="userInput" 
          (keydown.enter)="sendMessage()" 
          placeholder="Ask about gold rings, best sellers..."
          [disabled]="isTyping"
        >
        <button (click)="sendMessage()" [disabled]="!userInput.trim() || isTyping">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `,
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ],
  styles: [`
    .chat-toggle-btn {
      position: fixed; bottom: 30px; right: 30px;
      width: 65px; height: 65px; border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37, #B8960C);
      color: #0d0d0d; font-size: 1.5rem; border: none;
      cursor: pointer; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
      z-index: 1000; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex; align-items: center; justify-content: center;
    }
    .chat-toggle-btn:hover { transform: scale(1.1) rotate(5deg); }
    .chat-toggle-btn.active { background: #1A1A1A; color: #D4AF37; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    
    .btn-badge {
      position: absolute; top: -5px; right: -5px;
      background: #fff; color: #0d0d0d; padding: 4px 8px;
      border-radius: 12px; font-size: 0.7rem; font-weight: 800;
      border: 2px solid #D4AF37;
    }

    .chat-panel {
      position: fixed; bottom: 110px; right: 30px;
      width: 380px; height: 500px; max-height: 80vh;
      background: #0d0d0d; border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 20px; z-index: 1000; overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 15px 50px rgba(0,0,0,0.8);
    }

    .chat-header {
      padding: 20px; background: #1A1A1A; border-bottom: 1px solid rgba(212, 175, 55, 0.2);
      display: flex; justify-content: space-between; align-items: center;
    }
    .header-info { display: flex; align-items: center; gap: 15px; }
    .ai-avatar { 
      width: 40px; height: 40px; border-radius: 50%; background: #D4AF37; 
      color: #0d0d0d; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
    }
    .header-info h4 { color: #fff; margin: 0; font-size: 1rem; font-weight: 600; }
    .status-dot { color: #27AE60; font-size: 0.75rem; display: flex; align-items: center; gap: 5px; }
    .status-dot:before { content: ""; width: 8px; height: 8px; background: #27AE60; border-radius: 50%; }
    .header-actions button { background: none; border: none; color: #777; cursor: pointer; font-size: 1rem; transition: 0.3s; }
    .header-actions button:hover { color: #D4AF37; }

    .chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; overscroll-behavior: contain; }
    .message-wrapper { display: flex; flex-direction: column; max-width: 85%; }
    .message-wrapper.user { align-self: flex-end; }
    .message-wrapper.bot { align-self: flex-start; }

    .message-bubble { padding: 12px 16px; border-radius: 18px; font-size: 0.9rem; line-height: 1.5; color: #fff; position: relative; }
    .user .message-bubble { background: #D4AF37; color: #0d0d0d; border-bottom-right-radius: 2px; }
    .bot .message-bubble { background: #1E1E1E; border: 1px solid #333; border-bottom-left-radius: 2px; }
    .msg-time { font-size: 0.65rem; color: rgba(0,0,0,0.5); align-self: flex-end; display: block; margin-top: 5px; }
    .bot .msg-time { color: #555; }

    .chat-input-area { padding: 15px; background: #1A1A1A; display: flex; gap: 10px; align-items: center; }
    .chat-input-area input { 
      flex: 1; background: #0d0d0d; border: 1px solid #333; border-radius: 25px; 
      padding: 10px 20px; color: #fff; font-size: 0.9rem; outline: none; transition: 0.3s;
    }
    .chat-input-area input:focus { border-color: #D4AF37; }
    .chat-input-area button { 
      width: 40px; height: 40px; border-radius: 50%; 
      background: #D4AF37; border: none; color: #0d0d0d; cursor: pointer; transition: 0.3s;
    }
    .chat-input-area button:disabled { background: #333; color: #555; cursor: not-allowed; }

    /* Typing Animation */
    .typing { display: flex; gap: 4px; padding: 15px 20px !important; min-width: 60px; justify-content: center; }
    .dot { width: 6px; height: 6px; background: #D4AF37; border-radius: 50%; opacity: 0.4; animation: blink 1.4s infinite; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }

    /* Custom Scrollbar */
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }

    @media (max-width: 480px) {
      .chat-panel { width: calc(100% - 40px); right: 20px; bottom: 90px; }
      .chat-toggle-btn { bottom: 20px; right: 20px; }
    }
  `]
})
export class AiChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  isOpen = false;
  isTyping = false;
  userInput = '';
  messages: ChatMessage[] = [];
  private sub: Subscription | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.sub = this.chatService.messages$.subscribe(msgs => {
      this.messages = msgs;
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isTyping) return;
    
    const text = this.userInput;
    this.userInput = '';
    this.isTyping = true;
    
    this.chatService.sendMessage(text).subscribe({
      next: () => {
        this.isTyping = false;
      },
      error: () => {
        this.isTyping = false;
        // Optional: show error message
      }
    });
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}
