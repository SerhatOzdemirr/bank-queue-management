import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceItem } from './service-item';
import { environment } from '../../environment';

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/services`;

  getAll(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(this.base);
  }
}
