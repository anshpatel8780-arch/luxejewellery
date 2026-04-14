import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <section class="auth-page">
      <div class="glow-sphere"></div>
      <div class="auth-card animate-fadeInUp">
        <div class="auth-header">
          <img src="assets/logo.png" alt="Kairo Jewellery Logo" class="auth-logo">
          <h1 class="premium-heading">Welcome Back</h1>
          <p class="premium-sub">Sign in to your heritage of elegance</p>
        </div>
        
        <form (ngSubmit)="login()" autocomplete="off">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="your@email.com" required autocomplete="off">
          </div>
          
          <div class="form-group" style="margin-bottom: 8px;">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required autocomplete="new-password">
          </div>
          
          <div class="forgot-link-row">
            <a routerLink="/forgot-password" class="forgot-link">Recover Access?</a>
          </div>
          
          <div *ngIf="error" class="error-msg">{{error}}</div>
          
          <button type="submit" class="btn-luxe-premium" [disabled]="loading">
            {{loading ? 'AUTHENTICATING...' : 'Sign In'}}
          </button>
          
          <div class="trust-badge-premium">
             <i class="fa-solid fa-lock-shield gold-text"></i>
             <span>SECURE END-TO-END ENCRYPTED LOGIN</span>
          </div>
        </form>

        <div class="premium-divider"></div>
        <p class="auth-footer">Seeking exclusivity? <a routerLink="/register">Create Your Account</a></p>
      </div>
    </section>
  `,
    styles: [`
    .auth-page {
      height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 20px; background: #050505; position: relative; overflow: hidden;
    }
    .glow-sphere {
      position: absolute; width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%);
      top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;
    }
    .auth-card {
      background: rgba(18, 18, 18, 0.95); backdrop-filter: blur(25px);
      border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 28px;
      padding: 35px 45px; width: 100%; max-width: 480px;
      box-shadow: 0 40px 100px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.05);
      position: relative; z-index: 10;
    }
    .auth-header { text-align: center; margin-bottom: 25px; }
    .auth-logo { 
      display: block; margin: 0 auto 15px;
      height: 90px; width: 90px; object-fit: cover; border-radius: 50%; 
      border: 3px solid #D4AF37; background: #000;
      box-shadow: 0 0 25px rgba(212, 175, 55, 0.4);
    }
    .premium-heading { 
      font-family: 'Playfair Display', serif; color: #fff; font-size: 2rem; 
      margin-bottom: 5px; font-weight: 700; letter-spacing: -0.5px;
    }
    .premium-sub { color: #888; font-size: 0.8rem; letter-spacing: 0.5px; text-transform: uppercase; }
    
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; color: #777; font-size: 0.65rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; }
    .form-group input {
      width: 100%; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.08); 
      padding: 14px 18px; border-radius: 12px; color: #fff; transition: 0.4s;
      font-size: 0.95rem;
    }
    .form-group input:focus { border-color: #D4AF37; outline: none; background: #000; box-shadow: 0 0 20px rgba(212, 175, 55, 0.15); }
    
    .forgot-link-row { text-align: right; margin-bottom: 25px; }
    .forgot-link { color: #D4AF37; font-size: 0.8rem; font-weight: 700; opacity: 0.7; transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px; }
    .forgot-link:hover { opacity: 1; text-decoration: none; color: #fff; }
    
    .btn-luxe-premium {
      width: 100%; background: linear-gradient(135deg, #D4AF37, #8B732A); color: #000; 
      padding: 18px; border: none; border-radius: 16px; font-weight: 900; 
      font-size: 0.9rem; cursor: pointer; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
      letter-spacing: 1.5px; text-transform: uppercase;
    }
    .btn-luxe-premium:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(212, 175, 55, 0.5); filter: brightness(1.1); }
    .btn-luxe-premium:disabled { background: #222; color: #444; cursor: not-allowed; }

    .trust-badge-premium { 
      display: flex; align-items: center; justify-content: center; gap: 10px; 
      margin-top: 15px; color: #444; font-size: 0.65rem; font-weight: 900; letter-spacing: 1px;
    }
    .gold-text { color: #D4AF37; }

    .premium-divider { height: 1px; background: linear-gradient(90deg, transparent, #D4AF3744, transparent); margin: 20px 0; }
    .auth-footer { text-align: center; color: #777; font-size: 0.85rem; margin: 0; font-weight: 500; }
    .auth-footer a { color: #D4AF37; font-weight: 800; margin-left: 5px; text-decoration: none; transition: 0.3s; }
    .auth-footer a:hover { color: #fff; text-decoration: underline; }

    .error-msg { color: #ff5252; background: rgba(255, 82, 82, 0.08); padding: 14px; border-radius: 12px; margin-bottom: 25px; font-size: 0.85rem; text-align: center; border: 1px solid rgba(255, 82, 82, 0.2); font-weight: 600; }
  `]
})
export class LoginComponent {
    email = ''; password = ''; error = ''; loading = false;

    constructor(private authService: AuthService, private router: Router) { }

    login() {
        this.error = '';
        if (!this.email || !this.password) { this.error = 'Please fill in all fields'; return; }
        this.loading = true;
        this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: (res) => {
                if (res.user.role === 'admin') this.router.navigate(['/admin']);
                else this.router.navigate(['/dashboard']);
            },
            error: (err) => { this.error = err.error?.message || 'Login failed'; this.loading = false; }
        });
    }
}
