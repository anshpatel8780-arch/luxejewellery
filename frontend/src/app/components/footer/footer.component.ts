import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink],
    template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <a routerLink="/" class="footer-logo">
              <img src="assets/logo.png" alt="LuxeJewels Logo" class="footer-logo-img">
            </a>
            <p>Discover the finest collection of handcrafted jewellery. Premium quality, timeless elegance, and exceptional craftsmanship since 1995.</p>
            <div class="social-links">
              <a href="#" class="facebook" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
              <a href="#" class="instagram" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
              <a href="#" class="twitter" title="Twitter"><i class="fa-brands fa-x-twitter"></i></a>
              <a href="#" class="pinterest" title="Pinterest"><i class="fa-brands fa-pinterest-p"></i></a>
            </div>
          </div>

          <div class="footer-col">
            <h4>Quick Links</h4>
            <a routerLink="/">Home</a>
            <a routerLink="/shop">Shop</a>
            <a routerLink="/about">About Us</a>
            <a routerLink="/contact">Contact</a>
          </div>

          <div class="footer-col">
            <h4>Categories</h4>
            <a routerLink="/shop" [queryParams]="{category:'Rings'}">Rings</a>
            <a routerLink="/shop" [queryParams]="{category:'Necklaces'}">Necklaces</a>
            <a routerLink="/shop" [queryParams]="{category:'Earrings'}">Earrings</a>
            <a routerLink="/shop" [queryParams]="{category:'Bracelets'}">Bracelets</a>
            <a routerLink="/shop" [queryParams]="{category:'Watches'}">Watches</a>
          </div>

          <div class="footer-col">
            <h4>Contact Info</h4>
            <p><i class="fa-solid fa-location-dot"></i> 123 Jewellery Lane, Mumbai, India</p>
            <p><i class="fa-solid fa-phone"></i> +91 98765 43210</p>
            <p><i class="fa-solid fa-envelope"></i> info&#64;luxejewels.com</p>
            <p><i class="fa-solid fa-clock"></i> Mon-Sat: 10AM - 8PM</p>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2024 LuxeJewels. All Rights Reserved. Crafted with <i class="fa-solid fa-heart" style="color: #D4AF37;"></i></p>
        </div>
      </div>
    </footer>
  `,
    styles: [`
    .footer {
      background: #0A0A0A; border-top: 1px solid rgba(212,175,55,0.15);
      padding: 60px 0 0;
    }
    .footer-container { max-width: 1280px; margin: 0 auto; padding: 0 20px; }
    .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; }
    .footer-logo {
      display: inline-block; margin-bottom: 20px; transition: 0.3s;
    }
    .footer-logo-img { height: 60px; width: 60px; object-fit: cover; border-radius: 50%; border: 1.5px solid #D4AF37; background: #000; }
    .brand-col p { color: #777; font-size: 0.9rem; line-height: 1.7; margin-bottom: 20px; }
    .social-links { display: flex; gap: 12px; }
    .social-links a {
      width: 40px; height: 40px; border-radius: 50%;
      background: #1A1A1A; border: 1px solid #333;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: #B0B0B0; text-decoration: none; overflow: hidden;
    }
    .social-links a i { 
      line-height: 0;
      margin: 0; padding: 0;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .social-links a:hover { background: #D4AF37; border-color: #D4AF37; transform: translateY(-3px); }
    .social-links a:hover i { color: #0D0D0D; }
    .footer-col h4 {
      color: #D4AF37; font-family: 'Playfair Display', serif;
      font-size: 1.15rem; margin-bottom: 20px; position: relative;
    }
    .footer-col h4::after {
      content: ''; position: absolute; bottom: -8px; left: 0;
      width: 30px; height: 2px; background: #D4AF37;
    }
    .footer-col a, .footer-col p {
      display: block; color: #777; font-size: 0.9rem;
      margin-bottom: 10px; transition: all 0.3s;
    }
    .footer-col a:hover { color: #D4AF37; padding-left: 5px; }
    .footer-bottom {
      margin-top: 40px; padding: 20px 0;
      border-top: 1px solid #222; text-align: center;
    }
    .footer-bottom p { color: #555; font-size: 0.85rem; }
    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr; gap: 30px; }
    }
  `]
})
export class FooterComponent { }
