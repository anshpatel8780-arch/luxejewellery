import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <section class="auth-page">
      <div class="auth-card animate-fadeInUp">
        <div class="auth-header">
          <img src="assets/logo.png" alt="Kairo Jewellery Logo" class="auth-logo">
          <h1>Join Kairo Jewellery</h1>
          <p>Create your account to start shopping</p>
        </div>
        <form (ngSubmit)="register()">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="name" name="name" placeholder="Your full name" required>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="your@email.com" required>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" [(ngModel)]="phone" name="phone" placeholder="+91 XXXXX XXXXX">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Min. 6 characters" required>
          </div>
          <div *ngIf="error" class="error-msg">{{error}}</div>
          <button type="submit" class="btn btn-primary" style="width:100%" [disabled]="loading">
            {{loading ? 'Creating Account...' : 'Create Account →'}}
          </button>
        </form>
        <p class="auth-footer">Already have an account? <a routerLink="/login">Sign In</a></p>
      </div>
    </section>
  `,
    styles: [`
    .auth-page {
      min-height: calc(100vh - 70px); display: flex; align-items: center; justify-content: center;
      padding: 40px 20px;
      background: radial-gradient(ellipse at center, rgba(212,175,55,0.03) 0%, transparent 60%);
    }
    .auth-card {
      background: #1E1E1E; border: 1px solid #333; border-radius: 16px;
      padding: 48px 40px; width: 100%; max-width: 440px;
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { height: 90px; width: 90px; object-fit: cover; border-radius: 50%; border: 2px solid #D4AF37; background: #000; margin-bottom: 24px; transition: 0.3s; }
    .auth-header h1 { color: #fff; font-size: 1.8rem; margin-bottom: 8px; }
    .auth-header p { color: #777; }
    .error-msg { color: #E74C3C; background: rgba(231,76,60,0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; }
    .auth-footer { text-align: center; margin-top: 24px; color: #777; font-size: 0.9rem; }
    .auth-footer a { color: #D4AF37; font-weight: 600; }
  `]
})
export class RegisterComponent {
    name = ''; email = ''; phone = ''; password = ''; error = ''; loading = false;

    constructor(private authService: AuthService, private router: Router) { }

    register() {
        this.error = '';
        if (!this.name || !this.email || !this.password) { this.error = 'Please fill in all required fields'; return; }
        if (this.password.length < 6) { this.error = 'Password must be at least 6 characters'; return; }
        
        this.loading = true;
        this.authService.registerCheck(this.email).subscribe({
            next: () => {
              const tempData = { name: this.name, email: this.email, phone: this.phone, password: this.password };
              localStorage.setItem('temp_reg_data', JSON.stringify(tempData));
              this.router.navigate(['/verify-email'], { queryParams: { email: this.email } });
            },
            error: (err) => { 
                this.error = err.error?.message || 'Email already exists or request failed'; 
                this.loading = false; 
            }
        });
    }
}
