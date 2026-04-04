import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
    private apiUrl = 'http://localhost:9000/api/reviews';

    constructor(private http: HttpClient) { }

    createReview(data: any): Observable<Review> {
        return this.http.post<Review>(this.apiUrl, data);
    }

    getProductReviews(productId: string): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.apiUrl}/${productId}`);
    }

    checkEligibility(productId: string): Observable<{ isEligible: boolean; reason: string }> {
        return this.http.get<{ isEligible: boolean; reason: string }>(`${this.apiUrl}/check-eligibility/${productId}`);
    }
}
