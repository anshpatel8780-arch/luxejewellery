import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = environment.apiUrl;
    private userSubject = new BehaviorSubject<User | null>(null);
    user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        const user = localStorage.getItem('user');
        if (user) this.userSubject.next(JSON.parse(user));
    }

    register(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap(res => this.setSession(res))
        );
    }

    registerCheck(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/otp/send`, { email, purpose: 'register-verify' });
    }

    login(data: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
            tap(res => this.setSession(res))
        );
    }

    private setSession(res: AuthResponse) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    isAdmin(): boolean {
        const user = this.userSubject.value;
        return user?.role === 'admin';
    }

    getUser(): User | null {
        return this.userSubject.value;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/profile`);
    }

    updateProfile(data: any): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/profile`, data).pipe(
            tap(user => {
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
            })
        );
    }

    uploadProfileImage(file: File): Observable<{ image: string }> {
        const formData = new FormData();
        formData.append('image', file);
        return this.http.post<{ image: string }>(`${this.apiUrl}/profile/image`, formData).pipe(
            tap(res => {
                const user = this.userSubject.value;
                if (user) {
                    const updatedUser = { ...user, image: res.image };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    this.userSubject.next(updatedUser);
                }
            })
        );
    }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${id}`);
    }

    toggleSuspension(id: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/users/${id}/suspend`, {});
    }
}
