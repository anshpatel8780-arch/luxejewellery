import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { WishlistService } from '../../services/wishlist.service';
import { AddressService } from '../../services/address.service';
import { NotificationService } from '../../services/notification.service';
import { User, Order, Product, Address } from '../../models/product.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <section class="dashboard-page">
      <div class="container">
        <h1>My <span class="gold">Dashboard</span></h1>

        <div class="tabs">
          <button *ngFor="let tab of tabs" [class.active]="activeTab === tab" (click)="activeTab = tab">{{tab}}</button>
        </div>

        <!-- Profile -->
        <div *ngIf="activeTab === 'Profile'" class="tab-content animate-fadeIn">
          <div class="profile-container" *ngIf="user">
            <div class="profile-main-card">
              <div class="profile-header">
                <div class="profile-avatar-container">
                  <div class="profile-avatar" *ngIf="!user.image">{{user.name.charAt(0)}}</div>
                  <img *ngIf="user.image" [src]="user.image.startsWith('http') ? user.image : 'http://localhost:9000' + user.image" class="profile-img" alt="Profile">
                  <div class="avatar-edit-overlay" (click)="fileInput.click()">
                    <i class="fa-solid fa-camera"></i>
                  </div>
                  <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none;">
                </div>
                <div class="profile-basic-info">
                  <h2>{{user.name}}</h2>
                  <p class="member-since">Member since {{user.createdAt | date:'MMMM yyyy'}}</p>
                  <span class="badge badge-gold">{{user.role | uppercase}}</span>
                  <div class="profile-phone-meta" *ngIf="user.phone">
                    <i class="fa-solid fa-phone-volume gold"></i>
                    <span>{{user.phone}}</span>
                  </div>
                </div>
                <div class="profile-actions-header">
                  <a *ngIf="user.role === 'admin'" routerLink="/admin" class="btn btn-gold btn-sm mr-2 admin-panel-btn">
                    <i class="fa-solid fa-gauge-high"></i> Admin Panel
                  </a>
                  <button class="btn btn-outline btn-sm edit-btn" (click)="toggleEditProfile()">
                    <i class="fa-solid" [class.fa-xmark]="isEditingProfile" [class.fa-user-pen]="!isEditingProfile"></i>
                    {{ isEditingProfile ? ' Cancel' : ' Edit Profile' }}
                  </button>
                </div>
              </div>

              <div class="profile-details" *ngIf="!isEditingProfile">
                <div class="detail-item">
                  <span class="label">Email Address</span>
                  <span class="value">
                    <i class="fa-solid fa-envelope gold" style="margin-right: 8px;"></i>
                    {{user.email}}
                  </span>
                </div>
              </div>

              <!-- Edit Mode -->
              <div class="profile-edit-form" *ngIf="isEditingProfile">
                <div class="form-group">
                  <label>Full Name</label>
                  <input [(ngModel)]="editUserData.name" placeholder="Enter your name">
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input [(ngModel)]="editUserData.phone" placeholder="Enter your phone number">
                </div>
                <button class="btn btn-primary btn-sm" (click)="updateProfile()" [disabled]="updatingProfile">
                  {{ updatingProfile ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders -->
        <div *ngIf="activeTab === 'Orders'" class="tab-content animate-fadeIn">
          <div *ngIf="orders.length === 0" class="empty-state">
            <p><i class="fa-solid fa-box-open"></i> No orders yet</p>
            <a routerLink="/shop" class="btn btn-primary btn-sm">Start Shopping</a>
          </div>
            <div *ngFor="let order of orders" class="order-card">
            <div class="order-header">
              <div>
                <span class="order-id">Order #{{order._id.slice(-8).toUpperCase()}}</span>
                <span class="order-date">{{order.createdAt | date:'mediumDate'}}</span>
              </div>
              <div class="status-wrap">
                <span *ngIf="order.cancellation?.status === 'Pending'" class="badge badge-pending-cancel">Cancellation Pending</span>
                <span *ngIf="order.cancellation?.status !== 'Pending'" class="badge" [ngClass]="'badge-' + order.status.toLowerCase()">{{order.status}}</span>
                <button *ngIf="canCancel(order)" class="btn btn-cancel" (click)="onCancelOrder(order)">
                  <span class="icon">✕</span>
                  {{ order.status === 'Shipped' ? 'Request Cancellation' : 'Cancel Order' }}
                </button>
              </div>
            </div>
            
            <div *ngIf="order.cancellation?.status === 'Pending'" class="cancellation-alert">
              <i class="fa-solid fa-clock"></i> Cancellation request is under review.
            </div>
            <div *ngIf="order.status === 'Cancelled'" class="cancellation-info">
              <i class="fa-solid fa-ban"></i> This order was cancelled. Reason: {{order.cancellation?.reason || 'N/A'}}
            </div>

            <div class="order-items">
              <div *ngFor="let item of order.products" class="order-item">
                <img [src]="item.image" [alt]="item.name">
                <div>
                  <h4>{{item.name}}</h4>
                  <span>Qty: {{item.quantity}} × ₹{{item.price | number}}</span>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <span class="order-total">Total: ₹{{order.totalPrice | number}}</span>
              <div class="footer-actions">
                <span class="payment-method">
                  <i class="fa-solid" [class.fa-credit-card]="order.paymentMethod === 'Online'" [class.fa-money-bill-1]="order.paymentMethod === 'COD'"></i> 
                  {{order.paymentMethod}}
                </span>
                <button class="btn btn-invoice" (click)="getInvoice(order)">
                  <i class="fa-solid fa-file-pdf"></i> Download Invoice
                </button>
              </div>
            </div>

            <!-- Order Tracking (Hide if cancelled) -->
            <div class="tracking" *ngIf="order.status !== 'Cancelled'">
              <div *ngFor="let step of trackingSteps" class="track-step" [class.active]="isStepActive(order.status, step)" [class.completed]="isStepCompleted(order.status, step)">
                <div class="track-dot"></div>
                <span>{{step}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Wishlist -->
        <div *ngIf="activeTab === 'Wishlist'" class="tab-content animate-fadeIn">
          <div *ngIf="wishlistProducts.length === 0" class="empty-state">
            <p><i class="fa-solid fa-heart-crack"></i> Your wishlist is empty</p>
            <a routerLink="/shop" class="btn btn-primary btn-sm">Explore Collection</a>
          </div>
          <div class="wishlist-grid">
            <div *ngFor="let product of wishlistProducts" class="product-card">
              <div class="product-image">
                <img [src]="product.images[0]" [alt]="product.name">
                <button class="remove-wishlist" (click)="removeFromWishlist(product._id)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div class="product-info">
                <h3><a [routerLink]="['/product', product._id]">{{product.name}}</a></h3>
                <span class="product-price">₹{{product.price | number}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Addresses -->
        <div *ngIf="activeTab === 'Addresses'" class="tab-content animate-fadeIn">
          <div class="address-header">
            <h2>Saved Addresses</h2>
            <button class="btn btn-primary btn-sm" (click)="openAddressForm()">+ Add New Address</button>
          </div>

          <div *ngIf="isAddressFormOpen" class="address-form-container mt-4">
            <div class="checkout-form">
              <h3>{{ editingAddress ? 'Edit Address' : 'New Address' }}</h3>
              <div class="form-group">
                <label>Full Name</label>
                <input [(ngModel)]="currentAddress.name" placeholder="Enter your full name">
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input [(ngModel)]="currentAddress.phone" placeholder="+91 XXXXX XXXXX">
              </div>
              <div class="form-group">
                <label>Street Address</label>
                <input [(ngModel)]="currentAddress.street" placeholder="123 Main Street, Apt 4B">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>City</label>
                  <input [(ngModel)]="currentAddress.city" placeholder="City">
                </div>
                <div class="form-group">
                  <label>Pincode</label>
                  <input [(ngModel)]="currentAddress.pincode" placeholder="400001">
                </div>
              </div>
              <label class="default-checkbox">
                <input type="checkbox" [(ngModel)]="currentAddress.isDefault">
                Set as default address
              </label>
              
              <div class="form-actions mt-3">
                <button class="btn btn-primary" (click)="saveAddress()">Save Address</button>
                <button class="btn btn-outline" (click)="cancelAddressForm()" style="margin-left: 10px;">Cancel</button>
              </div>
            </div>
          </div>

          <div *ngIf="addresses.length === 0 && !isAddressFormOpen" class="empty-state">
            <p><i class="fa-solid fa-house"></i> No saved addresses yet</p>
          </div>

          <div class="addresses-grid mt-4" *ngIf="!isAddressFormOpen">
            <div *ngFor="let addr of addresses" class="address-card" [class.default-address]="addr.isDefault">
              <div class="address-card-header">
                <span class="badge badge-gold" *ngIf="addr.isDefault">Default</span>
              </div>
              <h4>{{addr.name}}</h4>
              <p>{{addr.street}}</p>
              <p>{{addr.city}}, {{addr.pincode}}</p>
              <p><i class="fa-solid fa-phone-flip" style="font-size: 0.8rem;"></i> {{addr.phone}}</p>
              <div class="address-actions">
                <button class="btn-text" (click)="editAddress(addr)"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                <button class="btn-text text-danger" (click)="deleteAddress(addr._id!)"><i class="fa-solid fa-trash"></i> Delete</button>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-danger" (click)="logout()" style="margin-top:32px">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>
    </section>
  `,
    styles: [`
    .dashboard-page { padding: 40px 0 60px; }
    .dashboard-page h1 { font-size: 2rem; margin-bottom: 24px; }
    .gold { color: #D4AF37; }
    .tabs { display: flex; gap: 8px; margin-bottom: 32px; border-bottom: 1px solid #333; padding-bottom: 12px; }
    .tabs button {
      padding: 10px 24px; background: none; color: #777; border: none;
      font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: 0.3s;
      border-bottom: 2px solid transparent;
    }
    .tabs button.active { color: #D4AF37; border-bottom-color: #D4AF37; }
    .tab-content { }
    .profile-card {
      display: flex; align-items: center; gap: 24px;
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px; padding: 32px;
    }
    .profile-avatar {
      width: 100px; height: 100px; border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37, #B8960C);
      color: #0D0D0D; display: flex; align-items: center; justify-content: center;
      font-size: 2.5rem; font-weight: 700; flex-shrink: 0;
      border: 3px solid #0D0D0D; box-shadow: 0 0 0 1px #333;
    }
    .profile-avatar-container { position: relative; cursor: pointer; }
    .profile-img { 
      width: 100px; height: 100px; border-radius: 50%; object-fit: cover;
      border: 3px solid #0D0D0D; box-shadow: 0 0 0 1px #333;
    }
    .avatar-edit-overlay {
      position: absolute; top: 0; left: 0; width: 100px; height: 100px;
      border-radius: 50%; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s; color: #fff; font-size: 1.2rem;
    }
    .profile-avatar-container:hover .avatar-edit-overlay { opacity: 1; }
    .profile-container { display: flex; flex-direction: column; gap: 32px; align-items: stretch; }
    .profile-main-card { background: #1E1E1E; border: 1px solid #333; border-radius: 12px; padding: 32px; }
    .profile-header { display: flex; align-items: center; gap: 24px; position: relative; margin-bottom: 32px; }
    .profile-basic-info h2 { color: #fff; font-size: 1.5rem; margin-bottom: 4px; }
    .member-since { color: #777; font-size: 0.85rem; margin-bottom: 8px; }
    .profile-phone-meta { color: #D4AF37; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; margin-top: 8px; font-weight: 500; }
    .profile-phone-meta { color: #D4AF37; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; margin-top: 8px; font-weight: 500; }
    .profile-actions-header { position: absolute; right: 0; top: 0; display: flex; gap: 10px; }
    .mr-2 { margin-right: 8px; }
    .btn-gold { background: #D4AF37; color: #000; border: none; font-weight: 600; }
    .btn-gold:hover { background: #B8960C; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2); }
    .admin-panel-btn { transition: all 0.3s; }
    
    .profile-details { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .detail-item { display: flex; flex-direction: column; gap: 8px; }
    .detail-item .label { color: #555; text-transform: uppercase; font-size: 0.75rem; font-weight: 600; letter-spacing: 1px; }
    .detail-item .value { color: #fff; font-size: 1rem; }

    .profile-edit-form { max-width: 400px; border-top: 1px solid #333; padding-top: 24px; margin-top: 8px; }
    .profile-stats { display: flex; flex-direction: column; gap: 16px; }
    .stat-card {
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px; padding: 20px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .stat-icon { font-size: 1.5rem; margin-bottom: 12px; }
    .stat-value { color: #D4AF37; font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
    .stat-label { color: #777; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }

    .profile-info h2 { color: #fff; margin-bottom: 8px; }
    .profile-info p { color: #777; font-size: 0.9rem; margin-bottom: 4px; }
    .empty-state { text-align: center; padding: 60px 20px; color: #777; }
    .order-card {
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px;
      padding: 24px; margin-bottom: 16px;
    }
    .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .order-id { color: #fff; font-weight: 600; margin-right: 16px; }
    .order-date { color: #777; font-size: 0.85rem; }
    .status-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
    .order-items { border-top: 1px solid #333; padding-top: 16px; }
    .order-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .order-item img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .order-item h4 { color: #fff; font-size: 0.9rem; font-family: 'Poppins'; margin-bottom: 2px; }
    .order-item span { color: #777; font-size: 0.8rem; }
    .order-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #333; padding-top: 16px; margin-top: 8px; }
    .order-total { color: #D4AF37; font-weight: 700; font-size: 1.1rem; }
    .payment-method { color: #777; font-size: 0.85rem; }
    
    .badge-cancelled { background: #444; color: #aaa; }
    .badge-pending-cancel { background: #E67E22; color: #fff; }

    /* Premium Cancel Button */
    .btn-cancel {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px; margin-top: 8px;
      background: rgba(231, 76, 60, 0.05);
      border: 1px solid rgba(231, 76, 60, 0.3);
      border-radius: 6px; color: #E74C3C;
      font-size: 0.8rem; font-weight: 600; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(4px);
    }
    .btn-cancel:hover {
      background: rgba(231, 76, 60, 0.15);
      border-color: #E74C3C;
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
    }
    .btn-cancel:hover .icon { transform: rotate(90deg); }
    
    .btn-invoice {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px; background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 6px; color: #D4AF37;
      font-size: 0.8rem; font-weight: 600; cursor: pointer;
      transition: all 0.3s;
    }
    .btn-invoice:hover {
      background: rgba(212, 175, 55, 0.2);
      border-color: #D4AF37;
      transform: translateY(-1px);
    }
    .footer-actions { display: flex; align-items: center; gap: 16px; }

    /* Tracking */
    .tracking { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 16px; border-top: 1px solid #333; position: relative; }
    .tracking::before { content: ''; position: absolute; top: 24px; left: 10%; right: 10%; height: 2px; background: #333; }
    .track-step { text-align: center; position: relative; z-index: 2; }
    .track-dot {
      width: 16px; height: 16px; border-radius: 50%; background: #333;
      margin: 0 auto 8px; border: 2px solid #555; transition: 0.3s;
    }
    .track-step span { color: #777; font-size: 0.75rem; }
    .track-step.active .track-dot { background: #D4AF37; border-color: #D4AF37; box-shadow: 0 0 12px rgba(212,175,55,0.4); }
    .track-step.completed .track-dot { background: #27AE60; border-color: #27AE60; }
    .track-step.active span, .track-step.completed span { color: #fff; }

    .wishlist-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .product-card {
      background: #1E1E1E; border: 1px solid #333; border-radius: 12px; overflow: hidden;
      transition: 0.3s;
    }
    .product-card:hover { border-color: rgba(212,175,55,0.3); transform: translateY(-4px); }
    .product-image { position: relative; aspect-ratio: 1; }
    .product-image img { width: 100%; height: 100%; object-fit: cover; }
    .remove-wishlist {
      position: absolute; top: 8px; right: 8px;
      background: rgba(231,76,60,0.9); color: #fff; border: none;
      width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 0.8rem;
    }
    .product-info { padding: 14px; }
    .product-info h3 { font-size: 0.9rem; font-family: 'Poppins'; margin-bottom: 4px; }
    .product-info h3 a { color: #fff; }
    .product-info h3 a:hover { color: #D4AF37; }
    .product-info h3 a:hover { color: #D4AF37; }
    .product-price { color: #D4AF37; font-weight: 700; }

    /* Addresses */
    .address-header { display: flex; justify-content: space-between; align-items: center; }
    .address-header h2 { color: #D4AF37; font-size: 1.25rem; }
    .addresses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .address-card { background: #1E1E1E; border: 1px solid #333; padding: 20px; border-radius: 12px; position: relative; }
    .address-card.default-address { border-color: #D4AF37; background: rgba(212,175,55,0.02); }
    .address-card h4 { color: #fff; margin-bottom: 8px; }
    .address-card p { color: #aaa; font-size: 0.9rem; margin-bottom: 4px; }
    .address-card-header { position: absolute; right: 20px; top: 20px; }
    .address-actions { display: flex; gap: 16px; margin-top: 16px; border-top: 1px solid #333; padding-top: 12px; }
    .btn-text { background: none; border: none; color: #D4AF37; cursor: pointer; font-size: 0.85rem; padding: 0; }
    .text-danger { color: #E74C3C; }
    .btn-outline { background: transparent; border: 1px solid #555; color: #fff; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .btn-outline:hover { background: #333; }
    .default-checkbox { display: flex; align-items: center; gap: 8px; color: #fff; cursor: pointer; font-size: 0.9rem; margin-top: 8px; }
    .checkout-form { background: #1E1E1E; border: 1px solid #333; border-radius: 12px; padding: 32px; max-width: 600px; }
    .checkout-form h3 { color: #D4AF37; margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; color: #aaa; margin-bottom: 8px; font-size: 0.85rem; }
    .form-group input { width: 100%; padding: 12px; background: #252525; border: 1px solid #444; color: #fff; border-radius: 6px; }
    .form-group input:focus { border-color: #D4AF37; outline: none; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .mt-4 { margin-top: 24px; }
    .mt-3 { margin-top: 16px; }

    @media (max-width: 1024px) {
      .profile-details { grid-template-columns: 1fr; }
      .wishlist-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 640px) {
      .dashboard-page { padding: 80px 0 40px; }
      .dashboard-page h1 { font-size: 1.8rem; text-align: center; margin-bottom: 24px; }
      
      .tabs { 
        gap: 0; overflow-x: auto; scrollbar-width: none; 
        padding-bottom: 0; margin-bottom: 24px;
        -webkit-overflow-scrolling: touch;
      }
      .tabs::-webkit-scrollbar { display: none; }
      .tabs button { padding: 12px 16px; font-size: 0.85rem; flex-shrink: 0; }
      
      .profile-header { flex-direction: column; text-align: center; gap: 15px; margin-bottom: 24px; }
      .profile-actions-header { position: static; justify-content: center; width: 100%; margin-top: 15px; }
      
      .order-card { padding: 16px; }
      .order-header { flex-direction: column; align-items: flex-start; gap: 10px; }
      .status-wrap { align-items: flex-start; }
      
      .tracking { 
        flex-direction: column; gap: 15px; padding-left: 20px; 
        border-top: none; border-left: 2px solid #333; margin-left: 10px;
      }
      .tracking::before { display: none; }
      .track-step { display: flex; align-items: center; gap: 15px; text-align: left; }
      .track-dot { margin: 0; }
      
      .wishlist-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .product-info h3 { font-size: 0.8rem; }
      
      .checkout-form { padding: 20px; }
      .form-row { grid-template-columns: 1fr; gap: 0; }
      
      .address-header { flex-direction: column; gap: 12px; align-items: flex-start; }
      .addresses-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
    user: User | null = null;
    orders: Order[] = [];
    wishlistProducts: Product[] = [];
    addresses: Address[] = [];
    activeTab = 'Profile';
    tabs = ['Profile', 'Orders', 'Wishlist', 'Addresses'];
    trackingSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];

    isAddressFormOpen = false;
    editingAddress = false;
    currentAddress: Address = { name: '', phone: '', street: '', city: '', pincode: '', isDefault: false };

    isEditingProfile = false;
    updatingProfile = false;
    editUserData = { name: '', phone: '' };

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            this.authService.uploadProfileImage(file).subscribe({
                next: (res) => {
                    this.notificationService.alert('Profile image updated.', 'success');
                },
                error: (err) => {
                    console.error('Upload Error:', err);
                    this.notificationService.alert(err.error?.message || 'Upload failed.', 'error');
                }
            });
        }
    }

    constructor(
        private authService: AuthService,
        private orderService: OrderService,
        private wishlistService: WishlistService,
        private addressService: AddressService,
        private notificationService: NotificationService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['tab'] && this.tabs.includes(params['tab'])) {
                this.activeTab = params['tab'];
            }
        });
        this.authService.user$.subscribe(user => {
            this.user = user;
        });
        this.orderService.getUserOrders().subscribe(orders => this.orders = orders);
        this.wishlistService.getWishlist().subscribe(wl => this.wishlistProducts = wl.products || []);
        this.fetchAddresses();
    }

    fetchAddresses() {
        this.addressService.getAddresses().subscribe({
            next: (addrs) => this.addresses = addrs,
            error: (err) => console.error('Failed to load addresses:', err)
        });
    }

    openAddressForm() {
        this.isAddressFormOpen = true;
        this.editingAddress = false;
        this.currentAddress = { name: '', phone: '', street: '', city: '', pincode: '', isDefault: this.addresses.length === 0 };
    }

    editAddress(address: Address) {
        this.isAddressFormOpen = true;
        this.editingAddress = true;
        this.currentAddress = { ...address };
    }

    cancelAddressForm() {
        this.isAddressFormOpen = false;
    }

    saveAddress() {
        if (!this.currentAddress.name || !this.currentAddress.street || !this.currentAddress.city) {
            this.notificationService.alert('Please fill out all required fields.', 'error');
            return;
        }

        if (this.editingAddress && this.currentAddress._id) {
            this.addressService.updateAddress(this.currentAddress._id, this.currentAddress).subscribe({
                next: (addrs) => {
                    this.addresses = addrs;
                    this.isAddressFormOpen = false;
                    this.notificationService.alert('Address updated successfully.', 'success');
                },
                error: (err) => {
                    console.error('Update Address Error:', err);
                    const msg = err.error?.message || 'Failed to update address.';
                    this.notificationService.alert(msg, 'error');
                }
            });
        } else {
            this.addressService.addAddress(this.currentAddress).subscribe({
                next: (addrs) => {
                    this.addresses = addrs;
                    this.isAddressFormOpen = false;
                    this.notificationService.alert('Address saved successfully.', 'success');
                },
                error: (err) => {
                    console.error('Add Address Error:', err);
                    const msg = err.error?.message || 'Failed to save address.';
                    this.notificationService.alert(msg, 'error');
                }
            });
        }
    }

    toggleEditProfile() {
        this.isEditingProfile = !this.isEditingProfile;
        if (this.isEditingProfile && this.user) {
            this.editUserData = { name: this.user.name, phone: this.user.phone || '' };
        }
    }

    updateProfile() {
        if (!this.editUserData.name) {
            this.notificationService.alert('Name is required.', 'error');
            return;
        }

        this.updatingProfile = true;
        this.authService.updateProfile(this.editUserData).subscribe({
            next: (updatedUser) => {
                this.user = updatedUser;
                this.isEditingProfile = false;
                this.updatingProfile = false;
                this.notificationService.alert('Profile updated successfully.', 'success');
            },
            error: (err) => {
                console.error('Profile Update Error:', err);
                this.updatingProfile = false;
                this.notificationService.alert('Failed to update profile.', 'error');
            }
        });
    }

    async deleteAddress(id: string) {
        const confirmed = await this.notificationService.confirm('Are you sure you want to delete this specific address?');
        if (confirmed) {
            this.addressService.deleteAddress(id).subscribe({
                next: (addrs) => {
                    this.addresses = addrs;
                    this.notificationService.alert('Address deleted.', 'success');
                },
                error: () => this.notificationService.alert('Failed to delete address.', 'error')
            });
        }
    }

    isStepActive(status: string, step: string): boolean { return status === step; }
    isStepCompleted(status: string, step: string): boolean {
        const order = this.trackingSteps.indexOf(status);
        const stepIdx = this.trackingSteps.indexOf(step);
        return stepIdx < order;
    }

    removeFromWishlist(id: string) {
        this.wishlistService.removeFromWishlist(id).subscribe(wl => this.wishlistProducts = wl.products || []);
    }

    canCancel(order: Order): boolean {
        // Can cancel if Pending or Processing.
        // Can request cancellation if Shipped.
        // Cannot cancel if Delivered, Cancelled or already has a Pending request.
        if (order.status === 'Delivered' || order.status === 'Cancelled') return false;
        if (order.cancellation?.status === 'Pending') return false;
        return true;
    }

    async onCancelOrder(order: Order) {
        const reason = await this.notificationService.prompt(
            `Are you sure you want to cancel Order #${order._id.slice(-8).toUpperCase()}?`,
            'Cancel Order',
            'Please provide a reason for cancellation...'
        );
        
        if (reason === null) return; 
        
        if (!reason.trim()) {
            await this.notificationService.alert('Reason is required for cancellation.', 'error');
            return;
        }

        this.orderService.cancelOrderAction(order._id, reason).subscribe({
            next: async (updatedOrder) => {
                const index = this.orders.findIndex(o => o._id === updatedOrder._id);
                if (index !== -1) {
                    this.orders[index] = updatedOrder;
                    this.orders = [...this.orders]; // FORCE REACTIVE UPDATE
                }
                
                let msg = updatedOrder.status === 'Cancelled' ? 'Order cancelled successfully!' : 'Cancellation request submitted.';
                if (updatedOrder.status === 'Cancelled' && updatedOrder.paymentMethod === 'Online') {
                    msg += ' Your payment will be refunded soon.';
                }
                
                await this.notificationService.alert(msg, 'success', 'Success');
            },
            error: async (err) => {
                await this.notificationService.alert(err.error?.message || 'Error occurred while cancelling order', 'error');
            }
        });
    }

    async getInvoice(order: Order) {
        if (order.status === 'Cancelled') {
            await this.notificationService.alert('Your order is cancelled. Invoice is not available for cancelled orders.', 'error', 'Order Cancelled');
            return;
        }

        this.orderService.downloadInvoice(order._id).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Invoice_${order._id.slice(-8).toUpperCase()}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            },
            error: async (err) => {
                await this.notificationService.alert('Failed to download invoice. Please try again later.', 'error');
            }
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
