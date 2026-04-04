import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Cart } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
    private apiUrl = `${environment.apiUrl}/cart`;
    private cartCountSubject = new BehaviorSubject<number>(0);
    cartCount$ = this.cartCountSubject.asObservable();
    private baseUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getCart(): Observable<Cart> {
        return this.http.get<Cart>(this.apiUrl).pipe(
            map(cart => this.formatCartImages(cart)),
            tap(cart => this.cartCountSubject.next(cart.products?.length || 0))
        );
    }

    addToCart(productId: string, quantity: number = 1): Observable<Cart> {
        return this.http.post<Cart>(`${this.apiUrl}/add`, { productId, quantity }).pipe(
            map(cart => this.formatCartImages(cart)),
            tap(cart => this.cartCountSubject.next(cart.products?.length || 0))
        );
    }

    updateQuantity(productId: string, quantity: number): Observable<Cart> {
        return this.http.put<Cart>(`${this.apiUrl}/update`, { productId, quantity }).pipe(
            map(cart => this.formatCartImages(cart)),
            tap(cart => this.cartCountSubject.next(cart.products?.length || 0))
        );
    }

    removeFromCart(productId: string): Observable<Cart> {
        return this.http.delete<Cart>(`${this.apiUrl}/remove/${productId}`).pipe(
            map(cart => this.formatCartImages(cart)),
            tap(cart => this.cartCountSubject.next(cart.products?.length || 0))
        );
    }

    private formatCartImages(cart: Cart): Cart {
        if (cart.products) {
            cart.products = cart.products.map(item => {
                if (item.productId && item.productId.images) {
                    item.productId.images = item.productId.images.map(img => {
                        if (img && !img.startsWith('http') && !img.startsWith('data:')) {
                            const path = img.startsWith('/') ? img : `/${img}`;
                            return `${this.baseUrl}${path}`;
                        }
                        return img;
                    });
                }
                return item;
            });
        }
        return cart;
    }

    clearCart(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/clear`).pipe(
            tap(() => this.cartCountSubject.next(0))
        );
    }

    resetCount() {
        this.cartCountSubject.next(0);
    }
}
