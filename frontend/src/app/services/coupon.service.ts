import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon, CouponValidationResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = 'http://localhost:9000/api/coupons';

  constructor(private http: HttpClient) { }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  createCoupon(couponData: any): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, couponData);
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  validateCoupon(code: string, cartItems: any[], subtotal: number): Observable<CouponValidationResponse> {
    return this.http.post<CouponValidationResponse>(`${this.apiUrl}/validate`, { code, cartItems, subtotal });
  }
}
