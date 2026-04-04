import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:9000/api/addresses';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addAddress(address: Address): Observable<Address[]> {
    return this.http.post<Address[]>(this.apiUrl, address, { headers: this.getHeaders() });
  }

  updateAddress(id: string, address: Address): Observable<Address[]> {
    return this.http.put<Address[]>(`${this.apiUrl}/${id}`, address, { headers: this.getHeaders() });
  }

  deleteAddress(id: string): Observable<Address[]> {
    return this.http.delete<Address[]>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
