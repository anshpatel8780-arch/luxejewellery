import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { OtpService } from '../../services/otp.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <section class="auth-page">
      <div class="auth-card animate-fadeInUp">

        <div class="auth-header">
          <span class="auth-icon">✉️</span>
          <h1>Verify Your Email</h1>
          <p *ngIf="!verified">Enter the 6-digit code sent to <strong>{{ email }}</strong></p>
          <p *ngIf="verified">Your email is now verified!</p>
        </div>

        <form *ngIf="!verified" (ngSubmit)="verifyOtp()" class="otp-form">

          <div class="otp-boxes">
            <input *ngFor="let i of [0,1,2,3,4,5]"
                   type="text" maxlength="1" inputmode="numeric"
                   class="otp-box"
                   [id]="'ve-box-' + i"
                   [(ngModel)]="otpDigits[i]" [name]="'d' + i"
                   (input)="onDigitInput($event, i)"
                   (keydown)="onDigitKeydown($event, i)"
                   (paste)="onPaste($event)" />
          </div>

          <div *ngIf="error" class="error-msg">{{ error }}</div>
          <div *ngIf="successMsg" class="success-msg">{{ successMsg }}</div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="loading || otpValue.length < 6">
            <span *ngIf="!loading">Verify Email →</span>
            <span *ngIf="loading" class="spinner"></span>
          </button>

          <div class="resend-row">
            <span *ngIf="resendCooldown > 0" class="cooldown-text">Resend code in {{ resendCooldown }}s</span>
            <button type="button" *ngIf="resendCooldown === 0" class="link-btn" (click)="resendOtp()">
              Resend OTP
            </button>
          </div>

          <p class="auth-footer">Wrong email? <a routerLink="/register">Go back to Register</a></p>
        </form>

        <div *ngIf="verified" class="done-state">
          <div class="done-icon">🎉</div>
          <h2>Email Verified!</h2>
          <p>Your Luxé account is now active. Enjoy exploring our exclusive collection.</p>
          <a routerLink="/login" class="btn btn-primary">Sign In Now →</a>
        </div>

      </div>
    </section>
  `,
    styles: [`
    .auth-page {
      min-height: calc(100vh - 70px);
      display: flex; align-items: center; justify-content: center;
      padding: 40px 20px;
      background: radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 60%);
    }
    .auth-card {
      background: #1E1E1E; border: 1px solid #333; border-radius: 16px;
      padding: 48px 40px; width: 100%; max-width: 440px;
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
    .auth-header h1 { color: #fff; font-size: 1.8rem; margin-bottom: 8px; }
    .auth-header p { color: #777; font-size: 0.9rem; }
    .auth-header strong { color: #D4AF37; }

    .otp-form { display: flex; flex-direction: column; gap: 4px; }

    .otp-boxes { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
    .otp-box {
      width: 52px; height: 60px;
      background: #252525; border: 2px solid #444; border-radius: 10px;
      text-align: center; font-size: 1.6rem; font-weight: 700; color: #D4AF37;
      transition: all 0.2s ease; caret-color: #D4AF37;
    }
    .otp-box:focus { border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212,175,55,0.2); outline: none; }

    .error-msg { color: #E74C3C; background: rgba(231,76,60,0.1); padding: 12px 14px; border-radius: 8px; font-size: 0.88rem; }
    .success-msg { color: #27AE60; background: rgba(39,174,96,0.1); padding: 12px 14px; border-radius: 8px; font-size: 0.88rem; }

    .w-full { width: 100%; margin-top: 8px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; transition: all 0.3s ease; cursor: pointer; }
    .btn-primary { background: linear-gradient(135deg, #D4AF37, #B8960C); color: #0D0D0D; border: none; }
    .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #E8CC6E, #D4AF37); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(212,175,55,0.25); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .resend-row { text-align: center; margin-top: 12px; }
    .cooldown-text { color: #777; font-size: 0.85rem; }
    .link-btn { background: none; border: none; color: #D4AF37; cursor: pointer; font-size: 0.85rem; font-weight: 600; padding: 0; text-decoration: underline; }

    .auth-footer { text-align: center; margin-top: 16px; color: #777; font-size: 0.88rem; }
    .auth-footer a { color: #D4AF37; font-weight: 600; }

    .spinner { width: 18px; height: 18px; border: 2px solid rgba(0,0,0,0.3); border-top-color: #0D0D0D; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .done-state { text-align: center; padding: 16px 0; }
    .done-icon { font-size: 4rem; margin-bottom: 16px; animation: bounceIn 0.5s ease; }
    .done-state h2 { color: #27AE60; font-size: 1.6rem; margin-bottom: 12px; }
    .done-state p { color: #B0B0B0; margin-bottom: 28px; line-height: 1.6; }
    @keyframes bounceIn { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }

    @media (max-width: 480px) {
      .auth-card { padding: 32px 20px; }
      .otp-box { width: 44px; height: 52px; font-size: 1.4rem; }
    }
  `]
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
    email = '';
    otpDigits: string[] = ['', '', '', '', '', ''];
    error = '';
    successMsg = '';
    loading = false;
    verified = false;
    resendCooldown = 0;
    private cooldownTimer: any;

    constructor(
        private otpService: OtpService,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        // Accept email from query param e.g. /verify-email?email=user@example.com
        this.route.queryParams.subscribe(params => {
            this.email = params['email'] || '';
        });
        // Start with a 60s cooldown so user can't immediately spam resend
        this.startResendCooldown(60);
    }

    get otpValue(): string {
        return this.otpDigits.join('');
    }

    onDigitInput(event: Event, index: number) {
        const input = event.target as HTMLInputElement;
        const val = input.value.replace(/\D/g, '');
        this.otpDigits[index] = val ? val[val.length - 1] : '';
        if (val && index < 5) {
            (document.getElementById(`ve-box-${index + 1}`) as HTMLInputElement)?.focus();
        }
    }

    onDigitKeydown(event: KeyboardEvent, index: number) {
        if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
            (document.getElementById(`ve-box-${index - 1}`) as HTMLInputElement)?.focus();
        }
    }

    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const text = event.clipboardData?.getData('text') || '';
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        digits.forEach((d, i) => { if (i < 6) this.otpDigits[i] = d; });
        const next = Math.min(digits.length, 5);
        (document.getElementById(`ve-box-${next}`) as HTMLInputElement)?.focus();
    }

    verifyOtp() {
        this.error = ''; this.successMsg = '';
        if (this.otpValue.length < 6) { this.error = 'Please enter the full 6-digit code.'; return; }
        this.loading = true;
        this.otpService.verifyOtp(this.email, this.otpValue, 'register-verify').subscribe({
            next: () => { 
                const tempData = localStorage.getItem('temp_reg_data');
                if (tempData) {
                    const data = JSON.parse(tempData);
                    this.authService.register(data).subscribe({
                        next: () => {
                            this.loading = false;
                            this.verified = true;
                            localStorage.removeItem('temp_reg_data');
                        },
                        error: (err) => {
                            this.loading = false;
                            this.error = err.error?.message || 'Registration completion failed. Please try again.';
                        }
                    });
                } else {
                    this.loading = false;
                    this.verified = true;
                }
            },
            error: (err) => { this.loading = false; this.error = err.error?.message || 'Invalid OTP.'; }
        });
    }

    resendOtp() {
        this.error = ''; this.successMsg = '';
        this.loading = true;
        this.otpService.sendOtp(this.email, 'register-verify').subscribe({
            next: () => {
                this.loading = false;
                this.successMsg = 'New OTP sent to your email!';
                this.otpDigits = ['', '', '', '', '', ''];
                this.startResendCooldown(60);
            },
            error: (err) => { this.loading = false; this.error = err.error?.message || 'Failed to resend OTP.'; }
        });
    }

    private startResendCooldown(seconds: number) {
        this.resendCooldown = seconds;
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = setInterval(() => {
            this.resendCooldown--;
            if (this.resendCooldown <= 0) clearInterval(this.cooldownTimer);
        }, 1000);
    }

    ngOnDestroy() { clearInterval(this.cooldownTimer); }
}
