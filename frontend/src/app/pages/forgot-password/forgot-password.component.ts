import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OtpService } from '../../services/otp.service';

type Step = 'email' | 'otp' | 'password' | 'done';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <section class="auth-page">
      <div class="auth-card animate-fadeInUp">

        <div class="auth-header">
          <span class="auth-icon">🔐</span>
          <h1>Forgot Password</h1>
          <p>{{ stepSubtitle }}</p>
        </div>

        <div class="step-bar">
          <div class="step-item" [class.active]="step === 'email'" [class.done]="stepIndex > 0">
            <div class="step-dot">{{ stepIndex > 0 ? '✓' : '1' }}</div>
            <span>Email</span>
          </div>
          <div class="step-line" [class.filled]="stepIndex > 0"></div>
          <div class="step-item" [class.active]="step === 'otp'" [class.done]="stepIndex > 1">
            <div class="step-dot">{{ stepIndex > 1 ? '✓' : '2' }}</div>
            <span>Verify OTP</span>
          </div>
          <div class="step-line" [class.filled]="stepIndex > 1"></div>
          <div class="step-item" [class.active]="step === 'password' || step === 'done'" [class.done]="step === 'done'">
            <div class="step-dot">{{ step === 'done' ? '✓' : '3' }}</div>
            <span>New Password</span>
          </div>
        </div>

        <form *ngIf="step === 'email'" (ngSubmit)="sendOtp()" class="otp-form">
          <div class="form-group">
            <label>Registered Email Address</label>
            <input type="email" [(ngModel)]="email" name="email"
                   placeholder="your@email.com" required autocomplete="email" />
          </div>
          <div *ngIf="error" class="error-msg">{{ error }}</div>
          <div *ngIf="successMsg" class="success-msg">{{ successMsg }}</div>
          <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
            <span *ngIf="!loading">Send OTP →</span>
            <span *ngIf="loading" class="spinner"></span>
          </button>
          <p class="auth-footer">Remember your password? <a routerLink="/login">Sign In</a></p>
        </form>

        <form *ngIf="step === 'otp'" (ngSubmit)="verifyOtp()" class="otp-form">
          <p class="otp-hint">We sent a 6-digit code to <strong>{{ email }}</strong></p>

          <!-- 6-box OTP input -->
          <div class="otp-boxes">
            <input *ngFor="let i of [0,1,2,3,4,5]"
                   type="text" maxlength="1" inputmode="numeric"
                   class="otp-box"
                   [id]="'otp-box-' + i"
                   [(ngModel)]="otpDigits[i]" [name]="'d' + i"
                   (input)="onDigitInput($event, i)"
                   (keydown)="onDigitKeydown($event, i)"
                   (paste)="onPaste($event)" />
          </div>

          <div *ngIf="error" class="error-msg">{{ error }}</div>
          <div *ngIf="successMsg" class="success-msg">{{ successMsg }}</div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="loading || otpValue.length < 6">
            <span *ngIf="!loading">Verify Code →</span>
            <span *ngIf="loading" class="spinner"></span>
          </button>

          <div class="resend-row">
            <span *ngIf="resendCooldown > 0" class="cooldown-text">Resend in {{ resendCooldown }}s</span>
            <button type="button" *ngIf="resendCooldown === 0" class="link-btn" (click)="resendOtp()">
              Resend OTP
            </button>
          </div>
          <p class="auth-footer"><a (click)="goBack()" class="link-btn">← Change email</a></p>
        </form>

        <form *ngIf="step === 'password'" (ngSubmit)="resetPassword()" class="otp-form">
          <div class="form-group">
            <label>New Password</label>
            <div class="input-eye">
              <input [type]="showPass ? 'text' : 'password'"
                     [(ngModel)]="newPassword" name="newPassword"
                     placeholder="Min. 6 characters" required />
              <button type="button" class="eye-btn" (click)="showPass = !showPass">
                {{ showPass ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <div class="input-eye">
              <input [type]="showConfirm ? 'text' : 'password'"
                     [(ngModel)]="confirmPassword" name="confirmPassword"
                     placeholder="Re-enter password" required />
              <button type="button" class="eye-btn" (click)="showConfirm = !showConfirm">
                {{ showConfirm ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div *ngIf="error" class="error-msg">{{ error }}</div>
          <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
            <span *ngIf="!loading">Reset Password →</span>
            <span *ngIf="loading" class="spinner"></span>
          </button>
        </form>

        <div *ngIf="step === 'done'" class="done-state">
          <div class="done-icon">✅</div>
          <h2>Password Reset!</h2>
          <p>Your password has been updated successfully. You can now sign in.</p>
          <a routerLink="/login" class="btn btn-primary">Go to Login</a>
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
      padding: 48px 40px; width: 100%; max-width: 460px;
    }
    .auth-header { text-align: center; margin-bottom: 28px; }
    .auth-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
    .auth-header h1 { color: #fff; font-size: 1.8rem; margin-bottom: 8px; }
    .auth-header p { color: #777; font-size: 0.9rem; }

    /* Step bar */
    .step-bar { display: flex; align-items: center; justify-content: center; margin-bottom: 32px; gap: 0; }
    .step-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-dot {
      width: 34px; height: 34px; border-radius: 50%; border: 2px solid #444;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700; color: #666; background: #1a1a1a;
      transition: all 0.3s ease;
    }
    .step-item.active .step-dot { border-color: #D4AF37; color: #D4AF37; box-shadow: 0 0 12px rgba(212,175,55,0.3); }
    .step-item.done .step-dot { border-color: #27AE60; background: #27AE60; color: #fff; }
    .step-item span { font-size: 0.72rem; color: #666; }
    .step-item.active span, .step-item.done span { color: #D4AF37; }
    .step-line { flex: 1; height: 2px; background: #333; margin: 0 6px; margin-bottom: 18px; transition: background 0.3s; min-width: 32px; }
    .step-line.filled { background: #27AE60; }

    .otp-form { display: flex; flex-direction: column; gap: 4px; }

    .otp-hint { color: #B0B0B0; font-size: 0.88rem; text-align: center; margin-bottom: 20px; }
    .otp-hint strong { color: #D4AF37; }

    /* OTP boxes */
    .otp-boxes { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
    .otp-box {
      width: 52px; height: 60px;
      background: #252525; border: 2px solid #444; border-radius: 10px;
      text-align: center; font-size: 1.6rem; font-weight: 700; color: #D4AF37;
      transition: all 0.2s ease; caret-color: #D4AF37;
    }
    .otp-box:focus { border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212,175,55,0.2); outline: none; }

    .error-msg { color: #E74C3C; background: rgba(231,76,60,0.1); padding: 12px 14px; border-radius: 8px; font-size: 0.88rem; margin-bottom: 4px; }
    .success-msg { color: #27AE60; background: rgba(39,174,96,0.1); padding: 12px 14px; border-radius: 8px; font-size: 0.88rem; margin-bottom: 4px; }

    .w-full { width: 100%; margin-top: 8px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; transition: all 0.3s ease; cursor: pointer; }
    .btn-primary { background: linear-gradient(135deg, #D4AF37, #B8960C); color: #0D0D0D; border: none; }
    .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #E8CC6E, #D4AF37); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(212,175,55,0.25); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .resend-row { text-align: center; margin-top: 12px; }
    .cooldown-text { color: #777; font-size: 0.85rem; }
    .link-btn { background: none; border: none; color: #D4AF37; cursor: pointer; font-size: 0.85rem; font-weight: 600; padding: 0; text-decoration: underline; }

    .auth-footer { text-align: center; margin-top: 16px; color: #777; font-size: 0.88rem; }
    .auth-footer a { color: #D4AF37; font-weight: 600; cursor: pointer; }

    /* Password eye */
    .input-eye { position: relative; }
    .input-eye input { width: 100%; padding: 14px 44px 14px 16px; background: #1A1A1A; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 0.95rem; }
    .input-eye input:focus { border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212,175,55,0.15); outline: none; }
    .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0; }

    /* Spinner */
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(0,0,0,0.3); border-top-color: #0D0D0D; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Done state */
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
export class ForgotPasswordComponent implements OnDestroy {
    step: Step = 'email';
    email = '';
    otpDigits: string[] = ['', '', '', '', '', ''];
    newPassword = '';
    confirmPassword = '';
    error = '';
    successMsg = '';
    loading = false;
    showPass = false;
    showConfirm = false;
    resendCooldown = 0;
    private cooldownTimer: any;

    constructor(private otpService: OtpService, private router: Router) {}

    get stepSubtitle(): string {
        const map: Record<Step, string> = {
            email: 'Enter your email to receive a reset code',
            otp: 'Enter the 6-digit code we sent you',
            password: 'Create a strong new password',
            done: 'All done!'
        };
        return map[this.step];
    }

    get stepIndex(): number {
        return { email: 0, otp: 1, password: 2, done: 3 }[this.step];
    }

    get otpValue(): string {
        return this.otpDigits.join('');
    }

    onDigitInput(event: Event, index: number) {
        const input = event.target as HTMLInputElement;
        const val = input.value.replace(/\D/g, '');
        this.otpDigits[index] = val ? val[val.length - 1] : '';
        if (val && index < 5) {
            (document.getElementById(`otp-box-${index + 1}`) as HTMLInputElement)?.focus();
        }
    }

    onDigitKeydown(event: KeyboardEvent, index: number) {
        if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
            (document.getElementById(`otp-box-${index - 1}`) as HTMLInputElement)?.focus();
        }
    }

    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const text = event.clipboardData?.getData('text') || '';
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        digits.forEach((d, i) => { if (i < 6) this.otpDigits[i] = d; });
        const next = Math.min(digits.length, 5);
        (document.getElementById(`otp-box-${next}`) as HTMLInputElement)?.focus();
    }

    sendOtp() {
        this.error = ''; this.successMsg = '';
        if (!this.email) { this.error = 'Please enter your email address.'; return; }
        this.loading = true;
        this.otpService.sendOtp(this.email, 'forgot-password').subscribe({
            next: (res) => {
                this.loading = false;
                this.successMsg = res.message;
                this.step = 'otp';
                this.startResendCooldown(60);
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Failed to send OTP. Please try again.';
            }
        });
    }

    resendOtp() {
        this.error = ''; this.successMsg = '';
        this.loading = true;
        this.otpService.sendOtp(this.email, 'forgot-password').subscribe({
            next: (res) => {
                this.loading = false;
                this.successMsg = 'New OTP sent!';
                this.otpDigits = ['', '', '', '', '', ''];
                this.startResendCooldown(60);
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Failed to resend OTP.';
            }
        });
    }

    verifyOtp() {
        this.error = ''; this.successMsg = '';
        if (this.otpValue.length < 6) { this.error = 'Please enter the full 6-digit code.'; return; }
        this.loading = true;
        this.otpService.verifyOtp(this.email, this.otpValue, 'forgot-password').subscribe({
            next: () => {
                this.loading = false;
                this.step = 'password';
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Invalid OTP. Please try again.';
            }
        });
    }

    resetPassword() {
        this.error = '';
        if (!this.newPassword || !this.confirmPassword) { this.error = 'Please fill in both password fields.'; return; }
        if (this.newPassword.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
        if (this.newPassword !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
        this.loading = true;
        this.otpService.resetPassword(this.email, this.otpValue, this.newPassword).subscribe({
            next: () => {
                this.loading = false;
                this.step = 'done';
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Password reset failed. Please try again.';
            }
        });
    }

    goBack() { this.step = 'email'; this.error = ''; this.successMsg = ''; }

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
