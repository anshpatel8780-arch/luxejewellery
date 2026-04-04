import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Wishlist, Product } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WishlistService {
    private apiUrl = `${environment.apiUrl}/wishlist`;
    private baseUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getWishlist(): Observable<Wishlist> {
        return this.http.get<Wishlist>(this.apiUrl).pipe(
            map(wl => this.formatWishlistImages(wl))
        );
    }

    addToWishlist(productId: string): Observable<Wishlist> {
        return this.http.post<Wishlist>(`${this.apiUrl}/add`, { productId }).pipe(
            map(wl => this.formatWishlistImages(wl))
        );
    }

    removeFromWishlist(productId: string): Observable<Wishlist> {
        return this.http.delete<Wishlist>(`${this.apiUrl}/remove/${productId}`).pipe(
            map(wl => this.formatWishlistImages(wl))
        );
    }

    private formatWishlistImages(wishlist: Wishlist): Wishlist {
        if (wishlist.products) {
            wishlist.products = wishlist.products.map(p => this.formatProductImageUrl(p));
        }
        return wishlist;
    }

    private formatProductImageUrl(product: Product): Product {
        if (product.images && product.images.length > 0) {
            product.images = product.images.map(img => {
                if (img && !img.startsWith('http') && !img.startsWith('data:')) {
                    const path = img.startsWith('/') ? img : `/${img}`;
                    return `${this.baseUrl}${path}`;
                }
                return img;
            });
        }
        return product;
    }
}
