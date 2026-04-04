import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled" [class.mobile-open]="mobileOpen">
      <div class="nav-container">
        <a routerLink="/" class="logo">
          <img src="assets/logo.png" alt="LuxeJewels Logo" class="logo-img">
        </a>

        <div class="nav-links" [class.active]="mobileOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="closeMobile()">Home</a>
          <a routerLink="/shop" routerLinkActive="active" (click)="closeMobile()">Shop</a>
          <a routerLink="/about" routerLinkActive="active" (click)="closeMobile()">About</a>
          <a routerLink="/contact" routerLinkActive="active" (click)="closeMobile()">Contact</a>
          <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="active" (click)="closeMobile()">Admin</a>
          
          <!-- Mobile Only Auth -->
          <div class="mobile-auth-links">
            <a *ngIf="!isLoggedIn" routerLink="/login" class="btn btn-primary" (click)="closeMobile()">Login</a>
            <button *ngIf="isLoggedIn" (click)="logout()" class="btn btn-secondary">Logout</button>
          </div>
        </div>

        <div class="nav-icons">
          <a *ngIf="isLoggedIn" routerLink="/dashboard" [queryParams]="{tab: 'Wishlist'}" class="icon-btn" title="Wishlist">
            <i class="fa-solid fa-heart"></i>
          </a>
          <a routerLink="/cart" class="icon-btn" title="Cart">
            <i class="fa-solid fa-cart-shopping"></i>
            <span *ngIf="cartCount > 0" class="cart-badge">{{cartCount}}</span>
          </a>
          <a *ngIf="isAdmin" routerLink="/admin" class="icon-btn" title="Admin Panel">
            <i class="fa-solid fa-user-shield"></i>
          </a>
          <a *ngIf="isLoggedIn" routerLink="/dashboard" class="icon-btn profile-btn" title="Dashboard">
            <i *ngIf="!user?.image" class="fa-solid fa-user"></i>
            <img *ngIf="user?.image" [src]="user.image.startsWith('http') ? user.image : 'http://localhost:9000' + user.image" class="nav-profile-img" alt="Profile">
          </a>
          <a *ngIf="!isLoggedIn" routerLink="/login" class="btn btn-primary btn-sm">Login</a>
          <button class="hamburger" (click)="toggleMobile()">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
      width: 95%; max-width: 1400px; z-index: 1000;
      padding: 12px 24px; transition: all 0.4s ease;
      background: rgba(15, 15, 15, 0.4);
      backdrop-filter: blur(10px) saturate(180%);
      border: 1px solid rgba(212, 175, 55, 0.15);
      border-radius: 60px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .navbar.scrolled {
      top: 30px;
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(25px) saturate(200%);
      border-color: rgba(212, 175, 55, 0.4);
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6);
      padding: 10px 24px;
    }
    .nav-container {
      margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo { 
      display: flex; align-items: center; gap: 12px;
      transition: 0.3s;
    }
    .logo-img { height: 45px; width: 45px; object-fit: cover; border-radius: 50%; border: 1.5px solid #D4AF37; background: #000; transition: 0.3s; }
    .gold { color: #D4AF37; }
    .nav-links { display: flex; gap: 35px; align-items: center; }
    .nav-links a {
      color: #D0D0D0; font-weight: 500; font-size: 0.9rem;
      position: relative; padding: 8px 4px; transition: all 0.3s;
      letter-spacing: 1px; text-transform: uppercase;
    }
    .nav-links a:hover, .nav-links a.active { color: #D4AF37; }
    .nav-links a::after {
      content: ''; position: absolute; bottom: 0; left: 50%;
      width: 0; height: 2px; background: #D4AF37;
      transition: all 0.3s; transform: translateX(-50%);
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
    }
    .nav-links a:hover::after, .nav-links a.active::after { width: 100%; }
    
    .nav-icons { display: flex; align-items: center; gap: 18px; }
    .icon-btn {
      background: none; border: none; color: #D0D0D0; font-size: 1.15rem;
      cursor: pointer; position: relative; width: 42px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s; border-radius: 50%; padding: 0;
    }
    .icon-btn:hover { color: #D4AF37; background: rgba(212, 175, 55, 0.12); transform: translateY(-2px); }
    
    .nav-profile-img { 
      width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
      border: 2px solid #D4AF37; box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
    }
    .profile-btn { padding: 0; overflow: hidden; }
    .cart-badge {
      position: absolute; top: -2px; right: -2px;
      background: #D4AF37; color: #0D0D0D;
      font-size: 0.7rem; font-weight: 800;
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
    }
    .hamburger { display: none; flex-direction: column; gap: 6px; background: none; border: none; cursor: pointer; padding: 10px; }
    .hamburger span { width: 26px; height: 2.5px; background: #D4AF37; transition: 0.3s; border-radius: 2px; }
    
    .mobile-open .hamburger span:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }
    .mobile-open .hamburger span:nth-child(2) { opacity: 0; }
    .mobile-open .hamburger span:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }

    @media (max-width: 1024px) {
      .navbar { width: 90%; }
      .nav-links { gap: 25px; }
    }

    @media (max-width: 640px) {
      .navbar { 
        width: 100%; border-radius: 0; top: 0; border-left: none; border-right: none; border-top: none; 
        padding: 10px 20px; background: rgba(10, 10, 10, 0.95);
      }
      .navbar.scrolled { top: 0; border-radius: 0; }
      .hamburger { display: flex; order: 3; }
      .logo { order: 1; }
      .nav-icons { order: 2; gap: 12px; }
      .icon-btn { width: 36px; height: 36px; font-size: 1rem; }
      .btn-sm { display: none; } /* Hide login button on small mobile icons row, put in menu instead */
      
      .nav-links {
        position: fixed; top: 0; left: 0; transform: translateX(100%);
        width: 100%; height: 100vh; border-radius: 0;
        background: #0D0D0D; flex-direction: column; 
        justify-content: center; align-items: center; gap: 20px; padding: 0;
        transition: 0.5s cubic-bezier(0.77, 0.2, 0.05, 1.0);
        opacity: 0; pointer-events: none; border: none;
        z-index: 999;
      }
      .nav-links.active { transform: translateX(0); opacity: 1; pointer-events: all; }
      .nav-links a { 
        padding: 20px; font-size: 1.5rem; text-align: center; border: none; 
        width: auto; font-family: 'Playfair Display', serif;
      }
      .nav-links a::after { display: none; }
      
      .mobile-auth-links { 
        display: flex; flex-direction: column; gap: 15px; margin-top: 30px; width: 80%; max-width: 300px;
      }
      .mobile-auth-links .btn { width: 100%; text-align: center; }
    }

    .mobile-auth-links { display: none; }
  `]
})
export class NavbarComponent {
  isScrolled = false;
  mobileOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  user: any = null;
  cartCount = 0;

  constructor(private authService: AuthService, private cartService: CartService) {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      if (user) {
        this.cartService.getCart().subscribe(cart => {
          this.cartCount = cart.products?.length || 0;
        });
      } else {
        this.cartCount = 0;
      }
    });
    this.cartService.cartCount$.subscribe(count => this.cartCount = count);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMobile() { this.mobileOpen = !this.mobileOpen; }
  closeMobile() { this.mobileOpen = false; }

  logout() {
    this.authService.logout();
    this.cartService.resetCount();
    this.closeMobile();
  }
}
