import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'confirm' | 'prompt';

export interface NotificationData {
  message: string;
  type: NotificationType;
  title?: string;
  inputPlaceholder?: string;
  confirmText?: string;
  cancelText?: string;
  resolve?: (value: any) => void;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<NotificationData | null>();
  notification$ = this.notificationSubject.asObservable();

  alert(message: string, type: NotificationType = 'info', title?: string): Promise<void> {
    return new Promise(resolve => {
      this.notificationSubject.next({ message, type, title, resolve });
    });
  }

  confirm(message: string, title: string = 'Are you sure?'): Promise<boolean> {
    return new Promise(resolve => {
      this.notificationSubject.next({
        message,
        type: 'confirm',
        title,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        resolve
      });
    });
  }

  prompt(message: string, title: string = 'Required Input', placeholder: string = 'Enter reason...'): Promise<string | null> {
    return new Promise(resolve => {
      this.notificationSubject.next({
        message,
        type: 'prompt',
        title,
        inputPlaceholder: placeholder,
        confirmText: 'Submit',
        cancelText: 'Back',
        resolve
      });
    });
  }

  close(value: any = null) {
    this.notificationSubject.next(null);
  }
}
