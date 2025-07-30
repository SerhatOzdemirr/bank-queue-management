// src/app/services/admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';
import { ServiceItem } from './service-item';


export interface Ticket {
  number: number;
  serviceKey: string;
  serviceLabel: string;
  takenAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  /** Services CRUD **/

  getServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${this.base}/services`);
  }

  addService(service: Partial<ServiceItem>): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(`${this.base}/services`, service);
  }

  updateService(id: number, service: Partial<ServiceItem>): Observable<void> {
    return this.http.put<void>(`${this.base}/services/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/services/${id}`);
  }

  /** Ticket Oversight **/

  getTickets(serviceKey?: string): Observable<Ticket[]> {
    let params = new HttpParams();
    if (serviceKey) {
      params = params.set('serviceKey', serviceKey);
    }
    return this.http.get<Ticket[]>(`${this.base}/tickets`, { params });
  }

  cancelTicket(serviceKey: string, number: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/tickets/${serviceKey}/${number}`);
  }
}
