import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { AddressService } from '../../services/address.service';
import { CouponService } from '../../services/coupon.service';
import { CartItem, Address } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="checkout-page">
      <div class="container">
        <h1>Checkout</h1>
        <div class="checkout-layout">
          <div class="checkout-form">
            <div *ngIf="savedAddresses.length > 0" class="saved-addresses-section">
              <h2>Saved Addresses</h2>
              <div class="address-selector">
                <div *ngFor="let addr of savedAddresses" class="address-option" [class.selected]="selectedAddressId === addr._id" (click)="selectAddress(addr)">
                  <div class="addr-header">
                    <strong>{{addr.name}}</strong>
                    <span *ngIf="addr.isDefault" class="badge badge-gold">Default</span>
                  </div>
                  <p>{{addr.street}}</p>
                  <p>{{addr.city}}, {{addr.pincode}}</p>
                  <p>📱 {{addr.phone}}</p>
                </div>
              </div>
              <button class="btn btn-outline btn-sm mt-3" (click)="clearSelection()">+ Use New Address</button>
              <hr class="divider">
            </div>

            <h2>{{ savedAddresses.length > 0 && selectedAddressId ? 'Selected Address' : 'Shipping Details' }}</h2>
            <div class="form-group">
              <label>Full Name</label>
              <input [(ngModel)]="address.name" placeholder="Enter your full name">
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input [(ngModel)]="address.phone" placeholder="+91 XXXXX XXXXX">
            </div>
            <div class="form-group">
              <label>Street Address</label>
              <input [(ngModel)]="address.street" placeholder="123 Main Street, Apt 4B">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>City</label>
                <input [(ngModel)]="address.city" placeholder="City">
              </div>
              <div class="form-group">
                <label>Pincode</label>
                <input [(ngModel)]="address.pincode" placeholder="400001">
              </div>
            </div>

            <h2>Payment Method</h2>
            <div class="payment-options">
              <label class="payment-option" [class.selected]="paymentMethod === 'COD'">
                <input type="radio" value="COD" [(ngModel)]="paymentMethod" name="payment">
                <span>💵 Cash on Delivery</span>
              </label>
              <label class="payment-option" [class.selected]="paymentMethod === 'Online'">
                <input type="radio" value="Online" [(ngModel)]="paymentMethod" name="payment">
                <span>💳 Online Payment</span>
              </label>
            </div>

            <div *ngIf="error" class="error-msg">{{error}}</div>
            <button class="btn btn-primary" (click)="placeOrder()" style="width:100%;margin-top:24px" [disabled]="placing">
              {{placing ? 'Placing Order...' : '🛍️ Place Order'}}
            </button>
          </div>

          <div class="order-summary">
            <h2>Order Summary</h2>
            <div *ngFor="let item of cartItems" class="summary-item">
              <img [src]="item.productId.images[0]" [alt]="item.productId.name">
              <div>
                <h4>{{item.productId.name}}</h4>
                <span>Qty: {{item.quantity}} × ₹{{item.productId.price | number}}</span>
              </div>
              <span class="item-total">₹{{(item.productId.price || 0) * item.quantity | number}}</span>
            </div>
            <div class="summary-totals">
              <div class="row"><span>Subtotal</span><span>₹{{subtotal | number}}</span></div>
              <div class="row"><span>Shipping</span><span class="free">FREE</span></div>
              
              <div class="coupon-section">
                <div class="coupon-input">
                  <input [(ngModel)]="couponCode" placeholder="Enter coupon code" [disabled]="appliedCoupon" class="coupon-field">
                  <button *ngIf="!appliedCoupon" (click)="applyCoupon()" class="btn btn-outline btn-sm apply-btn">Apply</button>
                  <button *ngIf="appliedCoupon" (click)="removeCoupon()" class="btn btn-danger btn-sm">✕</button>
                </div>
                <p *ngIf="appliedCoupon" class="coupon-msg">✅ Coupon <strong>{{appliedCoupon}}</strong> applied!</p>
              </div>

              <div *ngIf="discount > 0" class="row discount">
                <span>Discount <small class="gold">({{appliedCoupon}})</small></span>
                <span class="green">-₹{{discount | number}}</span>
              </div>
              <div class="row total-row"><span>Total</span><span>₹{{subtotal - discount | number}}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .checkout-page { padding: 40px 0 60px; }
    .checkout-page h1 { font-size: 2rem; color: #D4AF37; margin-bottom: 32px; }
    .checkout-layout { display: grid; grid-template-columns: 1fr 420px; gap: 32px; }
    .checkout-form { background: #1E1E1E; border: 1px solid #333; border-radius: 12px; padding: 32px; }
    .checkout-form h2 { color: #D4AF37; font-size: 1.15rem; margin-bottom: 20px; font-family: 'Poppins'; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .payment-options { display: flex; gap: 16px; margin-bottom: 8px; }
    .payment-option {
      flex: 1; padding: 16px; background: #252525; border: 2px solid #444;
      border-radius: 8px; cursor: pointer; transition: 0.3s; text-align: center;
    }
    .payment-option.selected { border-color: #D4AF37; background: rgba(212,175,55,0.05); }
    .payment-option input { display: none; }
    .payment-option span { color: #fff; font-weight: 500; }
    .error-msg { color: #E74C3C; background: rgba(231,76,60,0.1); padding: 12px; border-radius: 8px; margin-top: 12px; }

    .order-summary {
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px;
      padding: 28px; height: fit-content; position: sticky; top: 90px;
    }
    .order-summary h2 { color: #D4AF37; font-size: 1.15rem; margin-bottom: 20px; font-family: 'Poppins'; }
    .summary-item { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #333; }
    .summary-item img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
    .summary-item h4 { color: #fff; font-size: 0.9rem; font-family: 'Poppins'; margin-bottom: 4px; }
    .summary-item span { color: #777; font-size: 0.85rem; }
    .item-total { margin-left: auto; color: #D4AF37; font-weight: 600; }
    .summary-totals { margin-top: 16px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; color: #B0B0B0; }
    .total-row { border-top: 1px solid #333; padding-top: 16px; color: #fff; font-size: 1.2rem; font-weight: 700; }
    .free { color: #27AE60; }
    .green { color: #27AE60; font-weight: 600; }
    .discount small { margin-left: 8px; font-size: 0.75rem; }

    .free { color: #27AE60; }

    .saved-addresses-section { margin-bottom: 32px; }
    .address-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
    .address-option {
      background: #252525; border: 2px solid #333; border-radius: 8px; padding: 16px;
      cursor: pointer; transition: 0.3s;
    }
    .address-option:hover { border-color: #555; }
    .address-option.selected { border-color: #D4AF37; background: rgba(212,175,55,0.05); }
    .addr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .addr-header strong { color: #fff; font-size: 1rem; }
    .badge { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; }
    .badge-gold { background: rgba(212,175,55,0.2); color: #D4AF37; border: 1px solid #D4AF37; }
    .address-option p { color: #aaa; font-size: 0.85rem; margin-bottom: 4px; }
    .btn-outline { background: transparent; border: 1px solid #555; color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; }
    .btn-outline:hover { background: #333; }
    .btn-sm { padding: 6px 12px; font-size: 0.85rem; }
    .mt-3 { margin-top: 16px; }
    .divider { border: 0; height: 1px; background: #333; margin: 32px 0 24px; }

    @media (max-width: 1024px) {
      .checkout-layout { grid-template-columns: 1fr 360px; gap: 24px; }
      .checkout-form { padding: 24px; }
    }

    @media (max-width: 640px) {
      .checkout-page { padding: 80px 0 40px; }
      .checkout-page h1 { font-size: 1.8rem; margin-bottom: 24px; text-align: center; }
      
      .checkout-layout { grid-template-columns: 1fr; }
      
      .checkout-form { padding: 20px; border-radius: 16px; }
      .checkout-form h2 { font-size: 1.05rem; }
      
      .form-row { grid-template-columns: 1fr; gap: 0; }
      .address-selector { grid-template-columns: 1fr; }
      
      .payment-options { flex-direction: column; }
      .payment-option { padding: 14px; }

      .order-summary { position: static; width: 100%; padding: 24px; margin-top: 10px; border-radius: 16px; }
      
      .summary-item img { width: 50px; height: 50px; }
      .summary-item h4 { font-size: 0.85rem; }
      .item-total { font-size: 0.95rem; }
    }

    .coupon-section { margin-top: 15px; padding-top: 15px; border-top: 1px solid #333; margin-bottom: 10px; }
    .coupon-input { display: flex; gap: 8px; margin-bottom: 6px; }
    .coupon-field { 
      flex: 1; padding: 8px 12px; background: #1A1A1A !important; border: 1px solid #444 !important; 
      border-radius: 8px; color: #fff !important; font-size: 0.85rem; text-transform: uppercase;
      min-height: 40px;
    }
    .apply-btn { min-width: 80px; height: 40px; border: 1px solid #D4AF37; color: #D4AF37; background: transparent; }
    .apply-btn:hover { background: rgba(212,175,55,0.1); }
    .coupon-msg { color: #27AE60; font-size: 0.8rem; margin: 4px 0 0; }
  `]
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal = 0;
  discount = 0;
  couponCode = '';
  appliedCoupon = '';
  address = { name: '', phone: '', street: '', city: '', pincode: '' };
  paymentMethod = 'COD';
  placing = false;
  error = '';
  
  savedAddresses: Address[] = [];
  selectedAddressId: string | null = null;

  constructor(
    private cartService: CartService, 
    private orderService: OrderService, 
    private addressService: AddressService,
    private notificationService: NotificationService,
    private couponService: CouponService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.cartService.getCart().subscribe(cart => {
      this.cartItems = cart.products || [];
      this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.productId.price || 0) * item.quantity, 0);
    });

    this.addressService.getAddresses().subscribe({
      next: (addrs) => {
        this.savedAddresses = addrs;
        const defaultAddr = addrs.find(a => a.isDefault);
        if (defaultAddr) {
          this.selectAddress(defaultAddr);
        } else if (addrs.length > 0) {
          this.selectAddress(addrs[0]);
        }
      }
    });
  }

  selectAddress(addr: Address) {
    this.selectedAddressId = addr._id!;
    this.address = {
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      pincode: addr.pincode
    };
  }

  clearSelection() {
    this.selectedAddressId = null;
    this.address = { name: '', phone: '', street: '', city: '', pincode: '' };
  }

  async loadRazorpayScript(): Promise<any> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async placeOrder() {
    if (!this.address.name || !this.address.phone || !this.address.street || !this.address.city || !this.address.pincode) {
      this.error = 'Please fill in all shipping details.';
      return;
    }
    this.placing = true;
    this.error = '';

    const orderProducts = this.cartItems.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.images?.[0] || ''
    }));

    if (this.paymentMethod === 'Online') {
      const res = await this.loadRazorpayScript();
      if (!res) {
        this.error = "Razorpay SDK failed to load. Are you online?";
        this.placing = false;
        return;
      }

      this.orderService.createRazorpayOrder(this.subtotal - this.discount).subscribe({
        next: (orderData) => {
          const options = {
            key: 'rzp_test_Ryyer6VAKb8h6g', // Set your key ID
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'LUXEJEWELS',
            description: 'Premium Jewellery Order',
            order_id: orderData.orderId,
            handler: (response: any) => {
              this.orderService.verifyPayment({
                ...response,
                products: orderProducts,
                totalPrice: this.subtotal - this.discount,
                address: this.address,
                paymentMethod: 'Online',
                couponCode: this.appliedCoupon || null,
                discountAmount: this.discount
              }).subscribe({
                next: async (res: any) => { 
                  await this.notificationService.alert('Thank you for your trust! Your payment was successful and your order has been placed. ❤️', 'success', 'Order Confirmed');
                  this.router.navigate(['/dashboard']); 
                },
                error: (err) => {
                  this.error = err.error?.message || 'Payment verification failed on server.';
                  this.placing = false;
                }
              });
            },
            prefill: {
              name: this.address.name,
              contact: this.address.phone
            },
            theme: {
              color: '#D4AF37'
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', (resp: any) => {
            this.error = 'Payment Failed: ' + resp.error.description;
            this.placing = false;
          });
          rzp.open();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to initialize payment gateway';
          this.placing = false;
        }
      });
    } else {
      // Regular COD Flow
      this.orderService.createOrder({
        products: orderProducts,
        totalPrice: this.subtotal - this.discount,
        address: this.address,
        paymentMethod: this.paymentMethod,
        couponCode: this.appliedCoupon || null,
        discountAmount: this.discount
      }).subscribe({
        next: async (res: any) => { 
          await this.notificationService.alert('Thank you for your trust! Your order has been placed successfully. ❤️ Check your email for the invoice!', 'success', 'Order Placed');
          this.router.navigate(['/dashboard']); 
        },
        error: (err) => { this.error = err.error?.message || 'Failed to place order'; this.placing = false; }
      });
    }
  }

  applyCoupon() {
    if (!this.couponCode.trim()) return;

    const validationItems = this.cartItems.map(item => ({
      productId: item.productId._id,
      price: item.productId.price,
      quantity: item.quantity
    }));

    this.couponService.validateCoupon(this.couponCode, validationItems, this.subtotal).subscribe({
      next: (res) => {
        if (res.valid) {
          this.discount = res.discount;
          this.appliedCoupon = res.code;
          this.notificationService.alert(res.message, 'success', 'Coupon Applied');
        }
      },
      error: (err) => {
        this.notificationService.alert(err.error?.message || 'Invalid coupon code', 'error', 'Error');
        this.couponCode = '';
      }
    });
  }

  removeCoupon() {
    this.appliedCoupon = '';
    this.couponCode = '';
    this.discount = 0;
  }
}
