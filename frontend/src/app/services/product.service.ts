import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Product, ProductResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private apiUrl = 'http://localhost:9000/api/products';
    private baseUrl = 'http://localhost:9000';

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
