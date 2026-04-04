import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OtpService {
    private apiUrl = `${environment.apiUrl}/otp`;

    constructor(private http: HttpClient) {}

    sendOtp(email: string, purpose: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/send`, { email, purpose });
    }

    verifyOtp(email: string, otp: string, purpose: string): Observable<{ message: string; verified: boolean }> {
        return this.http.post<{ message: string; verified: boolean }>(`${this.apiUrl}/verify`, { email, otp, purpose });
    }

    resetPassword(email: string, otp: string, newPassword: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { email, otp, newPassword });
    }
}
