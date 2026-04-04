import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-shop',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <section class="shop-page">
      <div class="shop-header">
        <div class="container">
          <h1>Our <span class="gold">Collection</span></h1>
          <p>Explore our exquisite range of handcrafted jewellery</p>
        </div>
      </div>

      <div class="container">
        <button class="mobile-filter-btn" (click)="toggleFilters()">
          <i class="fa-solid fa-filter"></i> Refine Collection
        </button>

        <div class="shop-layout">
          <!-- Filters Sidebar -->
          <aside class="filters-sidebar" [class.active]="showMobileFilters">
            <button class="close-filters" (click)="toggleFilters()">×</button>
            <div class="filter-section">
              <h3>Search</h3>
              <input type="text" [(ngModel)]="filters.search" (input)="loadProducts()" placeholder="Search jewellery..." class="search-input">
            </div>

            <div class="filter-section">
              <h3>Categories</h3>
              <div class="filter-options">
                <label *ngFor="let cat of categoriesList" class="filter-option">
                  <input type="radio" name="category" [value]="cat" [(ngModel)]="filters.category" (change)="loadProducts()">
                  <span>{{cat}}</span>
                </label>
                <label class="filter-option">
                  <input type="radio" name="category" value="" [(ngModel)]="filters.category" (change)="loadProducts()">
                  <span>All Categories</span>
                </label>
              </div>
            </div>

            <div class="filter-section">
              <h3>Gold Type</h3>
              <div class="filter-options">
                <label *ngFor="let g of goldTypes" class="filter-option">
                  <input type="radio" name="goldType" [value]="g" [(ngModel)]="filters.goldType" (change)="loadProducts()">
                  <span>{{g}}</span>
                </label>
                <label class="filter-option">
                  <input type="radio" name="goldType" value="" [(ngModel)]="filters.goldType" (change)="loadProducts()">
                  <span>All Types</span>
                </label>
              </div>
            </div>

            <div class="filter-section">
              <h3>Price Range</h3>
              <div class="price-inputs">
                <input type="number" [(ngModel)]="filters.minPrice" (change)="loadProducts()" placeholder="Min ₹">
                <span>—</span>
                <input type="number" [(ngModel)]="filters.maxPrice" (change)="loadProducts()" placeholder="Max ₹">
              </div>
            </div>

            <div class="filter-section">
              <h3>Minimum Rating</h3>
              <select [(ngModel)]="filters.rating" (change)="loadProducts()">
                <option value="">All Ratings</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
              </select>
            </div>

            <button class="btn btn-secondary btn-sm" (click)="clearFilters()" style="width:100%">Clear Filters</button>
          </aside>

          <!-- Products Grid -->
          <div class="products-section">
            <div class="products-toolbar">
              <span class="results-count">{{totalProducts}} products found</span>
              <select [(ngModel)]="filters.sort" (change)="loadProducts()">
                <option value="">Sort: Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div class="products-grid">
              <div *ngFor="let product of products" class="product-card">
                <div class="product-image" [class.out-of-stock]="product.stock === 0">
                  <img [src]="product.images[0]" [alt]="product.name" loading="lazy" [class.img-out-of-stock]="product.stock === 0">
                  <div class="product-overlay">
                    <a [routerLink]="['/product', product._id]" class="btn btn-primary btn-sm">View Details</a>
                  </div>
                  <div class="out-of-stock-badge" *ngIf="product.stock === 0">OUT OF STOCK</div>
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

            <div *ngIf="products.length === 0" class="no-results">
              <p>💎 No products found matching your criteria.</p>
              <button class="btn btn-secondary btn-sm" (click)="clearFilters()">Clear Filters</button>
            </div>

            <!-- Pagination -->
            <div *ngIf="totalPages > 1" class="pagination">
              <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" class="page-btn">← Prev</button>
              <button *ngFor="let p of getPages()" (click)="goToPage(p)" [class.active]="p === currentPage" class="page-btn">{{p}}</button>
              <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="page-btn">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .shop-page { padding-bottom: 60px; }
    .shop-header {
      padding: 60px 0 40px; text-align: center;
      background: linear-gradient(135deg, rgba(212,175,55,0.05), transparent);
      border-bottom: 1px solid #222;
    }
    .shop-header h1 { font-size: 2.5rem; margin-bottom: 8px; }
    .gold { color: #D4AF37; }
    .shop-header p { color: #777; }
    .shop-layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; margin-top: 32px; }

    /* Filters */
    .filters-sidebar {
      background: #1A1A1A; border-radius: 12px; padding: 24px;
      border: 1px solid #333; height: fit-content; position: sticky; top: 90px;
    }
    .filter-section { margin-bottom: 24px; }
    .filter-section h3 { color: #D4AF37; font-size: 0.95rem; font-family: 'Poppins', sans-serif; margin-bottom: 12px; font-weight: 600; }
    .search-input {
      width: 100%; padding: 10px 14px; background: #252525; border: 1px solid #444;
      border-radius: 8px; color: #fff; font-size: 0.9rem;
    }
    .search-input:focus { border-color: #D4AF37; }
    .filter-option {
      display: flex; align-items: center; gap: 8px; padding: 6px 0;
      color: #B0B0B0; font-size: 0.9rem; cursor: pointer;
    }
    .filter-option input[type="radio"] { accent-color: #D4AF37; }
    .price-inputs { display: flex; align-items: center; gap: 8px; }
    .price-inputs input {
      flex: 1; padding: 8px 10px; background: #252525; border: 1px solid #444;
      border-radius: 8px; color: #fff; font-size: 0.85rem; width: 80px;
    }
    .price-inputs span { color: #777; }
    .filters-sidebar select {
      width: 100%; padding: 10px; background: #252525; border: 1px solid #444;
      border-radius: 8px; color: #fff;
    }

    /* Products */
    .products-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px;
    }
    .results-count { color: #777; font-size: 0.9rem; }
    .products-toolbar select {
      padding: 8px 16px; background: #1E1E1E; border: 1px solid #444;
      border-radius: 8px; color: #fff;
    }
    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .product-card {
      background: #1E1E1E; border-radius: 12px; overflow: hidden;
      border: 1px solid #333; transition: all 0.3s;
    }
    .product-card:hover { border-color: rgba(212,175,55,0.4); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(212,175,55,0.1); }
    .product-image { position: relative; overflow: hidden; aspect-ratio: 1; background: #161616; }
    .product-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .product-card:hover .product-image img { transform: scale(1.08); }
    .product-overlay {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.5); opacity: 0; transition: 0.3s;
    }
    .product-card:hover .product-overlay { opacity: 1; }
    .product-image.out-of-stock .product-overlay { background: rgba(0,0,0,0.7); opacity: 1; }
    .img-out-of-stock { opacity: 0.4; filter: grayscale(1); }
    .out-of-stock-badge {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #e74c3c; color: #fff; padding: 6px 12px; border-radius: 4px;
      font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; z-index: 2;
      box-shadow: 0 4px 15px rgba(231,76,60,0.3);
    }
    .product-badge {
      position: absolute; top: 12px; left: 12px;
      background: linear-gradient(135deg, #D4AF37, #B8960C); color: #0D0D0D;
      padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;
      z-index: 3;
    }
    .product-info { padding: 16px; }
    .product-info h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 8px; color: #fff; font-family: 'Poppins'; }
    .product-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .product-price { color: #D4AF37; font-weight: 700; font-size: 1.05rem; }
    .stars { color: #D4AF37; font-size: 0.8rem; }
    .product-type { color: #777; font-size: 0.8rem; }
    .no-results { text-align: center; padding: 60px 20px; color: #777; font-size: 1.1rem; }

    /* Pagination */
    .pagination { display: flex; justify-content: center; gap: 8px; margin-top: 40px; }
    .page-btn {
      padding: 10px 16px; background: #1E1E1E; border: 1px solid #333;
      border-radius: 8px; color: #B0B0B0; cursor: pointer; transition: 0.3s;
    }
    .page-btn:hover, .page-btn.active { background: #D4AF37; color: #0D0D0D; border-color: #D4AF37; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Responsive */
    @media (max-width: 1024px) {
      .shop-layout { grid-template-columns: 220px 1fr; gap: 20px; }
      .products-grid { grid-template-columns: repeat(2, 1fr); }
      .shop-header h1 { font-size: 2.2rem; }
    }

    @media (max-width: 640px) {
      .shop-header { padding: 40px 0 30px; }
      .shop-header h1 { font-size: 1.8rem; }
      .shop-header p { font-size: 0.9rem; }
      
      .shop-layout { grid-template-columns: 1fr; gap: 20px; margin-top: 20px; }
      
      .filters-sidebar {
        position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
        z-index: 2000; border-radius: 0; transform: translateX(-100%);
        transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow-y: auto; padding-top: 80px;
      }
      .filters-sidebar.active { transform: translateX(0); }
      
      .products-toolbar { flex-direction: column; align-items: flex-start; gap: 12px; }
      .products-toolbar select { width: 100%; }
      
      .products-grid { grid-template-columns: 1fr; gap: 20px; }
      .product-card:hover { transform: none; }
      
      .pagination { gap: 4px; }
      .page-btn { padding: 8px 12px; font-size: 0.85rem; }
    }

    /* Mobile Filter Toggle */
    .mobile-filter-btn {
      display: none; width: 100%; margin-bottom: 20px;
      background: #1A1A1A; color: #D4AF37; border: 1px solid #D4AF37;
      padding: 12px; border-radius: 8px; font-weight: 700;
      align-items: center; justify-content: center; gap: 10px;
    }
    .close-filters { display: none; }

    @media (max-width: 640px) {
      .mobile-filter-btn { display: flex; }
      .close-filters {
        display: block; position: absolute; top: 20px; right: 20px;
        background: none; color: #fff; font-size: 1.5rem; border: none;
      }
    }
  `]
})
export class ShopComponent implements OnInit {
    products: Product[] = [];
    totalProducts = 0;
    totalPages = 1;
    currentPage = 1;
    showMobileFilters = false;

    filters: any = { category: '', goldType: '', minPrice: '', maxPrice: '', rating: '', sort: '', search: '', page: 1 };
    categoriesList = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches'];
    goldTypes = ['18K', '22K', '24K', 'Silver', 'Platinum'];

    constructor(private productService: ProductService, private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['category']) this.filters.category = params['category'];
            this.loadProducts();
        });
    }

    loadProducts() {
        this.filters.page = this.currentPage;
        this.productService.getProducts(this.filters).subscribe(res => {
            this.products = res.products;
            this.totalProducts = res.total;
            this.totalPages = res.pages;
        });
        this.showMobileFilters = false; // Close on mobile after filtering
    }

    toggleFilters() {
        this.showMobileFilters = !this.showMobileFilters;
    }

    clearFilters() {
        this.filters = { category: '', goldType: '', minPrice: '', maxPrice: '', rating: '', sort: '', search: '', page: 1 };
        this.currentPage = 1;
        this.loadProducts();
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    getPages(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    getStars(rating: number): string {
        return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    }
}
