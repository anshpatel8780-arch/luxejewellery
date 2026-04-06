import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CouponService } from '../../services/coupon.service';
import { Product, Order, User, OrderStats, Coupon } from '../../models/product.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-layout animate-fadeIn">
      <!-- Mobile Header -->
      <header class="mobile-admin-header">
        <button class="mobile-toggle-btn" (click)="toggleSidebar()">
          <i class="fa-solid" [ngClass]="showMobileSidebar ? 'fa-xmark' : 'fa-bars'"></i>
        </button>
        <span class="mobile-title">LUXEJEWELS ADMIN</span>
      </header>

      <!-- Sidebar Navigation -->
      <aside class="admin-sidebar shadow-premium" [class.mobile-active]="showMobileSidebar">
        <div class="sidebar-header">
          <img src="assets/logo.png" alt="Admin Logo" class="sidebar-logo-img">
          <div class="logo-wrapper">
             <span class="logo-sub">ADMINISTRATION</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <button *ngFor="let tab of tabs" 
            [class.active]="activeTab === tab" 
            (click)="switchTab(tab)"
            class="nav-item">
            <div class="nav-icon-box">
              <i class="fa-solid" [ngClass]="getTabIcon(tab)"></i>
            </div>
            <span>{{tab}}</span>
            <i class="fa-solid fa-chevron-right arrow"></i>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="footer-divider"></div>
          <button class="logout-btn" (click)="authService.logout()">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="admin-main">
        <header class="admin-header shadow-subtle">
          <div class="header-content">
            <div class="header-title">
              <h1>{{activeTab}} <span class="gold-gradient">Overview</span></h1>
              <p class="breadcrumb">Admin / {{activeTab}}</p>
            </div>
            
            <div class="admin-profile" (click)="switchTab('Profile')" title="Edit Profile">
              <div class="avatar-wrapper">
                <img [src]="getUserImage(authService.user$ | async)" class="header-avatar" alt="Admin Avatar">
                <div class="status-dot"></div>
              </div>
            </div>
          </div>
        </header>

        <section class="admin-body">
          <!-- Dashboard Section -->
          <div *ngIf="activeTab === 'Dashboard'" class="tab-content animate-fadeIn">
            <div class="stats-grid">
              <div class="stat-card shine-effect luxury-card">
                <div class="stat-icon-wrapper orders"><i class="fa-solid fa-shopping-bag"></i></div>
                <div class="stat-data">
                  <h3>{{stats.totalOrders}}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div class="stat-card luxury-card">
                <div class="stat-icon-wrapper users"><i class="fa-solid fa-users"></i></div>
                <div class="stat-data">
                  <h3>{{stats.totalUsers}}</h3>
                  <p>Registered Clients</p>
                </div>
              </div>
              <div class="stat-card luxury-card highlight">
                <div class="stat-icon-wrapper revenue"><i class="fa-solid fa-indian-rupee-sign"></i></div>
                <div class="stat-data">
                  <h3>{{stats.totalRevenue | number}}</h3>
                  <p>Net Revenue</p>
                </div>
              </div>
              <div class="stat-card luxury-card">
                <div class="stat-icon-wrapper products"><i class="fa-solid fa-gem"></i></div>
                <div class="stat-data">
                  <h3>{{totalProducts}}</h3>
                  <p>Live Inventory</p>
                </div>
              </div>
            </div>

            <div *ngIf="isLoading" class="analytics-loading">
              <div class="luxury-spinner"></div>
              <p>Gathering Real-Time Insights...</p>
            </div>

            <div *ngIf="!isLoading" class="dashboard-analytics animate-fadeIn">
              <div class="chart-box luxury-card">
                <div class="chart-header"><h4><i class="fa-solid fa-chart-bar gold"></i> Orders by Status</h4></div>
                <div class="chart-container">
                  <canvas *ngIf="hasData('status')" id="statusChart"></canvas>
                  <div *ngIf="!hasData('status')" class="no-data-placeholder">
                    <i class="fa-solid fa-layer-group"></i>
                    <p>No orders to analyze yet</p>
                  </div>
                </div>
              </div>

              <div class="chart-box luxury-card">
                <div class="chart-header"><h4><i class="fa-solid fa-sack-dollar gold"></i> Monthly Revenue</h4></div>
                <div class="chart-container">
                  <canvas *ngIf="hasData('revenue')" id="revenueChart"></canvas>
                  <div *ngIf="!hasData('revenue')" class="no-data-placeholder">
                    <i class="fa-solid fa-calendar-alt"></i>
                    <p>Awaiting revenue milestones</p>
                  </div>
                </div>
              </div>

              <div class="chart-box luxury-card wide">
                <div class="chart-header">
                  <h4><i class="fa-solid fa-chart-line gold"></i> Sales Overview</h4>
                  <div class="date-filter-group">
                    <div class="date-input-wrapper">
                      <label>From</label>
                      <input type="date" [(ngModel)]="startDate" (change)="onDateRangeChange()" class="premium-date-input">
                    </div>
                    <div class="date-input-wrapper">
                      <label>To</label>
                      <input type="date" [(ngModel)]="endDate" (change)="onDateRangeChange()" class="premium-date-input">
                    </div>
                  </div>
                </div>
                <div class="chart-container">
                  <canvas *ngIf="hasData('trend')" id="trendChart"></canvas>
                  <div *ngIf="!hasData('trend')" class="no-data-placeholder">
                    <i class="fa-solid fa-chart-line"></i>
                    <p>No sales activity in this period</p>
                  </div>
                </div>
              </div>

              <div class="chart-box luxury-card">
                <div class="chart-header"><h4><i class="fa-solid fa-trophy gold"></i> Top Selling Products</h4></div>
                <div class="chart-container">
                  <canvas *ngIf="hasData('topProducts')" id="topProductsChart"></canvas>
                  <div *ngIf="!hasData('topProducts')" class="no-data-placeholder">
                    <i class="fa-solid fa-box-open"></i>
                    <p>Best sellers will appear here</p>
                  </div>
                </div>
              </div>

              <div class="chart-box luxury-card">
                <div class="chart-header"><h4><i class="fa-solid fa-pie-chart gold"></i> Category Distribution</h4></div>
                <div class="chart-container">
                  <canvas *ngIf="hasData('category')" id="categoryChart"></canvas>
                  <div *ngIf="!hasData('category')" class="no-data-placeholder">
                    <i class="fa-solid fa-tags"></i>
                    <p>No products in inventory yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Section -->
          <div *ngIf="activeTab === 'Products'" class="tab-content animate-fadeIn">
            <div class="action-bar">
              <button class="btn-luxe" (click)="showProductForm = !showProductForm">
                <i class="fa-solid" [ngClass]="showProductForm ? 'fa-xmark' : 'fa-plus'"></i>
                {{showProductForm ? 'Close Editor' : 'Add New Product'}}
              </button>
            </div>

            <div *ngIf="showProductForm" class="editor-panel luxury-card animate-slideDown">
              <form (submit)="saveProduct()" class="premium-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Product Name</label>
                    <input [(ngModel)]="productForm.name" name="name" placeholder="Enter product title..." required>
                  </div>
                  <div class="form-group">
                    <label>Base Price (₹)</label>
                    <input type="number" [(ngModel)]="productForm.price" name="price" required>
                  </div>
                  <div class="form-group">
                    <label>Collection / Category</label>
                    <select [(ngModel)]="productForm.category" name="category">
                      <option *ngFor="let cat of categoriesList" [value]="cat">{{cat}}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Metal / Purity</label>
                    <select [(ngModel)]="productForm.goldType" name="goldType">
                      <option *ngFor="let g of goldTypes" [value]="g">{{g}}</option>
                    </select>
                  </div>
                </div>
                <div class="form-group full-width">
                  <label>Luxury Description</label>
                  <textarea [(ngModel)]="productForm.description" name="description" rows="3"></textarea>
                </div>
                <div class="form-grid low-gap">
                   <div class="form-group checkbox-group">
                     <label><input type="checkbox" [(ngModel)]="productForm.featured" name="featured"> Featured Piece</label>
                     <label style="margin-left: 20px;"><input type="checkbox" [(ngModel)]="productForm.bestSeller" name="bestSeller"> Best Seller</label>
                   </div>
                    <div class="form-group">
                      <label>Upload File (Max 4)</label>
                      <input type="file" multiple (change)="onFileSelected($event)" accept="image/*" class="file-input">
                    </div>
                    <div class="form-group">
                      <label>Inventory Stock</label>
                      <input type="number" [(ngModel)]="productForm.stock" name="stock" required>
                    </div>
                 </div>

                 <div class="form-grid" style="grid-template-columns: repeat(2, 1fr);">
                    <div class="form-group">
                      <label>Image URL 1 (Main)</label>
                      <input [(ngModel)]="productForm.imageUrl1" name="imageUrl1" placeholder="HTTPS Link to image 1...">
                    </div>
                    <div class="form-group">
                      <label>Image URL 2</label>
                      <input [(ngModel)]="productForm.imageUrl2" name="imageUrl2" placeholder="HTTPS Link to image 2...">
                    </div>
                    <div class="form-group">
                      <label>Image URL 3</label>
                      <input [(ngModel)]="productForm.imageUrl3" name="imageUrl3" placeholder="HTTPS Link to image 3...">
                    </div>
                    <div class="form-group">
                      <label>Image URL 4</label>
                      <input [(ngModel)]="productForm.imageUrl4" name="imageUrl4" placeholder="HTTPS Link to image 4...">
                    </div>
                 </div>
                
                <div class="file-preview" *ngIf="selectedFiles.length > 0">
                  <div *ngFor="let f of selectedFiles; let i = index" class="file-token">
                    {{f.name}} <i class="fa-solid fa-xmark" (click)="removeFile(i)"></i>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-save" [disabled]="isSavingProduct">
                    {{isSavingProduct ? 'Persisting...' : 'Live on Catalog'}}
                  </button>
                </div>
              </form>
            </div>

            <div class="table-wrapper shadow-premium">
              <table class="luxe-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Metal</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of products" [class.low-stock-row]="p.stock > 0 && p.stock <= 5" [class.out-of-stock-row]="p.stock === 0">
                    <td class="name-cell">
                      <img [src]="p.images[0]" class="mini-thumb">
                      <div class="name-wrapper">
                        <span>{{p.name}}</span>
                        <div class="stock-alerts-mini">
                          <span *ngIf="p.stock > 0 && p.stock <= 5" class="mini-label low">Low Stock</span>
                          <span *ngIf="p.stock === 0" class="mini-label out">Out of Stock</span>
                        </div>
                      </div>
                    </td>
                    <td>{{p.category}}</td>
                    <td class="gold-text">₹{{p.price | number}}</td>
                    <td>{{p.goldType}}</td>
                    <td>
                      <span class="badge" [ngClass]="p.stock > 0 ? (p.stock <= 5 ? 'lowstock' : 'instock') : 'outstock'">
                        {{p.stock > 0 ? p.stock + ' in Stock' : 'Sold Out'}}
                      </span>
                    </td>
                    <td class="actions">
                      <button (click)="editProduct(p)" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button class="delete" (click)="deleteProduct(p._id)" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Orders Section -->
          <div *ngIf="activeTab === 'Orders'" class="tab-content animate-fadeIn">
             <div class="table-wrapper shadow-premium">
              <table class="luxe-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Placement Date</th>
                    <th>Fulfillment</th>
                    <th>Control</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let o of orders">
                    <td class="id-cell">#{{o._id.substring(o._id.length-8)}}</td>
                    <td>{{o.userId.name}}</td>
                    <td class="gold-text">₹{{o.totalPrice | number}}</td>
                    <td>{{o.createdAt | date:'mediumDate'}}</td>
                    <td><span class="status-pill" [ngClass]="o.status.toLowerCase()">{{o.status}}</span></td>
                    <td>
                      <select [ngModel]="o.status" (ngModelChange)="updateOrderStatus(o._id, $event)" 
                              class="mini-select"
                              [disabled]="o.status === 'Delivered' || o.status === 'Cancelled'">
                        <option *ngFor="let st of getFilteredStatuses(o)" [value]="st">{{st}}</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Users Section -->
          <div *ngIf="activeTab === 'Users'" class="tab-content animate-fadeIn">
            <div class="table-wrapper shadow-premium">
              <table class="luxe-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of users">
                    <td class="name-cell">
                      <img [src]="getUserImage(u)" class="mini-thumb" [alt]="u.name">
                      <span>{{u.name}}</span>
                    </td>
                    <td>{{u.email}}</td>
                    <td>
                      <span *ngIf="u.lastLogin" style="font-size: 0.8rem; color: #888;">
                        {{u.lastLogin | date:'short'}}
                      </span>
                      <span *ngIf="!u.lastLogin" style="font-size: 0.8rem; color: #555;">Never</span>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="u.role === 'admin' ? 'instock' : (u.isSuspended ? 'outstock' : 'gold-text')">
                        {{u.isSuspended ? 'Suspended' : u.role}}
                      </span>
                      <i class="fa-solid fa-circle-check gold" *ngIf="u.verified" style="margin-left: 8px;" title="Verified"></i>
                    </td>
                    <td class="actions">
                      <button [class]="u.isSuspended ? 'btn-approve' : 'delete'" 
                              (click)="toggleSuspension(u._id)" 
                              [title]="u.isSuspended ? 'Activate Account' : 'Suspend Account'"
                              style="margin-right: 8px;">
                        <i class="fa-solid" [ngClass]="u.isSuspended ? 'fa-user-check' : 'fa-user-slash'"></i>
                      </button>
                      <button class="delete" (click)="deleteUser(u._id)" title="Terminate Account">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Cancellations Section -->
          <div *ngIf="activeTab === 'Cancellations'" class="tab-content animate-fadeIn">
             <div class="table-wrapper shadow-premium">
              <table class="luxe-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Reason</th>
                    <th>Request Date</th>
                    <th>Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of cancellationRequests">
                    <td class="id-cell">#{{c.orderId.substring(c.orderId.length-8)}}</td>
                    <td class="reason-cell">"{{c.reason}}"</td>
                    <td>{{c.requestedAt | date}}</td>
                    <td class="actions wide">
                      <button class="btn-approve" (click)="processRequest(c._id, 'Approved')">Approve</button>
                      <button class="btn-reject" (click)="processRequest(c._id, 'Rejected')">Reject</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Coupons Section -->
          <div *ngIf="activeTab === 'Coupons'" class="tab-content animate-fadeIn">
            <div class="action-bar">
              <button class="btn-luxe" (click)="showCouponForm = !showCouponForm">
                <i class="fa-solid" [ngClass]="showCouponForm ? 'fa-xmark' : 'fa-plus'"></i>
                {{showCouponForm ? 'Close Editor' : 'Issue New Coupon'}}
              </button>
            </div>

            <div *ngIf="showCouponForm" class="editor-panel luxury-card animate-slideDown">
                <form (submit)="saveCoupon()" class="premium-form">
                  <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
                    <div class="form-group">
                      <label>Coupon Code</label>
                      <input [(ngModel)]="couponForm.code" name="code" placeholder="e.g. GOLDEN20" required>
                    </div>
                    <div class="form-group">
                      <label>Discount Type Mode</label>
                      <div class="luxe-toggle-group">
                        <button type="button" class="toggle-btn" [class.active]="couponForm.discountType === 'percentage'" (click)="setDiscountType('percentage')">
                          <i class="fa-solid fa-percent"></i> Percentage
                        </button>
                        <button type="button" class="toggle-btn" [class.active]="couponForm.discountType === 'fixed'" (click)="setDiscountType('fixed')">
                          <i class="fa-solid fa-indian-rupee-sign"></i> Fixed Amount
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="form-grid" style="grid-template-columns: 1fr 1fr 1fr;">
                    <div class="form-group animate-slideInLeft" *ngIf="couponForm.discountType === 'percentage'">
                      <label>Percentage (%) Value</label>
                      <input type="number" [(ngModel)]="couponForm.percentageValue" name="percentageValue" placeholder="e.g. 10" min="0" max="100" required>
                    </div>
                    <div class="form-group animate-slideInLeft" *ngIf="couponForm.discountType === 'fixed'">
                      <label>Fixed Amount (₹) Value</label>
                      <input type="number" [(ngModel)]="couponForm.fixedValue" name="fixedValue" placeholder="e.g. 500" min="0" required>
                    </div>
                    <div class="form-group">
                      <label>Minimum Order Amount (₹)</label>
                      <input type="number" [(ngModel)]="couponForm.minOrderAmount" name="minOrderAmount" placeholder="e.g. 1000" min="0">
                    </div>
                    <div class="form-group">
                      <label>Expiry Date</label>
                      <input type="date" [(ngModel)]="couponForm.expiryDate" name="expiryDate" required>
                    </div>
                  </div>
                  <div class="form-grid">
                    <div class="form-group">
                      <label>Scope</label>
                      <select [(ngModel)]="couponForm.scope" name="scope">
                        <option value="all">Global (All Products - Broadcast Email)</option>
                        <option value="product">Single Product</option>
                      </select>
                    </div>
                    <div class="form-group" *ngIf="couponForm.scope === 'product'">
                      <label>Select Product</label>
                      <select [(ngModel)]="couponForm.productId" name="productId">
                        <option *ngFor="let p of products" [value]="p._id">{{p.name}}</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-actions">
                    <button type="submit" class="btn-save" [disabled]="isSavingCoupon">
                      {{isSavingCoupon ? 'Issuing Ticket...' : 'Activate Campaign'}}
                    </button>
                  </div>
                </form>
            </div>

            <div class="coupon-grid">
              <div *ngFor="let cp of coupons" class="coupon-voucher" [class.expired]="isExpired(cp.expiryDate)">
                <div class="voucher-inner">
                  <div class="voucher-left">
                    <div class="holes-top"></div>
                    <div class="discount-display">
                      <span class="symbol" *ngIf="cp.discountType === 'fixed'">₹</span>
                      <span class="amt">{{cp.discountValue}}</span>
                      <span class="symbol" *ngIf="cp.discountType === 'percentage'">%</span>
                    </div>
                    <div class="off-text">DISCOUNT</div>
                    <div class="holes-bottom"></div>
                  </div>
                  
                  <div class="voucher-right">
                    <div class="status-badge" [class.active]="!isExpired(cp.expiryDate)">
                      {{isExpired(cp.expiryDate) ? 'EXPIRED' : 'ACTIVE'}}
                    </div>
                    <div class="voucher-info">
                      <h4 class="code-text">{{cp.code}}</h4>
                      <p class="expiry-text">Valid Until: {{cp.expiryDate | date:'mediumDate'}}</p>
                      <div class="scope-row">
                        <i class="fa-solid" [ngClass]="cp.scope === 'all' ? 'fa-globe' : 'fa-gem'"></i>
                        <span>{{cp.scope === 'all' ? 'Universal Access' : 'Limited Edition'}}</span>
                      </div>
                    </div>
                    <button class="btn-delete-voucher" (click)="deleteCoupon(cp._id)" title="Retire Coupon">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Section -->
          <div *ngIf="activeTab === 'Profile'" class="tab-content animate-fadeIn">
            <div class="profile-container luxury-card shadow-premium">
              <div class="profile-header-studio">
                <div class="avatar-studio">
                  <div class="studio-avatar-wrapper">
                    <img [src]="getUserImage(authService.user$ | async)" class="studio-avatar" alt="Admin Avatar">
                    <label class="avatar-edit-overlay">
                      <i class="fa-solid fa-camera"></i>
                      <input type="file" (change)="onProfileImageSelected($event)" accept="image/*" hidden>
                    </label>
                  </div>
                  <div class="studio-info">
                    <h2>Admin Profile Settings</h2>
                    <p>Manage your account credentials and security</p>
                    <button class="btn-update-img" (click)="avatarInput.click()">
                      <i class="fa-solid fa-camera"></i> Change Photo
                    </button>
                    <input #avatarInput type="file" (change)="onProfileImageSelected($event)" accept="image/*" hidden>
                  </div>
                </div>
              </div>

              <div class="profile-details-grid">
                <form (submit)="saveProfile()" class="premium-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Full Professional Name</label>
                      <div class="input-with-icon">
                        <i class="fa-solid fa-user-tie"></i>
                        <input [(ngModel)]="profileForm.name" name="name" placeholder="Enter your full name..." required>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Email Address</label>
                      <div class="input-with-icon">
                        <i class="fa-solid fa-envelope"></i>
                        <input [(ngModel)]="profileForm.email" name="email" type="email" placeholder="email@example.com" required disabled>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Contact Number</label>
                      <div class="input-with-icon">
                        <i class="fa-solid fa-phone"></i>
                        <input [(ngModel)]="profileForm.phone" name="phone" placeholder="Your phone number...">
                      </div>
                    </div>
                  </div>

                  <div class="profile-actions">
                    <button type="submit" class="btn-save" [disabled]="isSavingProfile">
                      <i class="fa-solid" [ngClass]="isSavingProfile ? 'fa-spinner fa-spin' : 'fa-check-circle'"></i>
                      {{isSavingProfile ? 'Updating Credentials...' : 'Save Profile Changes'}}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; background: #080808; color: #e0e0e0; font-family: 'Inter', sans-serif; }
    
    /* Sidebar Renaissance */
    .admin-sidebar { width: 300px; background: #0a0a0a; border-right: 1px solid rgba(212, 175, 55, 0.1); display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 1000; box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
    .sidebar-header { padding: 40px 30px; display: flex; flex-direction: column; align-items: center; gap: 15px; background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(212, 175, 55, 0.05); }
    .sidebar-logo-img { height: 90px; width: 90px; object-fit: cover; border-radius: 50%; border: 2.5px solid #D4AF37; padding: 3px; box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); background: #000; }
    .logo-sub { font-size: 0.7rem; letter-spacing: 5px; color: #D4AF37; font-weight: 800; text-transform: uppercase; margin-top: 8px; opacity: 0.8; }
    .gold-glow { color: #D4AF37; font-size: 2rem; font-family: 'Playfair Display', serif; filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.4)); }

    .sidebar-nav { padding: 20px 15px; flex: 1; overflow-y: auto; overflow-x: hidden; }
    .sidebar-nav::-webkit-scrollbar { width: 5px; }
    .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }
    .sidebar-nav::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.4); }
    .nav-item { 
      width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 18px; 
      background: none; border: none; color: #aaa; cursor: pointer; transition: 0.3s; 
      border-radius: 12px; margin-bottom: 8px; font-weight: 500; font-size: 0.95rem;
    }
    .nav-item:hover { background: rgba(212, 175, 55, 0.05); color: #fff; }
    .nav-item.active { background: #D4AF37; color: #000; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3); }
    .nav-icon-box { width: 30px; display: flex; justify-content: center; }
    .nav-item.active .nav-icon-box { color: #000; }
    .arrow { margin-left: auto; font-size: 0.7rem; opacity: 0.4; }
    .nav-item.active .arrow { opacity: 0.8; }

    .sidebar-footer { padding: 20px; flex-shrink: 0; }
    .footer-divider { height: 1px; background: rgba(255,255,255,0.05); margin-bottom: 20px; }
    .logout-btn { 
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; 
      padding: 14px; background: rgba(255, 68, 68, 0.05); border: 1px solid rgba(255, 68, 68, 0.2); 
      color: #ff4444; border-radius: 12px; cursor: pointer; transition: 0.3s; font-weight: 600;
      letter-spacing: 0.5px;
    }
    .logout-btn:hover { background: #ff4444; color: #fff; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3); }

    /* Main Canvas Renaissance */
    .admin-main { flex: 1; margin-left: 300px; background: #080808; min-height: 100vh; }
    .admin-header { background: rgba(15, 15, 15, 0.8); backdrop-filter: blur(20px); padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); sticky: top; top: 0; z-index: 900; }
    .header-content { display: flex; align-items: center; justify-content: space-between; }
    .header-title h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; margin: 0; }
    .breadcrumb { font-size: 0.75rem; color: #666; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px; }
    .gold-gradient { background: linear-gradient(90deg, #D4AF37, #f1d592); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .admin-profile { display: flex; align-items: center; gap: 15px; cursor: pointer; padding: 6px 12px; border-radius: 40px; transition: 0.3s; }
    .admin-profile:hover { background: rgba(255,255,255,0.03); }
    .profile-info { text-align: right; }
    .admin-name { display: block; font-size: 0.85rem; font-weight: 700; color: #fff; }
    .admin-status { font-size: 0.7rem; color: #44ff44; font-weight: 600; }
    .avatar-wrapper { position: relative; }
    .header-avatar { width: 44px; height: 44px; border-radius: 50%; border: 2px solid #D4AF37; padding: 2px; object-fit: cover; }
    .status-dot { width: 12px; height: 12px; background: #44ff44; border: 2px solid #0f0f0f; border-radius: 50%; position: absolute; bottom: 2px; right: 2px; }

    /* Profile Studio Styles */
    .profile-container { max-width: 900px; margin: 0 auto; overflow: hidden; }
    .profile-header-studio { padding: 40px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.05), transparent); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .avatar-studio { display: flex; align-items: center; gap: 30px; }
    .studio-avatar-wrapper { position: relative; width: 120px; height: 120px; border-radius: 50%; border: 3px solid #D4AF37; padding: 5px; }
    .studio-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
    .avatar-edit-overlay { 
      position: absolute; inset: 5px; background: rgba(0,0,0,0.6); 
      border-radius: 50%; display: flex; align-items: center; justify-content: center; 
      opacity: 0; transition: 0.3s; cursor: pointer; color: #fff; font-size: 1.5rem;
    }
    .studio-avatar-wrapper:hover .avatar-edit-overlay { opacity: 1; }
    .studio-info h2 { font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0 0 5px 0; color: #D4AF37; }
    .studio-info p { color: #888; font-size: 0.9rem; margin: 0; }

    .profile-details-grid { padding: 40px; }
    .form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .input-with-icon { position: relative; }
    .input-with-icon i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #D4AF37; opacity: 0.6; }
    .input-with-icon input { padding-left: 45px !important; }
    .form-group.checkbox-group { display: flex; align-items: center; gap: 20px; padding: 10px 0; }
    .checkbox-group label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; color: #fff; transform: none !important; margin: 0 !important; }
    .checkbox-group input { width: 18px; height: 18px; accent-color: #D4AF37; cursor: pointer; }

    .form-actions { display: flex; justify-content: flex-end; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
    .btn-update-img { 
      margin-top: 15px; background: rgba(212, 175, 55, 0.1); color: #D4AF37; 
      border: 1px solid rgba(212, 175, 55, 0.3); padding: 8px 20px; border-radius: 8px; 
      font-weight: 600; cursor: pointer; transition: 0.3s; font-size: 0.85rem;
      display: flex; align-items: center; gap: 8px;
    }
    .btn-update-img:hover { background: #D4AF37; color: #000; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2); }

    /* Body & Tables */
    .admin-body { padding: 40px; }
    .luxury-card { background: #0f0f0f; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; transition: 0.3s; }
    .luxury-card:hover { border-color: rgba(212, 175, 55, 0.2); }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; margin-bottom: 40px; }
    .stat-card { padding: 25px; display: flex; align-items: center; gap: 20px; }
    .stat-icon-wrapper { width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .stat-icon-wrapper.orders { background: rgba(212, 175, 55, 0.1); color: #D4AF37; }
    .stat-icon-wrapper.users { background: rgba(80, 200, 120, 0.1); color: #50C878; }
    .stat-icon-wrapper.revenue { background: rgba(212, 175, 55, 0.1); color: #D4AF37; }
    .stat-icon-wrapper.products { background: rgba(100, 149, 237, 0.1); color: #6495ED; }
    .stat-data h3 { font-size: 1.8rem; font-weight: 800; margin: 0; color: #fff; }
    .stat-data p { font-size: 0.8rem; color: #888; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 600; }
    .highlight { background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), transparent); }

    .luxe-table { width: 100%; border-collapse: separate; border-spacing: 0; }
    .luxe-table th { padding: 18px 25px; text-align: left; background: #151515; color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .luxe-table td { padding: 20px 25px; border-bottom: 1px solid rgba(255,255,255,0.02); font-size: 0.9rem; }
    .luxe-table tr:hover td { background: rgba(255,255,255,0.01); }
    .mini-thumb { width: 45px; height: 45px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
    .name-cell { display: flex; align-items: center; gap: 15px; font-weight: 600; color: #fff; }
    .gold-text { color: #D4AF37; font-weight: 700; }
    
    .status-pill { 
      padding: 6px 14px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; 
      text-transform: uppercase; letter-spacing: 1px; display: inline-flex; align-items: center; gap: 8px;
      border: 1px solid transparent;
    }
    .status-pill::before { content: ""; width: 6px; height: 6px; border-radius: 50%; }

    .status-pill.pending { 
      background: rgba(255, 179, 0, 0.08); color: #FFB300; border-color: rgba(255, 179, 0, 0.2); 
    }
    .status-pill.pending::before { background: #FFB300; box-shadow: 0 0 8px #FFB300; }

    .status-pill.confirmed { 
      background: rgba(80, 200, 120, 0.08); color: #50C878; border-color: rgba(80, 200, 120, 0.2); 
    }
    .status-pill.confirmed::before { background: #50C878; box-shadow: 0 0 8px #50C878; }

    .status-pill.processing { 
      background: rgba(187, 134, 252, 0.08); color: #BB86FC; border-color: rgba(187, 134, 252, 0.2); 
    }
    .status-pill.processing::before { background: #BB86FC; box-shadow: 0 0 8px #BB86FC; }

    .status-pill.shipped { 
      background: rgba(3, 218, 198, 0.08); color: #03DAC6; border-color: rgba(3, 218, 198, 0.2); 
    }
    .status-pill.shipped::before { background: #03DAC6; box-shadow: 0 0 8px #03DAC6; }

    .status-pill.delivered { 
      background: rgba(0, 200, 83, 0.08); color: #00C853; border-color: rgba(0, 200, 83, 0.2); 
    }
    .status-pill.delivered::before { background: #00C853; box-shadow: 0 0 8px #00C853; }

    .status-pill.cancelled { 
      background: rgba(255, 82, 82, 0.08); color: #FF5252; border-color: rgba(255, 82, 82, 0.2); 
    }
    .status-pill.cancelled::before { background: #FF5252; box-shadow: 0 0 8px #FF5252; }

    /* Stock Management Row Highlights */
    .low-stock-row td { background: rgba(212, 175, 55, 0.05) !important; }
    .out-of-stock-row td { background: rgba(231, 76, 60, 0.08) !important; }
    
    .name-wrapper { display: flex; flex-direction: column; gap: 4px; }
    .stock-alerts-mini { display: flex; gap: 8px; }
    .mini-label { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
    .mini-label.low { background: rgba(212, 175, 55, 0.2); color: #D4AF37; }
    .mini-label.out { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }

    .badge.lowstock { background: rgba(212, 175, 55, 0.1); color: #D4AF37; border: 1px solid rgba(212, 175, 55, 0.3); }
    .badge.instock { background: rgba(80, 200, 120, 0.1); color: #50C878; }
    .badge.outstock { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }

    /* Animations */
    .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-slideDown { animation: slideDown 0.4s ease-out; }
    @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    /* Forms */
    .editor-panel { padding: 30px; margin-bottom: 30px; }
    .premium-form .form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
    .form-group label { display: block; font-size: 0.75rem; color: #666; margin-bottom: 8px; text-transform: uppercase; font-weight: 700; }
    .form-group input, .form-group select, .form-group textarea { 
      width: 100%; background: #151515; border: 1px solid rgba(255,255,255,0.1); 
      padding: 12px 16px; border-radius: 10px; color: #fff; transition: 0.3s;
    }
    .form-group input:focus { border-color: #D4AF37; outline: none; background: #1a1a1a; }
    .btn-luxe { 
      background: #D4AF37; color: #000; padding: 12px 25px; border: none; 
      border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s;
      display: flex; align-items: center; gap: 10px; margin-bottom: 25px;
    }
    .btn-luxe:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }
    .btn-save { 
      background: #D4AF37; color: #000; padding: 14px 30px; border: none; 
      border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s;
      display: flex; align-items: center; gap: 10px; font-size: 0.95rem;
      border: 1px solid #D4AF37;
    }
    .btn-save:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4); background: #f1d592; }
    .btn-save:disabled { background: #333; border-color: #444; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }

     /* Dashboard Analytics */
    .analytics-loading, .no-data-placeholder { 
      min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; 
      gap: 20px; background: rgba(15, 15, 15, 0.5); border-radius: 20px; border: 1px dashed rgba(212, 175, 55, 0.2);
    }
    .no-data-placeholder { height: 350px; background: transparent; border: none; }
    .no-data-placeholder i { font-size: 2.5rem; color: #D4AF37; opacity: 0.3; filter: grayscale(1); }
    .no-data-placeholder p { font-size: 0.9rem; font-weight: 500; color: #666; }

    .luxury-spinner {
      width: 50px; height: 50px; border: 3px solid rgba(212, 175, 55, 0.1);
      border-top: 3px solid #D4AF37; border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .dashboard-analytics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin-top: 40px; }
    .chart-box { padding: 25px; display: flex; flex-direction: column; min-height: 400px; }
    .chart-box.wide { grid-column: span 2; }
    .chart-header { border-bottom: 1px solid rgba(212, 175, 55, 0.1); padding-bottom: 12px; margin-bottom: 20px; }
    .chart-header h4 { margin: 0; font-size: 1rem; color: #fff; display: flex; align-items: center; gap: 10px; }
    .chart-container { flex: 1; position: relative; width: 100%; min-height: 300px; }
    canvas { width: 100% !important; height: 100% !important; min-height: 350px; }
    
    /* Custom Select & Image Fixes */
    .mini-select {
      background: #151515; color: #D4AF37; border: 1px solid rgba(212, 175, 55, 0.3);
      padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
      cursor: pointer; transition: 0.3s; outline: none; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23D4AF37' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 8px center; background-size: 18px;
      padding-right: 30px;
    }
    
    /* Premium Date Filters */
    .date-filter-group { display: flex; gap: 20px; align-items: center; }
    .date-input-wrapper { display: flex; align-items: center; gap: 10px; }
    .date-input-wrapper label { font-size: 0.7rem; text-transform: uppercase; color: #666; font-weight: 800; letter-spacing: 0.5px; }
    .premium-date-input { 
      background: #151515; border: 1px solid rgba(212, 175, 55, 0.2); 
      color: #D4AF37; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; 
      font-weight: 600; cursor: pointer; transition: 0.3s;
      outline: none;
    }
    .premium-date-input:hover, .premium-date-input:focus { border-color: #D4AF37; background: #1a1a1a; box-shadow: 0 0 15px rgba(212, 175, 55, 0.1); }
    /* Hide default date icon in some browsers to use custom styling */
    .premium-date-input::-webkit-calendar-picker-indicator { filter: invert(0.7) sepia(1) saturate(5) hue-rotate(10deg); cursor: pointer; }
    .mini-select:hover { border-color: #D4AF37; background-color: #1a1a1a; box-shadow: 0 0 10px rgba(212, 175, 55, 0.1); }
    .mini-select option { background: #151515; color: #fff; padding: 10px; }

    .mini-thumb { background: #1a1a1a; min-width: 45px; display: block; border-radius: 8px; font-size: 0.5rem; text-align: center; }
    .mini-thumb:after { content: "No Img"; color: #444; line-height: 45px; }

    /* Luxury Voucher Styles */
    .coupon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 30px; margin-top: 20px; }
    .coupon-voucher { 
      position: relative; background: #111; border-radius: 16px; overflow: hidden; 
      transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(212, 175, 55, 0.1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .coupon-voucher:hover { transform: translateY(-8px); border-color: rgba(212, 175, 55, 0.4); box-shadow: 0 15px 40px rgba(212, 175, 55, 0.15); }
    .voucher-inner { display: flex; height: 160px; }

    .voucher-left { 
      width: 130px; background: linear-gradient(135deg, #D4AF37, #8B732A); color: #000;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      position: relative; border-right: 2px dashed rgba(0,0,0,0.1);
    }
    .discount-display { text-align: center; line-height: 1; }
    .discount-display .amt { font-size: 2.8rem; font-weight: 900; letter-spacing: -2px; }
    .discount-display .symbol { font-size: 1.2rem; font-weight: 800; vertical-align: top; margin-top: 8px; display: inline-block; }
    .off-text { font-size: 0.7rem; font-weight: 800; letter-spacing: 2px; margin-top: 5px; opacity: 0.8; }

    /* Punched Hole Effect */
    .holes-top, .holes-bottom { 
      position: absolute; left: 100%; width: 24px; height: 24px; 
      background: #080808; border-radius: 50%; z-index: 10; margin-left: -12px;
    }
    .holes-top { top: -12px; }
    .holes-bottom { bottom: -12px; }

    .voucher-right { flex: 1; padding: 25px; position: relative; background: #0f0f0f; display: flex; flex-direction: column; justify-content: center; }
    .status-badge { 
      position: absolute; top: 15px; right: 20px; font-size: 0.6rem; font-weight: 900; 
      padding: 4px 10px; border-radius: 20px; letter-spacing: 1px;
      background: rgba(255, 82, 82, 0.1); color: #FF5252; border: 1px solid rgba(255, 82, 82, 0.2);
    }
    .status-badge.active { background: rgba(80, 200, 120, 0.1); color: #50C878; border-color: rgba(80, 200, 120, 0.2); }
    
    .code-text { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #fff; margin: 0 0 8px 0; letter-spacing: 1px; }
    .expiry-text { font-size: 0.8rem; color: #888; margin: 0 0 15px 0; font-weight: 500; }
    .scope-row { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: #D4AF37; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    
    .btn-delete-voucher { 
      position: absolute; bottom: 15px; right: 15px; background: none; border: none; 
      color: #333; transition: 0.3s; cursor: pointer; font-size: 1.1rem;
    }
    .btn-delete-voucher:hover { color: #ff4444; transform: scale(1.2); }

    .coupon-voucher.expired { opacity: 0.6; filter: grayscale(0.5); }
    .coupon-voucher.expired .voucher-left { background: #333; color: #888; }
    
    .field-hint { display: block; font-size: 0.7rem; color: #c9a96e; margin-top: 6px; font-style: italic; opacity: 0.8; }

    /* Luxe Toggle Group */
    .luxe-toggle-group { display: flex; background: #151515; border-radius: 12px; padding: 4px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 5px; }
    .toggle-btn { 
      flex: 1; padding: 10px; border: none; background: none; color: #666; font-weight: 700; 
      cursor: pointer; transition: 0.3s; border-radius: 8px; font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .toggle-btn:hover { color: #fff; }
    .toggle-btn.active { background: #D4AF37; color: #000; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2); }
    .toggle-btn i { font-size: 0.9rem; }

    .animate-slideInLeft { animation: slideInLeft 0.3s ease-out; }
    @keyframes slideInLeft { from { transform: translateX(-15px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    /* Admin Responsiveness */
    .mobile-admin-header { display: none; }

    @media (max-width: 1024px) {
      .admin-sidebar { width: 260px; }
      .admin-main { margin-left: 260px; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-analytics { grid-template-columns: 1fr; }
      .chart-box.wide { grid-column: span 1; }
      .form-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }

    @media (max-width: 768px) {
      .mobile-admin-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 20px; height: 60px; background: #0a0a0a; border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        position: fixed; top: 0; width: 100%; z-index: 1100;
      }
      .mobile-toggle-btn { background: none; border: none; color: #D4AF37; font-size: 1.4rem; cursor: pointer; }
      .mobile-title { color: #D4AF37; font-weight: 800; letter-spacing: 2px; font-size: 0.9rem; }

      .admin-sidebar { 
        transform: translateX(-100%); transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        width: 280px; box-shadow: 20px 0 50px rgba(0,0,0,0.8);
      }
      .admin-sidebar.mobile-active { transform: translateX(0); }
      
      .admin-main { margin-left: 0; padding-top: 60px; }
      .admin-header { display: none; }
      .admin-body { padding: 20px 15px; }
      
      .stats-grid { grid-template-columns: 1fr; gap: 15px; }
      .stat-card { padding: 15px; }
      
      .table-wrapper { 
        overflow-x: auto; -webkit-overflow-scrolling: touch; 
        margin: 0 -15px; border-radius: 0; border-left: none; border-right: none;
      }
      .luxe-table th, .luxe-table td { padding: 15px; min-width: 120px; }
      .name-cell { min-width: 200px; }
      
      .editor-panel { padding: 20px; border-radius: 16px; }
      .form-grid { grid-template-columns: 1fr !important; gap: 15px; }
      
      .coupon-grid { grid-template-columns: 1fr; gap: 20px; }
      .voucher-inner { height: auto; flex-direction: column; }
      .voucher-left { width: 100%; height: 80px; border-right: none; border-bottom: 2px dashed rgba(0,0,0,0.1); }
      .holes-top, .holes-bottom { left: -12px; margin-left: 0; transform: rotate(90deg); }
      .holes-top { top: 70px; }
      .holes-bottom { bottom: auto; top: 70px; left: auto; right: -12px; }
      .discount-display .amt { font-size: 2rem; }
      
      .profile-header-studio { padding: 20px; }
      .avatar-studio { flex-direction: column; text-align: center; }
      .form-row { grid-template-columns: 1fr; margin-bottom: 0; }
    }
  `]
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {
  activeTab = 'Dashboard';
  tabs = ['Dashboard', 'Products', 'Orders', 'Users', 'Cancellations', 'Coupons', 'Profile'];
  stats: OrderStats = { totalOrders: 0, totalRevenue: 0, totalUsers: 0, statusCounts: [], monthlySales: [], salesTrend: [], topProducts: [] };
  totalProducts = 0;
  categoryStats: any[] = [];
  products: Product[] = [];
  orders: Order[] = [];
  users: User[] = [];
  cancellationRequests: any[] = [];
  statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  charts: Chart[] = [];
  isLoading = true;
  chartDataLoaded = false;
  showMobileSidebar = false;

  // Date Range Filter
  startDate: string = '';
  endDate: string = '';

  // Product Editor State
  showProductForm = false;
  editingProduct: Product | null = null;
  isSavingProduct = false;
  selectedFiles: File[] = [];
  productForm: any = { name: '', price: 0, category: 'Rings', goldType: '22K', weight: '', stock: 0, description: '', featured: false, bestSeller: false, imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '' };
  categoriesList = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches'];
  goldTypes = ['18K', '22K', '24K', 'Silver', 'Platinum'];

  // Coupon State
  coupons: Coupon[] = [];
  showCouponForm = false;
  isSavingCoupon = false;
  couponForm: any = { code: '', discountType: 'percentage', percentageValue: 0, fixedValue: 0, minOrderAmount: 0, expiryDate: '', scope: 'all', productId: '', description: '' };

  // Profile State
  isSavingProfile = false;
  profileForm: any = { name: '', email: '', phone: '' };

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    public authService: AuthService,
    private notificationService: NotificationService,
    private couponService: CouponService
  ) { }

  ngOnInit() {
    this.initDefaultDates();
    this.loadDashboard();
    this.authService.user$.subscribe(u => {
      if (u) this.profileForm = { name: u.name, email: u.email, phone: u.phone || '' };
    });
  }

  private initDefaultDates() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    this.endDate = end.toISOString().split('T')[0];
    this.startDate = start.toISOString().split('T')[0];
  }

  onDateRangeChange() {
    this.isLoading = true;
    this.loadDashboard();
  }

  editProduct(p: Product) {
    this.editingProduct = p;
    // Extract base properties and map images to URL fields
    const { images, ...baseProduct } = p;
    this.productForm = {
      ...baseProduct,
      imageUrl1: images[0] || '',
      imageUrl2: images[1] || '',
      imageUrl3: images[2] || '',
      imageUrl4: images[3] || ''
    };
    this.showProductForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.showMobileSidebar = false; // Close sidebar on mobile
    if (tab === 'Dashboard') {
      this.destroyCharts();
      this.loadDashboard();
    }
    else if (tab === 'Products') this.loadProducts();
    else if (tab === 'Orders') this.loadOrders();
    else if (tab === 'Users') this.loadUsers();
    else if (tab === 'Cancellations') this.loadCancellationRequests();
    else if (tab === 'Coupons') this.loadCoupons();
  }

  toggleSidebar() {
    this.showMobileSidebar = !this.showMobileSidebar;
  }

  setDiscountType(type: string) {
    this.couponForm.discountType = type;
    // Clear values when switching
    if (type === 'percentage') this.couponForm.fixedValue = 0;
    else this.couponForm.percentageValue = 0;
  }

  getFilteredStatuses(order: Order) {
    let options = [...this.statusOptions];
    const current = order.status;

    // Terminal states are locked (handled by [disabled] in template too)
    if (current === 'Delivered' || current === 'Cancelled') {
      return [current];
    }

    // Forward-only Logic
    if (current === 'Processing') {
      options = options.filter(s => s !== 'Pending' && s !== 'Confirmed');
    } 
    else if (current === 'Shipped') {
      options = options.filter(s => s !== 'Pending' && s !== 'Confirmed' && s !== 'Processing');
    }

    // Special Case: Online orders never show 'Pending'
    if (order.paymentMethod === 'Online') {
      options = options.filter(s => s !== 'Pending');
    }

    // Safety: Always include current status
    if (!options.includes(current)) {
      options = [current, ...options];
    }
    
    return options;
  }

  loadDashboard() {
    this.orderService.getStats(this.startDate, this.endDate).subscribe({
      next: (s) => {
        // Ensure arrays are initialized even if backend fails/delivers empty
        this.stats = {
          ...s,
          statusCounts: s.statusCounts || [],
          monthlySales: s.monthlySales || [],
          salesTrend: s.salesTrend || [],
          topProducts: s.topProducts || []
        };

        this.productService.getStats().subscribe({
          next: (pStats) => {
            this.categoryStats = pStats.categories || [];
            this.totalProducts = pStats.totalProducts || 0;
            this.isLoading = false;
            this.chartDataLoaded = true;

            // Re-initialize charts after data arrives and DOM is ready
            setTimeout(() => this.initCharts(), 300);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error loading product stats:', err);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading order stats:', err);
      }
    });
  }

  private destroyCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  private initCharts() {
    this.destroyCharts();

    // 1. Status Chart (Bar)
    const statusCtx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (statusCtx && this.hasData('status')) {
      this.charts.push(new Chart(statusCtx, {
        type: 'bar',
        data: {
          labels: this.stats.statusCounts.map(s => s._id),
          datasets: [{
            label: 'Orders',
            data: this.stats.statusCounts.map(s => s.count),
            backgroundColor: ['#FFC107', '#6495ED', '#9B59B6', '#50C878', '#FF4444'],
            borderRadius: 8
          }]
        },
        options: this.getChartOptions()
      }));
    }

    // 2. Monthly Revenue (Bar)
    const revCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revCtx && this.hasData('revenue')) {
      this.charts.push(new Chart(revCtx, {
        type: 'bar',
        data: {
          labels: this.stats.monthlySales.map(m => this.getMonthName(m._id)),
          datasets: [{
            label: 'Revenue (₹)',
            data: this.stats.monthlySales.map(m => m.total),
            backgroundColor: '#D4AF37',
            borderRadius: 8
          }]
        },
        options: this.getChartOptions()
      }));
    }

    // 3. Sales Trend (Line)
    const trendCtx = document.getElementById('trendChart') as HTMLCanvasElement;
    if (trendCtx && this.hasData('trend')) {
      this.charts.push(new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: this.stats.salesTrend.map(t => new Date(t._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
          datasets: [{
            label: 'Daily Sales (₹)',
            data: this.stats.salesTrend.map(t => t.total),
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#D4AF37'
          }]
        },
        options: this.getChartOptions()
      }));
    }

    // 4. Top Selling Products (Horizontal Bar)
    const topCtx = document.getElementById('topProductsChart') as HTMLCanvasElement;
    if (topCtx && this.hasData('topProducts')) {
      this.charts.push(new Chart(topCtx, {
        type: 'bar',
        data: {
          labels: this.stats.topProducts.map(p => p._id),
          datasets: [{
            label: 'Units Sold',
            data: this.stats.topProducts.map(p => p.quantity),
            backgroundColor: '#D4AF37',
            borderRadius: 5
          }]
        },
        options: {
          ...this.getChartOptions(),
          indexAxis: 'y'
        }
      }));
    }

    // 5. Category Distribution (Pie)
    const catCtx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (catCtx && this.hasData('category')) {
      this.charts.push(new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: this.categoryStats.map(c => c._id),
          datasets: [{
            data: this.categoryStats.map(c => c.count),
            backgroundColor: ['#D4AF37', '#f1d592', '#8B732A', '#C5A028', '#E6C665'],
            borderWidth: 0
          }]
        },
        options: {
          ...this.getChartOptions(),
          cutout: '70%'
        }
      }));
    }
  }

  hasData(type: string): boolean {
    switch (type) {
      case 'status': return this.stats.statusCounts && this.stats.statusCounts.length > 0;
      case 'revenue': return this.stats.monthlySales && this.stats.monthlySales.length > 0 && this.stats.monthlySales.some(m => m.total > 0);
      case 'trend': return this.stats.salesTrend && this.stats.salesTrend.length > 0 && this.stats.salesTrend.some(t => t.total > 0);
      case 'topProducts': return this.stats.topProducts && this.stats.topProducts.length > 0 && this.stats.topProducts.some(p => p.quantity > 0);
      case 'category': return this.categoryStats && this.categoryStats.length > 0;
      default: return false;
    }
  }

  private getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: '#888', font: { size: 12, family: 'Inter' } } },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleColor: '#D4AF37',
          bodyColor: '#fff',
          borderColor: 'rgba(212, 175, 55, 0.2)',
          borderWidth: 1,
          padding: 12,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#666', font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#666', font: { size: 10 } }
        }
      }
    };
  }

  loadProducts() {
    this.productService.getProducts({ limit: 100 }).subscribe(r => this.products = r.products);
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe(o => this.orders = o);
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe(u => {
      this.users = u.filter(user => user.role !== 'admin');
    });
  }

  getUserImage(u: User | null): string {
    if (!u || !u.image) return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    if (u.image.startsWith('http')) return u.image;
    return `http://localhost:9000${u.image.startsWith('/') ? '' : '/'}${u.image}`;
  }

  loadCancellationRequests() {
    this.orderService.getCancellationRequests().subscribe(reqs => this.cancellationRequests = reqs);
  }

  async processRequest(id: string, action: string) {
    const adminNote = await this.notificationService.prompt(`Note for ${action}:`, `${action} Request`);
    if (adminNote === null && action === 'Rejected') return;
    this.orderService.processCancellationRequest(id, action, adminNote || '').subscribe({
      next: () => {
        this.notificationService.alert(`Success: ${action}`, 'success');
        this.loadCancellationRequests();
      },
      error: (err) => this.notificationService.alert(err.error?.message || 'Error', 'error')
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) this.selectedFiles.push(files[i]);
    }
  }

  removeFile(index: number) { this.selectedFiles.splice(index, 1); }

  trackByIndex(index: number, obj: any): any { return index; }

  saveProduct() {
    this.isSavingProduct = true;
    const formData = new FormData();
    Object.keys(this.productForm).forEach(key => {
      if (key.startsWith('imageUrl')) {
        if (this.productForm[key]) formData.append('images', this.productForm[key]);
      } else if (key !== 'images' && key !== '_id' && key !== '__v' && key !== 'createdAt') {
        formData.append(key, this.productForm[key]);
      }
    });
    this.selectedFiles.forEach(f => formData.append('images', f));

    const obs = this.editingProduct
      ? this.productService.updateProduct(this.editingProduct._id, formData)
      : this.productService.createProduct(formData);

    obs.subscribe({
      next: () => {
        this.isSavingProduct = false;
        this.showProductForm = false;
        this.editingProduct = null;
        this.selectedFiles = [];
        this.loadProducts();
        this.notificationService.alert('Inventory updated', 'success');
      },
      error: (err) => {
        this.isSavingProduct = false;
        this.notificationService.alert(err.error?.message || 'Cloud error', 'error');
      }
    });
  }

  deleteProduct(id: string) {
    if (confirm('Delete this piece?')) {
      this.productService.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }

  updateOrderStatus(id: string, status: string) {
    this.orderService.updateOrderStatus(id, status).subscribe({
      next: () => {
        this.loadOrders();
        this.notificationService.alert('Status updated', 'success');
      },
      error: (err) => this.notificationService.alert(err.error?.message || 'Update failed', 'error')
    });
  }

  deleteUser(id: string) {
    if (confirm('Delete user?')) {
      this.authService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  getStatusPercent(count: number): number {
    const total = this.stats.totalOrders || 1;
    return (count / total) * 100;
  }

  getMonthPercent(sales: number): number {
    const max = Math.max(...this.stats.monthlySales.map(m => m.total), 1);
    return (sales / max) * 100;
  }

  getMonthName(m: number): string {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1];
  }

  getTabIcon(tab: string): string {
    const icons: any = {
      'Dashboard': 'fa-chart-pie',
      'Products': 'fa-gem',
      'Orders': 'fa-shopping-cart',
      'Users': 'fa-users-gear',
      'Cancellations': 'fa-ban',
      'Coupons': 'fa-ticket'
    };
    return icons[tab] || 'fa-folder';
  }

  loadCoupons() { this.couponService.getCoupons().subscribe(c => this.coupons = c); }

  saveProfile() {
    this.isSavingProfile = true;
    this.authService.updateProfile(this.profileForm).subscribe({
      next: () => {
        this.isSavingProfile = false;
        this.notificationService.alert('Profile updated', 'success');
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.notificationService.alert(err.error?.message || 'Update failed', 'error');
      }
    });
  }

  async onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      this.notificationService.alert('File size too large! Max 100MB allowed.', 'error');
      return;
    }

    this.isSavingProfile = true;
    this.authService.uploadProfileImage(file).subscribe({
      next: () => {
        this.isSavingProfile = false;
        this.notificationService.alert('Avatar updated', 'success');
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.notificationService.alert(err.error?.message || 'Upload failed', 'error');
      }
    });
  }

  saveCoupon() {
    this.isSavingCoupon = true;
    
    // Determine discount type and value from the two fields
    const finalForm = { ...this.couponForm };
    if (this.couponForm.percentageValue > 0) {
      finalForm.discountType = 'percentage';
      finalForm.discountValue = this.couponForm.percentageValue;
    } else {
      finalForm.discountType = 'fixed';
      finalForm.discountValue = this.couponForm.fixedValue;
    }

    this.couponService.createCoupon(finalForm).subscribe({
      next: () => {
        this.isSavingCoupon = false;
        this.showCouponForm = false;
        // Reset form
        this.couponForm = { code: '', percentageValue: 0, fixedValue: 0, minOrderAmount: 0, expiryDate: '', scope: 'all', productId: '', description: '' };
        this.loadCoupons();
        this.notificationService.alert('Coupon active', 'success');
      },
      error: (err) => {
        this.isSavingCoupon = false;
        this.notificationService.alert(err.error?.message || 'Error', 'error');
      }
    });
  }

  deleteCoupon(id: string) {
    this.couponService.deleteCoupon(id).subscribe(() => this.loadCoupons());
  }

  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }

  toggleSuspension(id: string) {
    this.authService.toggleSuspension(id).subscribe({
      next: (res) => {
        const user = this.users.find(u => u._id === id);
        if (user) user.isSuspended = res.isSuspended;
        this.notificationService.alert(res.message, 'success');
      },
      error: (err) => {
        this.notificationService.alert(err.error?.message || 'Operation failed', 'error');
      }
    });
  }
}
