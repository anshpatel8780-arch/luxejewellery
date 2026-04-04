import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationComponent } from './components/notification/notification.component';
import { AiChatComponent } from './components/ai-chat/ai-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, NotificationComponent, AiChatComponent],
  template: `
    <app-navbar *ngIf="!isAdminRoute && !isAuthRoute"></app-navbar>
    <main class="main-content" [class.admin-mode]="isAdminRoute" [class.auth-mode]="isAuthRoute">
      <router-outlet></router-outlet>
    </main>
    <app-notification></app-notification>
    <app-ai-chat *ngIf="!isAdminRoute && !isAuthRoute"></app-ai-chat>
    <app-footer *ngIf="!isAdminRoute && !isAuthRoute"></app-footer>
  `,
  styles: [`
    .main-content { min-height: 100vh; padding-top: 70px; }
    .main-content.admin-mode, .main-content.auth-mode { padding-top: 0; }
  `]
})
export class AppComponent {
  isAdminRoute = false;
  isAuthRoute = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateRouteStates(event.urlAfterRedirects);
    });
    // Check initial state
    this.updateRouteStates(this.router.url);
  }

  private updateRouteStates(url: string) {
    this.isAdminRoute = url.includes('/admin');
    this.isAuthRoute = url.includes('/login') || 
                       url.includes('/register') || 
                       url.includes('/forgot-password');
  }
}
