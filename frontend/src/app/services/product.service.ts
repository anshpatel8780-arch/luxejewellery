import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Product, ProductResponse } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;
    private baseUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getProducts(filters: any = {}): Observable<ProductResponse> {
        let params = new HttpParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params = params.set(key, filters[key]);
            }
        });
        return this.http.get<ProductResponse>(this.apiUrl, { params }).pipe(
            map(res => {
                res.products = res.products.map(p => this.formatImageUrl(p));
                return res;
            })
        );
    }

    getProduct(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
            map(p => this.formatImageUrl(p))
        );
    }

    private formatImageUrl(product: Product): Product {
        if (product.images && product.images.length > 0) {
            product.images = product.images.map(img => {
                if (img && !img.startsWith('http') && !img.startsWith('data:')) {
                    const path = img.startsWith('/') ? img : `/${img}`;
                    return `${this.baseUrl}${path}`;
                }
                return img;
            });
        }
        
        // Inject placeholder 360 images for demonstration if none exist
        if (!product.images360 || product.images360.length === 0) {
            product.images360 = [];
            for (let i = 1; i <= 36; i++) { // 36 frames
                const bgColor = 'F9F9F9';
                const text = `Frame ${i} - Rotate`;
                product.images360.push(`https://placehold.co/600x600/${bgColor}/333333?text=${encodeURIComponent(text)}`);
            }
        }
        
        return product;
    }

    createProduct(data: any | FormData): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, data);
    }

    updateProduct(id: string, data: any | FormData): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
    }

    deleteProduct(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    getStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/stats`);
    }
}
