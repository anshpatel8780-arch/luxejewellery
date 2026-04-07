import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CouponService } from '../../services/coupon.service';
import { NotificationService } from '../../services/notification.service';
import { Product, Coupon } from '../../models/product.model';
import { Clipboard as CdkClipboard, ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ClipboardModule],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content animate-fadeInUp">
        <span class="hero-badge">✨ Premium Collection 2026</span>
        <h1>LuxeJewels<br><span class="gold">fine handcrafted jewellery</span></h1>
        <p>Discover exquisite handcrafted jewellery that reflects your unique style. Timeless elegance meets modern sophistication.</p>
        <div class="hero-btns">
          <a routerLink="/shop" class="btn btn-primary">Shop Now →</a>
          <a routerLink="/about" class="btn btn-secondary">Our Story</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">500+</span><span class="stat-label">Designs</span></div>
          <div class="stat"><span class="stat-num">10K+</span><span class="stat-label">Happy Customers</span></div>
          <div class="stat"><span class="stat-num">100%</span><span class="stat-label">Certified</span></div>
        </div>
      </div>
    </section>

    <!-- Exclusive Offers -->
    <section *ngIf="activeCoupons.length > 0" class="section offers-section animate-fadeIn">
      <div class="container">
        <div class="section-title">
          <span class="section-tag">Special Rewards</span>
          <h2>Exclusive Offers</h2>
        </div>
        <div class="coupons-container">
          <div *ngFor="let coupon of activeCoupons" class="coupon-card">
            <div class="coupon-left">
              <span class="disc-val">{{coupon.discountValue}}{{coupon.discountType === 'percentage' ? '%' : ''}}</span>
              <span class="disc-off">OFF</span>
            </div>
            <div class="coupon-right">
              <div class="coupon-info">
                <h3>{{coupon.code}}</h3>
                <p>{{coupon.description || 'Spend ₹' + (coupon.minOrderAmount | number) + ' or more'}}</p>
                <span class="expiry">Valid till {{coupon.expiryDate | date:'mediumDate'}}</span>
              </div>
              <button class="copy-btn" (click)="copyCode(coupon.code)">
                <i class="fa-solid fa-copy"></i> Copy
              </button>
            </div>
            <div class="card-dots"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="section" id="featured">
      <div class="container">
        <div class="section-title">
          <span class="section-tag">Handpicked For You</span>
          <h2>Featured Products</h2>
          <p>Our most loved pieces curated just for you</p>
        </div>
        <div class="products-grid">
          <div *ngFor="let product of featuredProducts; let i = index" class="product-card animate-fadeInUp" [style.animation-delay]="i * 0.1 + 's'">
            <div class="product-image">
              <img [src]="product.images[0]" [alt]="product.name" loading="lazy">
              <div class="product-overlay">
                <a [routerLink]="['/product', product._id]" class="btn btn-primary btn-sm">View Details</a>
              </div>
              <span *ngIf="product.bestSeller" class="product-badge">Best Seller</span>
            </div>
            <div class="product-info">
              <h3>{{product.name}}</h3>
              <div class="product-meta">
                <span class="product-price">₹{{product.price | number}}</span>
                <span class="stars">{{getStars(product.rating)}}</span>
              </div>
              <span class="product-type">{{product.goldType}} • {{product.weight}}</span>
            </div>
          </div>
        </div>
        <div class="section-cta">
          <a routerLink="/shop" class="btn btn-secondary">View All Products →</a>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="section categories-section">
      <div class="container">
        <div class="section-title">
          <span class="section-tag">Browse By</span>
          <h2>Shop Categories</h2>
          <p>Find your perfect piece from our curated collections</p>
        </div>
        <div class="categories-grid">
          <a *ngFor="let cat of categories" [routerLink]="['/shop']" [queryParams]="{category: cat.name}" class="category-card">
            <div class="category-image">
              <img [src]="cat.image" [alt]="cat.name" loading="lazy">
              <div class="category-overlay">
                <h3>{{cat.name}}</h3>
                <span>Explore →</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Best Sellers Carousel -->
    <section class="section">
      <div class="container">
        <div class="section-title">
          <span class="section-tag">Most Popular</span>
          <h2>Best Sellers</h2>
          <p>Our customers' favourite picks</p>
        </div>
        <div class="carousel">
          <button class="carousel-btn prev" (click)="prevSlide()">‹</button>
          <div class="carousel-track" [style.transform]="'translateX(-' + currentSlide * 280 + 'px)'">
        <div *ngFor="let product of bestSellers" class="carousel-item">
          <a [routerLink]="['/product', product._id]" class="best-seller-card">
            <div class="best-seller-image">
              <img [src]="product.images[0]" [alt]="product.name" loading="lazy">
              <div class="best-seller-overlay">
                <h3>{{product.name}}</h3>
                <span class="price">₹{{product.price | number}}</span>
                <span class="explore">View Details →</span>
              </div>
            </div>
          </a>
        </div>
          </div>
          <button class="carousel-btn next" (click)="nextSlide()">›</button>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="section why-section">
      <div class="container">
        <div class="section-title">
          <span class="section-tag">Why LuxeJewels</span>
          <h2>Why Choose Us</h2>
        </div>
        <div class="why-grid">
          <div *ngFor="let item of whyUs" class="why-card">
            <span class="why-icon">{{item.icon}}</span>
            <h3>{{item.title}}</h3>
            <p>{{item.desc}}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="section">
      <div class="container">
        <div class="section-title">
          <span class="section-tag">What Our Customers Say</span>
          <h2>Testimonials</h2>
        </div>
        <div class="testimonials-grid">
          <div *ngFor="let t of testimonials" class="testimonial-card">
            <div class="testimonial-stars">{{getStars(t.rating)}}</div>
            <p class="testimonial-text">"{{t.text}}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{t.name.charAt(0)}}</div>
              <div>
                <strong>{{t.name}}</strong>
                <span>{{t.location}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="section newsletter-section">
      <div class="container">
        <div class="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to get exclusive offers, new arrivals, and styling tips delivered to your inbox.</p>
          <div class="newsletter-form">
            <input type="email" [(ngModel)]="email" placeholder="Enter your email address">
            <button class="btn btn-primary" (click)="subscribe()">Subscribe</button>
          </div>
          <span *ngIf="subscribed" class="subscribe-msg">✓ Thank you for subscribing!</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Hero */
    .hero {
      height: 90vh; display: flex; align-items: center; justify-content: center;
      background: url('https://images.unsplash.com/photo-1515562141589-67f0d569b4b7?w=1600') center/cover no-repeat;
      position: relative; margin-top: 0;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.7) 50%, rgba(13,13,13,0.85) 100%);
    }
    .hero-content {
      position: relative; z-index: 2; text-align: center;
      max-width: 800px; padding: 120px 20px 0;
    }
    .hero-badge {
      display: inline-block; padding: 8px 24px;
      border: 1px solid rgba(212,175,55,0.4); border-radius: 30px;
      color: #D4AF37; font-size: 0.85rem; font-weight: 500;
      margin-bottom: 24px; letter-spacing: 1px;
      background: rgba(212,175,55,0.05);
    }
    .hero-content h1 {
      font-size: 4rem; font-weight: 800; line-height: 1.1;
      margin-bottom: 20px; color: #fff;
    }
    .gold { color: #D4AF37; }
    .hero-content p { color: #B0B0B0; font-size: 1.1rem; max-width: 550px; margin: 0 auto 32px; }
    .hero-btns { display: flex; gap: 16px; justify-content: center; margin-bottom: 48px; }
    .hero-stats {
      display: flex; gap: 48px; justify-content: center;
      border-top: 1px solid rgba(212,175,55,0.15); padding-top: 32px;
    }
    .stat { text-align: center; }
    .stat-num { display: block; font-size: 1.8rem; font-weight: 700; color: #D4AF37; font-family: 'Playfair Display', serif; }
    .stat-label { color: #777; font-size: 0.85rem; }

    /* Section tags */
    .section-tag {
      display: inline-block; color: #D4AF37; font-size: 0.85rem;
      font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
      margin-bottom: 8px;
    }

    /* Product Grid & Cards */
    .products-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
    .product-card {
      background: #1E1E1E; border-radius: 12px; overflow: hidden;
      border: 1px solid #333; transition: all 0.3s;
    }
    .product-card:hover { border-color: rgba(212,175,55,0.4); transform: translateY(-6px); box-shadow: 0 20px 50px rgba(212,175,55,0.12); }
    .product-image {
      position: relative; overflow: hidden; aspect-ratio: 1;
      background: #161616;
    }
    .product-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .product-card:hover .product-image img { transform: scale(1.08); }
    .product-overlay {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.5); opacity: 0; transition: 0.3s;
    }
    .product-card:hover .product-overlay { opacity: 1; }
    .product-badge {
      position: absolute; top: 12px; left: 12px;
      background: linear-gradient(135deg, #D4AF37, #B8960C);
      color: #0D0D0D; padding: 4px 12px; border-radius: 20px;
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    }
    .product-info { padding: 16px; }
    .product-info h3 { font-size: 1rem; font-weight: 600; margin-bottom: 8px; color: #fff; font-family: 'Poppins', sans-serif; }
    .product-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .product-price { color: #D4AF37; font-weight: 700; font-size: 1.1rem; }
    .stars { color: #D4AF37; font-size: 0.8rem; }
    .product-type { color: #777; font-size: 0.8rem; }
    .section-cta { text-align: center; margin-top: 40px; }

    /* Categories */
    .categories-section { background: #0A0A0A; }
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
    .category-card { border-radius: 12px; overflow: hidden; position: relative; aspect-ratio: 0.8; }
    .category-image { position: relative; width: 100%; height: 100%; }
    .category-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .category-card:hover img { transform: scale(1.1); }
    .category-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 24px; transition: 0.3s;
    }
    .category-overlay h3 { color: #fff; font-size: 1.15rem; margin-bottom: 4px; }
    .category-overlay span { color: #D4AF37; font-size: 0.85rem; font-weight: 500; }

    /* Carousel */
    .carousel { position: relative; overflow: hidden; padding: 20px 0; margin: 0 auto; max-width: 1200px; width: 100%; }
    .carousel-track { display: flex; gap: 24px; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .carousel-item { width: 280px; flex-shrink: 0; }
    .carousel-btn {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(212,175,55,0.15); border: 1px solid #D4AF37;
      color: #D4AF37; font-size: 1.5rem; cursor: pointer;
      z-index: 10; transition: 0.3s; display: flex; align-items: center; justify-content: center;
    }
    .carousel-btn:hover { background: #D4AF37; color: #0D0D0D; }
    .carousel-btn.prev { left: 0; }
    .carousel-btn.next { right: 0; }

    /* Best Seller Card (Matching Category Style) */
    .best-seller-card { 
      border-radius: 12px; overflow: hidden; position: relative; 
      aspect-ratio: 0.75; display: block; border: 1px solid #333;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .best-seller-image { position: relative; width: 100%; height: 100%; background: #161616; }
    .best-seller-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .best-seller-card:hover img { transform: scale(1.1); }
    .best-seller-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 20px; transition: 0.3s;
    }
    .best-seller-overlay h3 { color: #fff; font-size: 1rem; margin-bottom: 4px; font-family: 'Poppins', sans-serif; }
    .best-seller-overlay .price { color: #D4AF37; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; display: block; }
    .best-seller-overlay .explore { color: #D4AF37; font-size: 0.8rem; font-weight: 500; opacity: 0; transform: translateY(10px); transition: 0.3s; }
    .best-seller-card:hover .best-seller-overlay .explore { opacity: 1; transform: translateY(0); }

    /* Why Choose Us */
    .why-section { background: #0A0A0A; }
    .why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
    .why-card {
      text-align: center; padding: 40px 24px; border-radius: 12px;
      background: #1E1E1E; border: 1px solid #333; transition: 0.3s;
    }
    .why-card:hover { border-color: rgba(212,175,55,0.4); transform: translateY(-4px); }
    .why-icon { font-size: 2.5rem; display: block; margin-bottom: 16px; }
    .why-card h3 { color: #D4AF37; font-size: 1.1rem; margin-bottom: 8px; font-family: 'Poppins', sans-serif; }
    .why-card p { color: #777; font-size: 0.9rem; line-height: 1.6; }

    /* Testimonials */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
    .testimonial-card {
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px;
      padding: 32px; transition: 0.3s;
    }
    .testimonial-card:hover { border-color: rgba(212,175,55,0.4); transform: translateY(-4px); }
    .testimonial-stars { margin-bottom: 16px; color: #D4AF37; font-size: 1rem; }
    .testimonial-text { color: #B0B0B0; font-style: italic; line-height: 1.7; margin-bottom: 20px; font-size: 0.95rem; }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .author-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37, #B8960C);
      color: #0D0D0D; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1.1rem;
    }
    .testimonial-author strong { color: #fff; display: block; font-size: 0.95rem; }
    .testimonial-author span { color: #777; font-size: 0.8rem; }

    /* Newsletter */
    .newsletter-section {
      background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(13,13,13,1));
    }
    .newsletter-content { text-align: center; max-width: 600px; margin: 0 auto; }
    .newsletter-content h2 { color: #D4AF37; font-size: 2rem; margin-bottom: 12px; }
    .newsletter-content p { color: #B0B0B0; margin-bottom: 28px; }
    .newsletter-form { display: flex; gap: 12px; }
    .newsletter-form input {
      flex: 1; padding: 14px 20px; background: #1E1E1E; border: 1px solid #333;
      border-radius: 8px; color: #fff; font-size: 0.95rem;
    }
    .newsletter-form input:focus { border-color: #D4AF37; }
    .subscribe-msg { color: #27AE60; display: block; margin-top: 16px; font-weight: 500; }

    /* Responsive */
    @media (max-width: 1024px) {
      .hero-content h1 { font-size: 3.5rem; }
    }

    @media (max-width: 640px) {
      .hero { height: auto; min-height: 80vh; padding: 120px 0 60px; }
      .hero-content { padding-top: 0; }
      .hero-badge { font-size: 0.75rem; padding: 6px 18px; margin-bottom: 20px; }
      .hero-content h1 { font-size: 2.5rem; margin-bottom: 15px; }
      .hero-content p { font-size: 1rem; margin-bottom: 25px; color: #999; }
      .hero-btns { flex-direction: column; width: 100%; gap: 12px; }
      .hero-stats { gap: 20px; padding-top: 25px; margin-top: 30px; }
      .stat-num { font-size: 1.4rem; }
      .stat-label { font-size: 0.75rem; }
      
      .category-card { aspect-ratio: 1.2; }
      
      .carousel { overflow-x: auto; padding-right: 20px; scroll-snap-type: x mandatory; }
      .carousel-track { width: max-content; }
      .carousel-item { scroll-snap-align: start; }
      .carousel-btn { display: none; } /* Use touch scroll on mobile */
      
      .newsletter-form { flex-direction: column; width: 100%; }
      .newsletter-content h2 { font-size: 1.6rem; }
      
      .coupon-card { flex: 0 0 280px; height: 120px; }
      .coupon-left { width: 80px; }
      .disc-val { font-size: 1.4rem; }
      .card-dots { left: 75px; }
    }

    /* Coupon Card Styles */
    .offers-section { background: #0D0D0D; padding-top: 60px; padding-bottom: 20px; }
    .coupons-container { display: flex; gap: 24px; overflow-x: auto; padding: 20px 10px 40px; scrollbar-width: none; }
    .coupons-container::-webkit-scrollbar { display: none; }
    
    .coupon-card { 
      flex: 0 0 350px; height: 140px; display: flex; background: #1A1A1A; 
      border: 1px solid #333; border-radius: 12px; position: relative; overflow: hidden;
      transition: 0.3s;
    }
    .coupon-card:hover { border-color: #D4AF37; transform: translateY(-4px); box-shadow: 0 10px 30px rgba(212,175,55,0.1); }
    
    .coupon-left { 
      width: 100px; background: linear-gradient(135deg, #D4AF37, #B8960C); 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #0D0D0D; font-family: 'Playfair Display', serif;
    }
    .disc-val { font-size: 1.8rem; font-weight: 800; line-height: 1; }
    .disc-off { font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; }
    
    .coupon-right { flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
    .coupon-info h3 { color: #fff; font-size: 1.1rem; margin-bottom: 4px; letter-spacing: 1px; }
    .coupon-info p { color: #777; font-size: 0.8rem; margin-bottom: 8px; line-height: 1.2; }
    .expiry { color: #D4AF37; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    
    .copy-btn {
      align-self: flex-end; background: rgba(212,175,55,0.1); color: #D4AF37;
      border: 1px solid rgba(212,175,55,0.3); padding: 5px 12px; border-radius: 6px;
      font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: 0.3s;
    }
    .copy-btn:hover { background: #D4AF37; color: #0D0D0D; }
    
    .card-dots {
      position: absolute; left: 95px; top: -10px; bottom: -10px; width: 10px;
      display: flex; flex-direction: column; gap: 8px; justify-content: center; z-index: 2;
    }
    .card-dots::before, .card-dots::after {
      content: ''; position: absolute; left: -5px; width: 20px; height: 20px;
      background: #0D0D0D; border-radius: 50%;
    }
    .card-dots::before { top: -10px; }
    .card-dots::after { bottom: -10px; }
  `]
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  bestSellers: Product[] = [];
  activeCoupons: Coupon[] = [];
  currentSlide = 0;
  email = '';
  subscribed = false;

  categories = [
    { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400' },
    { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400' },
    { name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' },
    { name: 'Bracelets', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400' },
    { name: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400' }
  ];

  whyUs = [
    { icon: '💎', title: 'Premium Quality', desc: 'Every piece is crafted with the finest materials and quality assurance.' },
    { icon: '🏅', title: 'Certified Gold', desc: 'BIS hallmarked gold with purity guarantee certificates.' },
    { icon: '🚚', title: 'Free Shipping', desc: 'Complimentary insured shipping on all orders across India.' },
    { icon: '🔄', title: 'Easy Returns', desc: '30-day hassle-free returns with full refund guarantee.' }
  ];

  testimonials = [
    { name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'Absolutely stunning ring! The craftsmanship is exceptional. Received so many compliments. Will definitely shop again!' },
    { name: 'Rahul Mehta', location: 'Delhi', rating: 5, text: 'Ordered a necklace for my wife\'s anniversary. She loved it! The quality exceeded our expectations. Premium packaging too.' },
    { name: 'Anita Desai', location: 'Bangalore', rating: 4, text: 'Beautiful collection and fast delivery. The gold quality is authentic and the designs are truly unique and modern.' }
  ];

  constructor(
    private productService: ProductService,
    private couponService: CouponService,
    private notificationService: NotificationService,
    private clipboard: CdkClipboard
  ) { }

  ngOnInit() {
    this.productService.getProducts({ featured: 'true', limit: 8 }).subscribe(res => {
      this.featuredProducts = res.products;
    });
    this.productService.getProducts({ bestSeller: 'true', limit: 10 }).subscribe(res => {
      this.bestSellers = res.products;
    });
    this.couponService.getCoupons().subscribe(coupons => {
      this.activeCoupons = coupons;
    });
  }

  copyCode(code: string) {
    this.clipboard.copy(code);
    this.notificationService.alert('Code copied to clipboard!', 'success', 'Copied');
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating));
  }

  prevSlide() { if (this.currentSlide > 0) this.currentSlide--; }
  nextSlide() { if (this.currentSlide < this.bestSellers.length - 3) this.currentSlide++; }

  subscribe() {
    if (this.email) { this.subscribed = true; this.email = ''; }
  }
}
