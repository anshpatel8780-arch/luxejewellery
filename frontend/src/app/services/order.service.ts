import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Order, OrderStats } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;
    private paymentUrl = `${environment.apiUrl}/payment`;
    private baseUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    createOrder(data: any): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, data);
    }

    createRazorpayOrder(amount: number): Observable<any> {
        return this.http.post<any>(`${this.paymentUrl}/create-order`, { amount });
    }

    verifyPayment(data: any): Observable<Order> {
        return this.http.post<Order>(`${this.paymentUrl}/verify`, data);
    }

    downloadInvoice(id: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/invoice`, { responseType: 'blob' });
    }


    getUserOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/user`).pipe(
            map(orders => orders.map(o => this.formatOrderImages(o)))
        );
    }

    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl).pipe(
            map(orders => orders.map(o => this.formatOrderImages(o)))
        );
    }

    updateOrderStatus(id: string, status: string): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { status }).pipe(
            map(o => this.formatOrderImages(o))
        );
    }

    getStats(): Observable<OrderStats> {
        return this.http.get<OrderStats>(`${this.apiUrl}/stats`);
    }

    cancelOrderAction(id: string, reason: string): Observable<Order> {
        return this.http.post<{ message: string, order: Order }>(`${this.apiUrl}/${id}/cancel`, { reason }).pipe(
            map(res => this.formatOrderImages(res.order))
        );
    }

    private formatOrderImages(order: Order): Order {
        if (order.products) {
            order.products = order.products.map(item => {
                if (item.image && !item.image.startsWith('http') && !item.image.startsWith('data:')) {
                    const path = item.image.startsWith('/') ? item.image : `/${item.image}`;
                    item.image = `${this.baseUrl}${path}`;
                }
                return item;
            });
        }
        return order;
    }

    getCancellationRequests(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/admin/cancellation-requests`).pipe(
            map(orders => orders.map(o => this.formatOrderImages(o)))
        );
    }

    processCancellationRequest(id: string, action: string, adminNote?: string): Observable<Order> {
        return this.http.put<{ message: string, order: Order }>(`${this.apiUrl}/admin/cancellation-requests/${id}/process`, { action, adminNote }).pipe(
            map(res => this.formatOrderImages(res.order))
        );
    }
}
