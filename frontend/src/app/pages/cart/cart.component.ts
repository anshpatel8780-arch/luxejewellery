import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CouponService } from '../../services/coupon.service';
import { NotificationService } from '../../services/notification.service';
import { CartItem } from '../../models/product.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <section class="cart-page">
      <div class="container">
        <h1>Shopping <span class="gold">Cart</span></h1>

        <div *ngIf="items.length === 0" class="empty-cart">
          <span class="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Explore our collection and add some beautiful pieces!</p>
          <a routerLink="/shop" class="btn btn-primary">Shop Now</a>
        </div>

        <div *ngIf="items.length > 0" class="cart-layout">
          <div class="cart-items">
            <div *ngFor="let item of items" class="cart-item">
              <ng-container *ngIf="item.productId">
                <img [src]="item.productId.images?.[0]" [alt]="item.productId.name" class="item-image">
                <div class="item-info">
                  <h3>
                    <a [routerLink]="['/product', item.productId._id]">{{item.productId.name}}</a>
                  </h3>
                  <span class="item-type">{{item.productId.goldType}} • {{item.productId.weight}}</span>
                  <span class="item-price">₹{{item.productId.price | number}}</span>
                </div>
                <div class="item-qty">
                  <button (click)="updateQty(item, -1)" [disabled]="item.quantity <= 1">−</button>
                  <span>{{item.quantity}}</span>
                  <button (click)="updateQty(item, 1)" [disabled]="item.quantity >= item.productId.stock">+</button>
                </div>
                <span class="item-total">₹{{(item.productId.price || 0) * item.quantity | number}}</span>
                <button class="remove-btn" (click)="removeItem(item)" title="Remove">✕</button>
              </ng-container>
              <div *ngIf="!item.productId" class="item-info">
                <span class="item-type" style="color: #e74c3c; font-weight: 600;">Product no longer available</span>
                <button class="btn btn-danger btn-sm" (click)="removeItem(item)">Remove Orphaned Item</button>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-row"><span>Subtotal</span><span>₹{{subtotal | number}}</span></div>
            <div class="summary-row"><span>Shipping</span><span class="free">FREE</span></div>
            
            <div class="summary-row total"><span>Total</span><span>₹{{subtotal | number}}</span></div>
            <a routerLink="/checkout" class="btn btn-primary" style="width:100%;margin-top:16px">Proceed to Checkout →</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .cart-page { padding: 40px 0 60px; }
    .cart-page h1 { font-size: 2rem; margin-bottom: 32px; }
    .gold { color: #D4AF37; }
    .empty-cart { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 16px; }
    .empty-cart h2 { color: #fff; margin-bottom: 8px; }
    .empty-cart p { color: #777; margin-bottom: 24px; }
    .cart-layout { display: grid; grid-template-columns: 1fr 360px; gap: 32px; }
    .cart-item {
      display: flex; align-items: center; gap: 20px;
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px;
      padding: 20px; margin-bottom: 16px; transition: 0.3s;
    }
    .cart-item:hover { border-color: rgba(212,175,55,0.3); }
    .item-image { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }
    .item-info { flex: 1; }
    .item-info h3 { font-size: 1rem; margin-bottom: 4px; font-family: 'Poppins'; }
    .item-info h3 a { color: #fff; }
    .item-info h3 a:hover { color: #D4AF37; }
    .item-type { color: #777; font-size: 0.8rem; display: block; margin-bottom: 4px; }
    .item-price { color: #D4AF37; font-weight: 600; }
    .item-qty {
      display: flex; align-items: center; background: #1A1A1A;
      border-radius: 8px; border: 1px solid #444; overflow: hidden;
    }
    .item-qty button { width: 36px; height: 36px; background: none; color: #D4AF37; font-size: 1.1rem; cursor: pointer; border: none; }
    .item-qty button:hover:not(:disabled) { background: rgba(212,175,55,0.1); }
    .item-qty button:disabled { color: #444; cursor: not-allowed; }
    .item-qty span { padding: 0 14px; color: #fff; font-weight: 600; }
    .item-total { color: #fff; font-weight: 700; font-size: 1.1rem; min-width: 100px; text-align: right; }
    .remove-btn {
      background: none; color: #777; font-size: 1.2rem; cursor: pointer;
      width: 36px; height: 36px; border-radius: 50%; border: none;
      transition: 0.3s;
    }
    .remove-btn:hover { background: rgba(231,76,60,0.15); color: #E74C3C; }

    .cart-summary {
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px;
      padding: 28px; height: fit-content; position: sticky; top: 90px;
    }
    .cart-summary h3 { color: #D4AF37; margin-bottom: 20px; font-size: 1.15rem; font-family: 'Poppins'; }
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; color: #B0B0B0; border-bottom: 1px solid #333; }
    .summary-row.total { border: none; color: #fff; font-size: 1.2rem; font-weight: 700; padding-top: 16px; }
    .free { color: #27AE60; font-weight: 600; }

    @media (max-width: 1024px) {
      .cart-layout { grid-template-columns: 1fr 320px; gap: 20px; }
    }

    @media (max-width: 640px) {
      .cart-page { padding: 80px 0 40px; }
      .cart-page h1 { font-size: 1.8rem; margin-bottom: 24px; text-align: center; }
      
      .cart-layout { grid-template-columns: 1fr; }
      
      .cart-item { 
        display: grid; 
        grid-template-areas: 
          "img info remove"
          "img qty total";
        grid-template-columns: 90px 1fr auto;
        gap: 15px; padding: 15px; border-radius: 12px;
      }
      .item-image { grid-area: img; width: 90px; height: 90px; }
      .item-info { grid-area: info; }
      .item-info h3 { font-size: 0.95rem; line-height: 1.2; }
      .item-qty { grid-area: qty; width: fit-content; }
      .item-total { grid-area: total; font-size: 1rem; align-self: flex-end; }
      .remove-btn { grid-area: remove; align-self: flex-start; margin-right: -5px; margin-top: -5px; }

      .cart-summary { position: static; width: 100%; border-radius: 16px; padding: 24px; margin-top: 10px; }
      .summary-row.total { font-size: 1.3rem; }
      
      .coupon-input { flex-direction: column; }
      .coupon-input input { padding: 12px; }
      .coupon-input .btn { width: 100%; }
    }

  `]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  subtotal = 0;

  constructor(
    private cartService: CartService,
    private couponService: CouponService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() { this.loadCart(); }

  loadCart() {
    this.cartService.getCart().subscribe(cart => {
      this.items = cart.products || [];
      this.calcSubtotal();
    });
  }

  calcSubtotal() {
    this.subtotal = this.items.reduce((sum, item) => {
      if (item.productId) {
        return sum + (item.productId.price || 0) * item.quantity;
      }
      return sum;
    }, 0);
  }

  updateQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty < 1 || (delta > 0 && newQty > item.productId.stock)) return;
    this.cartService.updateQuantity(item.productId._id, newQty).subscribe(() => this.loadCart());
  }

  removeItem(item: CartItem) {
    const removeId = item.productId?._id || item._id;
    if (!removeId) return;

    this.cartService.removeFromCart(removeId).subscribe(() => this.loadCart());
  }


}
