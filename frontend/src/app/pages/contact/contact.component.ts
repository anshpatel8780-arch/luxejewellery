import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="contact-page">
      <div class="contact-hero">
        <div class="container">
          <h1>Get In <span class="gold">Touch</span></h1>
          <p>We'd love to hear from you</p>
        </div>
      </div>

      <div class="container">
        <div class="contact-layout">
          <div class="contact-form">
            <h2>Send us a Message</h2>
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="form.name" placeholder="Your name" [disabled]="isSubmitting">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="form.email" placeholder="your@email.com" [disabled]="isSubmitting">
            </div>
            <div class="form-group">
              <label>Subject</label>
              <input type="text" [(ngModel)]="form.subject" placeholder="How can we help?" [disabled]="isSubmitting">
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea [(ngModel)]="form.message" placeholder="Tell us more..." rows="5" [disabled]="isSubmitting"></textarea>
            </div>
            
            <div *ngIf="message" class="alert" [class.success]="!isError" [class.error]="isError">
              {{message}}
            </div>

            <button class="btn btn-primary" (click)="send()" [disabled]="isSubmitting" style="width:100%">
              {{isSubmitting ? 'Sending...' : 'Send Message →'}}
            </button>
          </div>

          <div class="contact-info">
            <div class="info-card">
              <span class="info-icon">📍</span>
              <h3>Visit Us</h3>
              <p>123 Jewellery Lane<br>Mumbai, Maharashtra 400001<br>India</p>
            </div>
            <div class="info-card">
              <span class="info-icon">📞</span>
              <h3>Call Us</h3>
              <p>+91 98765 43210<br>Mon-Sat: 10AM - 8PM</p>
            </div>
            <div class="info-card">
              <span class="info-icon">✉️</span>
              <h3>Email Us</h3>
              <p>info&#64;kairo-jewellery.com<br>support&#64;kairo-jewellery.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-hero {
      padding: 80px 0 60px; text-align: center;
      background: linear-gradient(135deg, rgba(212,175,55,0.08), transparent);
      border-bottom: 1px solid #222;
    }
    .contact-hero h1 { font-size: 3rem; margin-bottom: 12px; }
    .gold { color: #D4AF37; }
    .contact-hero p { color: #777; font-size: 1.1rem; }
    .contact-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; padding: 60px 0; }
    .contact-form { background: #1E1E1E; border: 1px solid #333; border-radius: 12px; padding: 32px; }
    .contact-form h2 { color: #D4AF37; margin-bottom: 24px; font-family: 'Poppins'; font-size: 1.2rem; }
    .contact-info { display: flex; flex-direction: column; gap: 20px; }
    .info-card {
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px;
      padding: 28px; transition: 0.3s;
    }
    .info-card:hover { border-color: rgba(212,175,55,0.4); }
    .info-icon { font-size: 2rem; display: block; margin-bottom: 12px; }
    .info-card h3 { color: #D4AF37; margin-bottom: 8px; font-family: 'Poppins'; }
    .info-card p { color: #777; line-height: 1.7; font-size: 0.9rem; }
    .alert { padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; }
    .alert.success { background: rgba(39, 174, 96, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
    .alert.error { background: rgba(231, 76, 60, 0.15); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3); }
    @media (max-width: 768px) { .contact-layout { grid-template-columns: 1fr; } }
  `]
})
export class ContactComponent implements OnInit {
  form = { name: '', email: '', subject: '', message: '' };
  isSubmitting = false;
  message = '';
  isError = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.form.name = user.name || '';
      this.form.email = user.email || '';
    }
  }

  send() {
    if (!this.form.name || !this.form.email || !this.form.message) {
      this.message = 'Please fill in all required fields.';
      this.isError = true;
      return;
    }

    this.isSubmitting = true;
    this.message = '';
    
    this.http.post('http://localhost:9000/api/contact', this.form).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.message = res.message || 'Message sent successfully!';
        this.isError = false;
        this.form = { ...this.form, message: '', subject: '' }; // Keep name/email, clear content
        setTimeout(() => this.message = '', 5000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.message = err.error?.message || 'Failed to send message. Please try again later.';
        this.isError = true;
      }
    });
  }
}
