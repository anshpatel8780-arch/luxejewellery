import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Product, Review } from '../../models/product.model';
import { Product360ViewerComponent } from '../../components/product-360-viewer/product-360-viewer.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, Product360ViewerComponent],
  template: `
    <section class="product-detail" *ngIf="product">
      <div class="container">
      
        <div class="detail-grid">
          <!-- Image Gallery -->
          <div class="gallery">
            <div class="main-image-container">
              <div class="main-image" *ngIf="!is360Active" (mousemove)="onZoom($event)" (mouseleave)="resetZoom()">
                <img [src]="selectedImage" [alt]="product.name" [style.transform-origin]="zoomOrigin" [class.zoomed]="isZooming">
              </div>
              
              <!-- 360 Viewer -->
              <div *ngIf="is360Active && product.images360 && product.images360.length > 0" class="viewer-360-wrapper">
                <app-product-360-viewer [images]="product.images360"></app-product-360-viewer>
                <button class="back-btn" (click)="is360Active = false">
                   <i class="fa-solid fa-arrow-left"></i> Back to Images
                </button>
              </div>
            </div>
            <!-- 360 Button Toggle -->
            <button *ngIf="!is360Active && product.images360 && product.images360.length > 0" 
                    class="btn-360-toggle" 
                    (click)="is360Active = true">
              <i class="fa-solid fa-rotate"></i> Interactive 360° View
            </button>

            <div class="thumbnails">
              <img *ngFor="let img of product.images" [src]="img" (click)="selectedImage = img; is360Active = false" [class.active]="selectedImage === img && !is360Active">
            </div>
          </div>

          <!-- Product Info -->
          <div class="info">
            <span class="info-category">{{product.category}}</span>
            <h1>{{product.name}}</h1>
            <div class="info-rating">
              <span class="stars">{{getStars(product.rating)}}</span>
              <span class="rating-text">{{product.rating}} ({{product.numReviews}} reviews)</span>
            </div>
            <p class="info-price">₹{{product.price | number}}</p>
            <p class="info-desc">{{product.description}}</p>

            <div class="info-specs">
              <div class="spec"><span class="spec-label">Gold Type</span><span class="spec-value">{{product.goldType}}</span></div>
              <div class="spec"><span class="spec-label">Weight</span><span class="spec-value">{{product.weight}}</span></div>
              <div class="spec">
                <span class="spec-label">Availability</span>
                <span class="spec-value" [class.low-stock]="product.stock > 0 && product.stock <= 5" [class.out-of-stock]="product.stock === 0">
                  <i class="fa-solid" [ngClass]="product.stock === 0 ? 'fa-circle-xmark' : (product.stock <= 5 ? 'fa-triangle-exclamation' : 'fa-circle-check')"></i>
                  {{product.stock > 0 ? (product.stock <= 5 ? product.stock + ' Low Stock' : 'In Stock') : 'Sold Out'}}
                </span>
              </div>
            </div>

            <!-- Stock Alerts -->
            <div *ngIf="product.stock > 0 && product.stock <= 5" class="stock-alert low-stock-alert animate-pulse">
              ⚠️ Only {{product.stock}} pieces remaining. Order soon!
            </div>
            <div *ngIf="product.stock === 0" class="stock-alert out-of-stock-alert">
              🚫 This exquisite piece is currently unavailable.
            </div>

            <div class="info-actions">
              <div class="qty-selector" [class.disabled]="product.stock === 0">
                <button (click)="quantity > 1 && quantity = quantity - 1" [disabled]="product.stock === 0">−</button>
                <span>{{quantity}}</span>
                <button (click)="product && quantity < product.stock && (quantity = quantity + 1)" [disabled]="product.stock === 0">+</button>
              </div>
              <button class="btn btn-primary" (click)="addToCart()" [disabled]="product.stock === 0">
                <i class="fa-solid fa-cart-shopping"></i> {{product.stock === 0 ? 'Sold Out' : 'Add to Cart'}}
              </button>
              <button class="btn btn-secondary" (click)="addToWishlist()">♡ Wishlist</button>
            </div>
            <button class="btn btn-primary buy-now-btn" (click)="buyNow()" [disabled]="product.stock === 0">
              <i class="fa-solid fa-bolt"></i> {{product.stock === 0 ? 'Out of Stock' : 'Buy Now'}}
            </button>

            <div *ngIf="message" class="action-message" [class.success]="!isError" [class.error]="isError">{{message}}</div>
          </div>
        </div>

        <!-- Reviews -->
        <div class="reviews-section">
          <h2>Customer Reviews</h2>

          <div *ngIf="authService.isLoggedIn(); else loginPrompt" class="review-status">
            <!-- Eligible to Review -->
            <div *ngIf="isEligible" class="review-form">
              <h3>Write a Review</h3>
              <div class="rating-input">
                <span *ngFor="let s of [1,2,3,4,5]" (click)="newReview.rating = s" [class.active]="s <= newReview.rating" class="star-btn">★</span>
              </div>
              <textarea [(ngModel)]="newReview.comment" placeholder="Share your experience..." rows="3"></textarea>
              <button class="btn btn-primary btn-sm" (click)="submitReview()">Submit Review</button>
            </div>

            <!-- Not Eligible -->
            <div *ngIf="!isEligible" class="eligibility-msg">
              <p *ngIf="eligibilityReason === 'NOT_PURCHASED'">
                <i class="info-icon">ℹ️</i> You can only review products you have <strong>purchased and received</strong>.
              </p>
              <p *ngIf="eligibilityReason === 'ALREADY_REVIEWED'">
                 You have already shared your feedback for this piece. ✨
              </p>
            </div>
          </div>

          <ng-template #loginPrompt>
            <p class="login-prompt">Please <a routerLink="/login">sign in</a> to share your thoughts on this product.</p>
          </ng-template>

          <div class="reviews-list">
            <div *ngFor="let review of reviews" class="review-card">
              <div class="review-header">
                <div class="review-avatar">{{review.userId.name.charAt(0) || 'U'}}</div>
                <div>
                  <strong>{{review.userId.name || 'User'}}</strong>
                  <span class="review-date">{{review.createdAt | date:'mediumDate'}}</span>
                </div>
                <span class="review-stars">{{getStars(review.rating)}}</span>
              </div>
              <p>{{review.comment}}</p>
            </div>
            <p *ngIf="reviews.length === 0" class="no-reviews">No reviews yet. Be the first to review!</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .product-detail { padding: 30px 0 60px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }

    .gallery {}
    .main-image-container { position: relative; margin-bottom: 16px; border-radius: 12px; overflow: hidden; }
    .main-image {
      background: #1A1A1A; border: 1px solid #333; cursor: zoom-in;
      aspect-ratio: 1; border-radius: inherit;
    }
    .main-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .main-image img.zoomed { transform: scale(1.8); }

    .viewer-360-wrapper { position: relative; width: 100%; background: #1A1A1A; aspect-ratio: 1; border-radius: inherit; overflow: hidden; border: 1px solid #333; }
    .viewer-360-wrapper .back-btn { 
      position: absolute; top: 16px; left: 16px; background: rgba(0,0,0,0.6); 
      color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; 
      padding: 6px 14px; font-size: 0.85rem; cursor: pointer; transition: 0.2s; backdrop-filter: blur(4px); z-index: 100;
    }
    .viewer-360-wrapper .back-btn:hover { background: rgba(212,175,55,0.8); border-color: #D4AF37; }

    .thumbnails { display: flex; gap: 12px; }
    .thumbnails img {
      width: 80px; height: 80px; object-fit: cover; border-radius: 8px;
      border: 2px solid #333; cursor: pointer; transition: 0.3s;
    }
    .thumbnails img.active, .thumbnails img:hover { border-color: #D4AF37; }
    
    .btn-360-toggle { 
      width: 100%; margin-bottom: 16px; display: flex; justify-content: center; 
      gap: 8px; align-items: center; border: 1px solid #D4AF37; color: #D4AF37; 
      background: transparent; padding: 12px; border-radius: 8px; 
      cursor: pointer; font-weight: 600; font-size: 1rem; transition: background 0.3s; 
    }
    .btn-360-toggle:hover { background: rgba(212, 175, 55, 0.1); }
    
    .info {}
    .info-category { color: #D4AF37; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }
    .info h1 { font-size: 2rem; margin: 8px 0 16px; color: #fff; }
    .info-rating { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .stars { color: #D4AF37; font-size: 1.1rem; }
    .rating-text { color: #777; font-size: 0.9rem; }
    .info-price { font-size: 2rem; font-weight: 700; color: #D4AF37; margin-bottom: 16px; font-family: 'Playfair Display', serif; }
    .info-desc { color: #B0B0B0; line-height: 1.7; margin-bottom: 24px; }

    .info-specs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
    .spec {
      background: #1A1A1A; padding: 16px; border-radius: 8px; border: 1px solid #333;
      text-align: center;
    }
    .spec-label { display: block; color: #777; font-size: 0.8rem; margin-bottom: 4px; }
    .spec-value { color: #fff; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .low-stock { color: #f1c40f !important; }
    .out-of-stock { color: #e74c3c !important; }

    .stock-alert {
      padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;
      font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 10px;
    }
    .low-stock-alert { background: rgba(241, 196, 15, 0.1); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.2); }
    .out-of-stock-alert { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.2); }

    .animate-pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }

    .info-actions { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    .qty-selector {
      display: flex; align-items: center; background: #1A1A1A; border-radius: 8px;
      border: 1px solid #333; overflow: hidden; transition: 0.3s;
    }
    .qty-selector.disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
    .qty-selector button {
      width: 40px; height: 40px; background: none; color: #D4AF37;
      font-size: 1.2rem; border: none; cursor: pointer;
    }
    .qty-selector button:hover { background: rgba(212,175,55,0.1); }
    .qty-selector span { padding: 0 16px; color: #fff; font-weight: 600; }
    
    .btn:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(1); transform: none !important; box-shadow: none !important; }
    .buy-now-btn { width: 100%; margin-top: 10px; }

    .action-message { padding: 12px; border-radius: 8px; margin-top: 16px; font-weight: 500; }
    .action-message.success { background: rgba(39,174,96,0.15); color: #27AE60; }
    .action-message.error { background: rgba(231,76,60,0.15); color: #E74C3C; }

    /* Reviews */
    .reviews-section { margin-top: 60px; }
    .reviews-section h2 { color: #D4AF37; font-size: 1.5rem; margin-bottom: 24px; }
    .review-form {
      background: #1A1A1A; border: 1px solid #333; border-radius: 12px;
      padding: 24px; margin-bottom: 24px;
    }
    .review-form h3 { font-size: 1rem; color: #fff; margin-bottom: 12px; font-family: 'Poppins'; }
    .rating-input { margin-bottom: 12px; }
    .star-btn { font-size: 1.5rem; color: #555; cursor: pointer; transition: 0.2s; }
    .star-btn.active { color: #D4AF37; }
    .review-form textarea {
      width: 100%; padding: 12px; background: #252525; border: 1px solid #444;
      border-radius: 8px; color: #fff; font-size: 0.9rem; resize: vertical;
      margin-bottom: 12px;
    }
    .review-card {
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px;
      padding: 20px; margin-bottom: 16px;
    }
    .review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .review-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37, #B8960C);
      color: #0D0D0D; display: flex; align-items: center; justify-content: center;
      font-weight: 700;
    }
    .review-header strong { color: #fff; display: block; }
    .review-date { color: #777; font-size: 0.8rem; }
    .review-stars { margin-left: auto; color: #D4AF37; }
    .review-card p { color: #B0B0B0; line-height: 1.6; }
    .no-reviews { color: #777; text-align: center; padding: 40px; }
    .eligibility-msg, .login-prompt {
      background: #1A1A1A; border: 1px solid #333; border-radius: 12px;
      padding: 20px 24px; margin-bottom: 30px; color: #777;
      text-align: center; font-size: 0.95rem; border-left: 4px solid #D4AF37;
    }
    .eligibility-msg strong { color: #D4AF37; font-weight: 600; }
    .login-prompt a { color: #D4AF37; font-weight: 600; text-decoration: none; }
    .login-prompt a:hover { text-decoration: underline; }

    @media (max-width: 1024px) {
      .detail-grid { gap: 30px; }
      .info h1 { font-size: 1.8rem; }
      .info-price { font-size: 1.8rem; }
    }

    @media (max-width: 640px) {
      .product-detail { padding: 90px 0 40px; }
      .detail-grid { grid-template-columns: 1fr; gap: 24px; }
      
      .main-image-container { border-radius: 0; margin-left: -20px; margin-right: -20px; }
      .main-image { border-radius: 0; border-left: none; border-right: none; }
      .viewer-360-wrapper { border-radius: 0; border-left: none; border-right: none; }
      
      .thumbnails { overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
      .thumbnails::-webkit-scrollbar { display: none; }
      .thumbnails img, .thumbnail-360 { width: 70px; height: 70px; flex-shrink: 0; }
      
      .info h1 { font-size: 1.6rem; margin-bottom: 12px; }
      .info-price { font-size: 1.6rem; }
      .info-desc { font-size: 0.95rem; }
      
      .info-specs { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .spec { padding: 12px 8px; }
      
      .info-actions { flex-direction: column; align-items: stretch; gap: 12px; }
      .qty-selector { width: 100%; justify-content: center; height: 48px; }
      .qty-selector button { width: 60px; height: 48px; }
      .btn { height: 48px; font-size: 1rem; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  selectedImage = '';
  quantity = 1;
  reviews: Review[] = [];
  newReview = { rating: 5, comment: '' };
  message = '';
  isError = false;
  isZooming = false;
  is360Active = false;
  isEligible = false;
  eligibilityReason = '';
  zoomOrigin = 'center center';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.productService.getProduct(productId).subscribe(p => {
        this.product = p;
        this.selectedImage = p.images[0];
      });
      this.reviewService.getProductReviews(productId).subscribe(r => this.reviews = r);

      if (this.authService.isLoggedIn()) {
        this.checkReviewEligibility(productId);
      }
    });
  }

  checkReviewEligibility(productId: string) {
    this.reviewService.checkEligibility(productId).subscribe({
      next: (res) => {
        this.isEligible = res.isEligible;
        this.eligibilityReason = res.reason;
      },
      error: () => {
        // Silent failure for background check
        this.isEligible = false;
        this.eligibilityReason = 'ERROR';
      }
    });
  }

  addToCart() {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.cartService.addToCart(this.product!._id, this.quantity).subscribe({
      next: () => { this.message = 'Added to cart!'; this.isError = false; setTimeout(() => this.message = '', 3000); },
      error: (err) => { this.message = err.error?.message || 'Failed to add to cart'; this.isError = true; }
    });
  }

  addToWishlist() {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.wishlistService.addToWishlist(this.product!._id).subscribe({
      next: () => { this.message = 'Added to wishlist!'; this.isError = false; setTimeout(() => this.message = '', 3000); },
      error: () => { this.message = 'Failed to add to wishlist'; this.isError = true; }
    });
  }

  buyNow() {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.cartService.addToCart(this.product!._id, this.quantity).subscribe(() => {
      this.router.navigate(['/checkout']);
    });
  }

  submitReview() {
    this.reviewService.createReview({ productId: this.product!._id, ...this.newReview }).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.newReview = { rating: 5, comment: '' };
        this.message = 'Review submitted!'; this.isError = false;
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => { this.message = err.error?.message || 'Error submitting review'; this.isError = true; }
    });
  }

  onZoom(e: MouseEvent) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    this.zoomOrigin = `${x}% ${y}%`;
    this.isZooming = true;
  }
  resetZoom() { this.isZooming = false; }

  getStars(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }
}
