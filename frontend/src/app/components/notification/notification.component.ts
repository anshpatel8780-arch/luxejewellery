import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, NotificationData } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="data" class="modal-overlay" (click)="onCancel()">
      <div class="modal-container animate-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-icon" [ngClass]="data.type">
            <span *ngIf="data.type === 'success'">✓</span>
            <span *ngIf="data.type === 'error'">✕</span>
            <span *ngIf="data.type === 'info' || data.type === 'confirm' || data.type === 'prompt'">ℹ</span>
          </div>
          <h2 *ngIf="data.title">{{data.title}}</h2>
        </div>
        
        <div class="modal-body">
          <p>{{data.message}}</p>
          <div *ngIf="data.type === 'prompt'" class="prompt-input">
            <textarea [(ngModel)]="promptValue" [placeholder]="data.inputPlaceholder || 'Enter here...'" rows="3" autofocus></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button *ngIf="data.type === 'confirm' || data.type === 'prompt'" class="btn btn-secondary" (click)="onCancel()">
            {{data.cancelText || 'Cancel'}}
          </button>
          <button class="btn btn-primary" (click)="onConfirm()">
            {{data.confirmText || 'OK'}}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .modal-container {
      background: #1A1A1A; border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 20px; width: 100%; max-width: 420px;
      padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative; overflow: hidden;
    }
    .modal-container::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, #D4AF37, transparent);
    }
    .modal-header { text-align: center; margin-bottom: 24px; }
    .modal-icon {
      width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; font-weight: bold;
    }
    .modal-icon.success { background: rgba(39, 174, 96, 0.1); color: #27AE60; border: 1px solid #27AE60; }
    .modal-icon.error { background: rgba(231, 76, 60, 0.1); color: #E74C3C; border: 1px solid #E74C3C; }
    .modal-icon.info, .modal-icon.confirm, .modal-icon.prompt { background: rgba(212, 175, 55, 0.1); color: #D4AF37; border: 1px solid #D4AF37; }
    
    .modal-header h2 { color: #fff; font-size: 1.4rem; font-family: 'Playfair Display', serif; }
    .modal-body { text-align: center; color: #B0B0B0; margin-bottom: 32px; line-height: 1.6; }
    
    .prompt-input textarea {
      width: 100%; margin-top: 20px; background: #252525; border: 1px solid #333;
      border-radius: 12px; color: #fff; padding: 12px; outline: none;
      transition: 0.3s; resize: none; font-size: 0.95rem;
    }
    .prompt-input textarea:focus { border-color: #D4AF37; background: #2A2A2A; }
    
    .modal-footer { display: flex; gap: 12px; justify-content: center; }
    .modal-footer .btn { padding: 12px 28px; min-width: 120px; font-weight: 600; }

    .animate-modal {
      animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  data: NotificationData | null = null;
  promptValue: string = '';
  private sub?: Subscription;

  constructor(private service: NotificationService) {}

  ngOnInit() {
    this.sub = this.service.notification$.subscribe(data => {
      this.data = data;
      this.promptValue = '';
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onConfirm() {
    const resolve = this.data?.resolve;
    if (this.data?.type === 'prompt') {
      resolve?.(this.promptValue);
    } else if (this.data?.type === 'confirm') {
      resolve?.(true);
    } else {
      resolve?.(null);
    }
    this.service.close();
  }

  onCancel() {
    const resolve = this.data?.resolve;
    if (this.data?.type === 'confirm') {
      resolve?.(false);
    } else {
      resolve?.(null);
    }
    this.service.close();
  }
}
